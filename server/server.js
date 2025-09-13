const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error(err));
const app = express();

app.use(cors());
app.use(express.json()); 

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/suggestion', suggestionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));