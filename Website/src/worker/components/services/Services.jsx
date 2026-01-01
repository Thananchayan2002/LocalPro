import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wrench, AlertTriangle, Loader2, DollarSign } from 'lucide-react';

const Services = () => {
  const { user, token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [professionalData, setProfessionalData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch professional to derive serviceId when missing
  useEffect(() => {
    const fetchProfessional = async () => {
      if (user?.serviceId || (!user?.professionalId && !user?.phone)) return;

      setLoadingProfile(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        if (user?.professionalId) {
          const res = await fetch(`${apiUrl}/api/professionals/${user.professionalId}`, { headers });
          const data = await res.json();
          if (data.success) {
            setProfessionalData(data.data);
            setLoadingProfile(false);
            return;
          }
        }

        const res = await fetch(`${apiUrl}/api/professionals?search=${encodeURIComponent(user.phone)}`, { headers });
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setProfessionalData(data.data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch professional for service view:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfessional();
  }, [apiUrl, token, user?.phone, user?.professionalId, user?.serviceId]);

  useEffect(() => {
    const fetchIssues = async () => {
      const effectiveServiceId = user?.serviceId || professionalData?.serviceId?._id || professionalData?.serviceId;

      if (!effectiveServiceId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${apiUrl}/api/issues?serviceId=${effectiveServiceId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load issues');
        }
        setIssues(data.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load issues');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [apiUrl, token, user?.serviceId, professionalData?.serviceId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6 mt-16 lg:mt-10">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur border border-gray-100 shadow-sm p-6">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.08),transparent_32%)]" />
          <div className="relative flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 w-fit">
              <Wrench className="w-4 h-4" />
              My Service
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {user?.serviceName || professionalData?.serviceId?.service || 'Not assigned'}
            </h1>
            <p className="text-sm text-gray-600">Issues and base amounts. This is only a basic amount. You can negotiate or adjust based on specific circumstances.</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {loading ? (
            <div className="flex items-center gap-3 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading issues...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-100 rounded-lg p-4">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : (!user?.serviceId && !professionalData?.serviceId) ? (
            <div className="text-gray-600">You do not have a service assigned yet.</div>
          ) : issues.length === 0 ? (
            <div className="text-gray-600">No issues found for this service.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {issues.map((issue) => (
                <div
                  key={issue._id}
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-green-100/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Issue</p>
                      <h3 className="text-lg font-semibold text-gray-900">{issue.issueName}</h3>
            
                    </div>
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100">
                      Rs. {issue.basicCost ?? '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;