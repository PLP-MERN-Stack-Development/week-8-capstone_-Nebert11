import React, { useState } from 'react';
import { Calendar, Clock, User, Search, Filter, ArrowRight } from 'lucide-react';
import { BlogPost } from '../types';

const Blog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Understanding Anxiety: A Comprehensive Guide',
      excerpt: 'Learn about the different types of anxiety disorders, their symptoms, and effective coping strategies.',
      content: '',
      author: 'Dr. Sarah Johnson',
      category: 'Mental Health',
      tags: ['anxiety', 'coping', 'mental health'],
      imageUrl: 'https://images.pexels.com/photos/3779448/pexels-photo-3779448.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      publishedAt: new Date('2024-01-10'),
      isPublished: true
    },
    {
      id: '2',
      title: 'The Power of Mindfulness in Daily Life',
      excerpt: 'Discover how mindfulness practices can transform your mental well-being and reduce stress.',
      content: '',
      author: 'Dr. Michael Chen',
      category: 'Wellness',
      tags: ['mindfulness', 'meditation', 'stress'],
      imageUrl: 'https://images.pexels.com/photos/3779448/pexels-photo-3779448.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      publishedAt: new Date('2024-01-08'),
      isPublished: true
    },
    {
      id: '3',
      title: 'Building Resilience: Strategies for Tough Times',
      excerpt: 'Learn practical techniques to develop emotional resilience and bounce back from adversity.',
      content: '',
      author: 'Dr. Emma Williams',
      category: 'Personal Growth',
      tags: ['resilience', 'coping', 'growth'],
      imageUrl: 'https://images.pexels.com/photos/3912979/pexels-photo-3912979.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      publishedAt: new Date('2024-01-05'),
      isPublished: true
    },
    {
      id: '4',
      title: 'The Science Behind Cognitive Behavioral Therapy',
      excerpt: 'Explore how CBT works and why it\'s one of the most effective treatments for various mental health conditions.',
      content: '',
      author: 'Dr. David Brown',
      category: 'Therapy',
      tags: ['cbt', 'therapy', 'research'],
      imageUrl: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      publishedAt: new Date('2024-01-03'),
      isPublished: true
    },
    {
      id: '5',
      title: 'Navigating Depression: Hope and Healing',
      excerpt: 'Understanding depression and the path to recovery with professional support and self-care strategies.',
      content: '',
      author: 'Dr. Lisa Martinez',
      category: 'Mental Health',
      tags: ['depression', 'treatment', 'recovery'],
      imageUrl: 'https://images.pexels.com/photos/3779448/pexels-photo-3779448.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      publishedAt: new Date('2024-01-01'),
      isPublished: true
    },
    {
      id: '6',
      title: 'Digital Wellness: Managing Screen Time for Mental Health',
      excerpt: 'Tips for maintaining a healthy relationship with technology and protecting your mental well-being.',
      content: '',
      author: 'Dr. James Wilson',
      category: 'Wellness',
      tags: ['digital wellness', 'technology', 'balance'],
      imageUrl: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      publishedAt: new Date('2023-12-28'),
      isPublished: true
    }
  ];

  const categories = ['all', 'Mental Health', 'Wellness', 'Personal Growth', 'Therapy'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">Mental Health Resources</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto dark:text-white">
            Expert insights, practical tips, and evidence-based strategies for your mental wellness journey.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="all">All</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-12 dark:bg-gray-800 dark:text-white">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={featuredPost.imageUrl}
                  alt={featuredPost.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    Featured
                  </span>
                  <span className="ml-2">{featuredPost.category}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{featuredPost.title}</h2>
                <p className="text-gray-600 mb-4">{featuredPost.excerpt}</p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <User className="h-4 w-4 mr-1" />
                  <span className="mr-4">{featuredPost.author}</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{featuredPost.publishedAt.toLocaleDateString()}</span>
                </div>
                <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                  Read More
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.slice(1).map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800 dark:text-white">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <User className="h-4 w-4 mr-1" />
                  <span className="mr-4">{post.author}</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{post.publishedAt.toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                  Read More
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg dark:text-gray-400">No articles found matching your criteria.</p>
            <p className="text-gray-400 mt-2 dark:text-gray-500">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Newsletter Section */}
        <div className="bg-blue-600 text-white rounded-lg p-8 mt-12 dark:bg-blue-700 dark:text-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Stay Updated</h2>
            <p className="text-blue-100 mb-6 dark:text-blue-300">
              Get the latest mental health insights and resources delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
              />
              <button className="bg-white text-blue-600 px-6 py-2 rounded-md hover:bg-gray-100 transition-colors dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;