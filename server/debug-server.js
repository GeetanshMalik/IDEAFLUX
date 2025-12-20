import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001; // Different port to avoid conflicts

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple test routes
app.get('/health', (req, res) => {
  console.log('Health endpoint hit!');
  res.json({ status: 'OK', message: 'Debug server is working!' });
});

app.get('/test', (req, res) => {
  console.log('Test endpoint hit!');
  res.json({ message: 'Test successful!' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Debug server running on port: ${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/health`);
  console.log(`🔗 Test: http://localhost:${PORT}/test`);
});

// Prevent immediate termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down debug server...');
  server.close(() => {
    console.log('✅ Debug server closed');
    process.exit(0);
  });
});