import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    userName: {
        type: String,
        required: true
    },
    entryLocation: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        },
        accuracy: Number,
        timestamp: Number
    },
    exitLocation: {
        lat: Number,
        lng: Number,
        accuracy: Number,
        timestamp: Number
    },
    entryTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    exitTime: {
        type: Date
    },
    distanceKm: {
        type: Number,
        min: 0
    },
    fareAmount: {
        type: Number,
        min: 0
    },
    walletBalanceBefore: {
        type: Number,
        required: true
    },
    walletBalanceAfter: {
        type: Number
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'cancelled'],
        default: 'ongoing',
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
tripSchema.index({ userId: 1, createdAt: -1 });
tripSchema.index({ status: 1, createdAt: -1 });

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
