









🌟 Eventify – MERN Stack Event Management Application

Eventify is a full-stack event management platform built using the MERN stack.
It enables users to create, discover, and RSVP to events with real-time capacity tracking, secure authentication, and a responsive user interface.

🔗 Live Demo Link : https://event-management-app-blue.vercel.app

📋 Features
✅ Core Features

User Authentication

Secure registration and login using JWT

Session management

Event Management

Create, read, update, and delete events

Event image uploads using Cloudinary

RSVP System

Join and leave events

Real-time capacity tracking

Event Discovery

Search, filter, and sort events by:

Category

Date

Location

Responsive Design

Mobile-first UI using Tailwind CSS

Real-time UI Updates

Instant updates without page refresh

🚀 Advanced Features

Concurrency-safe RSVP system

MongoDB transactions prevent race conditions and overbooking

Capacity Management

Accurate real-time attendee tracking

Event Categories

Music, Sports, Conference, Workshop, Festival, and more

User Profiles

Personalized event dashboards

Pagination

Efficient handling of large event lists

Form Validation

Client-side and server-side validation

Toast Notifications

User-friendly feedback system

🏗️ Tech Stack
Frontend

React 18

React Router 6

Tailwind CSS

React Icons

Axios

React Hot Toast

Context API

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT (Authentication)

Multer (File uploads)

Cloudinary (Image storage)

Bcrypt (Password hashing)

CORS

🛠️ Technical Highlight: Concurrency-safe RSVP System
Problem

When multiple users attempt to RSVP simultaneously:

Event capacity may be exceeded

Duplicate RSVPs may occur

Data inconsistency can happen

✅ Solution: MongoDB Transactions
Key Techniques

MongoDB sessions & transactions

Atomic capacity validation

Unique compound index on (userId, eventId)

Automatic rollback on failure

RSVP Schema (Duplicate Prevention)
rsvpSchema.index({ userId: 1, eventId: 1 }, { unique: true });

Why This Approach Works

Atomic Operations: Ensures all steps succeed or fail together

Strong Consistency: Prevents race conditions

Database-level Protection: Unique index blocks duplicates

Rollback Safety: Errors revert all changes

🔧 API Endpoints
Authentication

POST /api/auth/register – Register new user

POST /api/auth/login – Login user

POST /api/auth/logout – Logout user

GET /api/auth/is-auth – Check authentication status

Events

GET /api/events – Get all events (filters supported)

GET /api/events/:id – Get single event

POST /api/events – Create new event

PUT /api/events/:id – Update event

DELETE /api/events/:id – Delete event

RSVP

POST /api/rsvp/:eventId – RSVP to event

DELETE /api/rsvp/:eventId – Cancel RSVP

GET /api/rsvp/check/:eventId – Check RSVP status

GET /api/rsvp/user/my-rsvps – Get user RSVPs

📁 Project Structure
eventify/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── server.js
│
├── frontend/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
│
└── README.md

📌 Summary

Eventify demonstrates real-world MERN stack development, with a strong focus on:

Secure authentication

Concurrency-safe backend logic

Clean frontend architecture

Scalable and maintainable design