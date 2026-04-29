'use client'

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { destinations as initialDestinations, rideTypes as initialRideTypes } from "@/lib/data";
import { Car, Gem, MapPin, Users, PlusCircle, ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const rideTypeIcons: { [key: string]: React.ElementType } = {
  economy: Car,
  comfort: Gem,
  xl: Users,
};

export default function AdminPage() {
  const router = useRouter();

  const [destinations, setDestinations] = useState(initialDestinations);
  const [rideTypes, setRideTypes] = useState(initialRideTypes);

  // Add destination form state
  const [newDestLabel, setNewDestLabel] = useState('');
  const [newDestValue, setNewDestValue] = useState('');
  const [destDialogOpen, setDestDialogOpen] = useState(false);

  // Add ride type form state
  const [newRideName, setNewRideName] = useState('');
  const [newRideDesc, setNewRideDesc] = useState('');
  const [newRideMultiplier, setNewRideMultiplier] = useState('');
  const [rideDialogOpen, setRideDialogOpen] = useState(false);

  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestLabel.trim()) return;
    const slug = newDestValue.trim() || newDestLabel.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (destinations.some((d) => d.value === slug)) {
      alert('A destination with that key already exists.');
      return;
    }
    setDestinations((prev) => [...prev, { value: slug, label: newDestLabel.trim() }]);
    setNewDestLabel('');
    setNewDestValue('');
    setDestDialogOpen(false);
  };

  const handleDeleteDestination = (value: string) => {
    setDestinations((prev) => prev.filter((d) => d.value !== value));
  };

  const handleAddRideType = (e: React.FormEvent) => {
    e.preventDefault();
    const multiplier = parseFloat(newRideMultiplier);
    if (!newRideName.trim() || isNaN(multiplier) || multiplier <= 0) return;
    const id = newRideName.trim().toLowerCase().replace(/\s+/g, '-');
    setRideTypes((prev) => [
      ...prev,
      { id, name: newRideName.trim(), description: newRideDesc.trim(), icon: Car, priceMultiplier: multiplier },
    ]);
    setNewRideName('');
    setNewRideDesc('');
    setNewRideMultiplier('');
    setRideDialogOpen(false);
  };

  const handleDeleteRideType = (id: string) => {
    setRideTypes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <Button variant="outline" onClick={() => router.push('/booking')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to App
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Admin Panel</CardTitle>
          <CardDescription>Manage destinations and ride types for the SafeRide app.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="destinations">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="destinations">Destinations</TabsTrigger>
              <TabsTrigger value="rideTypes">Ride Types</TabsTrigger>
            </TabsList>

            {/* Destinations Tab */}
            <TabsContent value="destinations" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Manage Destinations</CardTitle>
                    <CardDescription>Add or remove available destinations.</CardDescription>
                  </div>
                  <Dialog open={destDialogOpen} onOpenChange={setDestDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Destination</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleAddDestination}>
                        <DialogHeader>
                          <DialogTitle>Add New Destination</DialogTitle>
                          <DialogDescription>Enter the destination name. The key will be auto-generated.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-1">
                            <Label htmlFor="dest-name">Destination Name *</Label>
                            <Input
                              id="dest-name"
                              placeholder="e.g. Stellenbosch University"
                              value={newDestLabel}
                              onChange={(e) => setNewDestLabel(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="dest-key">Key (optional — auto-generated if blank)</Label>
                            <Input
                              id="dest-key"
                              placeholder="e.g. stellenbosch-university"
                              value={newDestValue}
                              onChange={(e) => setNewDestValue(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setDestDialogOpen(false)}>Cancel</Button>
                          <Button type="submit" disabled={!newDestLabel.trim()}>Add Destination</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Icon</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {destinations.map((dest) => (
                        <TableRow key={dest.value}>
                          <TableCell><MapPin className="h-5 w-5 text-muted-foreground" /></TableCell>
                          <TableCell className="font-medium">{dest.label}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">{dest.value}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDestination(dest.value)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ride Types Tab */}
            <TabsContent value="rideTypes" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Manage Ride Types</CardTitle>
                    <CardDescription>Add or remove ride type options.</CardDescription>
                  </div>
                  <Dialog open={rideDialogOpen} onOpenChange={setRideDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Ride Type</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleAddRideType}>
                        <DialogHeader>
                          <DialogTitle>Add New Ride Type</DialogTitle>
                          <DialogDescription>Define a new ride category and its price multiplier.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-1">
                            <Label htmlFor="ride-name">Name *</Label>
                            <Input
                              id="ride-name"
                              placeholder="e.g. Premium"
                              value={newRideName}
                              onChange={(e) => setNewRideName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="ride-desc">Description</Label>
                            <Input
                              id="ride-desc"
                              placeholder="e.g. Luxury rides with top-rated drivers"
                              value={newRideDesc}
                              onChange={(e) => setNewRideDesc(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="ride-multiplier">Price Multiplier *</Label>
                            <Input
                              id="ride-multiplier"
                              type="number"
                              step="0.05"
                              min="0.5"
                              max="5"
                              placeholder="e.g. 2.0"
                              value={newRideMultiplier}
                              onChange={(e) => setNewRideMultiplier(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setRideDialogOpen(false)}>Cancel</Button>
                          <Button type="submit" disabled={!newRideName.trim() || !newRideMultiplier}>Add Ride Type</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Icon</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Multiplier</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rideTypes.map((type) => {
                        const Icon = rideTypeIcons[type.id] || Car;
                        return (
                          <TableRow key={type.id}>
                            <TableCell><Icon className="h-5 w-5 text-muted-foreground" /></TableCell>
                            <TableCell className="font-medium">{type.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{type.description}</TableCell>
                            <TableCell className="text-right font-mono">{type.priceMultiplier.toFixed(2)}x</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRideType(type.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
