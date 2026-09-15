require('dotenv').config();
const express = require('express');
const cors = require('cors');
const leadsRouter = require('./routes/leads');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const ingestRouter = require('./routes/ingest');
const adminRouter = require('./routes/admin');
const channelsRouter = require('./routes/channels');
const businessRouter = require('./routes/business');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Ekikrit API is running' });
});

app.use('/leads', leadsRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/ingest', ingestRouter);
app.use('/admin', adminRouter);
app.use('/channels', channelsRouter);
app.use('/business', businessRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
