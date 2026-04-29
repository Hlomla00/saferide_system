'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone.trim() && !email.trim()) {
      setError('Please provide a phone number or email address.');
      return;
    }
    if (pin !== pinConfirm) {
      setError('PINs do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phoneNumber: phone.trim() || undefined,
          email: email.trim() || undefined,
          pin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Sign up failed');
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
      <Card className="w-full max-w-md shadow-2xl">
        <form onSubmit={handleSignup}>
          <CardHeader className="text-center space-y-4 pt-8">
            <div className="mx-auto">
              <Logo size="large" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline">Create Account</CardTitle>
            <CardDescription className="text-lg">Join SafeRide to book your rides easily.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-8">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-md">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="py-6 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-md">Phone Number <span className="text-muted-foreground text-sm">(required if no email)</span></Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+27 12 345 6789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="py-6 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-md">Email <span className="text-muted-foreground text-sm">(required if no phone)</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="py-6 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-md">Choose a 4-Digit PIN</Label>
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
            <div className="space-y-2">
              <Label htmlFor="pinConfirm" className="text-md">Confirm PIN</Label>
              <Input
                id="pinConfirm"
                type="password"
                placeholder="••••"
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
                maxLength={4}
                className="py-6 text-lg"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 p-8 pt-0">
            <Button
              type="submit"
              disabled={isLoading || !name.trim() || pin.length !== 4 || pinConfirm.length !== 4}
              className="w-full py-7 text-xl font-bold transition-transform hover:scale-105"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
            <Button variant="link" size="sm" className="w-full" onClick={() => router.push('/login')}>
              Already have an account? Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
