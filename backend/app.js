const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const maintenanceRoutes = require('./routes/maintenance');
const panelsRoutes = require('./routes/panels');
const mlRoutes = require('./routes/ml_routes');

app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/panels', panelsRoutes);
app.use('/api/ml', mlRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 