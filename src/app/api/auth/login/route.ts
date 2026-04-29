import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';
import { verifyPin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { identifier, pin } = await request.json();

    if (!identifier || !pin) {
      return NextResponse.json(
        { error: 'Phone/email and PIN are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      $or: [{ phoneNumber: identifier }, { email: identifier }],
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with that phone number or email' },
        { status: 404 }
      );
    }

    const pinMatch = await verifyPin(pin, user.pin);
    if (!pinMatch) {
      return NextResponse.json(
        { error: 'Incorrect PIN' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        phoneNumber: user.phoneNumber,
        email: user.email,
        name: user.name,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
