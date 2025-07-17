# MindEase - Mental Wellness Platform

A comprehensive mental health platform that connects users with licensed therapists, provides AI-powered support, and offers tools for mood tracking and journaling.

## Features

### Frontend Features
- **User Authentication**: Secure login/register with JWT tokens
- **Role-Based Dashboards**: Different interfaces for patients, therapists, and admins
- **AI Chatbot**: 24/7 mental health support with contextual responses
- **Therapist Directory**: Search and filter licensed mental health professionals
- **Booking System**: Schedule therapy sessions with calendar integration
- **Journal & Mood Tracking**: Private journaling with mood analytics
- **Real-time Messaging**: Secure communication between users and therapists
- **Responsive Design**: Mobile-first design that works on all devices

### Backend Features
- **RESTful API**: Comprehensive API endpoints for all platform features
- **WebSocket Support**: Real-time messaging with Socket.IO
- **Database Integration**: MongoDB with Mongoose ODM
- **Security**: JWT authentication, password hashing, rate limiting
- **AI Integration**: OpenAI API for chatbot and content analysis
- **File Upload**: Secure file handling with validation
- **Email Service**: Automated notifications and communications
- **Payment Processing**: Stripe integration for session payments

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.IO Client** for real-time features
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **OpenAI API** for AI features
- **Stripe** for payments
- **Nodemailer** for emails

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- OpenAI API key
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/mindease.git
   cd mindease
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the development servers**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from root directory)
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/account` - Delete user account

### Therapists
- `GET /api/therapists` - Get all therapists
- `GET /api/therapists/:id` - Get therapist by ID
- `PUT /api/therapists/profile` - Update therapist profile

### Chat
- `POST /api/chat/ai` - Send message to AI chatbot
- `GET /api/chat/history` - Get chat history
- `POST /api/chat/message` - Send message to therapist

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Journal
- `POST /api/journal` - Create journal entry
- `GET /api/journal` - Get user journal entries
- `PUT /api/journal/:id` - Update journal entry
- `DELETE /api/journal/:id` - Delete journal entry

### Mood Tracking
- `POST /api/mood` - Create mood entry
- `GET /api/mood` - Get mood history
- `GET /api/mood/insights` - Get mood insights

## Database Schema

### Users Collection
```javascript
{
  firstName: String,
  lastName: String,
  email: String,
  password: String (hashed),
  role: ['patient', 'therapist', 'admin'],
  avatar: String,
  isActive: Boolean,
  therapistProfile: {
    license: String,
    specialties: [String],
    experience: Number,
    hourlyRate: Number,
    bio: String,
    verified: Boolean
  }
}
```

### Messages Collection
```javascript
{
  senderId: ObjectId,
  receiverId: ObjectId,
  content: String,
  messageType: ['text', 'image', 'file'],
  isRead: Boolean,
  isAIResponse: Boolean,
  aiMetadata: {
    confidence: Number,
    intent: String
  }
}
```

### Bookings Collection
```javascript
{
  patientId: ObjectId,
  therapistId: ObjectId,
  sessionDate: Date,
  duration: Number,
  status: ['pending', 'confirmed', 'completed', 'cancelled'],
  price: Number,
  paymentStatus: String,
  notes: String
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured cross-origin resource sharing
- **Helmet**: Security headers for Express apps
- **Content Moderation**: AI-powered content screening

## Deployment

### Frontend (Vercel)
```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

### Backend (Railway/Render)
```bash
# Set environment variables
# Deploy using platform-specific commands
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@mindease.com or join our community Discord server.

## Acknowledgments

- OpenAI for providing AI capabilities
- Stripe for payment processing
- MongoDB for database services
- All the amazing open-source contributors