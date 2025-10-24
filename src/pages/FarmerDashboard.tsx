import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package, TrendingUp, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

interface Crop {
  id: string;
  crop_name: string;
  category: string;
  quantity_kg: number;
  price_per_kg: number;
  available: boolean;
  location_district: string;
  created_at: string;
}

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCrops: 0,
    activeCrops: 0,
    totalValue: 0,
  });

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    // Verify user is a farmer
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData?.role !== "farmer") {
      navigate("/buyer-dashboard");
      return;
    }

    await fetchCrops(session.user.id);
  };

  const fetchCrops = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("crops")
        .select("*")
        .eq("farmer_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCrops(data || []);
      
      // Calculate stats
      const activeCrops = data?.filter(c => c.available).length || 0;
      const totalValue = data?.reduce((sum, c) => sum + (c.quantity_kg * c.price_per_kg), 0) || 0;
      
      setStats({
        totalCrops: data?.length || 0,
        activeCrops,
        totalValue,
      });
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
        <Navbar isAuthenticated={true} userRole="farmer" />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} userRole="farmer" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Farmer Dashboard</h1>
            <p className="text-muted-foreground">Manage your crops and track your inventory</p>
          </div>
          <Button onClick={() => navigate("/add-crop")} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add New Crop
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Crops Listed</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCrops}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{stats.activeCrops}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{stats.totalValue.toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/add-crop")}>
            <Plus className="h-6 w-6" />
            Add Crop
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/price-prediction")}>
            <TrendingUp className="h-6 w-6" />
            Price Prediction
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/transportation")}>
            <Truck className="h-6 w-6" />
            Track Transport
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/chatbot")}>
            <Package className="h-6 w-6" />
            AI Assistant
          </Button>
        </div>

        {/* Crops List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Crop Listings</CardTitle>
            <CardDescription>Manage and update your crop inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {crops.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No crops listed yet</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first crop to the marketplace</p>
                <Button onClick={() => navigate("/add-crop")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Crop
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {crops.map((crop) => (
                  <div key={crop.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{crop.crop_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {crop.category} • {crop.location_district}
                      </p>
                      <p className="text-sm mt-1">
                        Quantity: {crop.quantity_kg} kg • Price: ₹{crop.price_per_kg}/kg
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                        crop.available ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {crop.available ? 'Available' : 'Sold Out'}
                      </div>
                      <div className="text-lg font-bold mt-2">
                        ₹{(crop.quantity_kg * crop.price_per_kg).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmerDashboard;