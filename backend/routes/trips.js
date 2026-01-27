import express from 'express';
import Trip from '../models/Trip.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * POST /api/trips
 * Save trip data
 */
router.post('/', async (req, res) => {
    try {
        const tripData = req.body;

        console.log('🚌 Saving trip data for user:', tripData.userName);

        // Validate required fields
        if (!tripData.userId || !tripData.entryLocation || !tripData.exitLocation) {
            return res.status(400).json({
                success: false,
                message: 'Missing required trip data'
            });
        }

        // Create trip record
        const trip = await Trip.create({
            userId: tripData.userId,
            userName: tripData.userName,
            entryLocation: tripData.entryLocation,
            exitLocation: tripData.exitLocation,
            entryTime: tripData.entryTime || new Date(),
            exitTime: tripData.exitTime || new Date(),
            distanceKm: tripData.distanceKm,
            fareAmount: tripData.fareAmount,
            walletBalanceBefore: tripData.walletBalanceBefore,
            walletBalanceAfter: tripData.walletBalanceAfter,
            transactionId: tripData.transactionId,
            status: 'completed'
        });

        console.log('✅ Trip saved:', trip._id);

        res.json({
            success: true,
            tripId: trip._id,
            message: 'Trip data saved successfully',
            trip
        });

    } catch (error) {
        console.error('❌ Save trip error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save trip data',
            error: error.message
        });
    }
});

/**
 * GET /api/trips/:tripId
 * Get trip details by ID
 */
router.get('/:tripId', async (req, res) => {
    try {
        const { tripId } = req.params;

        const trip = await Trip.findById(tripId).populate('userId', 'name email phone');

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        res.json({
            success: true,
            trip
        });

    } catch (error) {
        console.error('❌ Get trip error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trip data',
            error: error.message
        });
    }
});

/**
 * GET /api/trips/user/:userId
 * Get all trips for a user
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        const trips = await Trip.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            count: trips.length,
            trips
        });

    } catch (error) {
        console.error('❌ Get user trips error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trips',
            error: error.message
        });
    }
});

export default router;
