
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { allRides, destinations, providers, paymentMethods, drivers } from '@/lib/data';
import { ArrowLeft, Wallet, CreditCard, Banknote, Phone, Zap, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Suspense, useMemo, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/Logo';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const destinationValue = searchParams.get('destination');
  const rideId = searchParams.get('rideId');
  const guestName = searchParams.get('guestName');
  const guestEmail = searchParams.get('guestEmail');
  const guestPhone = searchParams.get('guestPhone');
  const bookingToken = searchParams.get('token') || Math.floor(10000 + Math.random() * 90000).toString();

  // Pick a driver once per payment session
  const assignedDriver = useMemo(
    () => drivers[Math.floor(Math.random() * drivers.length)],
    []
  );

  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>(guestPhone || '');
  const [emailAddress, setEmailAddress] = useState<string>(guestEmail || '');
  const [walletPin, setWalletPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  
  // ID number and consent state for phone payment
  const [phoneIdNumber, setPhoneIdNumber] = useState<string>('');
  const [showPhoneConsentDialog, setShowPhoneConsentDialog] = useState(false);
  const [phoneConsentGiven, setPhoneConsentGiven] = useState(false);
  
  // ID number and consent state for RIDE NOW! payment
  const [rideNowIdNumber, setRideNowIdNumber] = useState<string>('');
  const [showRideNowConsentDialog, setShowRideNowConsentDialog] = useState(false);
  const [rideNowConsentGiven, setRideNowConsentGiven] = useState(false);
  
  // Card payment state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // RIDE NOW! specific state
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [showGoNowModal, setShowGoNowModal] = useState(false);
  const [goNowWalletAddress, setGoNowWalletAddress] = useState<string>('');
  const [goNowWalletBalance, setGoNowWalletBalance] = useState<number>(0);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [isProcessingLoan, setIsProcessingLoan] = useState(false);
  const [walletOption, setWalletOption] = useState<'input' | 'generate'>('input');
  const [userWalletAddress, setUserWalletAddress] = useState<string>('');
  const [rideNowPhoneNumber, setRideNowPhoneNumber] = useState<string>('');
  const [rideNowPin, setRideNowPin] = useState<string>('');
  const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);

  // Only allow all payment methods including phone
  const allowedPaymentMethods = paymentMethods;

  // South African banks for RIDE NOW! feature
  const southAfricanBanks = [
    { id: 'capitec', name: 'Capitec' },
    { id: 'nedbank', name: 'Nedbank' },
    { id: 'absa', name: 'Absa' },
    { id: 'fnb', name: 'FNB' },
    { id: 'tymebank', name: 'TymeBank' },
    { id: 'discovery', name: 'Discovery Bank' },
  ];

  // Icon mapping for payment methods
  const paymentIcons: Record<string, React.ElementType> = {
    card: CreditCard,
    cash: Banknote,
    phone: Phone,
    gonow: Zap,
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

  // Function to create wallet immediately when phone and PIN are entered
  const createWalletImmediately = async (phone: string, pin: string) => {
    if (!phone.trim() || pin.length !== 4 || isCreatingWallet) return;
    
    try {
      setIsCreatingWallet(true);
      
      // Check if user already exists
      const existingUserResponse = await fetch(`/api/user?phoneNumber=${encodeURIComponent(phone)}`);
      if (existingUserResponse.ok) {
        const existingResult = await existingUserResponse.json();
        setUserProfile(existingResult.user);
        console.log('Found existing wallet for phone:', phone);
        return;
      }

      // Create new user profile and wallet
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phone,
          email: emailAddress.trim() || undefined,
          name: guestName || 'Guest User',
          pin: pin,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setUserProfile(result.user);
        console.log('Wallet created immediately for phone:', phone, result.user);
      } else {
        console.error('Failed to create wallet:', await response.text());
      }
    } catch (error) {
      console.error('Error creating wallet immediately:', error);
    } finally {
      setIsCreatingWallet(false);
    }
  };

  // Effect to trigger immediate wallet creation when phone and PIN are complete
  useEffect(() => {
    if (paymentMethod === 'phone' && phoneNumber.trim() && walletPin.length === 4) {
      const timeoutId = setTimeout(() => {
        createWalletImmediately(phoneNumber.trim(), walletPin);
      }, 500); // Small delay to avoid too many API calls while typing
      
      return () => clearTimeout(timeoutId);
    }
  }, [phoneNumber, walletPin, paymentMethod]);

  // RIDE NOW! helper functions
  const generateTempWalletAddress = () => {
    // Generate a realistic-looking crypto wallet address
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  };

  // ID number validation function
  const validateIdNumber = (idNumber: string): boolean => {
    // South African ID number validation (13 digits)
    const cleanId = idNumber.replace(/\s/g, '');
    return /^\d{13}$/.test(cleanId);
  };

  // Handle phone payment ID confirmation
  const handlePhoneIdConfirm = () => {
    if (!validateIdNumber(phoneIdNumber)) {
      alert('Please enter a valid 13-digit ID number.');
      return;
    }
    setShowPhoneConsentDialog(true);
  };

  // Generate new wallet address
  const generateWalletAddress = async () => {
    setIsGeneratingWallet(true);
    try {
      // Simulate wallet generation - in production, this would call your wallet service
      const newWalletAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      setGoNowWalletAddress(newWalletAddress);
      setUserWalletAddress(newWalletAddress);
    } catch (error) {
      console.error('Error generating wallet:', error);
      alert('Failed to generate wallet address. Please try again.');
    } finally {
      setIsGeneratingWallet(false);
    }
  };

  // Handle RIDE NOW! payment processing
  const handleRideNowPayment = async () => {
    // Validate all required fields
    if (!userWalletAddress.trim()) {
      alert('Please provide a wallet address.');
      return;
    }
    if (!rideNowPhoneNumber.trim()) {
      alert('Please enter your phone number.');
      return;
    }
    if (!rideNowIdNumber || rideNowIdNumber.length !== 13) {
      alert('Please enter a valid 13-digit ID number.');
      return;
    }
    if (!rideNowPin || rideNowPin.length !== 4) {
      alert('Please enter a 4-digit PIN.');
      return;
    }
    if (!rideNowConsentGiven) {
      alert('Please confirm your ID and give consent first.');
      return;
    }

    setShowConfirmationPopup(true);
  };

  // Handle RIDE NOW! payment ID confirmation
  const handleRideNowIdConfirm = () => {
    if (!validateIdNumber(rideNowIdNumber)) {
      alert('Please enter a valid 13-digit ID number.');
      return;
    }
    setShowRideNowConsentDialog(true);
  };

  // Handle phone consent acceptance
  const handlePhoneConsentAccept = () => {
    setPhoneConsentGiven(true);
    setShowPhoneConsentDialog(false);
  };

  // Handle RIDE NOW! consent acceptance
  const handleRideNowConsentAccept = () => {
    setRideNowConsentGiven(true);
    setShowRideNowConsentDialog(false);
  };

  const calculateLoanDetails = () => {
    const rideCost = finalFare;
    const loanFee = rideCost * 0.05; // 5% fee
    const totalLoanAmount = rideCost + loanFee;
    return { rideCost, loanFee, totalLoanAmount };
  };

  const handleGoNowClick = () => {
    if (goNowWalletBalance > 0) {
      // If wallet is already funded, proceed directly
      return;
    }
    // Generate temporary wallet address when modal opens
    if (!goNowWalletAddress) {
      setGoNowWalletAddress(generateTempWalletAddress());
    }
    setShowGoNowModal(true);
  };

  const handleConfirmLoan = () => {
    if (!selectedBank) {
      alert('Please select a bank first.');
      return;
    }
    setShowConfirmationPopup(true);
  };

  const processLoan = async () => {
    setIsProcessingLoan(true);
    setShowConfirmationPopup(false);
    
    try {
      const { totalLoanAmount } = calculateLoanDetails();
      
      // Call the new Ride Now! API endpoint
      const response = await fetch('/api/ride-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPhone: rideNowPhoneNumber || phoneNumber || '+27 123 456 789',
          loanAmount: totalLoanAmount,
          pickupLocation: 'Current Location',
          destination: destination?.label || destinationValue,
          estimatedFare: finalFare,
          walletAddress: userWalletAddress,
          idNumber: rideNowIdNumber,
          pin: rideNowPin
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process instant loan');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update wallet balance and close modal
        setGoNowWalletBalance(totalLoanAmount);
        setShowGoNowModal(false);
        
        // Show success message with transaction details
        alert(`✅ Instant loan approved! $${totalLoanAmount.toFixed(2)} has been transferred to your wallet.\n\nTransaction Hash: ${result.data.paymentTransactionHash}\nRepayment Due: ${new Date(result.data.repaymentDueDate).toLocaleDateString()}\nTotal Repayment: $${result.data.totalRepaymentAmount.toFixed(2)}`);
        
        // Proceed to receipt
        handleProceedToReceipt();
      } else {
        throw new Error(result.message || 'Loan processing failed');
      }
    } catch (error) {
      console.error('Error processing instant loan:', error);
      alert(`❌ Loan processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessingLoan(false);
    }
  };

  if (!destination || !ride || isLoading) {
    return <PaymentSkeleton />;
  }

  const baseFare = 1.2; // USDC base fare for $1-2 range
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
      
      // If we don't have a user profile yet and phone payment is selected, create one
      if (!currentUserProfile && paymentMethod === 'phone' && currentPhone && walletPin) {
        await createWalletImmediately(currentPhone, walletPin);
        currentUserProfile = userProfile; // Get the updated profile
      }

      // If phone payment is selected and we have a user profile, process USDC loan transfer
      if (paymentMethod === 'phone' && currentUserProfile?.walletAddress) {
        // First, transfer USDC loan to user's wallet
        const loanResponse = await fetch('/api/loan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: currentPhone,
            loanAmount: finalFare.toFixed(2),
          }),
        });

        if (loanResponse.ok) {
          const loanResult = await loanResponse.json();
          console.log('USDC loan transfer successful:', loanResult);
          
          // Show appropriate notification based on mode
          if (loanResult.demoMode) {
            alert(`🎭 Demo Mode: USDC loan of $${finalFare.toFixed(2)} simulated successfully! In production, this would transfer real USDC from the app loan wallet to your wallet.`);
          } else {
            alert(`✅ USDC loan of $${finalFare.toFixed(2)} transferred successfully to your wallet! Transaction: ${loanResult.transactionHash}`);
          }

          // Then process the USDC payment from user's wallet
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
            
            // Show demo mode notification if applicable
            if (paymentResult.isDemoMode) {
              alert('🎭 Demo Mode: Payment simulated successfully! In production, this would be a real USDC transaction.');
            }
          } else {
            const errorResult = await paymentResponse.json();
            console.error('USDC payment failed:', errorResult);
            alert(`Payment failed: ${errorResult.error}`);
            return;
          }
        } else {
          const errorResult = await loanResponse.json();
          console.error('USDC loan transfer failed:', errorResult);
          alert(`Loan transfer failed: ${errorResult.error}`);
          return;
        }
      }

      // Proceed to confirmation page
      const params = new URLSearchParams({
        destination: destinationValue!,
        rideId: rideId!,
        payment: paymentMethod!,
        fare: finalFare.toFixed(2),
        token: bookingToken,
        driverName: assignedDriver.name,
        driverPlate: assignedDriver.plate,
        driverRating: assignedDriver.rating.toString(),
      });

      if (guestName) params.append('guestName', guestName);
      if (currentEmail) params.append('guestEmail', currentEmail);
      if (currentPhone) params.append('phoneNumber', currentPhone);
      if (currentUserProfile?.walletAddress) params.append('walletAddress', currentUserProfile.walletAddress);

      router.push(`/confirmation?${params.toString()}`);
    } catch (error) {
      console.error('Error processing booking:', error);
      alert('An error occurred while processing your booking. Please try again.');
    } finally {
      setIsCreatingProfile(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto p-3 sm:p-4">
        <Card className="shadow-2xl">
          <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/booking')}
                className="h-10 w-10 sm:h-12 sm:w-12 p-0 touch-manipulation"
              >
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
              <div className="h-8 w-auto flex justify-center items-center">
                <Logo size="default" />
              </div>
              <div className="w-10 sm:w-12" /> {/* Spacer for centering */}
            </div>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl text-center">Complete Payment</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Review your booking and select payment method
            </CardDescription>
          </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
          {/* Booking Summary */}
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-base sm:text-lg mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm sm:text-base">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Destination
                </span>
                <span className="font-medium">{destination.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <RideIcon className="h-4 w-4 text-muted-foreground" />
                  Ride Type
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{ride.name}</span>
                  {providerIconPath && (
                    <Image
                      src={providerIconPath}
                      alt={provider?.name || ''}
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain"
                    />
                  )}
                </div>
              </div>
              {guestName && (
                <div className="flex justify-between items-center">
                  <span>Passenger</span>
                  <span className="font-medium">{guestName}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Payment Methods */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-bold text-lg sm:text-xl">Select Payment Method</h3>
            <RadioGroup value={paymentMethod || ''} onValueChange={setPaymentMethod}>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {paymentMethods.map((method) => {
                  const PaymentIcon = method.icon;
                  return (
                    <div key={method.id}>
                      <RadioGroupItem value={method.id} id={method.id} className="peer sr-only" />
                      <div
                        onClick={() => setPaymentMethod(method.id)}
                        className="flex items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 sm:p-5 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all touch-manipulation active:scale-95"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <PaymentIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                          <div>
                            <p className="font-semibold text-base sm:text-lg">{method.name}</p>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg sm:text-xl font-bold">${finalFare.toFixed(2)}</p>
                          {method.id === 'phone' && (
                            <p className="text-xs text-muted-foreground">USDC</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Card Payment Form */}
          {paymentMethod === 'card' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-bold text-lg sm:text-xl">Card Details</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      type="text"
                      inputMode="numeric"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                        setCardNumber(digits.replace(/(.{4})/g, '$1 ').trim());
                      }}
                      className="h-12 font-mono tracking-widest"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="card-expiry">Expiry (MM/YY)</Label>
                      <Input
                        id="card-expiry"
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setCardExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                        }}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="card-cvv">CVV</Label>
                      <Input
                        id="card-cvv"
                        type="password"
                        inputMode="numeric"
                        placeholder="•••"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Payment Method Specific Content */}
          {paymentMethod === 'phone' && (
            <>
              <Separator />
              <div className="space-y-4 sm:space-y-6">
                <h3 className="font-bold text-lg sm:text-xl">Crypto Wallet Setup</h3>
                
                {/* Wallet Address Display */}
                <div className="space-y-3 sm:space-y-4">
                  {isCreatingWallet && (
                    <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm sm:text-base text-blue-800 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800"></div>
                        Creating your wallet...
                      </div>
                    </div>
                  )}
                  
                  {userProfile?.walletAddress && (
                    <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm sm:text-base font-medium mb-2 text-green-800">✅ Wallet Created Successfully!</p>
                      <p className="text-xs sm:text-sm font-mono break-all text-green-700">{userProfile.walletAddress}</p>
                    </div>
                  )}
                  
                  {!userProfile?.walletAddress && !isCreatingWallet && phoneNumber.trim() && walletPin.length === 4 && (
                    <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm sm:text-base text-yellow-800">
                        💡 Wallet will be created automatically when you enter your phone number and PIN
                      </p>
                    </div>
                  )}
                </div>
              
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
                      className="mt-1 sm:mt-2 h-12 sm:h-14 text-base"
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
                      className="mt-1 sm:mt-2 h-12 sm:h-14 text-base"
                    />
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {guestPhone ? `From booking: ${guestPhone}` : 'Optional - for SMS notifications'}
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="phoneId" className="text-sm sm:text-base font-medium">
                      ID Number (13 digits)
                    </Label>
                    <div className="flex gap-2 mt-1 sm:mt-2">
                      <Input
                        id="phoneId"
                        type="text"
                        placeholder="Enter your 13-digit ID number"
                        value={phoneIdNumber}
                        onChange={(e) => setPhoneIdNumber(e.target.value)}
                        className="h-12 sm:h-14 text-base flex-1"
                        maxLength={13}
                        pattern="[0-9]{13}"
                      />
                      <Button
                        onClick={handlePhoneIdConfirm}
                        disabled={!phoneIdNumber || phoneIdNumber.length !== 13}
                        className="h-12 sm:h-14 px-4"
                      >
                        Confirm
                      </Button>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Required for credit checks and loan authorization
                    </p>
                    {phoneConsentGiven && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs sm:text-sm text-green-800">
                        ✅ ID verified and consent given
                      </div>
                    )}
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
                      className="mt-1 sm:mt-2 h-12 sm:h-14 text-base text-center text-2xl tracking-widest"
                      maxLength={4}
                      pattern="[0-9]{4}"
                    />
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Required for crypto wallet creation and payments
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-800">
                  💡 Your crypto wallet will be created automatically when you enter your phone number and PIN. You'll pay with USDC on Base network.
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Price display */}
          <div className="text-center py-3 sm:py-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-lg sm:text-xl font-semibold">Total Fare</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-primary">${finalFare.toFixed(2)}</p>
            {paymentMethod === 'phone' && (
              <p className="text-sm text-muted-foreground mt-1">USDC on Base Network</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-3 sm:px-6 pb-4 sm:pb-6">
          <div className="w-full space-y-3">
            <Button
              onClick={handleProceedToReceipt}
              disabled={
                !paymentMethod ||
                (paymentMethod === 'card' && (cardNumber.replace(/\s/g, '').length !== 16 || cardExpiry.length !== 5 || cardCvv.length < 3)) ||
                (paymentMethod === 'phone' && (!phoneNumber.trim() || walletPin.length !== 4 || !phoneConsentGiven)) ||
                isCreatingProfile
              }
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold touch-manipulation"
              size="lg"
            >
              {isCreatingProfile ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                `Pay $${finalFare.toFixed(2)}`
              )}
            </Button>
            

          </div>
        </CardFooter>
      </Card>
    </div>

      {/* RIDE NOW! Instant Loan Modal */}
    <Dialog open={showGoNowModal} onOpenChange={setShowGoNowModal}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>RIDE NOW! (Instant Loan)</DialogTitle>
          <DialogDescription>
            Get your ride now and pay later with our instant loan service
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Wallet Address Section */}
          <div className="space-y-3">
            <Label>Wallet Address</Label>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter your wallet address (optional)"
                value={userWalletAddress}
                onChange={(e) => setUserWalletAddress(e.target.value)}
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateWalletAddress}
                disabled={isGeneratingWallet}
                className="w-full"
              >
                {isGeneratingWallet ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Generating...
                  </>
                ) : (
                  'Generate New Wallet Address'
                )}
              </Button>
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="ride-now-phone">Phone Number</Label>
            <Input
              id="ride-now-phone"
              type="tel"
              placeholder="+27 123 456 789"
              value={rideNowPhoneNumber}
              onChange={(e) => setRideNowPhoneNumber(e.target.value)}
              className="h-12"
            />
          </div>

          {/* ID Number */}
          <div className="space-y-2">
            <Label htmlFor="ride-now-id">ID Number (13 digits)</Label>
            <div className="flex gap-2">
              <Input
                id="ride-now-id"
                type="text"
                placeholder="Enter 13-digit ID number"
                value={rideNowIdNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 13) {
                    setRideNowIdNumber(value);
                  }
                }}
                className="flex-1 h-12"
                maxLength={13}
              />
              <Button
                type="button"
                onClick={handleRideNowIdConfirm}
                disabled={!rideNowIdNumber || rideNowIdNumber.length !== 13}
                className="px-6"
              >
                Confirm
              </Button>
            </div>
          </div>

          {/* PIN */}
          <div className="space-y-2">
            <Label htmlFor="ride-now-pin">4-Digit PIN</Label>
            <Input
              id="ride-now-pin"
              type="password"
              placeholder="Enter 4-digit PIN"
              value={rideNowPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 4) {
                  setRideNowPin(value);
                }
              }}
              className="h-12 text-center text-2xl tracking-widest"
              maxLength={4}
            />
          </div>

          {/* Loan Details */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <h4 className="font-semibold text-blue-800">Loan Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Ride Cost:</span>
                <span>${finalFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Loan Fee (5%):</span>
                <span>${(finalFare * 0.05).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Loan Amount:</span>
                <span>${(finalFare * 1.05).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Consent Display */}
          {rideNowConsentGiven && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ ID confirmed and consent given
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleRideNowPayment}
            disabled={!userWalletAddress.trim() || !rideNowPhoneNumber.trim() || !rideNowIdNumber || rideNowIdNumber.length !== 13 || !rideNowPin || rideNowPin.length !== 4 || !rideNowConsentGiven}
            className="w-full h-12 text-lg font-bold"
          >
            Pay ${(finalFare * 1.05).toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {/* Confirmation Dialog */}
    <AlertDialog open={showConfirmationPopup} onOpenChange={setShowConfirmationPopup}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Instant Loan</AlertDialogTitle>
          <AlertDialogDescription>
            Please confirm your instant loan details:
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Ride Cost:</span>
                <span>${finalFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Loan Fee (5%):</span>
                <span>${(finalFare * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Amount:</span>
                <span>${(finalFare * 1.05).toFixed(2)}</span>
              </div>
              <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                <p>Wallet: {userWalletAddress}</p>
                <p>Phone: {rideNowPhoneNumber}</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={processLoan} disabled={isProcessingLoan}>
            {isProcessingLoan ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              'Confirm Payment'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    {/* Phone Payment Consent Dialog */}
    <AlertDialog open={showPhoneConsentDialog} onOpenChange={setShowPhoneConsentDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Consent for Credit Check & Authorization</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>By proceeding, you acknowledge and consent to the following:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>SafeRide may use your ID number to run credit checks</li>
              <li>If you take a credit/loan on SafeRide, you authorize money to be taken from your account(s) using your ID</li>
              <li>Your information will be used in accordance with our privacy policy</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Decline</AlertDialogCancel>
          <AlertDialogAction onClick={handlePhoneConsentAccept}>
            I Consent
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* RIDE NOW! Payment Consent Dialog */}
    <AlertDialog open={showRideNowConsentDialog} onOpenChange={setShowRideNowConsentDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Consent for Credit Check & Authorization</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>By proceeding, you acknowledge and consent to the following:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>SafeRide may use your ID number to run credit checks</li>
              <li>If you take a credit/loan on SafeRide, you authorize money to be taken from your account(s) using your ID</li>
              <li>Your information will be used in accordance with our privacy policy</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Decline</AlertDialogCancel>
          <AlertDialogAction onClick={handleRideNowConsentAccept}>
            I Consent
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
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