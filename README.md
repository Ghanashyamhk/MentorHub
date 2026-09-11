# MentorHub – Mentor–Student Project Discovery Platform

MentorHub is a web-based platform that connects students with mentors based on project interests and technical domains.

Students can explore project ideas, send requests to mentors, track request status, receive notifications, view accepted project teams, and communicate with team members through email.

Mentors can publish project ideas, manage student requests, accept or reject students, receive notifications, and view their project teams.

---

## Features

### Student Features

* Student registration and login
* JWT-based authentication
* Browse project ideas by domain
* View project details
* Send requests to mentors
* Prevent duplicate requests
* Track request status:

  * Pending
  * Accepted
  * Rejected
* Receive notifications when requests are accepted or rejected
* View notification unread count
* View accepted project team members
* View mentor and student email addresses
* Contact the project team through email
* Dark/Light mode

### Mentor Features

* Mentor registration and login
* JWT-based authentication
* Add project ideas
* Select project domain and difficulty
* Create individual or group projects
* Set maximum group members
* View own projects
* Delete own projects
* Receive notifications when students request projects
* View student requests
* Accept or reject requests
* Automatic project capacity validation
* Automatic rejection of pending requests when a project becomes full
* View accepted project team members
* Contact the project team through email
* View notification unread count
* Dark/Light mode

---

## Project Types

### Individual Project

An individual project can have only one accepted student.

### Group Project

A group project can have multiple accepted students, with the mentor defining the maximum number of members.

The backend tracks the number of accepted members and prevents the project from exceeding its maximum capacity.

---

## Notification System

MentorHub provides a database-backed notification system.

### Mentor Notifications

Mentors receive a notification when a student requests to join one of their projects.

### Student Notifications

Students receive notifications when:

* Their request is accepted
* Their request is rejected
* Their pending request is automatically rejected because the project has reached its capacity

The notification system supports:

* Read/unread status
* Unread notification count
* Notification timestamps
* Notification types
* Request association

---

## Project Team

Once a student is accepted into a project, the student can view the project team.

Team information includes:

* Project
* Mentor
* Accepted students
* Names
* Email addresses
* Current team size
* Maximum team capacity

Only the project's mentor and accepted students can access the team information.

---

## Team Communication

MentorHub currently uses email-based communication instead of an internal real-time chat system.

The **Contact Team** feature collects the mentor's and accepted students' email addresses and opens the user's default email application with a pre-filled subject and message.

---

## Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Fetch API
* LocalStorage

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication and Security

* JSON Web Token (JWT)
* Password hashing
* Authentication middleware
* Role-based access control
* Protected API routes
* Project ownership validation
* Request ownership validation
* Project capacity validation

---

## Architecture

MentorHub follows an **MVC (Model–View–Controller) architecture** with a RESTful Node.js/Express backend and a separate HTML, CSS, and JavaScript frontend.

```text
MentorHub/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   │
│   ├── pages/
│   │   ├── student-dashboard.html
│   │   ├── mentor-dashboard.html
│   │   ├── project-list.html
│   │   └── add-project.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── auth.css
│   │   ├── dashboard.css
│   │   └── chat.css
│   │
│   └── js/
│       ├── auth.js
│       ├── dashboard.js
│       ├── mentor.js
│       ├── projects.js
│       └── chat.js
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .env.example
├── .gitignore
└── README.md
```

### MVC Components

* **Model** – Mongoose models responsible for MongoDB data structures.
* **View** – HTML/CSS/JavaScript frontend that provides the user interface.
* **Controller** – Contains the business logic for authentication, projects, requests, notifications, and team management.
* **Routes** – Defines REST API endpoints and connects requests to controllers.
* **Middleware** – Handles JWT authentication and access control.

### Application Flow

```text
Frontend
   ↓
REST API Routes
   ↓
Controllers
   ↓
Models
   ↓
MongoDB
```

---

## Application Flow

### Student Flow

```text
Register / Login
       ↓
Student Dashboard
       ↓
Select Domain
       ↓
Browse Projects
       ↓
View Project
       ↓
Request Mentor
       ↓
Pending
       ↓
Mentor Accepts / Rejects
       ↓
Notification
       ↓
Accepted
       ↓
View Project Team
       ↓
Contact Team
```

### Mentor Flow

```text
Register / Login
       ↓
Mentor Dashboard
       ↓
Select Domain
       ↓
Add Project Idea
       ↓
Project Stored in MongoDB
       ↓
Student Sends Request
       ↓
Mentor Notification
       ↓
View Requests
       ↓
Accept / Reject
       ↓
Student Notification
       ↓
View Accepted Team
       ↓
Contact Team
```

---

## Security

MentorHub implements security at multiple levels.

### JWT Authentication

Protected APIs require:

```text
Authorization: Bearer <token>
```

The backend verifies the JWT through authentication middleware.

### Role-Based Access Control

The platform supports two roles:

```text
Student
Mentor
```

Each role has different permissions.

For example:

* Students can request projects.
* Mentors can create projects.
* Only mentors can manage requests for their projects.
* Only accepted students and the project's mentor can view the team.

### Project Ownership

Mentors can manage only their own projects.

### Request Ownership

Only the mentor associated with a project can accept or reject requests for that project.

### Team Access

Only the project's mentor and accepted students can view the project team.

### Capacity Validation

The backend validates project capacity before accepting a request.

```text
Individual Project
Maximum accepted students = 1

Group Project
Maximum accepted students = maxMembers
```

---

## Database Models

The application uses MongoDB with Mongoose.

```text
User
Project
Request
Notification
```

### User

Stores:

* Name
* Email
* Password
* Role

### Project

Stores:

* Domain
* Title
* Description
* Difficulty
* Contact
* Mentor
* Project type
* Maximum members

### Request

Stores:

* Student
* Project
* Mentor
* Status
* Created date
* Updated date

Request statuses:

```text
pending
accepted
rejected
```

### Notification

Stores:

* Recipient
* Message
* Notification type
* Related request
* Read/unread status
* Created date

---

## API Structure

The backend exposes REST APIs under:

```text
/api
```

### Authentication

```text
/api/auth
```

Handles:

* Registration
* Login
* Authentication-related operations

### Projects

```text
/api/projects
```

Handles:

* Creating projects
* Getting projects
* Getting mentor's projects
* Deleting projects
* Project-related operations

### Requests

```text
/api/requests
```

Handles:

* Creating student requests
* Getting student requests
* Getting mentor requests
* Accepting requests
* Rejecting requests
* Getting project team members

### Notifications

```text
/api/notifications
```

Handles:

* Getting notifications
* Getting unread notification count
* Marking notifications as read

---

## Installation

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd mentorProject
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_username
EMAIL_PASSWORD=your_email_password

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Never upload the `.env` file to GitHub.

Use `.env.example` to show the required environment variables without exposing actual credentials.

### 4. Start the Backend

```bash
npm start
```

or:

```bash
node server.js
```

The backend runs on:

```text
http://localhost:5000
```

### 5. Open the Application

```text
http://localhost:5000
```

---

## API Testing

The backend REST APIs were tested independently using Postman before integrating them with the frontend.

---

## Challenges and Solutions

### Duplicate Requests

**Problem:**
A student could send multiple requests for the same project.

**Solution:**
The backend checks whether a request already exists for the same student and project before creating a new request.

### Group Capacity

**Problem:**
A group project should not exceed its maximum number of members.

**Solution:**
The backend counts only accepted requests and compares the count with `maxMembers`.

### Request Security

**Problem:**
A mentor should not be able to manage requests belonging to another mentor.

**Solution:**
The backend verifies that the request belongs to the logged-in mentor before accepting or rejecting it.

### Project Security

**Problem:**
A mentor should not be able to modify or delete another mentor's project.

**Solution:**
Project ownership is validated on protected backend routes.

### Notifications

**Problem:**
Students and mentors need to know when important request events occur.

**Solution:**
A dedicated Notification model stores notifications in MongoDB.

### Team Communication

**Problem:**
A real-time chat system adds additional backend and infrastructure complexity.

**Solution:**
The current implementation uses email-based team communication through `mailto:` links.

---

## Future Enhancements

* Real-time chat using Socket.IO
* Google Authentication
* Advanced mentor search
* Mentor recommendation system
* Project search and filtering
* Student skill profiles
* Mentor ratings and reviews
* Project progress tracking
* Team workspace
* File sharing
* Email notifications
* Admin dashboard
* Advanced analytics

---

## Project Status

**Active Development**

Current functionality includes:

* Authentication
* Role-based access control
* Project management
* Student requests
* Request acceptance/rejection
* Project capacity management
* Notifications
* Team member management
* Email-based team communication
* MongoDB persistence


## CI/CD
Automated testing and deployment using GitHub Actions and Render.