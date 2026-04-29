
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { allRides, destinations, providers, paymentMethods, drivers } from '@/lib/data';
import Image from 'next/image';
import { ArrowLeft, MapPin, Printer, Wallet, CheckCircle, Building, CreditCard, User, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';



function ReceiptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [localData, setLocalData] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  // Auto-redirect to booking page after 5 seconds
  useEffect(() => {
    if (isClient) {
      const timer = setTimeout(() => {
        router.push('/booking');
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [isClient, router]);

  // Prefer query params, fallback to localStorage
  const destinationValue = searchParams.get('destination') || localData?.destination;
  const rideId = searchParams.get('rideId') || localData?.rideId;
  const token = searchParams.get('token') || localData?.token;
  // Only allow card or cash
  let paymentId = searchParams.get('payment') || localData?.payment || 'card';
  // Allow all valid payment methods
  const validPaymentIds = paymentMethods.map(method => method.id);
  if (!validPaymentIds.includes(paymentId)) paymentId = 'card';
  const guestName = searchParams.get('guestName') || localData?.guestName;
  const driverName = driver?.name || 'SafeRide Driver';
  const driverPlate = driver?.plate || 'CAA 000-000';
  const driverRating = driver?.rating || 4.8;

  const destinationLabel = useMemo(() => {
    const predefined = destinations.find((d) => d.value === destinationValue);
    return predefined?.label || destinationValue;
  }, [destinationValue]);

  useEffect(() => {
    setIsClient(true);
    // Try to load from localStorage if any required param is missing
    const destinationValueCheck = searchParams.get('destination');
    const rideIdCheck = searchParams.get('rideId');
    const tokenCheck = searchParams.get('token');
    const paymentIdCheck = searchParams.get('payment');
    const driverNameCheck = searchParams.get('driverName');
    const guestNameCheck = searchParams.get('guestName');
    if (!destinationValueCheck || !rideIdCheck || !tokenCheck || !paymentIdCheck || !driverNameCheck) {
      const stored = localStorage.getItem('saferide_booking');
      if (stored) {
        setLocalData(JSON.parse(stored));
      }
    }
    // Pick a random driver only on client
    setDriver(drivers[Math.floor(Math.random() * drivers.length)]);
  }, [searchParams]);

  if (!isClient || !driver) return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );

  const ride = allRides.find((r) => r.id === rideId);
  const provider = providers.find((p) => p.id === ride?.provider);
  const paymentMethod = paymentMethods.find((p) => p.id === paymentId);

  if (!destinationLabel || !ride || !provider || !token || !paymentMethod) {
    return (
       <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <CardTitle>Invalid Receipt Details</CardTitle>
          <CardDescription>The receipt details are missing or incorrect. Please start a new ride.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push('/booking')} className="w-full">
            Start New Ride
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const baseFare = 1.2; // USDC base fare for $1-2 range
  let finalFare = localData?.finalFare || baseFare * ride.priceMultiplier;
  if (!localData?.finalFare) {
    // Randomize but never less than 1.0 USDC
    const minFare = 1.0; // Minimum USDC fare
    if (finalFare < minFare) {
      // Add a little randomization above 1.0 for realism
      finalFare = minFare + Math.random() * 1.0; 
    }
  }
  const RideIcon = ride.icon;
  const providerIconPath = provider.icon;
  const PaymentIcon = paymentMethod.icon;

  const handlePrint = () => {
    if (isClient) {
      window.print();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-4">
      <Card className="shadow-2xl print:shadow-none print:border-none">
        <CardHeader className="text-center pb-3 sm:pb-4 px-3 sm:px-6 py-3 sm:py-4">
          <div className="mx-auto mb-3 sm:mb-4 flex flex-col items-center gap-3 sm:gap-4 text-primary">
            <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16" />
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline">Ride Confirmed!</CardTitle>
            <CardDescription className="text-sm sm:text-base md:text-lg text-muted-foreground text-center">
              Thank you for riding with SafeRide.<br />
              Here is your receipt.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
          {/* Booking Token */}
          <div className="p-3 sm:p-4 border rounded-lg text-center bg-muted/50">
            <p className="text-sm sm:text-base text-muted-foreground font-semibold mb-2">Booking Token</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest text-primary font-mono">{token}</p>
          </div>

          <Separator />

          {/* Trip Details */}
          <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-base sm:text-lg mb-3">Trip Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Destination
                </span>
                <span className="text-sm sm:text-base font-medium">{destinationLabel}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  Provider
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm sm:text-base">{provider.name}</span>
                  <Image 
                    src={providerIconPath} 
                    alt={provider.name} 
                    width={20} 
                    height={20} 
                    className="w-5 h-5 sm:w-6 sm:h-6 object-contain" 
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <RideIcon className="h-4 w-4 text-muted-foreground" />
                  Ride Type
                </span>
                <span className="text-sm sm:text-base font-medium">{ride.name}</span>
              </div>

              {guestName && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Passenger
                  </span>
                  <span className="text-sm sm:text-base font-medium">{guestName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Driver Details */}
          <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-base sm:text-lg mb-3">Driver Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Driver
                </span>
                <span className="text-sm sm:text-base font-medium">
                  {driverName} ({driverRating} <span className="text-yellow-400">★</span>)
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <User className="h-4 w-4 text-muted-foreground" />
                  License Plate
                </span>
                <span className="font-mono bg-muted px-2 py-1 rounded-md text-sm sm:text-base font-medium">
                  {driverPlate}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-base sm:text-lg mb-3">Payment Details</h3>
            <div className="flex justify-between items-center">
              <span className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Paid With
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm sm:text-base">{paymentMethod.name}</span>
                <PaymentIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          </div>

          {/* Total Fare */}
          <Card className="bg-primary text-primary-foreground text-center p-4 sm:p-6">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
              Total Fare Paid
            </CardTitle>
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mt-2">
              ${finalFare.toFixed(2)}
            </p>
          </Card>
        </CardContent>

        <CardFooter className="px-3 sm:px-6 pb-4 sm:pb-6 print:hidden">
          <div className="w-full space-y-3">
            <Button 
              size="lg" 
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold touch-manipulation" 
              onClick={() => router.push('/booking')}
            >
              Book Another Ride
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-10 sm:h-12 text-sm sm:text-base touch-manipulation" 
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> 
              Print Receipt
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function ReceiptSkeleton() {
    return (
        <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="text-center">
                <Skeleton className="h-16 w-16 mx-auto mb-4 rounded-full" />
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-6 p-8">
                 <Skeleton className="h-20 w-full" />
                <div className="space-y-4 text-lg">
                    <Skeleton className="h-8 w-full" />
                    <Separator/>
                    <Skeleton className="h-8 w-full" />
                    <Separator/>
                    <Skeleton className="h-8 w-full" />
                     <Separator/>
                    <Skeleton className="h-8 w-full" />
                </div>
                 <Skeleton className="h-32 w-full" />
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </CardFooter>
        </Card>
    )
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<ReceiptSkeleton/>}>
      <ReceiptContent />
    </Suspense>
  );
}
