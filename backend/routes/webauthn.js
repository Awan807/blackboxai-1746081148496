const express = require('express');
const base64url = require('base64url');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { pool } = require('../server');

// In-memory storage for challenges and users for demo purposes
const challenges = new Map();
const users = new Map();

// Helper to generate random challenge
function generateChallenge() {
  return base64url(Buffer.from(uuidv4().replace(/-/g, ''), 'hex'));
}

// Helper to convert buffer to base64url
function bufferToBase64Url(buffer) {
  return base64url(buffer);
}

// Step 1: Registration options
router.post('/register/options', async (req, res) => {
  const { name, studentId, studentClass } = req.body;
  if (!name || !studentId || !studentClass) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const userId = Buffer.from(studentId).toString('base64');

  const challenge = generateChallenge();
  challenges.set(studentId, challenge);

  const publicKey = {
    challenge: challenge,
    rp: {
      name: "Attendance App",
    },
    user: {
      id: Buffer.from(studentId),
      name: studentId,
      displayName: name,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 }
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required"
    },
    timeout: 60000,
    attestation: "none",
  };

  res.json({ publicKey });
});

// Step 2: Registration verification
router.post('/register/verify', async (req, res) => {
  const { studentId, attestationResponse, name, studentClass } = req.body;
  if (!studentId || !attestationResponse || !name || !studentClass) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // For demo, we skip attestation verification and store credential directly
  // In production, verify attestationResponse properly

  try {
    // Store student and credential in DB
    const client = await pool.connect();

    // Insert student if not exists
    await client.query(
      `INSERT INTO students (student_id, name, class) VALUES ($1, $2, $3)
       ON CONFLICT (student_id) DO NOTHING`,
      [studentId, name, studentClass]
    );

    // Insert credential
    await client.query(
      `INSERT INTO credentials (student_id, credential_id, public_key) VALUES ($1, $2, $3)
       ON CONFLICT (credential_id) DO NOTHING`,
      [studentId, attestationResponse.id, JSON.stringify(attestationResponse)]
    );

    client.release();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
