const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/house-rental', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('\x1b[33m%s\x1b[0m', '---------------------------------------------------');
    console.error('\x1b[33m%s\x1b[0m', 'ERROR: Could not connect to MongoDB.');
    console.error('\x1b[33m%s\x1b[0m', '1. Make sure MongoDB Community Server is installed and running.');
    console.error('\x1b[33m%s\x1b[0m', '2. If using Atlas, check your MONGODB_URI in .env');
    console.error('\x1b[33m%s\x1b[0m', '---------------------------------------------------');
});

// Routes
app.use('/api/tenants', require('./routes/tenantRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/', (req, res) => {
    res.send('House Rental Management API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
