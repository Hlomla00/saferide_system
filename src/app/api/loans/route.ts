import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Loan } from '@/lib/models';

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

    // Find loans for the user
    const loans = await Loan.find(query).sort({ createdAt: -1 });

    const loansResponse = loans.map(loan => ({
      id: loan._id.toString(),
      userId: loan.userId.toString(),
      userPhone: loan.userPhone,
      userName: loan.userName,
      walletAddress: loan.walletAddress,
      loanAmount: loan.loanAmount,
      currency: loan.currency,
      status: loan.status,
      transactionHash: loan.transactionHash,
      blockchainNetwork: loan.blockchainNetwork,
      purpose: loan.purpose,
      rideId: loan.rideId,
      repaymentAmount: loan.repaymentAmount,
      repaymentDueDate: loan.repaymentDueDate,
      repaymentStatus: loan.repaymentStatus,
      createdAt: loan.createdAt,
      updatedAt: loan.updatedAt
    }));

    return NextResponse.json({
      success: true,
      loans: loansResponse,
      count: loansResponse.length
    });

  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const { 
      loanId, 
      status, 
      repaymentAmount, 
      repaymentDueDate, 
      repaymentStatus,
      transactionHash 
    } = await request.json();

    if (!loanId) {
      return NextResponse.json(
        { error: 'Loan ID is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (repaymentAmount) updateData.repaymentAmount = parseFloat(repaymentAmount);
    if (repaymentDueDate) updateData.repaymentDueDate = new Date(repaymentDueDate);
    if (repaymentStatus) updateData.repaymentStatus = repaymentStatus;
    if (transactionHash) updateData.transactionHash = transactionHash;

    // Update loan
    const updatedLoan = await Loan.findByIdAndUpdate(
      loanId,
      updateData,
      { new: true }
    );

    if (!updatedLoan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      loan: {
        id: updatedLoan._id.toString(),
        userId: updatedLoan.userId.toString(),
        userPhone: updatedLoan.userPhone,
        userName: updatedLoan.userName,
        walletAddress: updatedLoan.walletAddress,
        loanAmount: updatedLoan.loanAmount,
        currency: updatedLoan.currency,
        status: updatedLoan.status,
        transactionHash: updatedLoan.transactionHash,
        blockchainNetwork: updatedLoan.blockchainNetwork,
        purpose: updatedLoan.purpose,
        rideId: updatedLoan.rideId,
        repaymentAmount: updatedLoan.repaymentAmount,
        repaymentDueDate: updatedLoan.repaymentDueDate,
        repaymentStatus: updatedLoan.repaymentStatus,
        createdAt: updatedLoan.createdAt,
        updatedAt: updatedLoan.updatedAt
      },
      message: 'Loan updated successfully'
    });

  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json(
      { error: 'Failed to update loan' },
      { status: 500 }
    );
  }
}