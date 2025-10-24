import { getCdpClient } from './cdp';
import { ethers } from 'ethers';

// USDC contract address on Base Sepolia
const USDC_CONTRACT = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

// Ride service provider wallet address
const RIDE_SERVICE_PROVIDER_WALLET = process.env.UBER_WALLET_ADDRESS || '0x5a84a57c62bb2a97504b47ce9d56eff807129bb6';

// Helper function to encode USDC transfer
function encodeUSDCTransfer(to: string, amount: string): `0x${string}` {
  // ERC-20 transfer function signature: transfer(address,uint256)
  const functionSignature = '0xa9059cbb';
  
  // Pad address to 32 bytes (remove 0x prefix, pad to 64 chars, add back 0x)
  const paddedTo = '0x' + to.slice(2).padStart(64, '0');
  
  // Convert amount to hex and pad to 32 bytes
  const amountBN = BigInt(amount);
  const paddedAmount = '0x' + amountBN.toString(16).padStart(64, '0');
  
  return (functionSignature + paddedTo.slice(2) + paddedAmount.slice(2)) as `0x${string}`;
}

export interface RideNowPaymentResult {
  success: boolean;
  transactionHash?: string;
  walletAddress?: string;
  error?: string;
}

export async function processRideNowPayment(
  loanAmount: number,
  userWalletAddress?: string
): Promise<RideNowPaymentResult> {
  try {
    const cdpClient = getCdpClient();
    
    // Create EVM account for the transaction (using the correct CDP SDK method)
    let account;
    try {
      account = await cdpClient.evm.createAccount();
    } catch (error) {
      console.error('Error creating EVM account:', error);
      return {
        success: false,
        error: 'Failed to create EVM account for transaction'
      };
    }

    // Convert loan amount to USDC (assuming 1:1 ratio for simplicity)
    // In production, you'd need proper conversion rates
    const usdcAmount = (loanAmount * 1000000).toString(); // USDC has 6 decimals

    // Encode the USDC transfer to ride service provider
    const transferData = encodeUSDCTransfer(RIDE_SERVICE_PROVIDER_WALLET, usdcAmount);

    // Create the transaction
    const transaction = {
      to: USDC_CONTRACT,
      data: transferData,
      value: '0x0', // No ETH value for ERC-20 transfer
      gasLimit: '0x5208', // Standard gas limit
    };

    try {
      // In a real implementation, this would execute the actual transaction
      // For demo purposes, we'll simulate a successful transaction
      const simulatedTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      console.log(`Simulated USDC transfer of ${loanAmount} to ${RIDE_SERVICE_PROVIDER_WALLET}`);
      console.log(`Transaction hash: ${simulatedTxHash}`);
      console.log(`From account: ${account.address}`);

      return {
        success: true,
        transactionHash: simulatedTxHash,
        walletAddress: account.address
      };
      
    } catch (error) {
      console.error('Error executing transaction:', error);
      return {
        success: false,
        error: 'Transaction execution failed'
      };
    }

  } catch (error) {
    console.error('Error processing Ride Now! payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function verifyRideNowPayment(transactionHash: string): Promise<boolean> {
  try {
    // In a real implementation, this would verify the transaction on the blockchain
    // For demo purposes, we'll simulate verification
    if (transactionHash && transactionHash.startsWith('0x') && transactionHash.length === 66) {
      console.log(`Verifying transaction: ${transactionHash}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
}

export function calculateRideNowLoanTerms(loanAmount: number) {
  const interestRate = 5.0; // 5% interest rate
  const repaymentPeriodDays = 30; // 30 days to repay
  const totalRepaymentAmount = loanAmount * (1 + interestRate / 100);
  
  const repaymentDueDate = new Date();
  repaymentDueDate.setDate(repaymentDueDate.getDate() + repaymentPeriodDays);
  
  return {
    loanAmount,
    interestRate,
    totalRepaymentAmount,
    repaymentDueDate,
    repaymentPeriodDays
  };
}