import React, { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { API_BASE_URL } from "../../utils/api";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { SRI_LANKAN_DISTRICTS } from "../../utils/districts";
import { Calendar, Filter, TrendingUp, Briefcase, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // fixed import

export const Revenue = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterYear, setFilterYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterProfessional, setFilterProfessional] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [professionalsByDistrict, setProfessionalsByDistrict] = useState([]);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API_BASE_URL}/api/bookings/all-detailed`);
      const data = await res.json();

      if (data.success) {
        const allowedStatuses = ["paid", "completed", "verified"];
        const filteredData = data.data.filter((b) => allowedStatuses.includes(b.status));
        setBookings(filteredData);
      } else {
        toast.error(data.message || "Failed to fetch bookings");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Professionals dropdown based on district
  useEffect(() => {
    if (!filterDistrict) {
      setProfessionalsByDistrict([]);
      setFilterProfessional("");
      return;
    }

    const map = new Map();
    bookings.forEach((b) => {
      if (b.location?.district === filterDistrict && b.professionalId) {
        map.set(b.professionalId._id, b.professionalId);
      }
    });
    setProfessionalsByDistrict(Array.from(map.values()));
    setFilterProfessional("");
  }, [filterDistrict, bookings]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const date = new Date(b.scheduledTime);
      if (filterYear && date.getFullYear() !== parseInt(filterYear)) return false;
      if (startDate && date < new Date(startDate)) return false;
      if (endDate && date > new Date(endDate + "T23:59:59")) return false;
      if (filterDistrict && b.location?.district !== filterDistrict) return false;
      if (filterProfessional && b.professionalId?._id !== filterProfessional) return false;
      if (filterStatus && b.status !== filterStatus) return false;
      return true;
    });
  }, [bookings, filterYear, startDate, endDate, filterDistrict, filterProfessional, filterStatus]);

  // Revenue calculations
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.payment?.paymentByUser || 0), 0);
  const totalCommission = filteredBookings.reduce((sum, b) => sum + ((b.payment?.paymentByWorker || 0) * 0.1), 0);

  // CSV Export
  const exportCSV = () => {
    if (filteredBookings.length === 0) return;

    const headers = [
      "BookingID",
      "Customer",
      "Professional",
      "Service",
      "Status",
      "District",
      "Scheduled",
      "PaymentByUser",
      "PaymentByWorker",
      "Commission"
    ];

    const rows = filteredBookings.map((b) => [
      b._id,
      b.customerId?.name || "N/A",
      b.professionalId?.name || "Not Assigned",
      b.service,
      b.status,
      b.location?.district || "N/A",
      new Date(b.scheduledTime).toLocaleString(),
      b.payment?.paymentByUser || 0,
      b.payment?.paymentByWorker || 0,
      b.payment?.paymentByWorker ? (b.payment.paymentByWorker * 0.1).toFixed(2) : 0
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `revenue_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export
  const exportPDF = () => {
    if (filteredBookings.length === 0) return;

    const doc = new jsPDF();
    doc.text("Revenue Report", 14, 20);

    const tableColumn = [
      "BookingID",
      "Customer",
      "Professional",
      "Service",
      "Status",
      "District",
      "Scheduled",
      "PaymentByUser",
      "PaymentByWorker",
      "Commission"
    ];

    const tableRows = filteredBookings.map((b) => [
      b._id,
      b.customerId?.name || "N/A",
      b.professionalId?.name || "Not Assigned",
      b.service,
      b.status,
      b.location?.district || "N/A",
      new Date(b.scheduledTime).toLocaleString(),
      b.payment?.paymentByUser || 0,
      b.payment?.paymentByWorker || 0,
      b.payment?.paymentByWorker ? (b.payment.paymentByWorker * 0.1).toFixed(2) : 0
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [103, 58, 183] }
    });

    doc.save(`revenue_${new Date().toISOString()}.pdf`);
  };

  // Years for filter dropdown
  const years = Array.from(new Set(bookings.map((b) => new Date(b.scheduledTime).getFullYear()))).sort((a, b) => b - a);

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <Toaster position="top-right" />

      <div className="flex items-center gap-3 mb-6">
        <TrendingUp size={28} className="text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-800">Revenue Report</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {/* Year */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl outline-none"
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl outline-none"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="verified">Verified</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">District</label>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl outline-none"
            >
              <option value="">All Districts</option>
              {SRI_LANKAN_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Professional */}
          {filterDistrict && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Professional</label>
              <select
                value={filterProfessional}
                onChange={(e) => setFilterProfessional(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl outline-none"
              >
                <option value="">All Professionals</option>
                {professionalsByDistrict.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterYear("");
                setStartDate("");
                setEndDate("");
                setFilterDistrict("");
                setFilterProfessional("");
                setFilterStatus("");
              }}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 p-6 rounded-xl flex flex-col">
          <span className="text-gray-600 font-semibold">Total Revenue</span>
          <span className="text-2xl font-bold text-gray-800">Rs. {totalRevenue.toFixed(2)}</span>
        </div>
        <div className="bg-green-50 p-6 rounded-xl flex flex-col">
          <span className="text-gray-600 font-semibold">Total Commission (10%)</span>
          <span className="text-2xl font-bold text-gray-800">{totalCommission.toFixed(2)}</span>
        </div>
        <div className="bg-red-50 p-6 rounded-xl flex flex-col">
          <span className="text-gray-600 font-semibold">Total Bookings</span>
          <span className="text-2xl font-bold text-gray-800">{filteredBookings.length}</span>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={exportCSV}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2"
        >
          <Download size={18} /> Export CSV
        </button>
        <button
          onClick={exportPDF}
          className="px-6 py-2 bg-green-600 text-white rounded-xl flex items-center gap-2"
        >
          <Download size={18} /> Export PDF
        </button>
      </div>

      {/* Revenue Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">#</th>
              <th className="px-6 py-4 text-left">Customer</th>
              <th className="px-6 py-4 text-left">Professional</th>
              <th className="px-6 py-4 text-left">Service</th>
              <th className="px-6 py-4 text-left">District</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Scheduled</th>
              <th className="px-6 py-4 text-left">Payment by User</th>
              <th className="px-6 py-4 text-left">Payment by Worker</th>
              <th className="px-6 py-4 text-left">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center py-8 text-gray-500">Loading...</td>
              </tr>
            ) : filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-8 text-gray-500">No bookings found</td>
              </tr>
            ) : (
              filteredBookings.map((b, i) => (
                <tr key={b._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{i + 1}</td>
                  <td className="px-6 py-4">{b.customerId?.name || "N/A"}</td>
                  <td className="px-6 py-4">{b.professionalId?.name || "Not Assigned"}</td>
                  <td className="px-6 py-4">{b.service}</td>
                  <td className="px-6 py-4">{b.location?.district || "N/A"}</td>
                  <td className="px-6 py-4">{b.status}</td>
                  <td className="px-6 py-4">{new Date(b.scheduledTime).toLocaleString()}</td>
                  <td className="px-6 py-4">{b.payment?.paymentByUser || 0}</td>
                  <td className="px-6 py-4">{b.payment?.paymentByWorker || 0}</td>
                  <td className="px-6 py-4">{b.payment?.paymentByWorker ? (b.payment.paymentByWorker*0.1).toFixed(2) : 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
