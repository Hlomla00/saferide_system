import { NextRequest, NextResponse } from 'next/server';
import { createEvmAccount } from '@/lib/cdp';

// In-memory storage for demo purposes
// In production, use a proper database like PostgreSQL, MongoDB, etc.
const users: Array<{
  id: string;
  email: string;
  name: string;
  pin: string;
  walletAddress: string;
  createdAt: Date;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const { email, name, pin } = await request.json();

    // Validate input
    if (!email || !name || !pin) {
      return NextResponse.json(
        { error: 'Email, name, and PIN are required' },
        { status: 400 }
      );
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create wallet address using CDP
    const account = await createEvmAccount();
    
    // Create user profile
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser = {
      id: userId,
      email,
      name,
      pin, // In production, hash this PIN
      walletAddress: account.address,
      createdAt: new Date()
    };

    users.push(newUser);

    // Return user data (excluding PIN for security)
    const { pin: _, ...userResponse } = newUser;
    
    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'User profile and wallet created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to create user profile and wallet' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data (excluding PIN for security)
    const { pin: _, ...userResponse } = user;
    
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