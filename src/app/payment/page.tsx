
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { allRides, destinations, providers, paymentMethods } from '@/lib/data';
import { ArrowLeft, Wallet, CreditCard, Banknote, Phone } from 'lucide-react';
import { Suspense, useMemo, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/Logo';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const destinationValue = searchParams.get('destination');
  const rideId = searchParams.get('rideId');
  const guestName = searchParams.get('guestName');
  const guestEmail = searchParams.get('guestEmail');
  const guestPhone = searchParams.get('guestPhone');

  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>(guestPhone || '');
  const [emailAddress, setEmailAddress] = useState<string>(guestEmail || '');
  const [walletPin, setWalletPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  // Only allow all payment methods including phone
  const allowedPaymentMethods = paymentMethods;

  // Icon mapping for payment methods
  const paymentIcons: Record<string, React.ElementType> = {
    card: CreditCard,
    cash: Banknote,
    phone: Phone,
  };

  const ride = useMemo(() => allRides.find((r) => r.id === rideId), [rideId]);
  const destination = useMemo(() => destinations.find((d) => d.value === destinationValue), [destinationValue]);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (!destination || !ride || isLoading) {
    return <PaymentSkeleton />;
  }

  const baseFare = 15;
  const finalFare = baseFare * ride.priceMultiplier;

  // Provider and icons
  const provider = providers.find((p) => p.id === ride.provider);
  const providerIconPath = provider?.icon;
  const RideIcon = ride.icon;

  const handleProceedToReceipt = async () => {
    try {
      setIsCreatingProfile(true);
      
      // Use the current email address (either from form or updated by user)
      const currentEmail = emailAddress.trim() || guestEmail;
      const currentPhone = phoneNumber.trim() || guestPhone;
      
      let currentUserProfile = userProfile;
      
      // Create user profile and wallet if we have guest details and PIN for phone payment
      if (currentEmail && guestName && paymentMethod === 'phone' && walletPin) {
        const response = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: currentEmail,
            name: guestName,
            pin: walletPin,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          currentUserProfile = result.user;
          setUserProfile(result.user);
          console.log('User profile created:', result.user);
        } else {
          // If user already exists, try to fetch existing profile
          const existingUserResponse = await fetch(`/api/user?email=${encodeURIComponent(currentEmail)}`);
          if (existingUserResponse.ok) {
            const existingResult = await existingUserResponse.json();
            currentUserProfile = existingResult.user;
            setUserProfile(existingResult.user);
            console.log('Using existing user profile:', existingResult.user);
          }
        }
      }

      // If phone payment is selected and we have a user profile, process USDC payment
      if (paymentMethod === 'phone' && currentUserProfile?.walletAddress) {
        const paymentResponse = await fetch('/api/payment/usdc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userWalletAddress: currentUserProfile.walletAddress,
            amount: finalFare.toFixed(2),
            userEmail: currentEmail,
            bookingId: `booking_${Date.now()}`,
          }),
        });

        if (paymentResponse.ok) {
          const paymentResult = await paymentResponse.json();
          console.log('USDC payment successful:', paymentResult);
        } else {
          const errorResult = await paymentResponse.json();
          console.error('USDC payment failed:', errorResult);
          alert(`Payment failed: ${errorResult.error}`);
          return;
        }
      }

      // Proceed to receipt page
      const params = new URLSearchParams({
        destination: destinationValue!,
        rideId: rideId!,
        payment: paymentMethod!,
        fare: finalFare.toFixed(2),
      });
      
      if (guestName) {
        params.append('guestName', guestName);
      }
      if (currentEmail) {
        params.append('guestEmail', currentEmail);
      }
      if (currentPhone) {
        params.append('phoneNumber', currentPhone);
      }
      if (currentUserProfile?.walletAddress) {
        params.append('walletAddress', currentUserProfile.walletAddress);
      }
      
      router.push(`/receipt?${params.toString()}`);
    } catch (error) {
      console.error('Error processing booking:', error);
      alert('An error occurred while processing your booking. Please try again.');
    } finally {
      setIsCreatingProfile(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-2xl">
      <CardHeader className="text-center px-4 sm:px-6">
        <div className="mx-auto mb-4">
          <Logo />
        </div>
        <CardTitle className="text-2xl sm:text-4xl font-bold font-headline">Confirm Payment</CardTitle>
        <CardDescription className="text-base sm:text-lg">Please select your payment method.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-8">
        {/* Ride details */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between py-2 sm:py-3">
            <span className="text-sm sm:text-base font-medium text-muted-foreground">Destination</span>
            <span className="text-right truncate ml-2">{destination.label}</span>
          </div>
          
          {guestName && (
            <div className="flex items-center justify-between py-2 sm:py-3">
              <span className="text-sm sm:text-base font-medium text-muted-foreground">Passenger</span>
              <span className="text-right truncate ml-2">{guestName}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between py-2 sm:py-3">
            <span className="text-sm sm:text-base font-medium text-muted-foreground">Provider</span>
            <div className="flex items-center gap-2">
              <span className="truncate">{provider?.name}</span>
              {providerIconPath && (
                <img
                  src={providerIconPath}
                  alt={provider?.name}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                />
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 sm:py-3">
            <span className="text-sm sm:text-base font-medium text-muted-foreground">Ride</span>
            <div className="flex items-center gap-2">
              <span className="truncate">{ride.name}</span>
              <RideIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        <Separator />

        {/* Payment method selection */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold">Payment Method</h3>
          <RadioGroup value={paymentMethod ?? ''} onValueChange={setPaymentMethod} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {allowedPaymentMethods.map((method) => {
              const Icon = paymentIcons[method.id];
              return (
                <div key={method.id}>
                  <RadioGroupItem value={method.id} id={method.id} className="peer sr-only" />
                  <Label
                    htmlFor={method.id}
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                  >
                    <Icon className="mb-2 h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base font-medium mt-1 sm:mt-2">{method.name}</span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {paymentMethod === 'phone' && (
          <>
            <Separator />
            
            {/* Wallet Address Display */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Wallet Information</h3>
              
              {userProfile?.walletAddress && (
                <div className="p-3 sm:p-4 bg-muted rounded-lg">
                  <p className="text-sm sm:text-base font-medium mb-2">Your Wallet Address:</p>
                  <p className="text-xs sm:text-sm font-mono break-all">{userProfile.walletAddress}</p>
                </div>
              )}
              
              {/* Contact Information */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm sm:text-base font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="mt-1 sm:mt-2 h-10 sm:h-12"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {guestEmail ? `From booking: ${guestEmail}` : 'Optional - for email notifications'}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-sm sm:text-base font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-1 sm:mt-2 h-10 sm:h-12"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {guestPhone ? `From booking: ${guestPhone}` : 'Optional - for SMS notifications'}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="pin" className="text-sm sm:text-base font-medium">
                    Wallet PIN (4 digits)
                  </Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="Enter 4-digit PIN"
                    value={walletPin}
                    onChange={(e) => setWalletPin(e.target.value)}
                    className="mt-1 sm:mt-2 h-10 sm:h-12"
                    maxLength={4}
                    pattern="[0-9]{4}"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Required for crypto wallet creation and payments
                  </p>
                </div>
              </div>
            </div>
            
            {paymentMethod === 'phone' && (
              <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-800">
                  💡 Your crypto wallet will be created automatically. You'll pay with USDC on Base network.
                </p>
              </div>
            )}
          </>
        )}

        <Separator />

        {/* Price display */}
        <div className="text-center py-3 sm:py-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-base sm:text-lg font-medium">Total Fare</span>
          </div>
          <p className="text-3xl sm:text-5xl font-bold tracking-tighter mt-2">R{finalFare.toFixed(2)}</p>
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="w-full sm:w-auto order-2 sm:order-1 h-10 sm:h-12"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          className="w-full sm:flex-1 order-1 sm:order-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 sm:py-7 text-base sm:text-lg h-12 sm:h-16 transition-transform hover:scale-105"
          disabled={!paymentMethod || (paymentMethod === 'phone' && ((!emailAddress.trim() && !phoneNumber.trim()) || !walletPin.trim() || walletPin.length !== 4)) || isCreatingProfile}
          onClick={handleProceedToReceipt}
        >
          {isCreatingProfile ? 'Creating Profile & Wallet...' : 'Confirm & Book'}
        </Button>
      </CardFooter>
    </Card>
  );
}

function PaymentSkeleton() {
    return (
        <Card className="w-full max-w-lg mx-auto shadow-2xl">
            <CardHeader className="text-center px-4 sm:px-6">
                <Skeleton className="h-12 sm:h-16 w-32 sm:w-48 mx-auto mb-4" />
                <Skeleton className="h-8 sm:h-10 w-3/4 mx-auto" />
                <Skeleton className="h-6 sm:h-8 w-1/2 mx-auto mt-2" />
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-8">
                <div className="space-y-3 sm:space-y-4">
                    <Skeleton className="h-6 sm:h-8 w-full" />
                    <Skeleton className="h-6 sm:h-8 w-full" />
                    <Skeleton className="h-6 sm:h-8 w-full" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Skeleton className="h-20 sm:h-24 w-full" />
                    <Skeleton className="h-20 sm:h-24 w-full" />
                    <Skeleton className="h-20 sm:h-24 w-full" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentSkeleton />}>
      <PaymentContent />
    </Suspense>
  );
}