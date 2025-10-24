import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

// Initialize the CDP client
const cdp = new CdpClient({
  apiKeyId: process.env.CDP_API_KEY_ID!,
  apiKeySecret: process.env.CDP_API_KEY_SECRET!,
  walletSecret: process.env.CDP_WALLET_SECRET
});

// Create EVM account
async function createEvmAccount() {
  try {
    console.log("Creating EVM account...");
    const account = await cdp.evm.createAccount();
    console.log(`Created EVM account: ${account.address}`);
    return account;
  } catch (error) {
    console.error("Error creating EVM account:", error);
    throw error;
  }
}

// Execute the account creation
createEvmAccount().catch(console.error);

export { cdp, createEvmAccount };