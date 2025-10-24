'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Phone, Lock } from 'lucide-react';

interface WalletAccessProps {
  onWalletAccess: (userProfile: any) => void;
  onCancel?: () => void;
}

export function WalletAccess({ onWalletAccess, onCancel }: WalletAccessProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccessWallet = async () => {
    if (!phoneNumber.trim() || pin.length !== 4) {
      setError('Please enter a valid phone number and 4-digit PIN');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/user/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          pin: pin,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onWalletAccess(result.user);
      } else {
        const errorResult = await response.json();
        setError(errorResult.error || 'Failed to access wallet');
      }
    } catch (error) {
      console.error('Error accessing wallet:', error);
      setError('An error occurred while accessing your wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
          <Wallet className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-xl font-bold">Access Your Wallet</CardTitle>
        <CardDescription>
          Enter your phone number and PIN to access your existing wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pin" className="text-sm font-medium">
            Wallet PIN
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="pin"
              type="password"
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="pl-10"
              maxLength={4}
              pattern="[0-9]{4}"
            />
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleAccessWallet}
            disabled={!phoneNumber.trim() || pin.length !== 4 || isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Accessing...' : 'Access Wallet'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}