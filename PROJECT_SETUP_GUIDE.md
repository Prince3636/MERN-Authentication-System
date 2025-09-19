# MERN Authentication Project Setup Guide

This guide provides step-by-step instructions to create a full-stack authentication system using MERN stack (MongoDB, Express.js, React, Node.js).

## 📋 Project Overview

This project includes:
- User registration and login
- Email verification with OTP
- Password reset functionality
- JWT-based authentication
- Protected routes
- Responsive UI with Tailwind CSS

## 🛠️ Prerequisites

Before starting, ensure you have:
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Gmail account for email sending
- Git (optional)

## 📁 Project Structure

```
mern-auth/
├── client/          # React frontend
├── server/          # Node.js/Express backend
└── README.md
```

## 🚀 Step-by-Step Setup

### Step 1: Create Project Directory

```bash
mkdir mern-auth
cd mern-auth
```

### Step 2: Set Up Backend (Server)

```bash
mkdir server
cd server
npm init -y
```

#### Install Backend Dependencies

```bash
npm install express cors mongoose dotenv bcryptjs jsonwebtoken nodemailer cookie-parser
npm install -D nodemon
```

#### Create Backend Files

1. **server.js** - Main server file
```javascript
import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js';
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

connectDB();

const allowedOrigins = ['http://localhost:5173'];

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}));

app.get('/', (req, res) => res.send("API Working"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.listen(port, () => console.log(`Server running on PORT: ${port}`));
```

2. **config/mongodb.js** - Database connection
```javascript
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;
```

3. **models/userModel.js** - User schema
```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verifyOtp: { type: String, default: '' },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: '' },
  resetOtpExpireAt: { type: Number, default: 0 },
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;
```

4. **controller/authController.js** - Authentication logic
```javascript
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
```

5. **routes/authRoutes.js** - Authentication routes
```javascript
import express from 'express';
import { login, register } from '../controller/authController.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);

export default authRouter;
```

6. **middleware/userAuth.js** - Authentication middleware
```javascript
import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({ success: false, message: "Not Authorized, login again" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      req.body.userId = tokenDecode.id;
    } else {
      return res.json({ success: false, message: "Not Authorized, login again" });
    }
    next();
  } catch (error) {
    return res.json({ success: false, message: "Not Authorized, login again" });
  }
};

export default userAuth;
```

### Step 3: Set Up Frontend (Client)

```bash
cd ..
mkdir client
cd client
npm create vite@latest . -- --template react
```

#### Install Frontend Dependencies

```bash
npm install axios react-router-dom react-toastify tailwindcss
npm install -D @types/react @types/react-dom
```

#### Configure Tailwind CSS

```bash
npx tailwindcss init -p
```

Update **tailwind.config.js**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Update **src/index.css**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### Create Frontend Files

1. **src/App.jsx** - Main app component
```jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Login from "./pages/Login";

const App = () => (
  <div>
    <ToastContainer position="top-right" autoClose={3000} />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  </div>
);

export default App;
```

2. **src/pages/Login.jsx** - Login page
```jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {
        const { data } = await axios.post("http://localhost:4000/api/auth/register", {
          name, email, password,
        });
        if (data.success) {
          toast.success("Account created successfully!");
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post("http://localhost:4000/api/auth/login", {
          email, password,
        });
        if (data.success) {
          toast.success("Login successful!");
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <form onSubmit={onSubmitHandler} className="bg-slate-900 p-10 rounded-lg shadow-lg w-96 text-indigo-300">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>

        {state === "Sign Up" && (
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="w-full px-5 py-2.5 rounded-full bg-[#333A5C] mb-4"
            type="text"
            placeholder="Full Name"
            required
          />
        )}

        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className="w-full px-5 py-2.5 rounded-full bg-[#333A5C] mb-4"
          type="email"
          placeholder="Email id"
          required
        />

        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          className="w-full px-5 py-2.5 rounded-full bg-[#333A5C] mb-4"
          type="password"
          placeholder="Password"
          required
        />

        <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">
          {state}
        </button>

        <p className="text-gray-400 text-center text-xs mt-4">
          {state === "Sign Up" ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            onClick={() => setState(state === "Sign Up" ? "Login" : "Sign Up")}
            className="text-blue-400 cursor-pointer underline"
          >
            {state === "Sign Up" ? "Login here" : "Sign up"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
```

3. **src/pages/Home.jsx** - Home page
```jsx
import React from "react";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/bg_img.png')] bg-cover bg-center">
      <h1 className="text-4xl font-bold text-white mb-4">Welcome to MERN Auth</h1>
      <p className="text-white text-center max-w-md">
        Your authentication system is working perfectly!
      </p>
    </div>
  );
};

export default Home;
```

### Step 4: Environment Configuration

#### Backend Environment Variables (.env)

Create `.env` file in server directory:
```env
MONGODB_URL=mongodb+srv://username:password@cluster0.mongodb.net/mern-auth?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
PORT=4000
NODE_ENV=development
SENDER_EMAIL=your_email@gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Frontend Environment Variables (.env)

Create `.env` file in client directory:
```env
VITE_BACKEND_URL=http://localhost:4000
```

### Step 5: Configure Scripts

#### Backend package.json scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

#### Frontend package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Step 6: Run the Application

1. **Start Backend:**
```bash
cd server
npm run dev
```

2. **Start Frontend (in new terminal):**
```bash
cd client
npm run dev
```

3. **Access the application:**
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## 🔧 Troubleshooting

### Common Issues:

1. **MongoDB Connection Issues:**
   - Ensure MONGODB_URL is correct
   - Check MongoDB Atlas IP whitelist
   - Verify database user credentials

2. **Email Sending Issues:**
   - Enable 2-factor authentication on Gmail
   - Generate App Password for SMTP
   - Update SMTP_USER and SMTP_PASS in .env

3. **CORS Issues:**
   - Ensure backend allows frontend origin
   - Check if credentials are set to true

4. **Port Conflicts:**
   - Change PORT in .env if 4000 is occupied
   - Update VITE_BACKEND_URL accordingly

## 📚 Additional Features (Optional)

- Add email verification
- Implement password reset
- Add user profile management
- Include social login
- Add role-based access control

## 🎯 Next Steps

1. Test user registration and login
2. Implement additional authentication features
3. Add frontend styling and components
4. Deploy to production

This guide provides a solid foundation for a MERN authentication system. Each step builds upon the previous one, ensuring a working application at the end.
