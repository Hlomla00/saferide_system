import mongoose, { Document, Schema } from 'mongoose';

export interface IRideNow extends Document {
  userId: mongoose.Types.ObjectId;
  userPhone: string;
  loanAmount: number;
  rideServiceProvider: string;
  providerWalletAddress: string;
  pickupLocation: string;
  destination: string;
  estimatedFare: number;
  cryptoLoanStatus: 'pending' | 'approved' | 'disbursed' | 'completed' | 'failed';
  paymentTransactionHash?: string;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  repaymentDueDate: Date;
  interestRate: number;
  totalRepaymentAmount: number;
}

const RideNowSchema = new Schema<IRideNow>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },
  loanAmount: {
    type: Number,
    required: true,
    min: 0
  },
  rideServiceProvider: {
    type: String,
    required: true,
    default: 'Uber'
  },
  providerWalletAddress: {
    type: String,
    required: true,
    default: '0x5a84a57c62bb2a97504b47ce9d56eff807129bb6'
  },
  pickupLocation: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  estimatedFare: {
    type: Number,
    required: true,
    min: 0
  },
  cryptoLoanStatus: {
    type: String,
    enum: ['pending', 'approved', 'disbursed', 'completed', 'failed'],
    default: 'pending'
  },
  paymentTransactionHash: {
    type: String,
    sparse: true
  },
  walletAddress: {
    type: String,
    sparse: true
  },
  repaymentDueDate: {
    type: Date,
    required: true
  },
  interestRate: {
    type: Number,
    required: true,
    default: 5.0 // 5% interest rate
  },
  totalRepaymentAmount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
RideNowSchema.index({ userId: 1, createdAt: -1 });
RideNowSchema.index({ userPhone: 1, createdAt: -1 });
RideNowSchema.index({ cryptoLoanStatus: 1 });

export default mongoose.models.RideNow || mongoose.model<IRideNow>('RideNow', RideNowSchema);