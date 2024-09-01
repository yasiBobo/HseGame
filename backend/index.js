const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const dotenv = require('dotenv');
const axios = require('axios'); // Import axios
const sendSms = require("./magfa.js")

const app = express();
const port = '5000';

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS
dotenv.config();

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database');
});

// Secret key for JWT
const JWT_SECRET = '27a7284ee08362d73492cc81d9f5504c98fe08190523a1d42d1391875f356382';

// In-memory store for verification codes with timestamp
const verificationCodes = {};
const users = {}; // Global in-memory store for user data

// List of phone numbers that can login as many times as they want
const unlimitedLoginNumbers = ["09192139677", "09356247665"];

// Helper function to generate a random 5-digit code
const generateVerificationCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token

  if (token == null) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });

    req.user = user;
    next();
  });
};

// Modified API endpoint for login
app.post('/login', async (req, res) => {
  const { phoneNumber, personalCode } = req.body;

  const query = 'SELECT id, phone, personal_code FROM users WHERE personal_code = ?';
  db.query(query, [personalCode], async (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ error: 'Database query error: ' + error });
    }
    if (results.length === 0) {
      return res.status(401).send('کد پرسنلی اشتباه است');
    }

    const user = results[0];
    const userId = user.id;

    // Generate verification code and update in-memory store
    const verificationCode = generateVerificationCode();
    const timestamp = Date.now();
    verificationCodes[phoneNumber] = { code: verificationCode, timestamp };

    const codeUpdateQuery = 'UPDATE users SET verification_code = ? WHERE id = ?';
    db.query(codeUpdateQuery, [verificationCode, userId], async (codeUpdateError) => {
      if (codeUpdateError) {
        console.error('Verification code update error:', codeUpdateError);
        return res.status(500).json({ error: 'Verification code update error' });
      }

      try {
        // Send SMS using the sendSms function from magfa.js
        const response = await sendSms({
          messages: [`زرینی عزیز با کد زیر میتونی وارد بازی زرین مهر بشی: ${verificationCode} گروه زرین`],
          recipients: [phoneNumber]
        });

        if (response.status === 0 && response.messages && response.messages[0].status === 0) {
          // Update the phone number in the database
          const updateQuery = 'UPDATE users SET phone = ? WHERE id = ?';
          db.query(updateQuery, [phoneNumber, userId], (updateError) => {
            if (updateError) {
              console.error('Database update error:', updateError);
              return res.status(500).json({ error: 'Database update error' });
            }

            res.json({ message: 'Verification code sent', userId });
          });
        } else {
          res.status(500).json({ message: 'خطا در ارسال کد تایید' });
        }
      } catch (smsError) {
        console.error('SMS sending error:', smsError);
        res.status(500).json({ message: 'خطا، لطفا تحریم شکن خود را خاموش کنید' });
      }
    });
  });
});

// API endpoint for verification
app.post('/verify', (req, res) => {
  const { phoneNumber, verificationCode } = req.body;

  // Check if the verification code matches and is within the valid timeframe
  if (verificationCodes[phoneNumber] && verificationCodes[phoneNumber].code === verificationCode) {
    const currentTime = Date.now();
    const storedTimestamp = verificationCodes[phoneNumber].timestamp;

    if ((currentTime - storedTimestamp) <= 120000) { // 2 minutes in milliseconds
      // Generate JWT token
      const token = jwt.sign({ phoneNumber }, JWT_SECRET, { expiresIn: '1h' });

      // Clear the verification code from the in-memory store and update the database
      delete verificationCodes[phoneNumber];
      const updateQuery = 'UPDATE users SET verification_code = NULL WHERE phone = ?';
      db.query(updateQuery, [phoneNumber], (updateError) => {
        if (updateError) {
          console.error('Database update error:', updateError);
          return res.status(500).json({ error: 'Database update error' });
        }
        res.json({ success: true, token });
      });
    } else {
      console.error(`Verification code expired: Current time: ${currentTime}, Stored timestamp: ${storedTimestamp}`);
      res.status(401).json({ error: 'کد تایید شما منقضی شده است' });
    }
  } else {
    console.error(`Invalid verification code: Provided code: ${verificationCode}, Stored code: ${verificationCodes[phoneNumber]?.code}`);
    res.status(401).json({ error: 'کد تایید شما اشتباه است' });
  }
});

// API endpoint for resending the verification code
app.post('/resend', async (req, res) => {
  const { phoneNumber } = req.body;

  // Generate a new verification code
  const verificationCode = generateVerificationCode();
  const timestamp = Date.now();
  verificationCodes[phoneNumber] = { code: verificationCode, timestamp };

  // Update database with the new verification code
  const updateQuery = 'UPDATE users SET verification_code = ? WHERE phone = ?';
  db.query(updateQuery, [verificationCode, phoneNumber], async (updateError) => {
    if (updateError) {
      console.error('Database update error:', updateError);
      return res.status(500).json({ error: 'Database update error' });
    }

    // Send SMS notification with the new verification code
    try {
      // Send request to the dynamic API URL using axios
      const response = await axios.post(process.env.API_URL, {
        messages: [`زرینی عزیز کد ورود جدید شما: ${verificationCode} گروه زرین`],
        recipients: [phoneNumber]
      });

      if (response.status === 200) {
        // Log the new verification code to ensure it's being generated correctly
        console.log(`Verification code resent: ${verificationCode} for phone number: ${phoneNumber}`);

        res.json({ message: 'Verification code resent' });
      } else {
        res.status(500).json({ message: 'خطا در ارسال کد تایید' });
      }
    } catch (smsError) {
      console.error('SMS sending error:', smsError);
      res.status(500).json({ message: 'خطا' });
    }
  });
});

app.get('/user/:id', (req, res) => {
  const { id } = req.params;

  // Query the database to get user details by ID
  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [id], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ error: 'Database query error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

app.get('/users_data/:userId', authenticateToken, (req, res) => {
  const userId = req.params.userId;

  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ error: 'Database query error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

app.put('/users_data/:userId', authenticateToken, (req, res) => {
  const userId = req.params.userId;
  const { number, mistakes, correctClicks, wrongChoices } = req.body;

  const query = `
    UPDATE users 
    SET number = ?, mistakes = ?, correct_clicks = ?, wrong_choices = ?
    WHERE id = ?
  `;

  db.query(query, [number, mistakes, correctClicks, wrongChoices, userId], (error, results) => {
    if (error) {
      console.error('Error updating user data:', error);
      return res.status(500).json({ message: 'Error updating user data', error });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User data updated successfully' });
  });
});

// Update user data
app.put('/user/:userId', (req, res) => {
  // console.log(`Received PUT request for userId: ${req.params.userId}`);
  // console.log('Request body:', req.body);

  const userId = req.params.userId;
  const { exciteCount, learnCount, peaceCount } = req.body;

  // Validate input
  if (typeof exciteCount !== 'number' || typeof learnCount !== 'number' || typeof peaceCount !== 'number') {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  // Update user data in MySQL
  const query = `
    UPDATE users 
    SET excite_count = ?, learn_count = ?, peace_count = ?
    WHERE id = ?
  `;

  db.query(query, [exciteCount, learnCount, peaceCount, userId], (error, results) => {
    if (error) {
      console.error('Error updating user data:', error);
      return res.status(500).json({ message: 'Error updating user data', error });
    }

    // Check if any rows were affected
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User data updated successfully');
    res.json({ message: 'User data updated successfully' });
  });
});

// fs.readFile('users.json', 'utf8', (err, data) => {
//   if (err) {
//       throw err;
//   }
//   const users = JSON.parse(data);

//   // Insert users into the database
//   users.forEach(user => {
//       const { personal_code, first_name, last_name } = user;
//       let sql = 'INSERT INTO users (personal_code, first_name, last_name) VALUES (?, ?, ?)';
//       db.query(sql, [personal_code, first_name, last_name], (err, result) => {
//           if (err) {
//               throw err;
//           }
//           console.log('User added with ID: ', result.insertId);
//       });
//   });
// });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});