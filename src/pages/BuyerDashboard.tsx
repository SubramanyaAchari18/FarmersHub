import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Package, TrendingUp, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

interface Crop {
  id: string;
  crop_name: string;
  category: string;
  quantity_kg: number;
  price_per_kg: number;
  location_district: string;
  location_state: string;
  farmer_id: string;
  profiles: {
    full_name: string;
    phone: string;
  };
}

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recentCrops, setRecentCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    // Verify user is a buyer
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData?.role !== "buyer") {
      navigate("/farmer-dashboard");
      return;
    }

    await fetchRecentCrops();
  };

  const fetchRecentCrops = async () => {
    try {
      const { data, error } = await supabase
        .from("crops")
        .select("*")
        .eq("available", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      // Fetch farmer profiles separately
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

      setRecentCrops(cropsWithProfiles);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={true} userRole="buyer" />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} userRole="buyer" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Buyer Dashboard</h1>
          <p className="text-muted-foreground">Discover fresh crops directly from farmers</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/marketplace")}>
            <Search className="h-6 w-6" />
            Search Crops
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/price-prediction")}>
            <TrendingUp className="h-6 w-6" />
            Price Trends
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/transportation")}>
            <Package className="h-6 w-6" />
            Track Orders
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/chatbot")}>
            <MessageSquare className="h-6 w-6" />
            AI Assistant
          </Button>
        </div>

        {/* Recently Listed Crops */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Listed Crops</CardTitle>
            <CardDescription>Fresh listings from farmers across India</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCrops.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No crops available</h3>
                <p className="text-muted-foreground">Check back soon for new listings</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {recentCrops.map((crop) => (
                  <Card key={crop.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{crop.crop_name}</CardTitle>
                      <CardDescription>
                        {crop.category} • {crop.location_district}, {crop.location_state}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quantity:</span>
                          <span className="font-semibold">{crop.quantity_kg} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price per kg:</span>
                          <span className="font-semibold text-primary">₹{crop.price_per_kg}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Value:</span>
                          <span className="font-bold text-lg">
                            ₹{(crop.quantity_kg * crop.price_per_kg).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground mb-1">Farmer: {crop.profiles?.full_name}</p>
                        {crop.profiles?.phone && (
                          <p className="text-sm text-muted-foreground">Contact: {crop.profiles.phone}</p>
                        )}
                      </div>
                      <Button className="w-full mt-4" onClick={() => navigate(`/marketplace?crop=${crop.id}`)}>
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyerDashboard;