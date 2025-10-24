import { NextRequest, NextResponse } from 'next/server';
import { verifyPin, isValidPin } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { phoneNumber, pin } = await request.json();

    // Validate input
    if (!phoneNumber || !pin) {
      return NextResponse.json(
        { error: 'Phone number and PIN are required' },
        { status: 400 }
      );
    }

    if (!isValidPin(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found with this phone number' },
        { status: 404 }
      );
    }

    // Verify PIN
    const isPinValid = await verifyPin(pin, user.pin);
    if (!isPinValid) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }

    // Return user data (excluding PIN for security)
    const userResponse = {
      id: user._id.toString(),
      phoneNumber: user.phoneNumber,
      email: user.email,
      name: user.name,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt
    };
    
    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'Authentication successful'
    });

  } catch (error) {
    console.error('Error authenticating user:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}