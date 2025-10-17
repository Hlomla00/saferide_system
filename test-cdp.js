// Test script for Coinbase CDP integration
import { createEvmAccount, getCdpClient } from "./src/lib/cdp.js";

async function testCdpIntegration() {
  try {
    console.log("Testing Coinbase CDP integration...");
    
    // Test CDP client initialization
    console.log("1. Initializing CDP client...");
    const cdp = getCdpClient();
    console.log("✓ CDP client initialized successfully");
    
    // Test EVM account creation
    console.log("2. Creating EVM account...");
    const account = await createEvmAccount();
    console.log(`✓ EVM account created successfully: ${account.address}`);
    
    console.log("\n🎉 CDP integration test completed successfully!");
    
  } catch (error) {
    console.error("❌ CDP integration test failed:", error.message);
    console.log("\n📝 Make sure to:");
    console.log("1. Set your CDP_API_KEY_NAME in .env.local");
    console.log("2. Set your CDP_PRIVATE_KEY in .env.local");
    console.log("3. Ensure you have valid Coinbase CDP credentials");
  }
}

// Run the test
testCdpIntegration();