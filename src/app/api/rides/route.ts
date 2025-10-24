import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Ride } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { 
      phoneNumber,
      pickup,
      destination,
      fare,
      paymentMethod = 'wallet',
      status = 'pending'
    } = await request.json();

    // Validate input
    if (!phoneNumber || !pickup || !destination || !fare) {
      return NextResponse.json(
        { error: 'Phone number, pickup, destination, and fare are required' },
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

    // Create new ride record
    const newRide = new Ride({
      userId: user._id,
      userPhone: user.phoneNumber,
      userName: user.name,
      pickup,
      destination,
      fare: parseFloat(fare),
      paymentMethod,
      status
    });

    await newRide.save();

    return NextResponse.json({
      success: true,
      ride: {
        id: newRide._id.toString(),
        userId: newRide.userId.toString(),
        userPhone: newRide.userPhone,
        userName: newRide.userName,
        pickup: newRide.pickup,
        destination: newRide.destination,
        fare: newRide.fare,
        paymentMethod: newRide.paymentMethod,
        status: newRide.status,
        createdAt: newRide.createdAt
      },
      message: 'Ride booked successfully'
    });

  } catch (error) {
    console.error('Error creating ride:', error);
    return NextResponse.json(
      { error: 'Failed to create ride' },
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

    if (!phoneNumber && !userId) {
      return NextResponse.json(
        { error: 'Phone number or user ID is required' },
        { status: 400 }
      );
    }

    // Build query
    const query: any = {};
    if (phoneNumber) query.userPhone = phoneNumber;
    if (userId) query.userId = userId;

    // Find rides for the user
    const rides = await Ride.find(query).sort({ createdAt: -1 });

    const ridesResponse = rides.map(ride => ({
      id: ride._id.toString(),
      userId: ride.userId.toString(),
      userPhone: ride.userPhone,
      userName: ride.userName,
      pickup: ride.pickup,
      destination: ride.destination,
      fare: ride.fare,
      paymentMethod: ride.paymentMethod,
      status: ride.status,
      createdAt: ride.createdAt,
      updatedAt: ride.updatedAt
    }));

    return NextResponse.json({
      success: true,
      rides: ridesResponse,
      count: ridesResponse.length
    });

  } catch (error) {
    console.error('Error fetching rides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rides' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const { rideId, status } = await request.json();

    if (!rideId || !status) {
      return NextResponse.json(
        { error: 'Ride ID and status are required' },
        { status: 400 }
      );
    }

    // Update ride status
    const updatedRide = await Ride.findByIdAndUpdate(
      rideId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedRide) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ride: {
        id: updatedRide._id.toString(),
        userId: updatedRide.userId.toString(),
        userPhone: updatedRide.userPhone,
        userName: updatedRide.userName,
        pickup: updatedRide.pickup,
        destination: updatedRide.destination,
        fare: updatedRide.fare,
        paymentMethod: updatedRide.paymentMethod,
        status: updatedRide.status,
        createdAt: updatedRide.createdAt,
        updatedAt: updatedRide.updatedAt
      },
      message: 'Ride status updated successfully'
    });

  } catch (error) {
    console.error('Error updating ride:', error);
    return NextResponse.json(
      { error: 'Failed to update ride' },
      { status: 500 }
    );
  }
}