const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/project-app';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Mongo connection error', err);
});

// Initialize Firebase Admin if service account set
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        console.log('Firebase admin initialized');
    } catch (err) {
        console.warn('Failed to initialize Firebase Admin. Provide valid FIREBASE_SERVICE_ACCOUNT path in .env');
    }
}

// Routes
app.get('/', (req, res) => res.json({ message: 'Welcome to the Express Server' }));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));
app.use('/api/teams', require('./routes/teams'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server with Socket.IO
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);
    socket.on('joinTeam', (teamId) => {
        socket.join(`team_${teamId}`);
    });
    socket.on('sendMessage', (msg) => {
        // broadcast to team room
        const room = `team_${msg.teamId}`;
        io.to(room).emit('message', msg);
    });
});

// expose io to routes via app
app.set('io', io);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});