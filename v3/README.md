---

# FaceSync v3 Documentation

FaceSync is a facial recognition–based class attendance and check-in system. The v3 version includes both a backend (using Node.js, Express, and MongoDB) and a React frontend. This documentation provides an overview of the project structure, setup instructions, API endpoints, and usage guidelines.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Setup and Installation](#setup-and-installation)
4. [Backend API Endpoints](#backend-api-endpoints)
5. [Frontend Overview](#frontend-overview)
6. [Usage and Features](#usage-and-features)
7. [Additional Notes](#additional-notes)

---

## Overview

FaceSync is designed to automate attendance tracking using facial recognition. The system allows:
- Student registration with face capture and course selection.
- Lecturer and course management.
- Real-time check-in using camera capture and face recognition.
- A dashboard that displays metrics, attendance trends, and recent activity.

---

## Project Structure

The repository is organized into two main sections: the backend and the frontend.

```
v3/
├── backend/
│   ├── server.js                # Main entry point for the Express backend.
│   ├── models/                  # Mongoose schemas for Users, Attendance, Lecturers, Courses.
│   ├── routes/                  # API route definitions.
│   └── config/                  # Configuration files (e.g., MongoDB URI).
│
├── frontend/
│   ├── public/
│   │   ├── models/              # Face detection model files for face-api.js.
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Registration.jsx     # Component for student registration.
│   │   │   ├── CheckIn.jsx          # Component for check-in using facial recognition.
│   │   │   ├── Dashboard.jsx        # Dashboard displaying metrics and trends.
│   │   │   ├── Lecturers.jsx        # Lecturer management (view, add, edit).
│   │   │   ├── CourseCreation.jsx   # Course management (view, add, edit).
│   │   │   └── Camera.jsx           # Camera component for capturing images.
│   │   ├── api.js                   # API helper functions for communicating with the backend.
│   │   ├── App.jsx                  # Main application component.
│   │   └── index.js                 # React entry point.
│   └── package.json
│
└── README.md
```

---

## Setup and Installation

### Prerequisites

- **Node.js** (v12 or higher recommended)
- **MongoDB** (or a MongoDB Atlas connection string)
- **npm** or **yarn**

### Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd v3/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your MongoDB URI in your configuration file or directly in `server.js`.
4. Start the backend server:
   ```bash
   npm start
   ```
   The backend server typically runs on port 5000 (or the port specified in your environment).

### Frontend Setup

1. Navigate to the `frontend` folder:
   ```bash
   cd v3/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## Backend API Endpoints

The backend exposes various endpoints to manage users, attendance, lecturers, and courses.

### Users
- **GET `/users`**  
  Fetch all registered users.

- **POST `/users`**  
  Register a new user.  
  **Body:** `{ name, email, userImage, faceData, courses }`

### Attendance
- **POST `/attendance`**  
  Mark attendance for a user.  
  **Body:** `{ userId }`

- **GET `/attendance`**  
  Fetch all attendance records (with populated user details).

### Lecturers
- **GET `/lecturers`**  
  Fetch all lecturers.

- **POST `/lecturers`**  
  Add a new lecturer.  
  **Body:** `{ name, email, courses }`

- **PUT `/lecturers/:id`**  
  Update a lecturer's information.  
  **Body:** `{ name, email, courses }`

### Courses
- **GET `/courses`**  
  Fetch all courses (with lecturer information populated).

- **POST `/courses`**  
  Add a new course.  
  **Body:** `{ courseName, courseCode, lecturer }`

- **PUT `/courses/:id`**  
  Update course details.  
  **Body:** `{ courseName, courseCode, lecturer }`

### Dashboard (Additional Endpoints)
- **GET `/students`**  
  Returns `{ totalStudents }` – count of registered users.

- **GET `/attendance-ratio`**  
  Returns `{ ratio }` – the ratio of attendance to students.

- **GET `/recent-activity`**  
  Returns the latest attendance records.

- **GET `/attendance-trends`**  
  Aggregates attendance counts grouped by month (or week).

- **GET `/upcoming-courses`**  
  Returns upcoming courses (if courses have a `startDate` field).

---

## Frontend Overview

The React frontend consumes the backend API via helper functions in `src/api.js` and is divided into several components:

- **Registration.jsx:**  
  Allows new students to register by providing name, email, a captured face image, and selecting one or more courses.

- **CheckIn.jsx:**  
  Uses `face-api.js` to capture a check-in photo, detect faces, and compare them with registered users for attendance marking.

- **Dashboard.jsx:**  
  Displays an overview of metrics (total students, attendance, ratio), attendance trends (using Chart.js), recent activity, and upcoming courses.

- **Lecturers.jsx and CourseCreation.jsx:**  
  Provide interfaces for managing lecturers and courses (including creation and editing).

- **Camera.jsx:**  
  A component that handles camera initialization and capturing images.

---

## Usage and Features

- **Student Registration:**  
  Students register with their name, email, and capture a face image. They can also select multiple courses during registration.

- **Facial Recognition Check-In:**  
  The system uses `face-api.js` to detect faces from the captured image, compare them against stored user descriptors, and mark attendance for recognized users.

- **Dashboard:**  
  The dashboard provides real-time insights:
  - **Metrics:** Total students, total attendance, and attendance/student ratio.
  - **Attendance Trends:** A line chart visualizing attendance over time.
  - **Recent Activity:** A list of recent attendance records.
  - **Upcoming Courses:** A list of courses scheduled to occur soon.

- **Management Interfaces:**  
  Admins can manage lecturers and courses using dedicated pages for adding, viewing, and editing records.

---

## Additional Notes

- **Model Files for Face Detection:**  
  Ensure that the face detection models (e.g., `ssd_mobilenetv1`, `faceLandmark68Net`, `faceRecognitionNet`) are correctly placed in the `public/models` folder of the frontend and are accessible at `/models`.

- **Environment Variables:**  
  Update the backend's MongoDB connection string and any other environment-specific configurations as needed.

- **Error Handling:**  
  The app uses `react-toastify` for error and success notifications. Check the console for more detailed error messages when debugging.

- **Deployment:**  
  Both the backend and frontend can be deployed independently. For example, the backend might be hosted on a service like Heroku or Vercel (as indicated by your API URL), and the frontend on Netlify, Vercel, or another static hosting provider.

---
