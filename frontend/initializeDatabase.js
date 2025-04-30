require('dotenv').config();
const { initializePanels } = require('./src/scripts/initializePanels');

const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    await initializePanels();
    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  }
};

initializeDatabase(); 