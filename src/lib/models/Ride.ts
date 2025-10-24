import mongoose, { Document, Schema } from 'mongoose';

export interface IRide extends Document {
  _id: string;
  userId: string;
  userPhone: string;
  userName: string;
  userEmail?: string;
  pickup: {
    name: string;
    address?: string;
  };
  destination: {
    name: string;
    address?: string;
  };
  provider: {
    id: string;
    name: string;
  };
  rideType: 'standard' | 'premium' | 'shared';
  fare: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  paymentMethod: 'phone' | 'card' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed';
  transactionId?: string;
  driverInfo?: {
    name: string;
    phone: string;
    plateNumber: string;
    rating: number;
  };
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  distance?: number; // in kilometers
  createdAt: Date;
  updatedAt: Date;
}

const RideSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  userPhone: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
  },
  pickup: {
    name: {
      type: String,
      required: true,
    },
    address: String,
  },
  destination: {
    name: {
      type: String,
      required: true,
    },
    address: String,
  },
  provider: {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  rideType: {
    type: String,
    enum: ['standard', 'premium', 'shared'],
    required: true,
  },
  fare: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USDC',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['phone', 'card', 'cash'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  transactionId: String,
  driverInfo: {
    name: String,
    phone: String,
    plateNumber: String,
    rating: Number,
  },
  estimatedDuration: Number,
  actualDuration: Number,
  distance: Number,
}, {
  timestamps: true,
});

// Create indexes for better query performance
RideSchema.index({ userId: 1 });
RideSchema.index({ userPhone: 1 });
RideSchema.index({ status: 1 });
RideSchema.index({ createdAt: -1 });

export default mongoose.models.Ride || mongoose.model<IRide>('Ride', RideSchema);