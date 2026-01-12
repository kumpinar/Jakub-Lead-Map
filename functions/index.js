const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Proxy function for Monday.com API to avoid CORS issues
exports.mondayProxy = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { query, token, apiVersion } = req.body;

    if (!query || !token) {
      res.status(400).json({ error: 'Missing required parameters: query and token' });
      return;
    }

    const mondayApiUrl = 'https://api.monday.com/v2';
    const version = apiVersion || '2023-10';

    const response = await fetch(mondayApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'API-Version': version
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    
    if (!response.ok) {
      res.status(response.status).json(data);
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error proxying Monday.com API request:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});
