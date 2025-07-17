import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-8 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">MindEase</span>
        </div>
        <div className="mt-4 md:mt-0 text-gray-600 text-sm dark:text-gray-300">
          &copy; {new Date().getFullYear()} MindEase. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;