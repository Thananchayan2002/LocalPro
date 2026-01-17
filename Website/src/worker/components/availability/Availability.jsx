import React, { useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../worker/context/AuthContext';
import { Clock, Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';
import { authFetch } from '../../../utils/authFetch';

const Availability = () => {
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const [availability, setAvailability] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({ from: '', to: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Local display date (YYYY-MM-DD) to show in UI
  const displayDate = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toLocaleDateString('en-CA');
  };

  // API date matching backend logic using local date (avoid UTC shift)
  const apiDate = (offsetDays = 0) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offsetDays);
    return d.toLocaleDateString('en-CA');
  };

  const normalizeTime = (value) => {
    if (!value) return null;
    const cleaned = value.trim().replace('.', ':');
    const [hRaw, mRaw] = cleaned.split(':');
    const h = Number(hRaw);
    const m = Number(mRaw);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    const hh = h.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const todayLabel = useMemo(() => displayDate(0), []);
  const tomorrowLabel = useMemo(() => displayDate(1), []);
  const todayStr = useMemo(() => apiDate(0), []);
  const tomorrowStr = useMemo(() => apiDate(1), []);

  const currentDay = useMemo(() => {
    if (!availability?.days) return null;
    const targetDate = activeTab === 'today' ? todayStr : tomorrowStr;
    return availability.days.find((d) => d.date === targetDate) || null;
  }, [availability, activeTab, todayStr, tomorrowStr]);

  const fetchAvailability = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await authFetch(`${apiUrl}/api/availability/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setAvailability(data.data);
      } else {
        toast.error(data.message || 'Failed to load availability');
      }
    } catch (error) {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const checkOverlap = (newFrom, newTo, excludeSlotId = null) => {
    if (!currentDay) return false;
    
    return currentDay.slots.some(slot => {
      // Skip if it's the same slot being edited
      if (excludeSlotId && slot._id === excludeSlotId) return false;
      
      // Check if times overlap
      const slotFrom = slot.from;
      const slotTo = slot.to;
      
      // Overlap occurs if: new start < existing end AND new end > existing start
      return newFrom < slotTo && newTo > slotFrom;
    });
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    if (!formData.from || !formData.to) {
      toast.error('Both times are required');
      return;
    }
    
    // Check if from time is before to time
    if (formData.from >= formData.to) {
      toast.error('Start time must be before end time');
      return;
    }
    
    // Check slot limit (max 3 per day) only when adding new slot
    if (!editingSlot && currentDay && currentDay.slots.length >= 3) {
      toast.error('Maximum 3 time slots allowed per day');
      return;
    }
    
    // Check for overlaps
    if (checkOverlap(formData.from, formData.to, editingSlot?._id)) {
      toast.error('This time slot overlaps with an existing slot');
      return;
    }
    
    const date = activeTab === 'today' ? todayStr : tomorrowStr;

    const endpoint = editingSlot
      ? `${apiUrl}/api/availability/${user?.id}/slots/${editingSlot._id}`
      : `${apiUrl}/api/availability/${user?.id}/slots`;

    const method = editingSlot ? 'PUT' : 'POST';

    try {
      const res = await authFetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date, from: formData.from, to: formData.to })
      });
      const data = await res.json();
      if (data.success) {
        setAvailability(data.data);
        setFormData({ from: '', to: '' });
        setEditingSlot(null);
        setShowModal(false);
        toast.success(editingSlot ? 'Slot updated' : 'Slot added');
      } else {
        toast.error(data.message || 'Save failed');
      }
    } catch (error) {
      toast.error('Save failed');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { slotId, date } = deleteConfirm;
    
    try {
      const res = await authFetch(`${apiUrl}/api/availability/${user?.id}/slots/${slotId}?date=${date}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setAvailability(data.data);
        toast.success('Slot deleted');
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!availability) {
    return <div className="text-center p-8 text-gray-600">Failed to load availability</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 md:p-10">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur border border-gray-100 shadow-sm p-6">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.08),transparent_32%)]" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Availability</h1>
                <p className="text-sm text-gray-600">Manage only Today & Tomorrow. Slots rotate daily.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex gap-2">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'today'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today ({todayLabel})
          </button>
          <button
            onClick={() => setActiveTab('tomorrow')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'tomorrow'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tomorrow ({tomorrowLabel})
          </button>
        </div>

        {/* Slots */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Time Slots {currentDay && `(${currentDay.slots.length}/3)`}
            </h2>
            <button
              onClick={() => {
                if (currentDay && currentDay.slots.length >= 3) {
                  toast.error('Maximum 3 time slots allowed per day');
                  return;
                }
                setEditingSlot(null);
                setFormData({ from: '', to: '' });
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentDay && currentDay.slots.length >= 3}
            >
              <Plus size={18} />
              Add Slot
            </button>
          </div>

          {/* Timeline View */}
          <div className="mb-6">
            <div className="text-xs text-gray-500 mb-2 flex justify-between px-1">
              <span>6 AM</span>
              <span>10 AM</span>
              <span>2 PM</span>
              <span>6 PM</span>
              <span>10 PM</span>
            </div>
            <div className="relative h-16 bg-gray-100 rounded-lg overflow-hidden">
              {/* Timeline base (6am to 10pm = 16 hours) */}
              {currentDay && currentDay.slots.map((slot) => {
                const [fromH, fromM] = slot.from.split(':').map(Number);
                const [toH, toM] = slot.to.split(':').map(Number);
                const startMins = (fromH - 6) * 60 + fromM;
                const endMins = (toH - 6) * 60 + toM;
                const totalMins = 16 * 60; // 6am to 10pm
                const left = (startMins / totalMins) * 100;
                const width = ((endMins - startMins) / totalMins) * 100;
                
                return (
                  <div
                    key={slot._id}
                    className={`absolute h-full flex items-center justify-center text-xs font-semibold text-white cursor-pointer transition-all hover:opacity-80 ${
                      slot.isBooked ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    onClick={() => {
                      if (!slot.isBooked) {
                        setEditingSlot(slot);
                        setFormData({ from: slot.from, to: slot.to });
                        setShowModal(true);
                      }
                    }}
                    title={`${slot.from} - ${slot.to} (${slot.isBooked ? 'Booked' : 'Available'})`}
                  >
                    {slot.from}-{slot.to}
                  </div>
                );
              })}
              {(!currentDay || currentDay.slots.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                  No slots scheduled
                </div>
              )}
            </div>
          </div>

          {/* Slot List */}
          {currentDay && currentDay.slots.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentDay.slots.map((slot) => (
                <div
                  key={slot._id}
                  className={`border rounded-lg p-3 flex items-center justify-between ${
                    slot.isBooked
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {slot.from} - {slot.to}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        slot.isBooked
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {slot.isBooked ? 'Booked' : 'Available'}
                    </span>
                  </div>
                  {!slot.isBooked && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingSlot(slot);
                          setFormData({ from: slot.from, to: slot.to });
                          setShowModal(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ slotId: slot._id, date: currentDay.date })}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingSlot ? 'Edit Slot' : 'Add Slot'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From (6:00 AM - 10:00 PM)</label>
                <input
                  type="time"
                  value={formData.from}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && (val < '06:00' || val > '22:00')) {
                      toast.error('Time must be between 6:00 AM and 10:00 PM');
                      return;
                    }
                    setFormData({ ...formData, from: val });
                  }}
                  min="06:00"
                  max="22:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To (6:00 AM - 10:00 PM)</label>
                <input
                  type="time"
                  value={formData.to}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && (val < '06:00' || val > '22:00')) {
                      toast.error('Time must be between 6:00 AM and 10:00 PM');
                      return;
                    }
                    setFormData({ ...formData, to: val });
                  }}
                  min="06:00"
                  max="22:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-all"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Time Slot?</h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. The time slot will be permanently removed.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Availability;
