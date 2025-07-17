import React from 'react';
import { Heart, Shield, Users, Award, Target, Globe } from 'lucide-react';

const About: React.FC = () => {
  const values = [
    {
      icon: Heart,
      title: 'Compassionate Care',
      description: 'We believe in treating every individual with empathy, respect, and understanding on their mental health journey.'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Your privacy is paramount. We use enterprise-grade security to protect your personal information and conversations.'
    },
    {
      icon: Users,
      title: 'Professional Network',
      description: 'Our therapists are licensed, verified professionals who undergo rigorous screening and continuous education.'
    },
    {
      icon: Award,
      title: 'Evidence-Based',
      description: 'We employ proven therapeutic approaches and cutting-edge technology to deliver effective mental health support.'
    },
    {
      icon: Target,
      title: 'Personalized Approach',
      description: 'Every individual is unique. We tailor our services to meet your specific needs and goals.'
    },
    {
      icon: Globe,
      title: 'Accessible Care',
      description: 'Mental health support should be available to everyone, anywhere, at any time.'
    }
  ];

  const team = [
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Chief Clinical Officer',
      image: 'https://images.pexels.com/photos/3779448/pexels-photo-3779448.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: 'Licensed psychologist with 15 years of experience in digital mental health innovation.'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Engineering',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: 'Former tech lead at major healthcare platforms, passionate about secure, scalable mental health solutions.'
    },
    {
      name: 'Dr. Sarah Kim',
      role: 'Director of Clinical Research',
      image: 'https://images.pexels.com/photos/3912979/pexels-photo-3912979.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: 'Research scientist specializing in AI applications in mental health and therapeutic outcomes.'
    },
    {
      name: 'James Wilson',
      role: 'Head of Product',
      image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: 'Product strategist focused on creating intuitive, accessible mental health experiences.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 dark:from-blue-800 dark:to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 dark:text-white">
              Transforming Mental Healthcare
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto dark:text-white">
              We're on a mission to make quality mental health support accessible, affordable, and available to everyone, everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 dark:text-white">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 dark:text-white">
                Mental health challenges affect millions of people worldwide, yet access to quality care remains limited by geography, cost, and stigma. We're changing that.
              </p>
              <p className="text-lg text-gray-600 mb-6 dark:text-white">
                MindEase combines the expertise of licensed therapists with AI-powered support to create a comprehensive, accessible mental health platform that meets you where you are.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">100K+</div>
                  <div className="text-gray-600 dark:text-gray-300">Lives Impacted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">500+</div>
                  <div className="text-gray-600 dark:text-gray-300">Licensed Therapists</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3779448/pexels-photo-3779448.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
                alt="Mental health support"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 dark:text-white">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto dark:text-white">
              These core principles guide everything we do at MindEase
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">{value.title}</h3>
                <p className="text-gray-600 dark:text-white">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate professionals dedicated to revolutionizing mental healthcare
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white dark:bg-blue-900 dark:text-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-blue-100">User Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">AI Support Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Countries Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">HIPAA</div>
              <div className="text-blue-100">Compliant Platform</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 dark:text-white">Ready to Begin Your Journey?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto dark:text-white">
            Join thousands of individuals who have found support, healing, and growth through MindEase.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600">
              Get Started Today
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;