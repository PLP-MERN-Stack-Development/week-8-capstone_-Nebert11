import React, { useState, useEffect } from 'react';
import { Star, Filter, MapPin, Clock, DollarSign, Video, MessageCircle } from 'lucide-react';
import { Therapist } from '../types';
import Button from '../components/ui/Button';

const Therapists: React.FC = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';
    fetch(`${API_BASE_URL}/api/therapists?limit=1000`)
      .then(res => res.json())
      .then(data => setTherapists(data.therapists || []))
      .catch(() => setTherapists([]));
  }, []);

  const specialties = ['all', 'Anxiety', 'Depression', 'Trauma', 'Couples Therapy', 'Family Therapy', 'Addiction Recovery', 'ADHD'];
  const locations = ['all', 'New York', 'California', 'Texas', 'Florida'];
  const priceRanges = ['all', '$50-$100', '$100-$150', '$150-$200', '$200+'];

  const filteredTherapists = therapists.filter(therapist => {
    const specialtyMatch = selectedSpecialty === 'all' || therapist.specialties.includes(selectedSpecialty);
    const priceMatch = priceRange === 'all' || 
      (priceRange === '$50-$100' && therapist.hourlyRate >= 50 && therapist.hourlyRate < 100) ||
      (priceRange === '$100-$150' && therapist.hourlyRate >= 100 && therapist.hourlyRate < 150) ||
      (priceRange === '$150-$200' && therapist.hourlyRate >= 150 && therapist.hourlyRate < 200) ||
      (priceRange === '$200+' && therapist.hourlyRate >= 200);
    
    return specialtyMatch && priceMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">Find a Therapist</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto dark:text-white">
            Browse our network of licensed therapists and find the right fit for you.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 dark:bg-gray-800 dark:text-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty === 'all' ? 'All Specialties' : specialty}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
              >
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
              >
                {priceRanges.map(range => (
                  <option key={range} value={range}>
                    {range === 'all' ? 'All Prices' : range}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search and Filter UI */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 dark:text-white">
          <input
            type="text"
            placeholder="Search therapists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTherapists.map((therapist) => (
            <div key={therapist.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:text-white">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={therapist.avatar}
                    alt={`${therapist.firstName} ${therapist.lastName}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {therapist.firstName} {therapist.lastName}
                      </h3>
                      {therapist.verified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{therapist.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{therapist.experience} years exp</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>${therapist.hourlyRate}/hour</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-600 text-sm mb-3">{therapist.bio}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {therapist.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>License: {therapist.license}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>Message</span>
                      </Button>
                      <Button size="sm" className="flex items-center space-x-1">
                        <Video className="h-4 w-4" />
                        <span>Book Session</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTherapists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No therapists found matching your criteria.</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Therapists;