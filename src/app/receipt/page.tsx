
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { allRides, destinations, providers, paymentMethods } from '@/lib/data';
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
  if (paymentId !== 'card' && paymentId !== 'cash') paymentId = 'card';
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
    const { drivers } = require('@/lib/data');
    setDriver(drivers[Math.floor(Math.random() * drivers.length)]);
  }, [searchParams]);

  if (!isClient || !driver) return null; // or a loading skeleton

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

  const baseFare = 15;
  let finalFare = localData?.finalFare || baseFare * ride.priceMultiplier;
  if (!localData?.finalFare) {
    // Randomize but never less than 26
    const minFare = 26;
    if (finalFare < minFare) {
      // Add a little randomization above 26 for realism
      finalFare = minFare + Math.floor(Math.random() * 10); 
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
    <Card className="w-full max-w-lg shadow-2xl print:shadow-none print:border-none">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex flex-col items-center gap-4 text-primary">
            <CheckCircle className="h-16 w-16" />
            <CardTitle className="text-4xl font-bold font-headline">Ride Confirmed!</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Thank you for riding with SafeRide.<br />
              Here is your receipt.
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <div className="p-4 border rounded-lg text-center bg-muted">
          <p className="text-muted-foreground font-semibold">Booking Token</p>
          <p className="text-4xl font-bold tracking-widest text-primary font-mono">{token}</p>
        </div>
        <Separator />
          <div className="flex justify-between items-center">
            <span className="font-semibold flex items-center gap-2"><MapPin className="text-muted-foreground"/> Destination</span>
            <span>{destinationLabel}</span>
          </div>
          <Separator />
        <div className="space-y-4 text-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold flex items-center gap-2"><Building className="text-muted-foreground"/> Provider</span>
            <span className="flex items-center gap-2 font-semibold">
              {provider.name}
              <Image src={providerIconPath} alt={provider.name} width={24} height={24} className="h-6 w-auto object-contain inline-block align-middle" />
            </span>
          </div>
          
          <Separator />
          <div className="flex justify-between items-center">
            <span className="font-semibold flex items-center gap-2"><RideIcon className="text-muted-foreground"/> Ride Type</span>
            <span>{ride.name}</span>
          </div>
           <Separator />
      <div className="flex justify-between items-center">
        <span className="font-semibold flex items-center gap-2"><User className="text-muted-foreground"/> Driver</span>
        <span>{driverName} ({driverRating} <span className="text-yellow-400">★</span>)</span>
      </div>
      <Separator />
      <div className="flex justify-between items-center">
        <span className="font-semibold flex items-center gap-2"><User className="text-muted-foreground"/> Registration Plate</span>
        <span className="font-mono bg-muted px-2 py-1 rounded-md">{driverPlate}</span>
      </div>
           <Separator />
            {guestName && (
            <>
              <div className="flex justify-between items-center">
                <span className="font-semibold flex items-center gap-2"><Users className="text-muted-foreground"/> Rider</span>
                <span>{guestName}</span>
              </div>
              <Separator />
            </>
           )}
           <div className="flex justify-between items-center">
            <span className="font-semibold flex items-center gap-2"><CreditCard className="text-muted-foreground"/> Paid With</span>
             <span className="flex items-center gap-2 font-semibold">{paymentMethod.name} <PaymentIcon className="h-6 w-auto"/></span>
          </div>
        </div>
        <Card className="bg-primary text-primary-foreground text-center p-6">
          <CardTitle className="flex items-center justify-center gap-2 text-xl"><Wallet/> Total Fare Paid</CardTitle>
          <p className="text-5xl font-bold tracking-tighter mt-2">R{finalFare.toFixed(2)}</p>
        </Card>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-4 print:hidden">
        <Button variant="outline" size="lg" className="py-7 text-lg" onClick={handlePrint}>
          <Printer className="mr-2 h-5 w-5" /> Print Receipt
        </Button>
        <Button 
          size="lg" 
          className="py-7 text-lg" 
          onClick={() => router.push('/booking')}
        >
          New Ride
        </Button>
      </CardFooter>
    </Card>
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
