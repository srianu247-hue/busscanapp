import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    walletBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    },
    fingerprintId: {
        type: String,
        unique: true,
        sparse: true // Allows null values while maintaining uniqueness
    },
    fingerprintTemplate: {
        type: String, // Encrypted fingerprint data
        select: false // Don't return by default for security
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Instance method to check if user can travel
userSchema.methods.canTravel = function () {
    return this.status === 'active' && this.walletBalance > 0;
};

// Instance method to deduct balance
userSchema.methods.deductBalance = async function (amount) {
    if (this.walletBalance < amount) {
        throw new Error('Insufficient wallet balance');
    }
    this.walletBalance -= amount;
    await this.save();
    return this.walletBalance;
};

const User = mongoose.model('User', userSchema);

export default User;
