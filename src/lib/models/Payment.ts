import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  _id: string;
  userId: string;
  userPhone: string;
  userName: string;
  rideId?: string;
  loanId?: string;
  amount: number;
  currency: string;
  paymentMethod: 'phone' | 'card' | 'cash' | 'crypto';
  paymentType: 'ride_payment' | 'loan_repayment' | 'refund' | 'fee';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  transactionId?: string;
  transactionHash?: string; // For blockchain transactions
  blockchainNetwork?: string;
  fromWallet?: string;
  toWallet?: string;
  merchantWallet?: string;
  gasUsed?: number;
  gasFee?: number;
  processingFee?: number;
  netAmount?: number; // Amount after fees
  paymentProvider?: string; // e.g., 'coinbase', 'stripe', 'paypal'
  failureReason?: string;
  refundAmount?: number;
  refundedAt?: Date;
  metadata?: {
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
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
  rideId: {
    type: String,
    ref: 'Ride',
  },
  loanId: {
    type: String,
    ref: 'Loan',
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USDC',
  },
  paymentMethod: {
    type: String,
    enum: ['phone', 'card', 'cash', 'crypto'],
    required: true,
  },
  paymentType: {
    type: String,
    enum: ['ride_payment', 'loan_repayment', 'refund', 'fee'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
  },
  transactionId: String,
  transactionHash: String,
  blockchainNetwork: String,
  fromWallet: String,
  toWallet: String,
  merchantWallet: String,
  gasUsed: Number,
  gasFee: Number,
  processingFee: Number,
  netAmount: Number,
  paymentProvider: String,
  failureReason: String,
  refundAmount: Number,
  refundedAt: Date,
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Create indexes for better query performance
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ userPhone: 1 });
PaymentSchema.index({ rideId: 1 });
PaymentSchema.index({ loanId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ paymentType: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ transactionHash: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);