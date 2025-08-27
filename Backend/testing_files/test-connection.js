import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config.env' });

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful!');
    
    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    // Test basic operations
    const db = mongoose.connection.db;
    const stats = await db.stats();
    console.log('📊 Database stats:', {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize
    });
    
    console.log('🎉 Backend setup is working correctly!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check your MONGODB_URI in config.env');
    console.log('3. Ensure MongoDB is accessible from your network');
    console.log('4. For local MongoDB, try: mongodb://localhost:27017/budget-mate');
  } finally {
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Connection closed');
    }
    process.exit(0);
  }
}

// Run the test
testConnection(); 