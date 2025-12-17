Eventify - Event Management Platform
Eventify is a full-stack event management application that allows users to create, discover, and manage events. Users can RSVP to events, track attendance, and interact with their community through a modern, responsive web interface.

🌟 Live Demo
Frontend: https://eventify-app.vercel.app

Backend API: https://eventify-api.onrender.com

📋 Features
✅ Core Features Implemented
User Authentication: Secure registration, login, and session management using JWT tokens

Event Management: Create, read, update, and delete events with image uploads

RSVP System: Join/leave events with real-time capacity tracking

Event Discovery: Search, filter, and sort events by category, date, and location

Responsive Design: Mobile-first responsive UI built with Tailwind CSS

Real-time Updates: Instant UI updates without page refresh

Image Uploads: Cloudinary integration for event images

✅ Advanced Features
Concurrency-safe RSVP: MongoDB transactions prevent double-booking and race conditions

Capacity Management: Real-time tracking of available spots

Event Categories: Music, Sports, Conference, Workshop, Festival, and more

User Profiles: Personalized event dashboards

Pagination: Efficient loading for large event lists

Form Validation: Client and server-side validation

Toast Notifications: User-friendly feedback system

🏗️ Tech Stack
Frontend
React 18 - UI library

React Router 6 - Client-side routing

Tailwind CSS - Utility-first CSS framework

React Icons - Icon library

Axios - HTTP client

React Hot Toast - Notification system

Context API - State management

Backend
Node.js - Runtime environment

Express.js - Web framework

MongoDB - NoSQL database

Mongoose -

write in .md file
Eventify - Event Management Platform
Eventify is a full-stack event management application that allows users to create, discover, and manage events. Users can RSVP to events, track attendance, and interact with their community through a modern, responsive web interface.

🌟 Live Demo
Frontend: https://eventify-app.vercel.app

Backend API: https://eventify-api.onrender.com

📋 Features
✅ Core Features Implemented
User Authentication: Secure registration, login, and session management using JWT tokens

Event Management: Create, read, update, and delete events with image uploads

RSVP System: Join/leave events with real-time capacity tracking

Event Discovery: Search, filter, and sort events by category, date, and location

Responsive Design: Mobile-first responsive UI built with Tailwind CSS

Real-time Updates: Instant UI updates without page refresh

Image Uploads: Cloudinary integration for event images

✅ Advanced Features
Concurrency-safe RSVP: MongoDB transactions prevent double-booking and race conditions

Capacity Management: Real-time tracking of available spots

Event Categories: Music, Sports, Conference, Workshop, Festival, and more

User Profiles: Personalized event dashboards

Pagination: Efficient loading for large event lists

Form Validation: Client and server-side validation

Toast Notifications: User-friendly feedback system

🏗️ Tech Stack
Frontend
React 18 - UI library

React Router 6 - Client-side routing

Tailwind CSS - Utility-first CSS framework

React Icons - Icon library

Axios - HTTP client

React Hot Toast - Notification system

Context API - State management

Backend
Node.js - Runtime environment

Express.js - Web framework

MongoDB - NoSQL database

Mongoose - ODM for MongoDB

JWT - Authentication tokens

Multer - File upload handling

Cloudinary - Cloud image storage

Bcrypt - Password hashing

CORS - Cross-origin resource sharing

🚀 Local Setup
Prerequisites
Node.js (v16 or higher)

MongoDB (local installation or MongoDB Atlas account)

npm or yarn package manager

1. Clone the Repository
bash
git clone https://github.com/yourusername/eventify.git
cd eventify
2. Backend Setup
bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment variables file
cp .env.example .env

# Edit .env file with your configuration
nano .env
Environment Variables (.env)
env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventify
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventify

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
3. Frontend Setup
bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment variables file
cp .env.example .env

# Edit .env file
nano .env
Environment Variables (.env)
env
VITE_BACKEND_URL=http://localhost:5000
4. Database Setup
bash
# Make sure MongoDB is running
# For local MongoDB:
mongod

# For MongoDB Atlas, ensure your connection string is correct in .env
5. Running the Application
Option A: Run Both Services Separately
Terminal 1 - Backend:

bash
cd backend
npm run dev
# Server runs on http://localhost:5000
Terminal 2 - Frontend:

bash
cd frontend
npm run dev
# App runs on http://localhost:5173
Option B: Using Concurrently (Recommended)
bash
# From root directory
npm install -g concurrently

# Add to package.json in root:
{
  "scripts": {
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm run dev\""
  }
}

# Then run:
npm run dev
6. Access the Application
Frontend: http://localhost:5173

Backend API: http://localhost:5000

API Health Check: http://localhost:5000/health

🛠️ Technical Implementation
RSVP Capacity and Concurrency Challenge
Problem Statement
When multiple users try to RSVP to an event simultaneously, we face two critical challenges:

Race Conditions: Two users might see available capacity and RSVP at the same time, exceeding the limit

Double Booking: A user might RSVP multiple times to the same event

Data Consistency: Attendee count might not match actual RSVPs

Solution Strategy: MongoDB Transactions
Database Schema:

javascript
// Event Model
const eventSchema = new mongoose.Schema({
  title: String,
  capacity: Number,
  attendeesCount: { type: Number, default: 0 }
});

// RSVP Model (prevents duplicate RSVPs)
const rsvpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }
}, { timestamps: true });

// Unique compound index prevents duplicate RSVPs
rsvpSchema.index({ userId: 1, eventId: 1 }, { unique: true });
Concurrency-safe RSVP Implementation
Key Code Implementation (rsvp.controller.js):

javascript
export const rsvpEvent = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const userId = req.user._id;
    const eventId = req.params.eventId;
    
    // 1. Check event exists within transaction
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Event not found" });
    }
    
    // 2. Check capacity within transaction (atomic read)
    if (event.attendeesCount >= event.capacity) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Event is full" });
    }
    
    // 3. Check for duplicate RSVP within transaction
    const existing = await RSVP.findOne({ userId, eventId }).session(session);
    if (existing) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Already RSVP'd" });
    }
    
    // 4. Create RSVP and update count atomically
    await RSVP.create([{ userId, eventId }], { session });
    
    // 5. Increment attendees count (atomic operation)
    event.attendeesCount += 1;
    await event.save({ session });
    
    // 6. Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    return res.status(201).json({
      success: true,
      message: "RSVP successful",
      attendeesCount: event.attendeesCount
    });
    
  } catch (error) {
    // 7. Rollback on any error
    await session.abortTransaction();
    session.endSession();
    
    // Handle duplicate key error (unique index violation)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate RSVP detected"
      });
    }
    
    return res.status(500).json({ success: false, message: error.message });
  }
};
Why This Solution Works:
Atomic Operations: MongoDB transactions ensure all operations succeed or fail together

Isolation Level: Serializable isolation prevents dirty reads and phantom reads

Unique Constraints: Compound index prevents duplicate RSVPs at database level

Capacity Validation: Check happens within transaction, ensuring real-time accuracy

Rollback Safety: Any error triggers complete rollback, maintaining data consistency

Alternative Solutions Considered:
Optimistic Concurrency Control:

Version field with $inc operator

Retry logic on version mismatch

Pros: Better performance for high contention

Cons: More complex implementation

Pessimistic Locking:

Document-level locks

Pros: Simple to understand

Cons: Poor performance, not native in MongoDB

Application-level Queues:

Process RSVPs sequentially

Pros: Complete control

Cons: Single point of failure, complex

Performance Considerations:
Index Optimization: Compound index on (userId, eventId) for fast duplicate checks

Read Preference: Primary reads for strong consistency

Write Concern: Majority write concern for data durability

Session Management: Proper session cleanup to prevent memory leaks

📁 Project Structure
text
eventify/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── event.controller.js
│   │   └── rsvp.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── event.model.js
│   │   └── rsvp.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── event.routes.js
│   │   └── rsvp.routes.js
│   ├── config/
│   │   └── cloudinary.config.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── EventCard.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── events/
│   │   │   │   ├── Events.jsx
│   │   │   │   ├── CreateEvent.jsx
│   │   │   │   ├── EditEvent.jsx
│   │   │   │   └── EventDetails.jsx
│   │   │   └── Home.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   ├── index.html
│   └── vite.config.js
│
└── README.md
🔧 API Endpoints
Authentication
POST /api/auth/register - Register new user

POST /api/auth/login - Login user

POST /api/auth/logout - Logout user

GET /api/auth/is-auth - Check authentication status

Events
GET /api/events - Get all events (with filters)

GET /api/events/:id - Get single event

POST /api/events - Create new event

PUT /api/events/:id - Update event

DELETE /api/events/:id - Delete event

GET /api/events/:id/attendees - Get event attendees

GET /api/events/:id/likes - Get event likes

POST /api/events/:id/like - Like/unlike event

RSVP

POST /api/rsvp/:eventId - RSVP to event

DELETE /api/rsvp/:eventId - Cancel RSVP

GET /api/rsvp/check/:eventId - Check RSVP status

GET /api/rsvp/user/my-rsvps - Get user's RSVPs