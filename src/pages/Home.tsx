import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Users, Calendar, Heart, Shield, Clock } from 'lucide-react';
import Button from '../components/ui/Button';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: MessageCircle,
      title: 'AI Mental Health Chatbot',
      description: 'Get immediate support with our AI-powered chatbot trained on mental health best practices.'
    },
    {
      icon: Users,
      title: 'Licensed Therapists',
      description: 'Connect with verified, licensed mental health professionals for personalized care.'
    },
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Book sessions at your convenience with our integrated calendar system.'
    },
    {
      icon: Heart,
      title: 'Mood Tracking',
      description: 'Monitor your emotional well-being with daily mood tracking and insights.'
    },
    {
      icon: Shield,
      title: 'Private & Secure',
      description: 'Your privacy is our priority with end-to-end encryption and HIPAA compliance.'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Access support whenever you need it with our round-the-clock availability.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white dark:from-blue-800 dark:to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 dark:text-white">
              Your Mental Wellness Journey Starts Here
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto dark:text-white">
              Professional therapy, AI-powered support, and personalized care - all in one secure platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-300 px-8 py-4 text-lg dark:bg-gray-900 dark:text-blue-400 dark:hover:bg-gray-800">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg dark:bg-gray-900 dark:text-blue-400 dark:hover:bg-gray-800">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/therapists">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg dark:border-gray-200 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-blue-400">
                      Find Therapists
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 dark:text-white">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto dark:text-white">
              Our comprehensive platform combines professional therapy with innovative technology to support your mental health journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:text-white">
                <feature.icon className="h-12 w-12 text-blue-600 mb-4 dark:text-blue-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-white">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16 dark:bg-blue-900 dark:text-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Happy Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Licensed Therapists</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">AI Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 dark:text-white">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto dark:text-white">
            Join thousands of users who have improved their mental health with MindEase.
          </p>
          {!user && (
            <Link to="/register">
              <Button size="lg" className="px-8 py-4 text-lg">
                Get Started Today
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;