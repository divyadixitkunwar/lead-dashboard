require('dotenv').config();
const express = require('express');
const cors = require('cors');
const leadsRouter = require('./routes/leads');
const usersRouter = require('./routes/users');  // add with other requires at top
const authRouter = require('./routes/auth');   // at top with other requires
const ingestRouter = require('./routes/ingest');  // at top
const adminRouter = require('./routes/admin');  // superadmin-only approval queue
const channelsRouter = require('./routes/channels');  // Facebook Login for Business connect flow


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'Lead Dashboard API is running' });
});

app.use('/leads', leadsRouter);
app.use('/users', usersRouter);                 // add below the leads line
app.use('/auth', authRouter);                  // below other routes
app.use('/ingest', ingestRouter);                 // with other routes
app.use('/admin', adminRouter);                 // superadmin-only
app.use('/channels', channelsRouter);           // Messenger + Instagram connect flow


// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});