'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ChevronsUpDown, MapPin, User, Phone, Mail } from 'lucide-react';

import { destinations, providers, allRides } from '@/lib/data';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

const baseFare = 1.2; // USDC base fare for $1-2 range

function DestinationList({
  onSelect,
  currentValue,
}: {
  onSelect: (value: string) => void;
  currentValue: string;
}) {
  return (
    <Command>
      <CommandInput placeholder="Type or select a destination..." className="h-12 text-lg" />
      <CommandEmpty>No destination found.</CommandEmpty>
      <CommandList>
        <CommandGroup>
          {destinations.map((d) => (
            <CommandItem
              key={d.value}
              value={d.value}
              onSelect={() => onSelect(d.value)}
              className="py-3 text-lg"
            >
              <Check className={cn('mr-2 h-5 w-5', currentValue === d.value ? 'opacity-100' : 'opacity-0')} />
              {d.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

const MemoizedDestinationList = React.memo(DestinationList);

interface RideItemProps {
  ride: typeof allRides[0];
  baseFare: number;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

const RideItem = React.memo(({ ride, baseFare, onSelect, isSelected }: RideItemProps) => {
  const RideIcon = ride.icon;
  const providerIconPath = providers.find(p => p.id === ride.provider)?.icon;
  const finalFare = baseFare * ride.priceMultiplier;

  return (
    <div>
      <RadioGroupItem value={ride.id} id={ride.id} className="peer sr-only" />
      <div
        onClick={() => onSelect(ride.id)}
        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 sm:p-5 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all h-full min-h-[160px] sm:min-h-[180px] touch-manipulation active:scale-95"
      >
        <div className='flex justify-between w-full items-start mb-3'>
          {providerIconPath && (
            <Image 
              src={providerIconPath} 
              alt={ride.provider} 
              width={24} 
              height={24} 
              className="h-6 w-6 sm:h-7 sm:w-7 object-contain" 
            />
          )}
          <RideIcon className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
          <p className="text-lg sm:text-xl font-bold font-headline">{ride.name}</p>
          <p className="text-sm sm:text-base text-muted-foreground leading-tight px-1">{ride.description}</p>
        </div>
        <div className="mt-3 pt-2 border-t border-muted w-full text-center">
          <p className="text-xl sm:text-2xl font-bold tracking-tighter text-primary">${finalFare.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
});

export default function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [destination, setDestination] = React.useState('');
  const [selectedProviders, setSelectedProviders] = React.useState<string[]>([]);
  const [selectedRide, setSelectedRide] = React.useState<string | null>(null);

  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  // State for guest details
  const [isGuestModalOpen, setIsGuestModalOpen] = React.useState(false);
  const [guestName, setGuestName] = React.useState(searchParams.get('guestName') || '');
  const [guestEmail, setGuestEmail] = React.useState(searchParams.get('guestEmail') || '');
  const [guestPhone, setGuestPhone] = React.useState(searchParams.get('guestPhone') || '');

  const handleBooking = () => {
    if (destination && selectedRide) {
      // Generate random 5-digit token
      const token = Math.floor(10000 + Math.random() * 90000).toString();
      // Get ride and fare
      const ride = allRides.find(r => r.id === selectedRide);
      const finalFare = ride ? baseFare * ride.priceMultiplier : 0;
      // Store booking details in localStorage
      const bookingDetails = {
        destination,
        rideId: selectedRide,
        guestName,
        guestEmail,
        guestPhone,
        token,
        finalFare,
      };
      localStorage.setItem('saferide_booking', JSON.stringify(bookingDetails));
      const guestQuery = `&guestName=${encodeURIComponent(guestName)}&guestEmail=${encodeURIComponent(guestEmail)}&guestPhone=${encodeURIComponent(guestPhone)}&token=${token}`;
      router.push(`/payment?destination=${destination}&rideId=${selectedRide}${guestQuery}`);
    }
  };

  const handleGuestDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(guestName.trim() && (guestPhone.trim() || guestEmail.trim())) {
        setIsGuestModalOpen(false);
        handleBooking();
    }
  };

  const displayedRides = React.useMemo(() => {
    const rides = selectedProviders.length > 0
      ? allRides.filter(ride => selectedProviders.includes(ride.provider))
      : allRides;
    
    return rides.sort((a, b) => a.priceMultiplier - b.priceMultiplier);
  }, [selectedProviders]);

  const selectedRideData = allRides.find(r => r.id === selectedRide);
  const destinationLabel = destinations.find((d) => d.value === destination)?.label;

  const handleDestinationSelect = (currentValue: string) => {
    setDestination(currentValue === destination ? '' : currentValue);
    setOpen(false);
    setSelectedRide(null);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl relative">
      <CardHeader className="pb-0 px-3 sm:px-6 py-3 sm:py-4">
        <div className="h-8 w-auto mb-3 sm:mb-4 mx-auto flex justify-center items-center">
          <Logo size="default" />
        </div>
        <CardTitle className="text-xl sm:text-2xl md:text-3xl text-center">Book Your Ride</CardTitle>
        <CardDescription className="text-center mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base">
          Select your destination and ride preference
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 md:space-y-6 px-3 sm:px-6">
        <div className="space-y-1">
          <Label htmlFor="destination" className="font-bold mb-1 block text-lg sm:text-xl md:text-2xl">
            Where are you going?
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  'w-full justify-between text-sm sm:text-base md:text-lg h-12 sm:h-12 md:h-14 touch-manipulation',
                  !destination && 'text-muted-foreground'
                )}
                id="destination"
              >
                {destination ? (
                  <>
                    <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="truncate">{destinations.find((d) => d.value === destination)?.label}</span>
                  </>
                ) : (
                  'Select a destination'
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <MemoizedDestinationList
                onSelect={handleDestinationSelect}
                currentValue={destination}
              />
            </PopoverContent>
          </Popover>
        </div>

        {destination && (
          <>
            <Separator />
            <div className="space-y-2 sm:space-y-3">
              <Label className="font-bold text-lg sm:text-xl md:text-2xl">Filter by Provider (Optional)</Label>
              <ToggleGroup
                type="multiple"
                value={selectedProviders}
                onValueChange={setSelectedProviders}
                className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3"
              >
                {providers.map((provider) => (
                  <ToggleGroupItem
                    key={provider.id}
                    value={provider.id}
                    className="flex flex-col items-center p-3 sm:p-4 h-16 sm:h-20 touch-manipulation"
                    aria-label={`Filter by ${provider.name}`}
                  >
                    <Image
                      src={provider.icon}
                      alt={provider.name}
                      width={24}
                      height={24}
                      className="h-6 w-6 sm:h-8 sm:w-8 object-contain mb-1"
                    />
                    <span className="text-xs sm:text-sm font-medium">{provider.name}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <Separator />

            <div className="space-y-2 sm:space-y-3">
              <Label className="font-bold text-lg sm:text-xl md:text-2xl">Choose Your Ride</Label>
              <RadioGroup value={selectedRide || ''} onValueChange={setSelectedRide}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {displayedRides.map((ride) => (
                    <RideItem
                      key={ride.id}
                      ride={ride}
                      baseFare={baseFare}
                      onSelect={setSelectedRide}
                      isSelected={selectedRide === ride.id}
                    />
                  ))}
                </div>
              </RadioGroup>
            </div>

            {selectedRide && (
              <>
                <Separator />
                <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-bold text-base sm:text-lg mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm sm:text-base">
                    <p><strong>Destination:</strong> {destinationLabel}</p>
                    <p><strong>Ride:</strong> {selectedRideData?.name}</p>
                    <p><strong>Estimated Fare:</strong> ${(baseFare * (selectedRideData?.priceMultiplier || 1)).toFixed(2)}</p>
                  </div>
                </div>

                <Button
                  onClick={() => setIsGuestModalOpen(true)}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold touch-manipulation"
                  size="lg"
                >
                  Continue to Payment
                </Button>
              </>
            )}
          </>
        )}
      </CardContent>

      {/* Guest Details Modal/Drawer */}
      {isMobile ? (
        <Drawer open={isGuestModalOpen} onOpenChange={setIsGuestModalOpen}>
          <DrawerContent className="px-4 pb-6">
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-4 text-center">
                <h2 className="text-lg font-bold">Guest Details</h2>
                <p className="text-sm text-muted-foreground">Please provide your contact information</p>
              </div>
              <form onSubmit={handleGuestDetailsSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="guest-name" className="text-sm font-medium">Full Name *</Label>
                  <Input
                    id="guest-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="guest-phone" className="text-sm font-medium">Phone Number</Label>
                  <Input
                    id="guest-phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="guest-email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  * Name is required. Please provide either phone number or email address.
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsGuestModalOpen(false)}
                    className="flex-1 h-12 touch-manipulation"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!guestName.trim() || (!guestPhone.trim() && !guestEmail.trim())}
                    className="flex-1 h-12 touch-manipulation"
                  >
                    Continue
                  </Button>
                </div>
              </form>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isGuestModalOpen} onOpenChange={setIsGuestModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Guest Details</DialogTitle>
              <DialogDescription>
                Please provide your name and at least one contact method (phone number or email) to continue.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleGuestDetailsSubmit} className="space-y-4">
              <div>
                <Label htmlFor="guestName">Name</Label>
                <Input
                  id="guestName"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="guestPhone">Phone Number (Optional)</Label>
                <Input
                  id="guestPhone"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="e.g., +27 12 345 6789"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Provide either phone number or email for notifications
                </p>
              </div>
              <div>
                <Label htmlFor="guestEmail">Email (Optional)</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Provide either phone number or email for notifications
                </p>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="w-full text-lg py-6" 
                  disabled={!guestName.trim() || (!guestPhone.trim() && !guestEmail.trim())}
                >
                  Confirm Booking
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}