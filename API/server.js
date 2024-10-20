import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import User from './models/user.js';
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const secret = 's@123&*';

await mongoose.connect('mongodb://localhost:27017/auth-todo');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const app = express();
app.use(cookieParser());
app.use(bodyParser.json({ extended: true }));
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
);

app.get('/', async (req, res) => {
  res.send('ok');
});

//get
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
    res.json({ email: user.email });
  });
});

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

    jwt.sign(
      { id: userInfo._id, email: userInfo.email },
      secret,
      (err, token) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to generate token' });
        }

        res.cookie('token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
        });

        res.json({
          message: 'Registration successful',
          id: userInfo._id,
          email: userInfo.email,
          token,
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error); // Log the complete error
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

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
  jwt.sign(
    { id: userInfo._id, email: userInfo.email },
    secret,
    (err, token) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to generate token' });
      }

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
    }
  );
});

app.post('/logout', (req, res) => {
  res
    .cookie('token', '', {
      httpOnly: true,
      secure: true, // use this in production with HTTPS
      sameSite: 'strict',
      expires: new Date(0), // Set the expiration date to a past date
    })
    .send({ message: 'Logged out successfully' });
});

app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});
