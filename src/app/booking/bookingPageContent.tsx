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

const baseFare = 15; // R15 base fare (Convenience fee per ride booked)

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
      <Label
        htmlFor={ride.id}
        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all h-full min-h-[140px] sm:min-h-[160px]"
      >
        <div className='flex justify-between w-full items-start'>
          {providerIconPath && (
            <Image src={providerIconPath} alt={ride.provider} width={20} height={20} className="h-5 w-auto sm:h-6 sm:w-auto object-contain" />
          )}
          <RideIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
        </div>
        <p className="text-lg sm:text-xl font-bold font-headline mt-2 text-center">{ride.name}</p>
        <p className="text-xs sm:text-sm text-muted-foreground text-center flex-grow leading-tight">{ride.description}</p>
        <p className="text-xl sm:text-2xl font-bold tracking-tighter mt-2">R{finalFare.toFixed(2)}</p>
      </Label>
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
      const baseFare = 15;
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
      <CardHeader className="pb-0 px-4 sm:px-6">
        <div className="h-8 w-auto mb-4 mx-auto flex justify-center items-center">
          <Logo size="default" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl text-center">Book Your Ride</CardTitle>
        <CardDescription className="text-center mb-6 sm:mb-8 text-sm sm:text-base">
          Select your destination and ride preference
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        <div className="space-y-1">
          <Label htmlFor="destination" className="font-bold mb-1 block text-xl sm:text-2xl">
            Where are you going?
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  'w-full justify-between text-base sm:text-lg h-11 sm:h-12',
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
            <div className="space-y-1">
              <Label className="font-bold mb-1 block text-xl sm:text-2xl">Choose your provider</Label>
              <div className="text-xs sm:text-sm text-muted-foreground mb-2">Select one or more to see options</div>
              <ToggleGroup
                type="multiple"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
                value={selectedProviders}
                onValueChange={setSelectedProviders}
              >
                {providers.map((provider) => (
                    <ToggleGroupItem
                      key={provider.id}
                      value={provider.id}
                      className={cn(
                        'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex h-20 sm:h-24 w-full items-center justify-center rounded-xl border-2 border-muted bg-popover px-3 sm:px-6 gap-2 sm:gap-4'
                      )}
                    >
                    {provider.icon && (
                      <Image src={provider.icon} alt={provider.name} width={48} height={48} className="h-12 sm:h-16 w-auto object-contain" />
                    )}
                    <span className="font-bold text-sm sm:text-lg">{provider.name}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <Separator />

            <div>
              <Label className="font-bold mb-1 block text-xl sm:text-2xl">Choose your ride</Label>
              <div className="text-xs sm:text-sm text-muted-foreground mb-2">Sorted from cheapest to most expensive</div>
              <RadioGroup
                value={selectedRide ?? ''}
                onValueChange={setSelectedRide}
                className="grid grid-cols-1 gap-3 sm:gap-4"
              >
                {displayedRides.map((ride) => (
                  <RideItem
                    key={ride.id}
                    ride={ride}
                    baseFare={baseFare}
                    onSelect={setSelectedRide}
                    isSelected={selectedRide === ride.id}
                  />
                ))}
              </RadioGroup>
            </div>

            <Separator />

            <div className="flex flex-col gap-4 pb-4">
              <Button
                className="w-full text-base sm:text-lg py-4 sm:py-6"
                disabled={!selectedRide}
                onClick={() => setIsGuestModalOpen(true)}
              >
                {`Book to ${destinationLabel || 'Destination'}`}
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* Guest Details Dialog */}
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
    </Card>
  );
}