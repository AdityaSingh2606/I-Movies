# 🎬 IMovies – Full-Stack Movie Ticket Booking & Cinema Management System

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-purple.svg)](https://github.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-blue.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Real--Time-Socket.IO-black.svg)](https://socket.io/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-brightgreen.svg)](https://www.mongodb.com/)

A modern, full-featured, responsive cinema management and movie ticket reservation platform designed with a dark cinematic aesthetic inspired by **BookMyShow**, **PVR Cinemas**, and **Netflix**.

---

## 🌟 Key Features

### 1. 🎟️ Real-Time Interactive Seat Selection & Synchronization
- Interactive auditorium layout with **Silver (Rows A-B)**, **Gold (Rows C-E)**, and **Platinum (Row F)** seating tiers.
- **Socket.IO Real-Time Engine**: When any customer temporarily selects a seat, all other users instantly see that seat locked in vibrant amber orange.
- **5-Minute Server-Side Reservation Lock**: Prevents double-booking. Expired seat locks are automatically released by background services.
- Dynamic ticket price calculations with base fare, convenience fee, and GST.

### 2. 💳 Simulated Payment Gateway (Demo Mode)
- Support for multiple payment methods: **UPI / QR Code**, **Credit Card**, **Debit Card**, and **Net Banking**.
- Dedicated **Demo Simulation Mode** with choice between:
  - **Simulate Success**: Confirms the booking, updates MongoDB atomically, locks seats, triggers celebration confetti, and issues a verified digital ticket.
  - **Simulate Failure**: Tests graceful gateway failure recovery, unlocks reserved seats, and allows re-selection.

### 3. 🎫 Digital Cinema E-Tickets with QR Verification
- Authentic cinema ticket format with perforated ticket notch divider.
- Real-time generated **QR code** containing tamper-proof verification references.
- One-click **Print / Download Ticket** optimized with `@media print` styling.

### 4. 👑 Executive Admin Dashboard & Cinema Console
- KPI Analytics: Total Users, Total Movies, Total Theatres, Active Shows, Total Bookings, and Gross Revenue.
- 7-Day Revenue Trend interactive bar visualizations and Top Grossing Movies breakdown.
- **Movie Management**: Full CRUD for titles, trailers, synopsis, posters, banners, durations, and release statuses.
- **Theatre Management**: Multiplex venue registration with automatic screen generator (IMAX Laser, 4DX, Dolby Cinema).
- **Show Scheduling**: Schedule movie screenings across dates, screen formats, and tier pricing.
- **Booking & Payment Ledgers**: Complete audit log of all customer transactions, statuses, and digital tickets.
- **User Management**: Role elevation (Admin/User) and account status toggles.

### 5. 🛡️ User Authentication & Profile
- JWT-based authentication with bcryptjs password hashing.
- Role-Based Access Control (RBAC) protecting customer and administrative routes.
- Personal dashboard: Upcoming, Past, and Cancelled bookings.
- In-app notification center for booking, payment, and cancellation alerts.
- Self-service booking cancellation with simulated refunds.

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript, Bootstrap 5, Custom CSS, React Router DOM v6, Axios, Lucide Icons, React Toastify, Socket.IO Client, QRCode.React, Canvas-Confetti |
| **Backend** | Node.js, Express.js, Socket.IO, JWT, bcryptjs, Multer, Morgan, Express-Rate-Limit, QRCode |
| **Database** | MongoDB, Mongoose ORM *(with built-in MongoMemoryServer zero-config fallback)* |

---

## 📁 Project Architecture

```
D:\I-Movies\
├── start-all.bat            # 1-Click launcher for both Server and Client
├── start-server.bat         # Starts API backend server on Port 5000
├── start-client.bat         # Starts Frontend dev server on Port 3000
├── seed-db.bat              # Seeds MongoDB with realistic sample data
├── package.json             # Root scripts
│
├── server/
│   ├── config/              # MongoDB connection (with automatic memory fallback)
│   ├── controllers/         # MVC Controllers (Auth, Movies, Theatres, Shows, Bookings, Payments, Users, Admin)
│   ├── middleware/          # Auth, Admin RBAC, Multer upload, Centralized error handlers
│   ├── models/              # Mongoose Schemas (User, Movie, Theatre, Screen, Show, Seat, Booking, Payment, Notification)
│   ├── routes/              # Express API Routes
│   ├── services/            # SeatLockService & background lock cleanup
│   ├── sockets/             # Socket.IO room and real-time seat lock events
│   ├── utils/               # JWT token and QR code generators
│   ├── seed/                # Realistic seeder (12 movies, 5 theatres, 15 screens, 180 shows)
│   ├── server.js            # Express & HTTP socket bootstrap
│   └── .env                 # Backend environment configuration
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── common/      # Navbar, Footer, ProtectedRoute, AdminRoute, LoadingSpinner, TrailerModal
    │   │   ├── movie/       # MovieCard with hover zoom & trailer trigger
    │   │   ├── booking/     # Curved Screen SeatMap, Category tiers, TicketView
    │   │   └── admin/       # AdminSidebar, AdminNavbar
    │   ├── context/         # AuthContext & state management
    │   ├── layouts/         # MainLayout, AdminLayout
    │   ├── pages/
    │   │   ├── Home.jsx, Movies.jsx, MovieDetails.jsx, Theatres.jsx
    │   │   ├── SeatBooking.jsx, Checkout.jsx, BookingSuccess.jsx
    │   │   ├── MyBookings.jsx, Profile.jsx, Login.jsx, Register.jsx, NotFound.jsx
    │   │   └── admin/       # Dashboard, Movies, Theatres, Shows, Bookings, Users, Payments
    │   ├── services/        # Axios API client & Socket.IO client
    │   ├── App.jsx          # Route definitions
    │   ├── main.jsx         # React DOM root
    │   └── index.css        # Cinematic custom CSS & theme variables
    └── vite.config.js       # Vite configuration with API reverse proxy
```

---

## 🔑 Demo Login Credentials

For quick evaluation, sample accounts are pre-seeded:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@imovies.com` | `Admin@123` | Full access to Admin Console (`/admin`) and Customer site |
| **Demo Customer** | `user@imovies.com` | `User@123` | Ticket booking, Seat reservation, Profile, My Tickets |

*(Quick-fill buttons are also available directly on the `/login` screen)*

---

## 🚀 Quick Start Guide

### Option A: Double-Click Launcher (Windows)
Double-click `start-all.bat` in the project root. It will open both the backend server and frontend client in separate terminal windows.

### Option B: Manual Terminal Execution

#### 1. Start the Backend API
```bash
cd server
npm run dev
```
*Backend runs on: `http://localhost:5000`*

#### 2. Start the Frontend Client
```bash
cd client
npm run dev
```
*Frontend runs on: `http://localhost:3000`*

#### 3. (Optional) Re-seed Database
```bash
cd server
npm run seed
```

---

## 🌐 Complete REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT |
| `GET` | `/api/auth/me` | Private | Retrieve current user profile |
| `PUT` | `/api/auth/profile` | Private | Update user profile information |
| `PUT` | `/api/auth/change-password` | Private | Update user account password |

### Movies (`/api/movies`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/movies` | Public | Browse movies with genre, language, status, and search filters |
| `GET` | `/api/movies/:id` | Public | Get single movie details and scheduled shows |
| `POST` | `/api/movies` | Admin | Add new movie to catalogue |
| `PUT` | `/api/movies/:id` | Admin | Update movie information |
| `DELETE`| `/api/movies/:id` | Admin | Delete movie (with show dependencies check) |

### Theatres (`/api/theatres`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/theatres` | Public | List theatres with city filter |
| `GET` | `/api/theatres/:id` | Public | Get theatre details, screens, and shows |
| `POST` | `/api/theatres` | Admin | Create theatre and auto-generate screens |
| `DELETE`| `/api/theatres/:id` | Admin | Delete theatre and screens |

### Shows (`/api/shows`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shows` | Public | Filter shows by movie, theatre, date, city |
| `GET` | `/api/shows/:id` | Public | Full seat map with real-time status |
| `POST` | `/api/shows` | Admin | Schedule show and initialize seat matrix |
| `DELETE`| `/api/shows/:id` | Admin | Cancel scheduled show |

### Bookings & Payments (`/api/bookings`, `/api/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings/initiate` | Private | Lock seats & create pending booking intent |
| `GET` | `/api/bookings/my-bookings`| Private | Retrieve current user's ticket bookings |
| `GET` | `/api/bookings/:id` | Private | Get single booking with QR code |
| `PUT` | `/api/bookings/:id/cancel` | Private | Cancel booking, release seats, process refund |
| `POST` | `/api/payments/process` | Private | Simulate payment (UPI, Card, Net Banking) |

### Admin Console (`/api/admin`, `/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard-stats` | Admin | Metrics, 7-day revenue trend, top grossing movies |
| `GET` | `/api/admin/bookings` | Admin | Search all customer bookings |
| `GET` | `/api/admin/payments` | Admin | View simulated payment transaction ledger |
| `GET` | `/api/users` | Admin | View user directory with booking counts |
| `PUT` | `/api/users/:id/role` | Admin | Promote or demote user |
| `PUT` | `/api/users/:id/toggle-status`| Admin | Activate or deactivate user |

---

## ⚡ Real-Time Socket.IO Protocol

The backend maintains rooms for each showtime: `show_<showId>`.

| Socket Event | Direction | Description |
| :--- | :--- | :--- |
| `join-show` | Client -> Server | Join the room for a specific show |
| `leave-show` | Client -> Server | Leave the show room |
| `request-lock-seats` | Client -> Server | Temporarily lock selected seats (5 min expiry) |
| `request-unlock-seats`| Client -> Server | Release selected seats |
| `seat-sync` | Server -> Client | Sends full snapshot of seat availability |
| `seats-locked` | Server -> Broadcast | Notifies viewers that seats were locked |
| `seats-unlocked` | Server -> Broadcast | Notifies viewers that seats are available again |
| `booking-confirmed` | Server -> Broadcast | Permanently marks seats as booked |

---

## 🎓 Academic Project Evaluation Checklist

- [x] **Full-Stack Architecture**: Modern MERN implementation with separate client and server packages.
- [x] **Database Design**: MongoDB models for User, Movie, Theatre, Screen, Show, Seat, Booking, Payment, Notification.
- [x] **Zero-Config Database**: Auto-fallback to embedded MongoDB engine ensures the app starts on any evaluator machine without external DB configuration.
- [x] **Security**: JWT authentication, bcrypt password hashing, input validation, role-based authorization, rate limiting.
- [x] **Real-Time Integration**: Socket.IO synchronizing seat availability live across multiple browser tabs.
- [x] **Interactive Seat Selection**: Curved screen, tiered pricing (Silver, Gold, Platinum), seat status indicators.
- [x] **Simulated Payments**: Multiple payment options (UPI, Card, Net Banking) with both success and failure test simulations.
- [x] **Digital Ticket with QR**: Perforated cinema ticket with embedded verifiable QR code and print formatting.
- [x] **Admin Management**: Executive metrics, interactive trend charts, and complete CRUD across Movies, Theatres, Shows, Bookings, Users, and Payments.
- [x] **Sample Dataset**: Pre-seeded with 12 blockbuster movies, 5 theatres, 15 screens, and 180 scheduled shows.

---
© 2026 IMovies Project. Designed and developed for academic project demonstration.
