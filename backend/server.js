const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { mongo, default: mongoose } = require('mongoose');

dotenv.config();

const app = express();

connectDB();

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/api/test', (req,res) => {
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