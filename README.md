#Car Dealership Management System (Kata)
A full-stack car dealership inventory and sales management web application built with Node.js, Express, TypeScript, Prisma ORM, and React.

##Tech Stack
Frontend: React, TypeScript, Vite, CSS

Backend: Node.js, Express.js, TypeScript, ts-node-dev

Database & ORM: SQLite / PostgreSQL, Prisma ORM

Authentication: JSON Web Tokens (JWT) & Role-Based Access Control (Admin / User)

Testing: Jest, Supertest

##Features
Authentication & Authorization: Secure JWT token login with distinct capabilities for regular Users and Admins.

Vehicle Inventory Management: Real-time adding, viewing, searching, and deleting of inventory listings.

Dynamic Stock Handling: Automatic stock calculation, low-stock threshold triggers, and real-time inventory updates.

Analytics Dashboard: Metrics displaying total revenue, completed sales counts, and real-time low-stock alerts.

Search & Filtering: Filtering vehicles by search queries (make, model, category) and maximum price ranges.

##Getting Started
###Prerequisites
Node.js (v18+ recommended)

npm

###Quick Start Setup
1. Clone the repository:
git clone https://github.com/MamathaKumari-210124/car-dealership-kata.git
cd car-dealership-kata

2. Setup and run Backend (Terminal 1):
cd backend
npm install
npx prisma migrate dev
npm run dev

3. Setup and run Frontend (Terminal 2 from root directory):
cd frontend
npm install
npm run dev

##Running Tests
To run the automated backend test suite:
cd backend
npm test

##Project Structure
car-dealership-kata/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route handler logic
│   │   ├── middleware/       # JWT auth & role validation
│   │   ├── routes/           # Express API endpoints
│   │   └── server.ts         # App entry point
│   ├── prisma/               # Database schemas & migrations
│   └── tests/                # Integration and unit tests
└── frontend/
└── src/                  # React UI components and state
