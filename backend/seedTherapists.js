const mongoose = require('mongoose');
const User = require('./models/User');

const sampleTherapists = [
  {
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@mindease.com',
    password: 'password123',
    role: 'therapist',
    isActive: true,
    therapistProfile: {
      verified: true,
      specialties: ['Anxiety', 'Depression', 'Trauma'],
      hourlyRate: 120,
      rating: 4.9,
      experience: 8,
      bio: 'Specializing in cognitive-behavioral therapy and trauma-informed care.',
    },
    avatar: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  },
  {
    firstName: 'Dr. Michael',
    lastName: 'Chen',
    email: 'michael.chen@mindease.com',
    password: 'password123',
    role: 'therapist',
    isActive: true,
    therapistProfile: {
      verified: true,
      specialties: ['Couples Therapy', 'Family Therapy', 'Communication'],
      hourlyRate: 140,
      rating: 4.8,
      experience: 12,
      bio: 'Helping couples and families improve communication and strengthen relationships.',
    },
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  },
  {
    firstName: 'Dr. Emma',
    lastName: 'Williams',
    email: 'emma.williams@mindease.com',
    password: 'password123',
    role: 'therapist',
    isActive: true,
    therapistProfile: {
      verified: true,
      specialties: ['Personal Growth', 'Resilience', 'CBT'],
      hourlyRate: 110,
      rating: 4.7,
      experience: 10,
      bio: 'Empowering clients to build resilience and achieve personal growth.',
    },
    avatar: 'https://images.pexels.com/photos/3912979/pexels-photo-3912979.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  },
  {
    firstName: 'Dr. Olivia',
    lastName: 'Smith',
    email: 'olivia.smith@mindease.com',
    password: 'password123',
    role: 'therapist',
    isActive: true,
    therapistProfile: {
      verified: true,
      specialties: ['Mindfulness', 'Meditation', 'Stress'],
      hourlyRate: 130,
      rating: 4.85,
      experience: 9,
      bio: 'Guiding clients through mindfulness and meditation for stress reduction.',
    },
    avatar: 'https://images.pexels.com/photos/3779448/pexels-photo-3779448.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  },
  {
    firstName: 'Dr. David',
    lastName: 'Lee',
    email: 'david.lee@mindease.com',
    password: 'password123',
    role: 'therapist',
    isActive: true,
    therapistProfile: {
      verified: true,
      specialties: ['Trauma', 'PTSD', 'EMDR'],
      hourlyRate: 150,
      rating: 4.95,
      experience: 15,
      bio: 'Expert in trauma recovery and EMDR therapy.',
    },
    avatar: 'https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  },
  {
    firstName: 'Dr. Sophia',
    lastName: 'Martinez',
    email: 'sophia.martinez@mindease.com',
    password: 'password123',
    role: 'therapist',
    isActive: true,
    therapistProfile: {
      verified: true,
      specialties: ['Adolescents', 'Family Therapy', 'Anxiety'],
      hourlyRate: 125,
      rating: 4.6,
      experience: 7,
      bio: 'Supporting adolescents and families through challenging times.',
    },
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  },
];

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/mindease'); // Update if your DB URI is different
  await User.deleteMany({ role: 'therapist' }); // Optional: clear existing therapists
  await User.insertMany(sampleTherapists);
  console.log('Sample therapists inserted!');
  mongoose.disconnect();
}

seed(); 