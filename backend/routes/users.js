import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

/**
 * GET /api/users/:userId
 * Get user details by ID
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        console.log('📋 Fetching user:', userId);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid User ID format. Please start a new trip.'
            });
        }

        const user = await User.findById(userId).select('-password -fingerprintTemplate');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('✅ User found:', user.name, '| Balance: ₹' + user.walletBalance);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            walletBalance: user.walletBalance,
            status: user.status,
            fingerprintId: user.fingerprintId,
            createdAt: user.createdAt
        });

    } catch (error) {
        console.error('❌ Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user data',
            error: error.message
        });
    }
});

/**
 * POST /api/users/:userId/deduct
 * Deduct amount from user wallet
 */
router.post('/:userId/deduct', async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, description, tripId } = req.body;

        console.log(`💳 Deducting ₹${amount} from user ${userId}`);

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        // Find user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is blocked. Please contact support.'
            });
        }

        // Check wallet balance
        if (user.walletBalance < amount) {
            return res.status(400).json({
                success: false,
                message: `Insufficient wallet balance. Required: ₹${amount.toFixed(2)}, Available: ₹${user.walletBalance.toFixed(2)}`
            });
        }

        const balanceBefore = user.walletBalance;

        // Deduct balance
        await user.deductBalance(amount);

        const balanceAfter = user.walletBalance;

        // Create transaction record
        const transaction = await Transaction.create({
            userId: user._id,
            amount,
            type: 'debit',
            description: description || 'Bus fare deduction',
            balanceBefore,
            balanceAfter,
            tripId,
            status: 'completed'
        });

        console.log(`✅ Deducted ₹${amount} | New balance: ₹${balanceAfter}`);

        res.json({
            success: true,
            newBalance: balanceAfter,
            transactionId: transaction._id,
            message: 'Fare deducted successfully',
            transaction: {
                amount,
                balanceBefore,
                balanceAfter,
                timestamp: transaction.timestamp
            }
        });

    } catch (error) {
        console.error('❌ Deduct balance error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to deduct balance',
            error: error.message
        });
    }
});

/**
 * POST /api/users/:userId/credit
 * Add amount to user wallet (for recharge)
 */
router.post('/:userId/credit', async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, description } = req.body;

        console.log(`💰 Adding ₹${amount} to user ${userId}`);

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const balanceBefore = user.walletBalance;
        user.walletBalance += amount;
        await user.save();
        const balanceAfter = user.walletBalance;

        // Create transaction record
        const transaction = await Transaction.create({
            userId: user._id,
            amount,
            type: 'credit',
            description: description || 'Wallet recharge',
            balanceBefore,
            balanceAfter,
            status: 'completed'
        });

        console.log(`✅ Added ₹${amount} | New balance: ₹${balanceAfter}`);

        res.json({
            success: true,
            newBalance: balanceAfter,
            transactionId: transaction._id,
            message: 'Wallet recharged successfully'
        });

    } catch (error) {
        console.error('❌ Credit balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to credit balance',
            error: error.message
        });
    }
});

/**
 * GET /api/users/:userId/transactions
 * Get user transaction history
 */
router.get('/:userId/transactions', async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        const transactions = await Transaction.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit);

        res.json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error('❌ Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions',
            error: error.message
        });
    }
});

export default router;
