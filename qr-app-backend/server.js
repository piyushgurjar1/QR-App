require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const qrRoutes = require('./routes/qrRoutes');
const childRoutes = require('./routes/childRoutes');
const adminRoutes = require('./routes/adminRoutes');
const parentRoutes = require('./routes/parentRoutes'); 

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/test', testRoutes);
app.use('/api/child', childRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/parent', parentRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});