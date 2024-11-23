const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// In-memory leaderboard
let leaderboard = [];

// API endpoints
app.get('/api/leaderboard', (req, res) => {
  const sortedLeaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
  res.json(sortedLeaderboard);
});

app.post('/api/leaderboard', (req, res) => {
  const { name, score, time } = req.body;
  leaderboard.push({ name, score, time });
  res.json({ message: 'Score submitted', score: { name, score, time } });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
