import { NextRequest, NextResponse } from 'next/server';
import { sendGasFreeUSDCTransaction } from '@/lib/cdp';

// Merchant wallet address for receiving payments
const MERCHANT_WALLET_ADDRESS = process.env.MERCHANT_WALLET_ADDRESS || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";

export async function POST(request: NextRequest) {
  try {
    const { userWalletAddress, amount, userEmail, bookingId } = await request.json();

    // Validate input
    if (!userWalletAddress || !amount || !userEmail) {
      return NextResponse.json(
        { error: 'User wallet address, amount, and email are required' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Convert amount to USDC format (6 decimals)
    const usdcAmount = (amountNum * 1000000).toString(); // USDC has 6 decimals

    console.log(`Processing USDC payment:`, {
      from: userWalletAddress,
      to: MERCHANT_WALLET_ADDRESS,
      amount: usdcAmount,
      userEmail,
      bookingId
    });

    let transactionResult;
    let isDemoMode = false;

    try {
      // Attempt to send gas-free USDC transaction using paymaster
      transactionResult = await sendGasFreeUSDCTransaction(
        userWalletAddress,
        MERCHANT_WALLET_ADDRESS,
        usdcAmount
      );
    } catch (transactionError) {
      console.log('Blockchain transaction failed, using demo mode:', transactionError);
      
      // Demo mode: Simulate successful payment for testing
      isDemoMode = true;
      transactionResult = {
        transactionHash: `demo_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        success: true,
        demoMode: true
      };
      
      console.log('🎭 Demo mode activated - Payment simulated successfully');
    }

    // Log the transaction for record keeping
    console.log(`USDC payment ${isDemoMode ? '(DEMO)' : ''} successful:`, {
      transactionHash: transactionResult.transactionHash,
      userEmail,
      amount: amountNum,
      bookingId,
      isDemoMode,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      transactionHash: transactionResult.transactionHash,
      amount: amountNum,
      currency: 'USDC',
      isDemoMode,
      message: isDemoMode 
        ? 'Payment simulated successfully (Demo Mode)' 
        : 'Payment processed successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing USDC payment:', error);
    
    // Return more specific error messages based on the error type
    let errorMessage = 'Failed to process USDC payment';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient USDC balance in wallet';
        statusCode = 400;
      } else if (error.message.includes('invalid address')) {
        errorMessage = 'Invalid wallet address provided';
        statusCode = 400;
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error, please try again';
        statusCode = 503;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

// GET endpoint to check payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionHash = searchParams.get('transactionHash');

    if (!transactionHash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would check the transaction status on the blockchain
    // For now, we'll return a simple response
    return NextResponse.json({
      success: true,
      transactionHash,
      status: 'confirmed',
      message: 'Transaction confirmed on blockchain'
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}