import React, { useState } from 'react';
import axios from 'axios';

function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

const StudentRegistration = () => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      // Step 1: Request registration options from backend
      const optionsResponse = await axios.post('http://localhost:5000/webauthn/register/options', {
        name,
        studentId,
        studentClass,
      });

      const options = optionsResponse.data;

      // Convert challenge and user.id from base64 to Uint8Array
      options.publicKey.challenge = base64ToBuffer(options.publicKey.challenge);
      options.publicKey.user.id = base64ToBuffer(options.publicKey.user.id);

      // Convert excludeCredentials id from base64 to Uint8Array if present
      if (options.publicKey.excludeCredentials) {
        options.publicKey.excludeCredentials = options.publicKey.excludeCredentials.map(cred => ({
          ...cred,
          id: base64ToBuffer(cred.id),
        }));
      }

      // Step 2: Call WebAuthn API to create credentials
      const credential = await navigator.credentials.create(options);

      // Prepare attestation response to send to backend
      const attestationResponse = {
        id: credential.id,
        rawId: bufferToBase64(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
          attestationObject: bufferToBase64(credential.response.attestationObject),
        },
      };

      // Step 3: Send attestation response to backend for verification and saving
      const verificationResponse = await axios.post('http://localhost:5000/webauthn/register/verify', {
        studentId,
        attestationResponse,
        name,
        studentClass,
      });

      if (verificationResponse.data && verificationResponse.data.success) {
        setMessage('Student registered successfully!');
        setName('');
        setStudentId('');
        setStudentClass('');
      } else {
        setMessage('Registration failed.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error during registration.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Student Registration</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Student ID</label>
          <input
            type="text"
            required
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Class</label>
          <input
            type="text"
            required
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Register Fingerprint
        </button>
      </form>
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
  );
};

export default StudentRegistration;
