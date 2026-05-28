// server/contact.js
// ------------------------------------------------------------
// Minimal Express backend that receives the contact form JSON payload
// and forwards it as an e‑mail using Nodemailer.
// ------------------------------------------------------------
//   1️⃣ Install dependencies (run once in the project root):
//        npm init -y
//        npm install express cors nodemailer dotenv
//   2️⃣ Create a .env file (same folder) with your mail credentials:
//        EMAIL_USER=youremail@example.com
//        EMAIL_PASS=yourSMTPpasswordOrAppPassword
//        EMAIL_TO=youremail@example.com   // where you want to receive messages
//   3️⃣ Start the server with: node server/contact.js
// ------------------------------------------------------------

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());                     // allow fetch from any origin (adjust for production)
app.use(express.json({ limit: '500kb' })); // parse JSON bodies

// ------------------------------------------------------------
// POST /api/contact  – receives { name, email, message }
// ------------------------------------------------------------
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Create a Nodemailer transport (SMTP)
  const transporter = nodemailer.createTransport({
    service: 'gmail',               // change if you use another provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `New contact from ${name}`,
    text: `You have a new message from your portfolio site:\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    replyTo: email,                 // lets you reply directly to the sender
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ status: 'sent' });
  } catch (err) {
    console.error('Mail error →', err);
    res.status(500).json({ error: 'Failed to send e‑mail.' });
  }
});

// ------------------------------------------------------------
// Start server (default port 4000 – you can change)
// ------------------------------------------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Contact API listening on http://localhost:${PORT}`));

// ------------------------------------------------------------
// .env.example (copy to .env and fill in real values)
// ------------------------------------------------------------
// EMAIL_USER=youremail@example.com
// EMAIL_PASS=yourSMTPpasswordOrAppPassword
// EMAIL_TO=youremail@example.com
// PORT=4000
