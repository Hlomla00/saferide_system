import mongoose, { Document, Schema } from 'mongoose';

export interface ILoan extends Document {
  _id: string;
  userId: string;
  userPhone: string;
  userName: string;
  walletAddress: string;
  loanAmount: number;
  currency: string;
  status: 'pending' | 'approved' | 'disbursed' | 'repaid' | 'defaulted';
  transactionHash?: string;
  blockchainNetwork: string;
  purpose: 'ride_payment' | 'emergency' | 'other';
  rideId?: string; // Reference to the ride this loan is for
  repaymentDueDate?: Date;
  repaymentAmount?: number;
  repaidAmount?: number;
  repaidAt?: Date;
  interestRate?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema: Schema = new Schema({
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
  walletAddress: {
    type: String,
    required: true,
  },
  loanAmount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USDC',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'disbursed', 'repaid', 'defaulted'],
    default: 'pending',
  },
  transactionHash: String,
  blockchainNetwork: {
    type: String,
    default: 'base-sepolia',
  },
  purpose: {
    type: String,
    enum: ['ride_payment', 'emergency', 'other'],
    default: 'ride_payment',
  },
  rideId: {
    type: String,
    ref: 'Ride',
  },
  repaymentDueDate: Date,
  repaymentAmount: Number,
  repaidAmount: {
    type: Number,
    default: 0,
  },
  repaidAt: Date,
  interestRate: {
    type: Number,
    default: 0,
  },
  notes: String,
}, {
  timestamps: true,
});

// Create indexes for better query performance
LoanSchema.index({ userId: 1 });
LoanSchema.index({ userPhone: 1 });
LoanSchema.index({ walletAddress: 1 });
LoanSchema.index({ status: 1 });
LoanSchema.index({ createdAt: -1 });
LoanSchema.index({ rideId: 1 });

export default mongoose.models.Loan || mongoose.model<ILoan>('Loan', LoanSchema);