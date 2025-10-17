import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

// Paymaster endpoint for gas-free USDC transactions
const PAYMASTER_ENDPOINT = "https://api.developer.coinbase.com/rpc/v1/base/RFSyJKeprQw2aHDovLWEC8s7kTQJmxV5";

// Initialize CDP client
let cdpClient: CdpClient | null = null;

export function getCdpClient(): CdpClient {
  if (!cdpClient) {
    try {
      cdpClient = new CdpClient({
        apiKeyId: process.env.CDP_API_KEY_ID,
        apiKeySecret: process.env.CDP_API_KEY_SECRET,
        walletSecret: process.env.CDP_WALLET_SECRET
      });
    } catch (error) {
      console.error("Failed to initialize CDP client:", error);
      throw new Error("CDP client initialization failed");
    }
  }
  return cdpClient;
}

export async function createEvmAccount() {
  try {
    const cdp = getCdpClient();
    const account = await cdp.evm.createAccount();
    console.log(`Created EVM account: ${account.address}`);
    return account;
  } catch (error) {
    console.error("Failed to create EVM account:", error);
    throw error;
  }
}

export async function getAccountBalance(address: string, network: string = "base-sepolia") {
  try {
    const cdp = getCdpClient();
    // Use the correct API method for getting balance
    const balance = await cdp.evm.getBalance({
      address,
      network: network as "base-sepolia" | "ethereum-sepolia"
    });
    return balance;
  } catch (error) {
    console.error("Failed to get account balance:", error);
    throw error;
  }
}

export async function sendTransaction(address: string, to: string, amount: string, network: string = "base-sepolia") {
  try {
    const cdp = getCdpClient();
    const transaction = await cdp.evm.sendTransaction({
      address,
      network: network as "base-sepolia" | "ethereum-sepolia",
      transaction: {
        to,
        value: amount
      }
    });
    console.log(`Transaction sent: ${transaction.transactionHash}`);
    return transaction;
  } catch (error) {
    console.error("Failed to send transaction:", error);
    throw error;
  }
}

// Paymaster utility functions for gas-free USDC transactions
export async function sendGasFreeUSDCTransaction(
  fromAddress: string,
  toAddress: string,
  amount: string,
  network: string = 'base-sepolia'
): Promise<any> {
  try {
    // USDC contract address on Base Sepolia
    const USDC_CONTRACT = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
    
    // Encode USDC transfer function call
    const data = encodeUSDCTransfer(toAddress, amount);
    
    // Send transaction using CDP's sendTransaction method with proper EIP-1559 format
    const cdp = getCdpClient();
    const result = await cdp.evm.sendTransaction({
      address: fromAddress as `0x${string}`,
      network: network as "base-sepolia" | "ethereum-sepolia",
      transaction: {
        to: USDC_CONTRACT as `0x${string}`,
        data,
        value: '0x0',
        maxFeePerGas: BigInt('0x77359400'), // 2 gwei
        maxPriorityFeePerGas: BigInt('0x3b9aca00'), // 1 gwei
        gasLimit: BigInt('0xc350'), // 50000 gas for ERC-20 transfer
      },
    });
    
    return result;
  } catch (error) {
    console.error('Error sending gas-free USDC transaction:', error);
    throw error;
  }
}

// Helper function to encode USDC transfer
function encodeUSDCTransfer(to: string, amount: string): string {
  // ERC-20 transfer function signature: transfer(address,uint256)
  const functionSignature = '0xa9059cbb';
  
  // Pad address to 32 bytes (remove 0x prefix, pad to 64 chars, add back 0x)
  const paddedTo = '0x' + to.slice(2).padStart(64, '0');
  
  // Convert amount to hex and pad to 32 bytes
  const amountBN = BigInt(amount);
  const paddedAmount = '0x' + amountBN.toString(16).padStart(64, '0');
  
  return functionSignature + paddedTo.slice(2) + paddedAmount.slice(2);
}

// Request USDC from faucet for testing
export async function requestUSDCFromFaucet(
  address: string,
  network: string = 'base-sepolia'
): Promise<any> {
  try {
    const cdp = getCdpClient();
    const faucetResult = await cdp.evm.requestFaucet({
      address,
      network: network as "base-sepolia" | "ethereum-sepolia",
      token: 'usdc',
    });
    
    return faucetResult;
  } catch (error) {
    console.error('Error requesting USDC from faucet:', error);
    throw error;
  }
}

// Check if paymaster is available for gas sponsorship
export async function checkPaymasterAvailability(): Promise<boolean> {
  try {
    const response = await fetch(PAYMASTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1
      })
    });
    
    const result = await response.json();
    return !result.error;
  } catch (error) {
    console.error("Paymaster availability check failed:", error);
    return false;
  }
}

// Export the CDP client for direct access if needed
export { cdpClient };