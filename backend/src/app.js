const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const pollRoutes = require('./routes/poll.routes');
// const movieRoutes = require('./routes/movie.routes');
// const eventRoutes = require('./routes/event.routes');

const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running successfully' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
