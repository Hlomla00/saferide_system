
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { allRides, destinations, providers, paymentMethods } from '@/lib/data';
import { ArrowLeft, Car, User, Wallet, Building, MapPin, CreditCard } from 'lucide-react';
import { Suspense, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/Logo';
import Image from 'next/image';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const destinationValue = searchParams.get('destination');
  const rideId = searchParams.get('rideId');
  const guestName = searchParams.get('guestName');
  const paymentId = searchParams.get('payment');
  const fare = searchParams.get('fare');
  const token = searchParams.get('token');
  const driverName = searchParams.get('driverName') || 'SafeRide Driver';
  const driverPlate = searchParams.get('driverPlate') || 'CAA 000-000';
  const driverRating = searchParams.get('driverRating') || '4.8';

  const destinationLabel = useMemo(() => {
    const predefined = destinations.find((d) => d.value === destinationValue);
    return predefined?.label || destinationValue;
  }, [destinationValue]);

  const ride = allRides.find((r) => r.id === rideId);
  const provider = providers.find((p) => p.id === ride?.provider);
  const paymentMethod = paymentMethods.find((p) => p.id === paymentId);

  if (!destinationLabel || !ride || !provider || !paymentMethod || !token) {
    return (
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <CardTitle>Invalid Ride Details</CardTitle>
          <CardDescription>The ride details are missing or incorrect. Please go back and try again.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push('/booking')} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const baseFare = 35;
  const finalFare = fare ? parseFloat(fare) : baseFare * ride.priceMultiplier;
  const RideIcon = ride.icon;
  const providerIconPath = provider.icon;

  const handleConfirmRide = () => {
    const params = new URLSearchParams({
      destination: destinationValue!,
      rideId: rideId!,
      token: token!,
      payment: paymentId!,
      fare: finalFare.toFixed(2),
      driverName,
      driverPlate,
      driverRating,
    });
    if (guestName) params.append('guestName', guestName);
    const email = searchParams.get('guestEmail');
    const phone = searchParams.get('phoneNumber');
    const wallet = searchParams.get('walletAddress');
    if (email) params.append('guestEmail', email);
    if (phone) params.append('phoneNumber', phone);
    if (wallet) params.append('walletAddress', wallet);
    router.push(`/receipt?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-4">
      <Card className="shadow-2xl">
        <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-10 w-10 sm:h-12 sm:w-12 p-0 touch-manipulation"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <div className="h-8 w-auto flex justify-center items-center">
              <Logo size="default" />
            </div>
            <div className="w-10 sm:w-12" />
          </div>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl text-center">Confirm Your Ride</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Review the details below before confirming
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
          {/* Booking Token */}
          <div className="p-3 sm:p-4 border-2 border-dashed rounded-lg text-center bg-muted/30">
            <p className="text-sm sm:text-base text-muted-foreground font-semibold mb-2">Your Booking Token</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest text-primary font-mono">{token}</p>
          </div>

          {/* Ride Details */}
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-base sm:text-lg mb-3">Ride Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Destination
                </span>
                <span className="font-medium text-sm sm:text-base">{destinationLabel}</span>
              </div>

              {guestName && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Passenger
                  </span>
                  <span className="font-medium text-sm sm:text-base">{guestName}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm sm:text-base">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  Provider
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm sm:text-base">{provider.name}</span>
                  <Image src={providerIconPath} alt={provider.name} width={20} height={20} className="w-5 h-5 object-contain" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm sm:text-base">
                  <RideIcon className="h-4 w-4 text-muted-foreground" />
                  Ride Type
                </span>
                <span className="font-medium text-sm sm:text-base">{ride.name}</span>
              </div>
            </div>
          </div>

          {/* Driver Information */}
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-base sm:text-lg mb-3">Your Driver</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm sm:text-base">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Driver
                </span>
                <span className="font-medium text-sm sm:text-base">{driverName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm sm:text-base">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  Plate
                </span>
                <span className="font-medium text-sm sm:text-base font-mono">{driverPlate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base">Rating</span>
                <span className="font-medium text-sm sm:text-base">⭐ {driverRating}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-base sm:text-lg mb-3">Payment</h3>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm sm:text-base">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Method
              </span>
              <span className="font-medium text-sm sm:text-base">{paymentMethod.name}</span>
            </div>
          </div>

          <Separator />

          <div className="text-center py-3 sm:py-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-lg sm:text-xl font-semibold">Total Fare</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-primary">R{finalFare.toFixed(2)}</p>
          </div>
        </CardContent>

        <CardFooter className="px-3 sm:px-6 pb-4 sm:pb-6">
          <div className="w-full space-y-3">
            <Button
              onClick={handleConfirmRide}
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold touch-manipulation"
              size="lg"
            >
              Confirm Ride
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full h-10 sm:h-12 text-sm sm:text-base touch-manipulation"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payment
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function ConfirmationSkeleton() {
  return (
    <Card className="w-full max-w-lg shadow-2xl">
      <CardHeader className="text-center">
        <Skeleton className="h-16 w-48 mx-auto mb-4" />
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<ConfirmationSkeleton />}>
      <ConfirmationContent />
    </Suspense>
  );
}
