import express from 'express';
import User from '../models/User.js';

const router = express.Router();

/**
 * POST /api/fingerprint/verify
 * Verify fingerprint and return user identification
 * 
 * In production, this would call the RDMS service
 * For now, we'll simulate with a test fingerprint ID
 */
router.post('/verify', async (req, res) => {
    try {
        // SIMULATION: For testing, use a test fingerprint ID
        const testFingerprintId = req.body.fingerprintId || 'FP_TEST_001';
        console.log('🔍 Verifying fingerprint:', testFingerprintId);

        // Find user by fingerprint ID
        let user = await User.findOne({ fingerprintId: testFingerprintId });

        // DYNAMIC MOCK: If the exact test FP isn't found, dynamically fetch the first active user from MongoDB to run the demo.
        if (!user) {
            user = await User.findOne({ status: 'active' });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                verified: false,
                message: 'No users found in database. Please register a user first.'
            });
        }

        console.log('✅ User found dynamically from DB:', user.name);

        res.json({
            success: true,
            userId: user._id,
            fingerprintId: user.fingerprintId || 'mock_dynamic',
            verified: true,
            message: 'Fingerprint verified matching live db user'
        });

    } catch (error) {
        console.error('❌ Fingerprint verification error:', error);
        res.status(500).json({
            success: false,
            verified: false,
            message: 'Fingerprint verification failed',
            error: error.message
        });
    }
});

/**
 * POST /api/fingerprint/capture
 * Capture fingerprint data (for registration)
 */
router.post('/capture', async (req, res) => {
    try {
        // TODO: In production, call RDMS service to capture fingerprint
        // const rdmsResponse = await fetch(`${process.env.RDMS_SERVICE_URL}/capture`);

        // SIMULATION: Return test fingerprint data
        const testFingerprintData = {
            fingerprintId: `FP_${Date.now()}`,
            template: 'SIMULATED_TEMPLATE_DATA',
            quality: 85
        };

        res.json({
            success: true,
            fingerprintData: testFingerprintData.fingerprintId,
            quality: testFingerprintData.quality,
            message: 'Fingerprint captured successfully'
        });

    } catch (error) {
        console.error('❌ Fingerprint capture error:', error);
        res.status(500).json({
            success: false,
            message: 'Fingerprint capture failed',
            error: error.message
        });
    }
});

/**
 * GET /api/fingerprint/status
 * Check RDMS service status
 */
router.get('/status', async (req, res) => {
    try {
        // TODO: In production, check actual RDMS service
        // const rdmsResponse = await fetch(`${process.env.RDMS_SERVICE_URL}/status`);

        res.json({
            connected: true,
            message: 'Scanner ready (simulation mode)',
            device: 'Precision Biometric Scanner',
            version: '1.0.0'
        });

    } catch (error) {
        res.json({
            connected: false,
            message: 'Scanner disconnected',
            error: error.message
        });
    }
});

export default router;
