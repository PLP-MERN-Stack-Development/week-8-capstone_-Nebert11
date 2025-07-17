import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, BookOpen, Search, Filter, Calendar, Heart, Lock, Globe } from 'lucide-react';
import { JournalEntry } from '../types';
import Button from '../components/ui/Button';

const Journal: React.FC = () => {
  const { user, token } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 5,
    tags: '',
    isPrivate: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    // Fetch journal entries from backend
    const fetchEntries = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/journal`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.entries)) {
          setEntries(data.entries.map((e: any) => ({
            ...e,
            createdAt: new Date(e.createdAt),
            updatedAt: new Date(e.updatedAt),
          })));
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchEntries();
  }, [token]);

  const handleCreateEntry = async () => {
    setError(null);
    setSuccess(false);
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: newEntry.title,
          content: newEntry.content,
          mood: newEntry.mood,
          tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          isPrivate: newEntry.isPrivate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to save entry.');
        return;
      }
      const entry: JournalEntry = {
        id: data.entry?.id || Date.now().toString(),
        userId: user?.id || '1',
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood,
        tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        isPrivate: newEntry.isPrivate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setEntries([entry, ...entries]);
      setNewEntry({
        title: '',
        content: '',
        mood: 5,
        tags: '',
        isPrivate: true
      });
      setIsWriting(false);
      setSuccess(true);
    } catch (err) {
      setError('Failed to save entry.');
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMood = moodFilter === 'all' ||
                        (moodFilter === 'positive' && entry.mood >= 7) ||
                        (moodFilter === 'neutral' && entry.mood >= 4 && entry.mood < 7) ||
                        (moodFilter === 'negative' && entry.mood < 4);
    
    return matchesSearch && matchesMood;
  });

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-600 dark:text-green-400';
    if (mood >= 6) return 'text-yellow-600 dark:text-yellow-300';
    if (mood >= 4) return 'text-orange-600 dark:text-orange-300';
    return 'text-red-600 dark:text-red-400';
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 9) return '😊';
    if (mood >= 7) return '😌';
    if (mood >= 5) return '😐';
    if (mood >= 3) return '😟';
    return '😢';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 dark:text-gray-100">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300">Please log in to access your journal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-blue-600 mr-3 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Journal</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-white">
            A safe space to express your thoughts, track your mood, and reflect on your journey.
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 dark:bg-gray-800 dark:text-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-300" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <select
                value={moodFilter}
                onChange={(e) => setMoodFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="all">All Moods</option>
                <option value="positive">Positive (7-10)</option>
                <option value="neutral">Neutral (4-6)</option>
                <option value="negative">Difficult (1-3)</option>
              </select>
            </div>
            <Button
              onClick={() => setIsWriting(true)}
              className="flex items-center space-x-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Entry</span>
            </Button>
          </div>
        </div>

        {/* New Entry Modal */}
        {isWriting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">New Journal Entry</h2>
                {error && <div className="text-red-600 text-center mb-2">{error}</div>}
                {success && <div className="text-green-600 text-center mb-2">Entry saved successfully!</div>}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={newEntry.title}
                      onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                      placeholder="Give your entry a title..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      value={newEntry.content}
                      onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                      placeholder="Write your thoughts here..."
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mood (1-10) {getMoodEmoji(newEntry.mood)}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newEntry.mood}
                      onChange={(e) => setNewEntry({...newEntry, mood: parseInt(e.target.value)})}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>Very Low</span>
                      <span className={getMoodColor(newEntry.mood)}>{newEntry.mood}</span>
                      <span>Very High</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <input
                      type="text"
                      value={newEntry.tags}
                      onChange={(e) => setNewEntry({...newEntry, tags: e.target.value})}
                      placeholder="Add tags separated by commas (e.g., gratitude, therapy, breakthrough)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      checked={newEntry.isPrivate}
                      onChange={(e) => setNewEntry({...newEntry, isPrivate: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
                      Keep this entry private
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsWriting(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateEntry}>
                    Save Entry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entries */}
        <div className="space-y-6">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:text-white">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">{entry.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-white">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{entry.createdAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Heart className={`h-4 w-4 mr-1 ${getMoodColor(entry.mood)}`} />
                        <span className={getMoodColor(entry.mood)}>
                          {entry.mood}/10 {getMoodEmoji(entry.mood)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {entry.isPrivate ? (
                          <Lock className="h-4 w-4 mr-1 text-gray-400" />
                        ) : (
                          <Globe className="h-4 w-4 mr-1 text-gray-400" />
                        )}
                        <span>{entry.isPrivate ? 'Private' : 'Public'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed dark:text-white">{entry.content}</p>
                </div>

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, i) => (
                      <span
                        key={tag + '-' + i}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg dark:text-white">No journal entries found.</p>
            <p className="text-gray-400 mt-2 dark:text-white">
              {searchTerm || moodFilter !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'Start by writing your first entry!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;