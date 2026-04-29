'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('saferide_user', JSON.stringify(data.user));
      router.push('/booking');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <Card className="w-full max-w-md shadow-2xl relative">
        <Button variant="outline" className="absolute top-4 left-4" onClick={() => router.push('/booking')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center space-y-4 pt-16">
            <div className="mx-auto">
              <Logo size="large" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline">Welcome Back</CardTitle>
            <CardDescription className="text-lg">Enter your credentials to book a ride.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-md">Phone Number or Email</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="+27 12 345 6789 or you@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="py-6 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-md">4-Digit PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
                maxLength={4}
                className="py-6 text-lg"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 p-8 pt-0">
            <Button
              type="submit"
              disabled={isLoading || !identifier.trim() || pin.length !== 4}
              className="w-full py-7 text-xl font-bold transition-transform hover:scale-105"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Button variant="link" size="sm" className="w-full" onClick={() => router.push('/signup')}>
              Don&apos;t have an account? Sign Up
            </Button>
            <Button variant="link" className="w-full mt-2" onClick={() => router.push('/booking')}>
              Continue as Guest
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
