import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

interface Therapist {
  _id: string;
  firstName: string;
  lastName: string;
}

const Book: React.FC = () => {
  const { token } = useAuth();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [form, setForm] = useState({
    therapistId: '',
    date: '',
    time: '',
    sessionType: 'individual',
    duration: 60, // default 60 minutes
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    // Fetch therapists
    fetch(`${API_BASE_URL}/api/therapists?limit=1000`)
      .then(res => res.json())
      .then(data => setTherapists(data.therapists || []))
      .catch(() => setTherapists([]));
    // Fetch user's bookings
    const fetchBookings = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setBookings(data);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchBookings();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.therapistId || !form.date || !form.time) {
      setError('Please fill all required fields.');
      return;
    }
    // Combine date and time into ISO string
    const sessionDate = new Date(`${form.date}T${form.time}`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          therapistId: form.therapistId,
          sessionDate: sessionDate.toISOString(),
          duration: form.duration,
          sessionType: form.sessionType,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to book session.');
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError('Failed to book session.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md dark:bg-gray-800 dark:text-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400 dark:text-white">Book a Session</h1>
        {submitted ? (
          <div className="text-green-600 text-center font-semibold dark:text-green-400 dark:text-white">Session booked successfully!</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-600 text-center dark:text-red-400">{error}</div>}
            <div>
              <label className="block text-gray-700 mb-1 dark:text-white">Therapist</label>
              <select
                name="therapistId"
                value={form.therapistId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
                required
              >
                <option value="">Select a therapist</option>
                {therapists.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1 dark:text-white">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Time</label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Session Type</label>
              <select
                name="sessionType"
                value={form.sessionType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="individual">Individual</option>
                <option value="couples">Couples</option>
                <option value="family">Family</option>
                <option value="group">Group</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                min={30}
                max={120}
                step={15}
                value={form.duration}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <Button type="submit" className="w-full">Book Session</Button>
          </form>
        )}
        {/* Booked Sessions List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">My Booked Sessions</h2>
          {bookings.length === 0 ? (
            <div className="text-gray-500">No sessions booked yet.</div>
          ) : (
            <ul className="space-y-2">
              {bookings.map((b) => (
                <li key={b._id} className="bg-white rounded shadow p-4 flex flex-col">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{new Date(b.sessionDate).toLocaleDateString()} {new Date(b.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Type: <span className="font-bold text-blue-600">{b.sessionType}</span></span>
                  </div>
                  <div>Therapist: {b.therapistId?.firstName} {b.therapistId?.lastName}</div>
                  <div>Duration: {b.duration} min</div>
                  <div>Status: {b.status || 'pending'}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Book; 