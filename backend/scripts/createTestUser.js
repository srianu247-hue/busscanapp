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
                name: 'Srinithi63694 95325',
                email: 'srinithi@example.com',
                phone: '+91 9532563694',
                password: 'password123',
                walletBalance: 1000.00,
                status: 'active',
                fingerprintId: 'FP_TEST_001'
            },
            {
                name: 'Varshini 99410 83933',
                email: 'varshini@example.com',
                phone: '+91 9941083933',
                password: 'password123',
                walletBalance: 1000.00,
                status: 'active',
                fingerprintId: 'FP_TEST_002'
            },
            {
                name: 'Harini',
                email: 'harini@example.com',
                phone: '+91 9876543212',
                password: 'password123',
                walletBalance: 1000.00,
                status: 'active',
                fingerprintId: 'FP_TEST_003'
            },
            {
                name: 'Anonymous',
                email: 'anonymous@example.com',
                phone: '+91 0000000000',
                password: 'password123',
                walletBalance: 10000.00,
                status: 'active',
                fingerprintId: 'FP_ANONYMOUS'
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
        console.log('   • FP_TEST_001 - Srinithi63694 95325');
        console.log('   • FP_TEST_002 - Varshini 99410 83933');
        console.log('   • FP_TEST_003 - Harini');
        console.log('   • FP_ANONYMOUS - Anonymous');
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
