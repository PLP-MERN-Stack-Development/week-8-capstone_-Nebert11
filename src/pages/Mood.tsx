import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

interface MoodEntry {
  id: string;
  mood: number;
  energy: number;
  notes: string;
  date: string;
}

const Mood: React.FC = () => {
  const { token } = useAuth();
  const [form, setForm] = useState({ mood: 5, energy: 5, notes: '' });
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    // Fetch mood entries from backend
    const fetchEntries = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/mood`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.entries)) {
          setEntries(data.entries.map((e: any) => ({
            ...e,
            date: new Date(e.createdAt).toLocaleDateString(),
          })));
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchEntries();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mood: Number(form.mood),
          energy: Number(form.energy),
          anxiety: 5, // default value, backend requires it
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to log mood.');
        return;
      }
      setEntries([
        ...entries,
        {
          id: data.entry?.id || Date.now().toString(),
          mood: Number(form.mood),
          energy: Number(form.energy),
          notes: form.notes,
          date: new Date().toLocaleDateString(),
        },
      ]);
      setForm({ mood: 5, energy: 5, notes: '' });
      setSuccess(true);
    } catch (err) {
      setError('Failed to log mood.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 dark:bg-gray-900">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md mb-8 dark:bg-gray-800 dark:text-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400 dark:text-white">Mood Tracker</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-600 text-center dark:text-red-400">{error}</div>}
          {success && <div className="text-green-600 text-center dark:text-green-400">Mood logged successfully!</div>}
          <div>
            <label className="block text-gray-700 mb-1 dark:text-white">Mood (1-10)</label>
            <input
              type="number"
              name="mood"
              min={1}
              max={10}
              value={form.mood}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 dark:text-white">Energy (1-10)</label>
            <input
              type="number"
              name="energy"
              min={1}
              max={10}
              value={form.energy}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 dark:text-white">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full">Log Mood</Button>
        </form>
      </div>
      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Mood Log</h2>
        {entries.length === 0 ? (
          <div className="text-gray-500 dark:text-white">No entries yet.</div>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li key={entry.id} className="bg-white rounded shadow p-4 flex flex-col">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold dark:text-white">{entry.date}</span>
                  <span>Mood: <span className="font-bold text-blue-600 dark:text-white">{entry.mood}</span></span>
                  <span>Energy: <span className="font-bold text-green-600 dark:text-white">{entry.energy}</span></span>
                </div>
                {entry.notes && <div className="text-gray-700 dark:text-white">Notes: {entry.notes}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Mood; 