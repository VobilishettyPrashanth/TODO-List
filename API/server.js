import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import User from './models/user.js';
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import Todo from './models/todo.js';

const secret = 's@123&*'; // Retaining your original secret

// Connect to MongoDB without deprecated options
await mongoose.connect('mongodb://localhost:27017/auth-todo');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const app = express();
app.use(cookieParser());
app.use(express.json()); // Using express's built-in JSON parser
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
);

app.get('/', (req, res) => {
  res.send('ok');
});

// Get user info
app.get('/user', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({ message: 'Token expired or invalid' });
    }

    // Successfully authenticated, return user email
    res.json({ id: user.id, email: user.email });
  });
});

// Register user
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  console.log('Registration attempt:', req.body); // Log the registration attempt

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User Already Registered. Please Login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ password: hashedPassword, email });
    const userInfo = await user.save();

    const token = jwt.sign({ id: userInfo._id, email: userInfo.email }, secret);

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true only in production with HTTPS
      sameSite: 'lax', // Use 'strict' or 'lax' based on your requirements
    });

    res.json({
      message: 'Registration successful',
      id: userInfo._id,
      email: userInfo.email,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error); // Log the complete error
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// Login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const userInfo = await User.findOne({ email });
  if (!userInfo) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }
  const isValidPassword = await bcrypt.compare(password, userInfo.password);
  if (!isValidPassword) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Generate JWT token
  const token = jwt.sign({ id: userInfo._id, email: userInfo.email }, secret);

  // Set the token as a cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // Set to true only in production with HTTPS
    sameSite: 'lax', // Use 'strict' or 'lax' based on your requirements
  });

  // Send the token back to the client along with user info
  res.json({
    message: 'Login successful',
    id: userInfo._id,
    email: userInfo.email,
    token,
  });
});

// Logout user
app.post('/logout', (req, res) => {
  res
    .cookie('token', '', {
      httpOnly: true,
      secure: true, // Use this in production with HTTPS
      sameSite: 'strict',
      expires: new Date(0), // Set the expiration date to a past date
    })
    .send({ message: 'Logged out successfully' });
});

// Get all todos for the authenticated user
app.get('/todos', async (req, res) => {
  try {
    const token = req.cookies.token;
    const payload = jwt.verify(token, secret);
    const todos = await Todo.find({ user: payload.id }); // Use payload.id directly as string
    res.json(todos);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Add a new todo
app.put('/todos', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Token is required' });
    }
    const payload = jwt.verify(token, secret);
    const todo = new Todo({
      text: req.body.text,
      done: false,
      user: payload.id, // Use payload.id directly as string
    });

    const savedTodo = await todo.save();
    res.status(201).json(savedTodo); // Return the created todo with a 201 status
  } catch (err) {
    console.error('Error adding todo:', err);
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

// Update a todo's completion status
app.post('/todos', async (req, res) => {
  try {
    const token = req.cookies.token;
    const payload = jwt.verify(token, secret);
    const { id, done } = req.body;

    const result = await Todo.updateOne(
      {
        _id: id, // Use id directly as string
        user: payload.id, // Use payload.id directly as string
      },
      { done }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ error: 'Todo not found or not owned by user' });
    }

    res.sendStatus(200); // Send a 200 status for successful update
  } catch (err) {
    console.error('Error updating todo:', err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});
