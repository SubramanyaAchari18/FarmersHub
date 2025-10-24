import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

interface Crop {
  id: string;
  crop_name: string;
  category: string;
  quantity_kg: number;
  price_per_kg: number;
  description: string;
  location_district: string;
  location_state: string;
  location_village: string;
  farmer_id: string;
}

interface Profile {
  full_name: string;
  phone: string;
}

const Marketplace = () => {
  const { toast } = useToast();
  const [crops, setCrops] = useState<(Crop & { profiles: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"farmer" | "buyer" | null>(null);

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
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsAuthenticated(true);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();
      if (data) setUserRole(data.role);
    }
  };

  const fetchCrops = async () => {
    try {
      const { data, error } = await supabase
        .from("crops")
        .select("*")
        .eq("available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const cropsWithProfiles = await Promise.all(
        (data || []).map(async (crop) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("id", crop.farmer_id)
            .single();
          
          return {
            ...crop,
            profiles: profile || { full_name: "", phone: "" }
          };
        })
      );

      setCrops(cropsWithProfiles);
    } catch (error: any) {
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
    const matchesSearch = crop.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || crop.category === selectedCategory;
    const matchesState = selectedState === "all" || crop.location_state === selectedState;
    
    return matchesSearch && matchesCategory && matchesState;
  });

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
              <Card key={crop.id} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{crop.crop_name}</CardTitle>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm capitalize">
                      {crop.category}
                    </span>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {crop.location_village}, {crop.location_district}, {crop.location_state}
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
                      <span className="font-semibold">{crop.quantity_kg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price per kg:</span>
                      <span className="font-semibold text-primary">₹{crop.price_per_kg}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Total Value:</span>
                      <span className="font-bold text-lg">
                        ₹{(crop.quantity_kg * crop.price_per_kg).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <p className="text-sm font-medium">Farmer: {crop.profiles.full_name}</p>
                    {crop.profiles.phone && (
                      <Button variant="outline" className="w-full" asChild>
                        <a href={`tel:${crop.profiles.phone}`}>
                          <Phone className="mr-2 h-4 w-4" />
                          Contact: {crop.profiles.phone}
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;