const express = require('express');
const router = express.Router();

// Mock get active polls
router.get('/', (req, res) => {
    res.json([
        { id: '1', title: 'Friday Sci-Fi Night', topMovie: 'Interstellar' },
        { id: '2', title: 'Halloween Horror', topMovie: 'The Conjuring' }
    ]);
});

// Mock create validate poll
router.post('/', (req, res) => {
    const { title, movies } = req.body;
    res.status(201).json({ id: '3', title, status: 'created', movies });
});

// Mock vote cast
router.post('/:pollId/vote', (req, res) => {
    const { movieId } = req.body;
    res.json({ message: `Voted for movie ${movieId} in poll ${req.params.pollId}` });
});

module.exports = router;
