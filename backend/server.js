import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import scholarshipRoutes from './routes/scholarships.js';
import { seed } from './seed-scholarship.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Allow requests from your React app
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow credentials (if needed)
};

app.use(cors(corsOptions)); // Use CORS with the specified options

app.use('/api/scholarships', scholarshipRoutes);

// Check if MONGO_URI is set
if (!MONGO_URI) {
  console.error("❌ MONGO_URI not set in .env");
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    await seed(); // Seed the database with initial data
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  });

// Basic route
app.get('/test-cors', (req, res) => {
  res.json({ message: "CORS is working!" });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
