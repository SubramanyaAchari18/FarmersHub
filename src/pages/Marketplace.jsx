import { useEffect, useState, useMemo } from "react";
import { authApi, rolesApi, cropsApi, profilesApi, transportApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Phone, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

const Marketplace = () => {
  const { toast } = useToast();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  useEffect(() => {
    checkAuth();
    fetchCrops();
  }, []);

  const checkAuth = async () => {
    const { session } = await authApi.getSession();
    if (session) {
      setIsAuthenticated(true);
      if (session.roles && session.roles.length > 0) {
        setUserRole(session.roles[0]);
      }
    }
  };

  const fetchCrops = async () => {
    try {
      const data = await cropsApi.getAll({ available: true });

      const cropsWithProfiles = await Promise.all(
        data.map(async (crop) => {
          try {
            const profile = await profilesApi.getById(crop.farmerId);
            return {
              ...crop,
              cropName: crop.cropName,
              quantityKg: Number(crop.quantityKg),
              pricePerKg: Number(crop.pricePerKg),
              locationDistrict: crop.locationDistrict,
              locationState: crop.locationState,
              locationVillage: crop.locationVillage,
              farmerId: crop.farmerId,
              profiles: { fullName: profile.fullName || "", phone: profile.phone || null }
            };
          } catch {
            return {
              ...crop,
              cropName: crop.cropName,
              quantityKg: Number(crop.quantityKg),
              pricePerKg: Number(crop.pricePerKg),
              locationDistrict: crop.locationDistrict,
              locationState: crop.locationState,
              locationVillage: crop.locationVillage,
              farmerId: crop.farmerId,
              profiles: { fullName: "", phone: null }
            };
          }
        })
      );

      setCrops(cropsWithProfiles);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch = crop.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || crop.category === selectedCategory;
    const matchesState = selectedState === "all" || crop.locationState === selectedState;
    
    return matchesSearch && matchesCategory && matchesState;
  });

  // Crop Card Component with Buy Now functionality
  const CropCardWithBuyNow = ({ crop }) => {
    const [open, setOpen] = useState(false);
    const [quantityKg, setQuantityKg] = useState("");
    const [deliveryLocation, setDeliveryLocation] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const totalPrice = useMemo(() => {
      const qty = parseFloat(quantityKg || "0");
      const price = parseFloat(crop?.pricePerKg || "0");
      const total = qty * price;
      if (!isFinite(total) || total <= 0) return 0;
      return Number(total.toFixed(2));
    }, [quantityKg, crop?.pricePerKg]);

    async function handleSubmit(e) {
      e.preventDefault();
      if (!crop?.id) return;

      // Validate quantity
      if (!quantityKg || Number(quantityKg) <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid quantity greater than 0.",
          variant: "destructive",
        });
        return;
      }

      // Check if requested quantity exceeds available quantity
      if (Number(quantityKg) > crop.quantityKg) {
        toast({
          title: "Error",
          description: `Requested quantity (${quantityKg} kg) exceeds available quantity (${crop.quantityKg} kg).`,
          variant: "destructive",
        });
        return;
      }

      // Validate delivery location
      if (!deliveryLocation.trim()) {
        toast({
          title: "Error",
          description: "Delivery location is required.",
          variant: "destructive",
        });
        return;
      }

      try {
        setSubmitting(true);
        await transportApi.create({
          cropId: crop.id,
          quantityKg: Number(quantityKg),
          totalPrice,
          deliveryLocation: deliveryLocation.trim(),
        });
        toast({
          title: "Success!",
          description: "Order placed successfully! The farmer has been notified.",
        });
        setOpen(false);
        setQuantityKg("");
        setDeliveryLocation("");
      } catch (err) {
        toast({
          title: "Error",
          description: err.message || "Failed to create order. Please try again.",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    }

    return (
      <>
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-xl">{crop.cropName}</CardTitle>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm capitalize">
                {crop.category}
              </span>
            </div>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {crop.locationVillage}, {crop.locationDistrict}, {crop.locationState}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {crop.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {crop.description}
              </p>
            )}

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available:</span>
                <span className="font-semibold">{crop.quantityKg} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per kg:</span>
                <span className="font-semibold text-primary">₹{crop.pricePerKg}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Total Value:</span>
                <span className="font-bold text-lg">
                  ₹{(crop.quantityKg * crop.pricePerKg).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-medium">Farmer: {crop.profiles.fullName}</p>
              {crop.profiles.phone && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={`tel:${crop.profiles.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Contact: {crop.profiles.phone}
                  </a>
                </Button>
              )}
            </div>

            {/* Buy Now Button - Only show if user is authenticated as buyer */}
            {isAuthenticated && userRole === "buyer" && (
              <Button className="w-full mt-4" onClick={() => setOpen(true)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buy Now
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Buy Now Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buy {crop.cropName}</DialogTitle>
              <DialogDescription>
                Enter the quantity and delivery address to place your order. The farmer will be notified once you confirm.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor={`quantity-${crop.id}`}>Quantity (kg)</Label>
                  <Input
                    id={`quantity-${crop.id}`}
                    type="number"
                    min="0.01"
                    max={crop.quantityKg}
                    step="0.01"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    placeholder={`Max: ${crop.quantityKg} kg`}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Available: {crop.quantityKg} kg
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`delivery-${crop.id}`}>Delivery Address</Label>
                  <Input
                    id={`delivery-${crop.id}`}
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="Enter your complete delivery address"
                    required
                  />
                </div>
                {quantityKg && Number(quantityKg) > 0 && (
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Price:</span>
                      <span className="text-2xl font-bold">
                        ₹{totalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {quantityKg} kg × ₹{crop.pricePerKg} per kg
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Processing..." : "Confirm Purchase"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} userRole={userRole} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Crop Marketplace</h1>
          <p className="text-muted-foreground">Browse fresh crops directly from farmers across India</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search crops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="grains">Grains</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="pulses">Pulses</SelectItem>
                  <SelectItem value="spices">Spices</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {indianStates.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 text-muted-foreground">
          Found {filteredCrops.length} crops
        </div>

        {loading ? (
          <p>Loading crops...</p>
        ) : filteredCrops.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-xl text-muted-foreground">No crops found matching your filters</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map((crop) => (
              <CropCardWithBuyNow key={crop.id} crop={crop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;

