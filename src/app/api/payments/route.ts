import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Payment } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { 
      phoneNumber,
      rideId,
      loanId,
      amount,
      currency = 'USDC',
      paymentMethod = 'wallet',
      paymentType = 'ride_payment',
      status = 'pending',
      transactionHash,
      blockchainNetwork = 'base-sepolia'
    } = await request.json();

    // Validate input
    if (!phoneNumber || !amount) {
      return NextResponse.json(
        { error: 'Phone number and amount are required' },
        { status: 400 }
      );
    }

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create new payment record
    const newPayment = new Payment({
      userId: user._id,
      userPhone: user.phoneNumber,
      userName: user.name,
      rideId,
      loanId,
      amount: parseFloat(amount),
      currency,
      paymentMethod,
      paymentType,
      status,
      transactionHash,
      blockchainNetwork
    });

    await newPayment.save();

    return NextResponse.json({
      success: true,
      payment: {
        id: newPayment._id.toString(),
        userId: newPayment.userId.toString(),
        userPhone: newPayment.userPhone,
        userName: newPayment.userName,
        rideId: newPayment.rideId,
        loanId: newPayment.loanId,
        amount: newPayment.amount,
        currency: newPayment.currency,
        paymentMethod: newPayment.paymentMethod,
        paymentType: newPayment.paymentType,
        status: newPayment.status,
        transactionHash: newPayment.transactionHash,
        blockchainNetwork: newPayment.blockchainNetwork,
        createdAt: newPayment.createdAt
      },
      message: 'Payment record created successfully'
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');
    const userId = searchParams.get('userId');
    const rideId = searchParams.get('rideId');
    const loanId = searchParams.get('loanId');

    if (!phoneNumber && !userId && !rideId && !loanId) {
      return NextResponse.json(
        { error: 'Phone number, user ID, ride ID, or loan ID is required' },
        { status: 400 }
      );
    }

    // Build query
    const query: any = {};
    if (phoneNumber) query.userPhone = phoneNumber;
    if (userId) query.userId = userId;
    if (rideId) query.rideId = rideId;
    if (loanId) query.loanId = loanId;

    // Find payments
    const payments = await Payment.find(query).sort({ createdAt: -1 });

    const paymentsResponse = payments.map(payment => ({
      id: payment._id.toString(),
      userId: payment.userId.toString(),
      userPhone: payment.userPhone,
      userName: payment.userName,
      rideId: payment.rideId,
      loanId: payment.loanId,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      paymentType: payment.paymentType,
      status: payment.status,
      transactionHash: payment.transactionHash,
      blockchainNetwork: payment.blockchainNetwork,
      merchantWallet: payment.merchantWallet,
      gasUsed: payment.gasUsed,
      gasFee: payment.gasFee,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    }));

    return NextResponse.json({
      success: true,
      payments: paymentsResponse,
      count: paymentsResponse.length
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const { 
      paymentId, 
      status, 
      transactionHash,
      merchantWallet,
      gasUsed,
      gasFee
    } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (transactionHash) updateData.transactionHash = transactionHash;
    if (merchantWallet) updateData.merchantWallet = merchantWallet;
    if (gasUsed) updateData.gasUsed = parseFloat(gasUsed);
    if (gasFee) updateData.gasFee = parseFloat(gasFee);

    // Update payment
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true }
    );

    if (!updatedPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: updatedPayment._id.toString(),
        userId: updatedPayment.userId.toString(),
        userPhone: updatedPayment.userPhone,
        userName: updatedPayment.userName,
        rideId: updatedPayment.rideId,
        loanId: updatedPayment.loanId,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        paymentMethod: updatedPayment.paymentMethod,
        paymentType: updatedPayment.paymentType,
        status: updatedPayment.status,
        transactionHash: updatedPayment.transactionHash,
        blockchainNetwork: updatedPayment.blockchainNetwork,
        merchantWallet: updatedPayment.merchantWallet,
        gasUsed: updatedPayment.gasUsed,
        gasFee: updatedPayment.gasFee,
        createdAt: updatedPayment.createdAt,
        updatedAt: updatedPayment.updatedAt
      },
      message: 'Payment updated successfully'
    });

  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}