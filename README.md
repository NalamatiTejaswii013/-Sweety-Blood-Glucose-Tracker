# 🌸 Sweety – Blood Glucose Tracker

## 📌 Project Overview

Sweety is a full-stack web application that helps users record, manage, and monitor their daily blood glucose readings. It provides secure authentication, glucose reading management, and reports to track reading history.

## ✨ Features

- User Registration and Login
- Secure password hashing using bcrypt
- JWT-based authentication
- Add, View, Update, and Delete glucose readings
- Four daily reading slots:
  - Morning
  - After breakfast
  - After lunch
  - After dinner
- Glucose value validation (40–600 mg/dL)
- Integer-only glucose values
- Duplicate reading prevention
- Maximum four readings per day
- Future date validation
- Daily glucose reports
- Month-to-Date reports
- Previous Month reports
- Highest, Lowest, Average, and Total reading summaries
- User-specific data access
- Friendly empty-state messages

## 🛠️ Technology Stack

### Frontend
- React.js
- JavaScript
- HTML
- CSS
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- REST APIs
- JWT
- bcryptjs

### Database
- PostgreSQL

### Tools
- VS Code
- Postman
- pgAdmin 4
- Git and GitHub

## 📂 Project Structure

```text
Sweety-Blood-Glucose-Tracker/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── tests/
│   ├── schema.sql
│   ├── seed.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── screenshots/
├── README.md
└── .gitignore
```

## ⚙️ Installation and Setup

### Prerequisites

- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Sweety-Blood-Glucose-Tracker
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Database Setup

Open PostgreSQL using pgAdmin.

Create the database:

```sql
CREATE DATABASE sweety_db;
```

Open the Query Tool for `sweety_db`.

Execute the SQL statements available in:

```text
backend/schema.sql
```

This creates the required users and readings tables.

### 3. Backend Setup

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example`.

Configure your PostgreSQL credentials and JWT secret.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sweety_db
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
JWT_SECRET=your_secret_key
```

Do not upload your actual `.env` file to GitHub.

### 4. Insert Sample Data

Run:

```bash
node seed.js
```

Demo login credentials:

- Email: demo@sweety.com
- Password: Demo@12345

### 5. Start Backend Server

```bash
npm run dev
```

Backend URL:

http://localhost:5000

### 6. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

http://localhost:5173

## 🔗 API Endpoints

All private endpoints require JWT authentication using a Bearer token.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |

### Glucose Readings

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/readings | Add reading |
| GET | /api/readings | Get readings |
| PUT | /api/readings/:id | Update reading |
| DELETE | /api/readings/:id | Delete reading |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/reports/daily?date=YYYY-MM-DD | Daily report |
| GET | /api/reports/month-to-date?date=YYYY-MM-DD | Month-to-date report |
| GET | /api/reports/previous-month?date=YYYY-MM-DD | Previous month report |

## 🔐 Security

- Passwords are hashed using bcrypt.
- JWT authentication protects private routes.
- Users can access only their own readings.
- Sensitive credentials are stored in environment variables.
- Backend validation protects against invalid glucose readings and dates.

## 🧪 Testing

The application APIs were tested using Postman.

Validation checks include:

- Glucose values below 40 and above 600.
- Decimal glucose values.
- Missing glucose values.
- Future dates.
- Duplicate readings for the same date and time slot.
- Reading creation, retrieval, updating, and deletion.
- Daily and monthly report generation.

## 📸 Application Screenshots

Application screenshots are available in the `screenshots` folder.

## 📝 Notes and Future Improvements

### Assumptions

- Each user can record a maximum of four readings per day.
- Each time slot can contain only one reading per day.
- Glucose values must be whole numbers between 40 and 600 mg/dL.
- Users can access only their own glucose reading history.

### Future Improvements

- Add pagination for reading history.
- Add monthly glucose trend charts.
- Introduce Docker Compose for easier application setup.
- Add automated frontend and backend tests.
- Implement Redis caching for reports.
- Add reminder notifications.

## 👩‍💻 Author

Developed as a Full Stack Web Development Assignment.

## 📄 License

This project is developed for educational purposes.

## Project Demo Video

Watch the complete project demonstration:
https://drive.google.com/file/d/1a8mcPOTHjec-Ap9yvZdnkBhstfkZMicA/view?usp=sharing&t=5.302
