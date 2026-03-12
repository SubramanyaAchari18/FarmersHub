import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, rolesApi, cropsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Package, TrendingUp, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import CropCard from "@/components/CropCard";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { session } = await authApi.getSession();

    if (!session) {
      navigate("/auth");
      return;
    }

    // Verify user is a buyer
    const roles = await rolesApi.getMyRoles();
    const role = roles?.[0]?.role;

    if (role !== "buyer") {
      navigate("/farmer-dashboard");
      return;
    }

    await fetchCrops();
  };

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const data = await cropsApi.getAvailable();
      setCrops(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load crops.",
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
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/buyer-orders")}>
            <Package className="h-6 w-6" />
            My Orders
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/chatbot")}>
            <MessageSquare className="h-6 w-6" />
            AI Assistant
          </Button>
        </div>

        {/* Available Crops */}
        <Card>
          <CardHeader>
            <CardTitle>Available Crops</CardTitle>
            <CardDescription>Fresh listings from farmers across India</CardDescription>
          </CardHeader>
          <CardContent>
            {crops.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No crops available</h3>
                <p className="text-muted-foreground">Check back soon for new listings</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crops.map((crop) => (
                  <CropCard key={crop.id} crop={crop} />
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
