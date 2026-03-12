import express from 'express';
import Trip from '../models/Trip.js';

const router = express.Router();

// ==========================================
// IN-MEMORY LIVE LOCATION BUFFER
// Stores the last 500 GPS pings per userId for real-time access.
// Keyed by userId string.
// ==========================================
const liveLocationBuffer = new Map();
const BUFFER_MAX = 500;

/**
 * POST /api/trips/location
 * Receive a real-time GPS location update from the bus terminal.
 * Called continuously during an active trip after fingerprint verification.
 *
 * Body: { userId, lat, lng, accuracy?, timestamp, tripPhase }
 */
router.post('/location', async (req, res) => {
    try {
        const { userId, lat, lng, accuracy, timestamp, tripPhase } = req.body;

        if (!userId || lat === undefined || lng === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, lat, lng'
            });
        }

        const update = {
            userId,
            lat,
            lng,
            accuracy: accuracy ?? null,
            timestamp: timestamp || Date.now(),
            tripPhase: tripPhase || 'inTrip',
            receivedAt: new Date().toISOString()
        };

        // Store in circular buffer (in-memory, no DB write per update — keeps it fast)
        if (!liveLocationBuffer.has(userId)) {
            liveLocationBuffer.set(userId, []);
        }
        const buf = liveLocationBuffer.get(userId);
        buf.push(update);
        if (buf.length > BUFFER_MAX) buf.shift();

        console.log(`📍 Live GPS [${tripPhase}] user:${userId} → (${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)})`);

        res.json({ success: true, message: 'Location received', update });

    } catch (error) {
        console.error('❌ Live location error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to store location update',
            error: error.message
        });
    }
});

/**
 * GET /api/trips/location/:userId
 * Retrieve the buffered live location history for a user.
 */
router.get('/location/:userId', (req, res) => {
    const { userId } = req.params;
    const buf = liveLocationBuffer.get(userId) || [];
    res.json({
        success: true,
        userId,
        count: buf.length,
        locations: buf
    });
});

/**
 * POST /api/trips
 * Save completed trip data to MongoDB
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

        // Clear the live location buffer for this user now that the trip is done
        liveLocationBuffer.delete(tripData.userId);

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
