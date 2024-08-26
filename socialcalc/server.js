const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173', // Replace with your frontend URL
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true,
    },
  });
app.use(cors({
    origin: 'http://localhost:5173', // Your React app's origin
    methods: ['GET', 'POST'], // HTTP methods allowed
    credentials: true,
  }));

let spreadsheetData = {}; // In-memory storage for spreadsheet data

io.on('connection', (socket) => {
  console.log('a user connected');

  // Send existing spreadsheet data to the new user
  socket.emit('load-data', spreadsheetData);

  // Handle cell update from a user
  socket.on('update-cell', ({ cellId, value }) => {
    spreadsheetData[cellId] = value; // Update the cell data
    io.emit('update-cell', { cellId, value }); // Broadcast the change to all users
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on :3000');
});
