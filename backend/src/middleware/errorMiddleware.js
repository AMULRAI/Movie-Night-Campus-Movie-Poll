/**
 * Placeholder for global error handling middleware
 */
module.exports = (err, req, res, next) => {
    console.error(err.stack);
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ success: false, error: message });
};
