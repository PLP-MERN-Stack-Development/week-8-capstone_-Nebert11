import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    urgency: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        urgency: 'normal'
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Crisis Support',
      content: '1-800-MINDEASE',
      subtitle: 'Available 24/7 for emergencies'
    },
    {
      icon: Mail,
      title: 'General Inquiries',
      content: 'support@mindease.com',
      subtitle: 'Response within 24 hours'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      content: 'Chat with our support team',
      subtitle: 'Monday - Friday, 9 AM - 6 PM EST'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      content: 'Monday - Friday: 9 AM - 6 PM EST',
      subtitle: 'Weekend support available'
    }
  ];

  const faqs = [
    {
      question: 'How quickly can I get matched with a therapist?',
      answer: 'Most users are matched with a therapist within 24-48 hours. Our AI system helps find the best fit based on your needs and preferences.'
    },
    {
      question: 'Is my information kept confidential?',
      answer: 'Yes, we follow strict HIPAA compliance and use enterprise-grade encryption to protect your privacy and personal information.'
    },
    {
      question: 'What if I need immediate help?',
      answer: 'For immediate crisis support, contact our 24/7 crisis line at 1-800-MINDEASE or call 988 for the National Suicide Prevention Lifeline.'
    },
    {
      question: 'How does the AI chatbot work?',
      answer: 'Our AI chatbot provides immediate support using evidence-based therapeutic techniques. It\'s available 24/7 and can help with coping strategies, mood tracking, and crisis support.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 dark:text-gray-100">Get in Touch</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            We're here to support you. Reach out with questions, concerns, or to learn more about our services.
          </p>
        </div>

        {/* Emergency Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 dark:bg-red-900 dark:border-red-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Phone className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Crisis Support</h3>
              <p className="text-red-700 dark:text-red-300">
                If you're experiencing a mental health crisis or having thoughts of self-harm, please contact emergency services immediately or call the National Suicide Prevention Lifeline at{' '}
                <a href="tel:988" className="font-semibold underline">988</a>.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl mx-auto dark:bg-gray-800 dark:text-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">Send us a Message</h2>
            
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600">Thank you for reaching out. We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                    Urgency Level
                  </label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  >
                    <option value="low">Low - General inquiry</option>
                    <option value="normal">Normal - Standard support</option>
                    <option value="high">High - Need assistance soon</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2"
                  size="lg"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </Button>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">Contact Information</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <info.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{info.title}</h3>
                      <p className="text-gray-700 dark:text-gray-300">{info.content}</p>
                      <p className="text-sm text-gray-500">{info.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Office Location */}
        <div className="bg-white rounded-lg shadow-sm p-8 mt-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 dark:text-white">Our Mission</h2>
            <p className="text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
              MindEase is committed to making mental health support accessible to everyone. Our team of licensed professionals and innovative technology work together to provide compassionate, effective care whenever you need it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;