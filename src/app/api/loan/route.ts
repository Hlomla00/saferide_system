import { NextRequest, NextResponse } from 'next/server';
import { createEvmAccount } from '../../../../main';
import connectDB from '@/lib/mongodb';
import { User, Loan } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
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

    return NextResponse.json({
      success: true,
      walletAddress: user.walletAddress,
      phoneNumber: user.phoneNumber,
      name: user.name
    });

  } catch (error) {
    console.error('Error fetching user wallet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user wallet' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { 
      phoneNumber, 
      loanAmount, 
      currency = 'USDC',
      purpose,
      rideId,
      transactionHash,
      blockchainNetwork = 'base-sepolia'
    } = await request.json();

    // Validate input
    if (!phoneNumber || !loanAmount) {
      return NextResponse.json(
        { error: 'Phone number and loan amount are required' },
        { status: 400 }
      );
    }

    if (typeof loanAmount !== 'number' || loanAmount <= 0) {
      return NextResponse.json(
        { error: 'Loan amount must be a positive number' },
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

    // Create new loan record
    const newLoan = new Loan({
      userId: user._id,
      userPhone: user.phoneNumber,
      userName: user.name,
      walletAddress: user.walletAddress,
      loanAmount: loanAmount,
      currency,
      status: transactionHash ? 'completed' : 'pending',
      transactionHash,
      blockchainNetwork,
      purpose,
      rideId
    });

    await newLoan.save();

    return NextResponse.json({
      success: true,
      loan: {
        id: newLoan._id.toString(),
        userId: newLoan.userId.toString(),
        userPhone: newLoan.userPhone,
        userName: newLoan.userName,
        walletAddress: newLoan.walletAddress,
        loanAmount: newLoan.loanAmount,
        currency: newLoan.currency,
        status: newLoan.status,
        transactionHash: newLoan.transactionHash,
        blockchainNetwork: newLoan.blockchainNetwork,
        purpose: newLoan.purpose,
        rideId: newLoan.rideId,
        createdAt: newLoan.createdAt
      },
      message: 'Loan record created successfully'
    });

  } catch (error) {
    console.error('Error creating loan record:', error);
    return NextResponse.json(
      { error: 'Failed to create loan record' },
      { status: 500 }
    );
  }
}