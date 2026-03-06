require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the project root (parent of 'server' folder)
app.use(express.static(path.join(__dirname, '..')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/users', require('./routes/users'));

// API Health check (moved to a specific endpoint to avoid clashing with static index.html)
app.get('/api/health', (req, res) => {
    res.json({ message: 'AquaSphere API is running! 💧' });
});

// For any other request, serve index.html (SPA support if needed, or basic fallback)
app.get('*', (req, res, next) => {
    // If it's an API call that wasn't matched, don't serve index.html
    if (req.path.startsWith('/api/')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Connect to SQLite and Start Server
connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`✅ SQLite DB connected and tables ready.`);
    });
}).catch(err => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
});
