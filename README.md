# SCRIPTSAFE: Secure Digital Profile and Notes Management System

ScriptSafe is a full-stack web application that enables secure digital profile management and note-taking. It allows users to create and edit personal profiles, as well as add, view, and manage notes securely. The application uses Google OAuth and Bcrypt Hashing for authentication, integrates PostgreSQL for data storage.

It is also hosted online on https://scriptsafe.onrender.com/ using Render Postgres online database and Web service. Feel free to check it out !!

---

## Features

### 1. **Authentication**
- Secure local authentication using `bcrypt` for password hashing.
- Google OAuth integration via `passport.js` for seamless third-party login.

### 2. **User Management**
- Users can create accounts, log in, and update their profiles (e.g., name, date of birth, contact details, etc.).

### 3. **Database Integration**
- PostgreSQL database for storing user data securely.

### 4. **Session Handling**
- Secure session management using `express-session` and environment-specific secrets.

### 5. **Dynamic Rendering**
- EJS templates for server-side rendering of pages.

---

## Technologies Used

- **Backend**: Node.js, Express.js, Passport.js
- **Database**: PostgreSQL
- **Frontend**: EJS, CSS
- **Security**: Bcrypt for password hashing, environment variables for configuration
- **API Integration**: Google OAuth for social login

---  

## Prerequisites

1. **Node.js**: Ensure Node.js is installed on your machine. Download it from [Node.js official website](https://nodejs.org/).
2. **PostgreSQL**: Install and set up PostgreSQL.
3. **Environment Configuration**: Create a `.env` file in the root directory with the following variables:

   ```plaintext
   PG_USER=your_db_username
   PG_PASSWORD=your_db_password
   PG_DATABASE=your_db_name
   PG_HOST=your_db_host
   PG_PORT=your_db_port
   SESSION_SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

---

## Installation and Setup

1. **Clone the Repository**: `git clone <repository-url>`
2. **Navigate to the Project Directory**: `cd <project-folder>`
3. **Install Dependencies**: `npm install`
4. **Set Up the Database**:Create a PostgreSQL database. Use the schema provided in the project (if applicable).
5. **Start the Application**: `nodemon index.js`
6. **Access the Application**: Open your browser and go to http://localhost:3000.

---

##  Project Structure

├── public/ #    Static files (CSS, images, etc.)<br /> 
├── views/ #     EJS templates for rendering pages<br /> 
├── .env #       Environment variables (ignored in Git)<br /> 
├── index.js #   Main application entry point<br /> 
├── package.json # Node.js project metadata<br /> 
└── README.md # Project documentation<br />

---

## Usage

-  **Home Page**: View the landing page at /
-  **Register**: Create a new user account at /register.
-  **Login**: Access your account via /login.
-  **Profile**: Manage your profile details and Notes at /profile (requires authentication).
-  **Google Login**: Authenticate using Google via /auth/google.

---

## NOTE: If you want to use Google oAuth while hosting locally, follow given steps:
1. Set up Google oAuth Credentials on https://console.cloud.google.com/
2. Enter your generated Client id and Client Secret in .env file.
3. In index.js change callback URL from http://scriptsafe.onrender.com/auth/google/profile to http://localhost:3000/auth/google/profile

