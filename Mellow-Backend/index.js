const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
require('dotenv').config();
const db = require('./db');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get('/', (req, res) => {
  res.send('Mellow backend is running!');
});

// Endpoint: Register User
app.post('/signup', (req, res) => {
  const { name, username, emailOrPhone, password, profileImage } = req.body;

  if (!name || !username || !emailOrPhone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const checkQuery = 'SELECT * FROM users WHERE emailOrPhone = ?';
  db.query(checkQuery, [emailOrPhone], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length > 0) {
      return res.status(400).json({ message: 'Email or phone already exists' });
    }

    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) return res.status(500).json({ message: 'Error hashing password' });

      const profileImageToSave = profileImage || null;
      const insertQuery = 'INSERT INTO users (name, username, emailOrPhone, passwordHash, profileImage, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
      db.query(insertQuery, [name, username, emailOrPhone, hash, profileImageToSave], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to create user' });
        }
        db.query('SELECT name, username, emailOrPhone, profileImage, created_at FROM users WHERE id = ?', [result.insertId], (err, userResults) => {
          if (err) return res.status(500).json({ message: 'Failed to fetch user' });
          res.status(201).json({ user: userResults[0], message: 'User created successfully' });
        });
      });
    });
  });
});

// Endpoint: Login User
app.post('/login', (req, res) => {
  const { emailOrPhone, password } = req.body;

  const query = 'SELECT * FROM users WHERE emailOrPhone = ?';
  db.query(query, [emailOrPhone], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = results[0];
    bcrypt.compare(password, user.passwordHash, (err, match) => {
      if (err) return res.status(500).json({ message: 'Error comparing passwords' });
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });

      res.status(200).json({ user: { name: user.name, username: user.username, emailOrPhone: user.emailOrPhone, profileImage: user.profileImage, created_at: user.created_at } });
    });
  });
});

// Endpoint: Update Profile Image
app.post('/update-profile', (req, res) => {
  const { emailOrPhone, profileImage } = req.body;
  
  if (!emailOrPhone || profileImage === undefined) {
    return res.status(400).json({ message: 'Email/phone and profile image are required' });
  }

  const updateQuery = 'UPDATE users SET profileImage = ? WHERE emailOrPhone = ?';
  db.query(updateQuery, [profileImage, emailOrPhone], (err, result) => {
    if (err) {
      console.error('Update Error:', err);
      return res.status(500).json({ message: 'Failed to update profile image' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Profile image updated successfully' });
  });
});

const path = require('path');
const fs = require('fs');

// Endpoint: Get filtered Yelp businesses
app.get('/api/deals', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'filtered_businesses.json');
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    res.json(parsed);
  } catch (error) {
    console.error('Error reading Yelp data:', error);
    res.status(500).json({ error: 'Failed to load deals' });
  }
});


const IP = '10.55.218.119'; // replace with your machine's IP address

app.listen(port, IP, () => {
  console.log(`Mellow backend listening at http://${IP}:${port}`);
});
