const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); 
const { notFound, errorHandler } = require('./middleware/errorMiddleware'); 

dotenv.config();
connectDB();

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from the DevLink backend! Test successful. CORS is working!' });
});
app.get('/api/db-status', (req, res) => {
  const dbState = mongoose.connection.readyState;
  let statusMessage = 'Database status unknown';
  switch (dbState) {
    case 0: statusMessage = 'MongoDB Disconnected'; break;
    case 1: statusMessage = 'MongoDB Connected'; break;
    case 2: statusMessage = 'MongoDB Connecting'; break;
    case 3: statusMessage = 'MongoDB Disconnecting'; break;
  }
  res.json({ db_connection_state: dbState, message: statusMessage });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes); 
app.use('/api/notifications', notificationRoutes);

app.use(notFound);  
app.use(errorHandler); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});