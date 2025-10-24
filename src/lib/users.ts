// In-memory user storage (in production, use a proper database)
export const users: Array<{
  id: string;
  phoneNumber: string;
  email?: string;
  name: string;
  pin: string;
  walletAddress: string;
  createdAt: Date;
}> = [];