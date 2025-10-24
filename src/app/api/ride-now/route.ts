import { NextRequest, NextResponse } from 'next/server';
import { createEvmAccount } from '../../../../main';
import connectDB from '@/lib/mongodb';
import { User, RideNow } from '@/lib/models';
import { processRideNowPayment, calculateRideNowLoanTerms } from '@/lib/rideNowPayment';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      userPhone, 
      loanAmount, 
      pickupLocation, 
      destination, 
      estimatedFare 
    } = body;

    // Validate required fields
    if (!userPhone || !loanAmount || !pickupLocation || !destination || !estimatedFare) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ phoneNumber: userPhone });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate repayment details using the payment service
    const loanTerms = calculateRideNowLoanTerms(loanAmount);

    // Create EVM account for the transaction
    let walletAddress = '';
    let paymentTransactionHash = '';
    
    try {
      const evmAccount = await createEvmAccount();
      walletAddress = evmAccount.address;
      
      // Process payment to ride-service provider wallet
      const paymentResult = await processRideNowPayment(loanAmount, walletAddress);
      
      if (!paymentResult.success) {
        return NextResponse.json(
          { error: `Payment failed: ${paymentResult.error}` },
          { status: 500 }
        );
      }
      
      paymentTransactionHash = paymentResult.transactionHash || '';
      
    } catch (error) {
      console.error('Error processing crypto payment:', error);
      return NextResponse.json(
        { error: 'Failed to process crypto payment' },
        { status: 500 }
      );
    }

    // Create RideNow record
    const rideNow = new RideNow({
      userId: user._id,
      userPhone,
      loanAmount,
      rideServiceProvider: 'Uber',
      providerWalletAddress: process.env.UBER_WALLET_ADDRESS || '0x5a84a57c62bb2a97504b47ce9d56eff807129bb6',
      pickupLocation,
      destination,
      estimatedFare,
      cryptoLoanStatus: 'disbursed',
      paymentTransactionHash,
      walletAddress,
      repaymentDueDate: loanTerms.repaymentDueDate,
      interestRate: loanTerms.interestRate,
      totalRepaymentAmount: loanTerms.totalRepaymentAmount
    });

    await rideNow.save();

    // Update user's wallet balance (subtract loan amount)
    if (user.walletBalance !== undefined) {
      user.walletBalance += loanAmount;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Ride Now! crypto loan processed successfully',
      data: {
        rideNowId: rideNow._id,
        loanAmount,
        totalRepaymentAmount: loanTerms.totalRepaymentAmount,
        repaymentDueDate: loanTerms.repaymentDueDate,
        paymentTransactionHash,
        walletAddress,
        providerWalletAddress: rideNow.providerWalletAddress,
        cryptoLoanStatus: rideNow.cryptoLoanStatus
      }
    });

  } catch (error) {
    console.error('Error processing Ride Now! crypto loan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userPhone = searchParams.get('phone');
    const userId = searchParams.get('userId');

    if (!userPhone && !userId) {
      return NextResponse.json(
        { error: 'Phone number or user ID is required' },
        { status: 400 }
      );
    }

    let query = {};
    if (userPhone) {
      query = { userPhone };
    } else if (userId) {
      query = { userId };
    }

    const rideNowRecords = await RideNow.find(query)
      .populate('userId', 'name phone email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: rideNowRecords
    });

  } catch (error) {
    console.error('Error fetching Ride Now! records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { rideNowId, cryptoLoanStatus, paymentTransactionHash } = body;

    if (!rideNowId) {
      return NextResponse.json(
        { error: 'RideNow ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (cryptoLoanStatus) {
      updateData.cryptoLoanStatus = cryptoLoanStatus;
    }
    if (paymentTransactionHash) {
      updateData.paymentTransactionHash = paymentTransactionHash;
    }
    if (cryptoLoanStatus === 'completed') {
      updateData.completedAt = new Date();
    }

    const rideNow = await RideNow.findByIdAndUpdate(
      rideNowId,
      updateData,
      { new: true }
    );

    if (!rideNow) {
      return NextResponse.json(
        { error: 'RideNow record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'RideNow record updated successfully',
      data: rideNow
    });

  } catch (error) {
    console.error('Error updating RideNow record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}