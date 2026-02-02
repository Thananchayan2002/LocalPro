import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../utils/api";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import {
  LayoutDashboard,
  Users,
  UserCog,
  TrendingUp,
  BarChart2 ,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";

export const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalProfessionals: 0,
    totalCustomers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    adminCommission: 0,
  });

  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [monthlyBookings, setMonthlyBookings] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Legend toggle states
  const [commissionVisible, setCommissionVisible] = useState({
    prevCommission: true,
    currCommission: true,
  });

  const [bookingVisible, setBookingVisible] = useState({
    prevBookings: true,
    currBookings: true,
  });

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const colors = {
    prevCommission: "#8884d8",
    currCommission: "#82ca9d",
    prevBookings: "#8884d8",
    currBookings: "#82ca9d",
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Dashboard summary
      const summaryRes = await (
        await fetchWithAuth(`${API_BASE_URL}/api/admin/dashboard/summary`)
      ).json();
      setSummary(summaryRes || summary);

      // Monthly Revenue
      const revenueRes = await (
        await fetchWithAuth(`${API_BASE_URL}/api/admin/dashboard/monthly-revenue`)
      ).json();

      const months = Array.from({ length: 12 }, (_, i) => i + 1);

      const mergedRevenue = months.map((month) => {
        const prev = revenueRes.find(
          (r) => r.year === previousYear && r.month === month
        );
        const curr = revenueRes.find(
          (r) => r.year === currentYear && r.month === month
        );

        return {
          month,
          prevCommission: prev ? prev.commission : 0,
          currCommission: curr ? curr.commission : 0,
        };
      });

      setMonthlyRevenue(mergedRevenue);

      // Monthly Bookings
      const bookingRes = await (
        await fetchWithAuth(`${API_BASE_URL}/api/admin/dashboard/monthly-booking`)
      ).json();
      setMonthlyBookings(Array.isArray(bookingRes) ? bookingRes : []);

      // Bookings by Service
      const serviceRes = await (
        await fetchWithAuth(
          `${API_BASE_URL}/api/admin/dashboard/bookings-by-service`
        )
      ).json();
      setServiceData(Array.isArray(serviceRes) ? serviceRes : []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Legend click handlers
  const handleCommissionLegendClick = (e) => {
    const key = e.dataKey;
    setCommissionVisible((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleBookingLegendClick = (e) => {
    const key = e.dataKey;
    setBookingVisible((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-500 font-semibold text-lg">
        Loading dashboard...
      </p>
    );

  return (
    <div className="space-y-12 p-6 bg-gray-50 min-h-screen mt-12"> 
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <LayoutDashboard className="w-7 h-7 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card title="Professionals" value={summary.totalProfessionals} icon={<UserCog />}onClick={() => (window.location.href = "/professionals")} />
        <Card title="Customers" value={summary.totalCustomers} icon={<Users />} />
        <Card title="Bookings" value={summary.totalBookings} icon={<LayoutDashboard />}onClick={() => (window.location.href = "/bookings")} />
        <Card title="Revenue" value={`Rs ${summary.totalRevenue}`} icon={<TrendingUp />} onClick={() => (window.location.href = "/payments")}/>
        <Card title="Commission" value={`Rs ${summary.adminCommission}`} icon={<BarChart2  />} onClick={() => (window.location.href = "/revenue")} />
      </div>

      {/* Monthly Commission */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="font-semibold text-lg mb-4">Monthly Commission</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyRevenue}>
            <XAxis
              dataKey="month"
              tickFormatter={(m) =>
                ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1]
              }
            />
            <YAxis />
            <Tooltip formatter={(v) => `Rs ${v}`} />
            <Legend
              onClick={handleCommissionLegendClick}
              formatter={(value, entry) => (
                <span
                  className="cursor-pointer font-medium"
                  style={{
                    color: commissionVisible[entry.dataKey]
                      ? colors[entry.dataKey]
                      : "#aaa",
                  }}
                >
                  {value}
                </span>
              )}
            />

            {/* Previous Year */}
            <Line
              type="monotone"
              dataKey="prevCommission"
              name={`Previous Year (${previousYear})`}
              stroke={colors.prevCommission}
              strokeWidth={2}
              dot={commissionVisible.prevCommission ? { r: 3 } : { r: 0 }}
              opacity={commissionVisible.prevCommission ? 1 : 0}
            />

            {/* Current Year */}
            <Line
              type="monotone"
              dataKey="currCommission"
              name={`Current Year (${currentYear})`}
              stroke={colors.currCommission}
              strokeWidth={2}
              dot={commissionVisible.currCommission ? { r: 3 } : { r: 0 }}
              opacity={commissionVisible.currCommission ? 1 : 0}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Bookings */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="font-semibold text-lg mb-4">Monthly Bookings Comparison</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyBookings}>
            <XAxis
              dataKey="month"
              tickFormatter={(m) =>
                ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1]
              }
            />
            <YAxis />
            <Tooltip />
            <Legend
              onClick={handleBookingLegendClick}
              formatter={(value, entry) => (
                <span
                  className="cursor-pointer font-medium"
                  style={{
                    color: bookingVisible[entry.dataKey]
                      ? colors[entry.dataKey]
                      : "#aaa",
                  }}
                >
                  {value}
                </span>
              )}
            />

            {/* Previous Year */}
            <Line
              type="monotone"
              dataKey="prevBookings"
              name={`Previous Year (${previousYear})`}
              stroke={colors.prevBookings}
              strokeWidth={2}
              dot={bookingVisible.prevBookings ? { r: 3 } : { r: 0 }}
              opacity={bookingVisible.prevBookings ? 1 : 0}
            />

            {/* Current Year */}
            <Line
              type="monotone"
              dataKey="currBookings"
              name={`Current Year (${currentYear})`}
              stroke={colors.currBookings}
              strokeWidth={2}
              dot={bookingVisible.currBookings ? { r: 3 } : { r: 0 }}
              opacity={bookingVisible.currBookings ? 1 : 0}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bookings by Service */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="font-semibold text-lg mb-4">Bookings by Service</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={serviceData}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Card Component
const Card = ({ title, value, icon, onClick }) => (
  <div
    className={`bg-white p-5 rounded-2xl shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer ${
      onClick ? "hover:bg-blue-50" : ""
    }`}
    onClick={onClick}
  >
    <div className="p-3 bg-blue-100 rounded-full text-blue-600">{icon}</div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  </div>
);

