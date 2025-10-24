import { NextRequest, NextResponse } from 'next/server';
import { createEvmAccount } from '../../../../main';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';
import { hashPin, isValidPin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { phoneNumber, email, name, pin } = await request.json();

    // Validate input
    if (!phoneNumber || !email || !name || !pin) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!isValidPin(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    // Check if user already exists by phone number or email
    const existingUser = await User.findOne({
      $or: [
        { phoneNumber },
        { email }
      ]
    });

    if (existingUser) {
      // Return existing user data (excluding PIN for security)
      const userResponse = {
        id: existingUser._id.toString(),
        phoneNumber: existingUser.phoneNumber,
        email: existingUser.email,
        name: existingUser.name,
        walletAddress: existingUser.walletAddress,
        createdAt: existingUser.createdAt
      };
      
      return NextResponse.json({
        success: true,
        user: userResponse,
        message: 'User already exists',
        isExisting: true
      });
    }

    // Create EVM account for new user
    const evmAccount = await createEvmAccount();
    
    // Hash the PIN before storing
    const hashedPin = await hashPin(pin);

    // Create new user in database
    const newUser = new User({
      phoneNumber,
      email,
      name,
      pin: hashedPin,
      walletAddress: evmAccount.address
    });

    await newUser.save();

    // Return user data (excluding PIN for security)
    const userResponse = {
      id: newUser._id.toString(),
      phoneNumber: newUser.phoneNumber,
      email: newUser.email,
      name: newUser.name,
      walletAddress: newUser.walletAddress,
      createdAt: newUser.createdAt
    };

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'User created successfully',
      isExisting: false
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');
    const email = searchParams.get('email');

    if (!phoneNumber && !email) {
      return NextResponse.json(
        { error: 'Phone number or email is required' },
        { status: 400 }
      );
    }

    // Find user by phone number or email
    const user = await User.findOne({
      $or: [
        ...(phoneNumber ? [{ phoneNumber }] : []),
        ...(email ? [{ email }] : [])
      ]
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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
      user: userResponse
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}