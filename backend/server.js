const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
const connectDB = require('./config/db');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

connectDB();

const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/api/test', (req,res) => {
    console.log('--- Request received for /api/text ---');
    res.json({message: 'Backend running successfully!'});
});

app.get('/api/db-status', (req,res) => {
    const dbState = mongoose.connection.readyState;
    let statusMessage = 'Database status unknown';
    switch(dbState){
        case 0: statusMessage = 'MongoDB Disconnected'; break;
        case 1: statusMessage = 'MongoDB Connected'; break;
        case 2: statusMessage = 'MongoDB Connecting'; break;
        case 3: statusMessage = 'MongoDB Disconnecting'; break;
    }
    res.json({ db_connection_state: dbState, message: statusMessage });
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});