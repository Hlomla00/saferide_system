import { CdpClient } from '@coinbase/cdp-sdk';
import dotenv from 'dotenv';
import { 
  checkPaymasterAvailability, 
  sendGasFreeUSDCTransaction,
  requestUSDCFromFaucet
} from './src/lib/cdp';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testPaymasterFunctionality() {
  try {
    console.log('🔍 Testing Paymaster Functionality for Gas-Free USDC Transactions\n');

    // Initialize CDP client
    const cdp = new CdpClient({
      apiKeyId: process.env.CDP_API_KEY_ID!,
      apiKeySecret: process.env.CDP_API_KEY_SECRET!,
      walletSecret: process.env.CDP_WALLET_SECRET!,
    });

    console.log('✅ CDP Client initialized successfully');

    // Check paymaster availability
    console.log('\n📡 Checking paymaster availability...');
    const paymasterAvailable = await checkPaymasterAvailability();
    console.log(`Paymaster available: ${paymasterAvailable ? '✅ Yes' : '❌ No'}`);

    // Create test accounts
    console.log('\n👤 Creating test EVM accounts...');
    const senderAccount = await cdp.evm.createAccount();
    const receiverAccount = await cdp.evm.createAccount();
    
    console.log(`Sender address: ${senderAccount.address}`);
    console.log(`Receiver address: ${receiverAccount.address}`);

    // Request USDC from faucet for sender
    console.log('\n💰 Requesting USDC from faucet for sender...');
    try {
      const faucetResult = await requestUSDCFromFaucet(senderAccount.address);
      console.log(`✅ USDC faucet request successful: ${faucetResult.transactionHash}`);
      
      // Wait a bit for the faucet transaction to be processed
      console.log('⏳ Waiting for faucet transaction to be processed...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
    } catch (faucetError) {
      console.log(`⚠️ Faucet request failed: ${faucetError}`);
      console.log('Continuing with gas-free transaction test...');
    }

    // Test gas-free USDC transaction
    console.log('\n🚀 Testing gas-free USDC transaction...');
    try {
      const transferAmount = '1000000'; // 1 USDC (6 decimals)
      
      const result = await sendGasFreeUSDCTransaction(
        senderAccount.address,
        receiverAccount.address,
        transferAmount
      );
      
      console.log(`✅ Gas-free USDC transaction successful!`);
      console.log(`Transaction hash: ${result.transactionHash}`);
      
    } catch (transactionError) {
      console.log(`❌ Gas-free USDC transaction failed: ${transactionError}`);
    }

    console.log('\n🎉 Paymaster functionality test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPaymasterFunctionality().catch(console.error);