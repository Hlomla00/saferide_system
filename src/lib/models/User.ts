import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  phoneNumber: string;
  email?: string;
  name: string;
  pin: string; // Will be hashed
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true, // Allows multiple null values but unique non-null values
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  pin: {
    type: String,
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Create indexes for better query performance
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ walletAddress: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);