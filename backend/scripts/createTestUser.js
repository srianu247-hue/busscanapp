import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

/**
 * Create test users with fingerprint IDs for testing
 */
async function createTestUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Test users data
        const testUsers = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+91 9876543210',
                password: 'password123', // In production, this should be hashed
                walletBalance: 500.00,
                status: 'active',
                fingerprintId: 'FP_TEST_001'
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '+91 9876543211',
                password: 'password123',
                walletBalance: 250.50,
                status: 'active',
                fingerprintId: 'FP_TEST_002'
            },
            {
                name: 'Bob Wilson',
                email: 'bob@example.com',
                phone: '+91 9876543212',
                password: 'password123',
                walletBalance: 1000.00,
                status: 'active',
                fingerprintId: 'FP_TEST_003'
            },
            {
                name: 'Alice Brown',
                email: 'alice@example.com',
                phone: '+91 9876543213',
                password: 'password123',
                walletBalance: 50.00,
                status: 'active',
                fingerprintId: 'FP_TEST_004'
            },
            {
                name: 'Blocked User',
                email: 'blocked@example.com',
                phone: '+91 9876543214',
                password: 'password123',
                walletBalance: 100.00,
                status: 'blocked',
                fingerprintId: 'FP_TEST_BLOCKED'
            }
        ];

        console.log('\n🔨 Creating test users...\n');

        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                console.log(`⏭️  User already exists: ${userData.name} (${userData.email})`);
                continue;
            }

            // Create user
            const user = await User.create(userData);
            console.log(`✅ Created: ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Fingerprint ID: ${user.fingerprintId}`);
            console.log(`   Wallet Balance: ₹${user.walletBalance}`);
            console.log(`   Status: ${user.status}`);
            console.log(`   User ID: ${user._id}`);
            console.log('');
        }

        console.log('✅ Test users created successfully!\n');
        console.log('📋 Test Fingerprint IDs for scanning:');
        console.log('   • FP_TEST_001 - John Doe (₹500)');
        console.log('   • FP_TEST_002 - Jane Smith (₹250.50)');
        console.log('   • FP_TEST_003 - Bob Wilson (₹1000)');
        console.log('   • FP_TEST_004 - Alice Brown (₹50)');
        console.log('   • FP_TEST_BLOCKED - Blocked User (blocked)');
        console.log('');
        console.log('💡 Use these fingerprint IDs in the frontend for testing');
        console.log('');

    } catch (error) {
        console.error('❌ Error creating test users:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

createTestUsers();
