const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { Chat } = require('./db');
const notifications = require('./email');

function initializeSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Simpan status online user
  const onlineUsers = new Map();

  // Middleware autentikasi socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, 'your_secret_key_here');
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { username, role } = socket.user;
    console.log(`User connected: ${username} (${role})`);

    // Update status online
    onlineUsers.set(username, {
      socketId: socket.id,
      role: role
    });
    broadcastOnlineUsers();

    // Join room untuk setiap laporan yang terkait
    socket.on('joinRoom', async (reportId) => {
      socket.join(`report_${reportId}`);
      
      // Kirim riwayat chat
      try {
        const chatHistory = await Chat.find({ reportId })
          .sort({ timestamp: 1 })
          .limit(100);
        socket.emit('chatHistory', chatHistory);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    });

    // Tangani pesan chat baru
    socket.on('sendMessage', async (data) => {
      try {
        const { reportId, message, recipientUsername } = data;
        
        // Simpan pesan ke database
        const chat = new Chat({
          reportId,
          sender: username,
          senderRole: role,
          message,
          timestamp: new Date()
        });
        await chat.save();

        // Broadcast pesan ke room
        io.to(`report_${reportId}`).emit('newMessage', {
          ...chat.toObject(),
          senderName: username
        });

        // Kirim notifikasi email jika penerima offline
        const recipient = onlineUsers.get(recipientUsername);
        if (!recipient) {
          const recipientData = {
            sender: username,
            reportTitle: data.reportTitle,
            content: message
          };
          await notifications.newChatMessage(recipientData, `${recipientUsername}@example.com`);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Tangani typing indicator
    socket.on('typing', (data) => {
      const { reportId } = data;
      socket.to(`report_${reportId}`).emit('userTyping', {
        username,
        reportId
      });
    });

    // Tangani disconnect
    socket.on('disconnect', () => {
      onlineUsers.delete(username);
      broadcastOnlineUsers();
      console.log(`User disconnected: ${username}`);
    });

    // Broadcast daftar user online
    function broadcastOnlineUsers() {
      const users = Array.from(onlineUsers).map(([username, data]) => ({
        username,
        role: data.role
      }));
      io.emit('onlineUsers', users);
    }
  });

  return io;
}

module.exports = initializeSocket;
