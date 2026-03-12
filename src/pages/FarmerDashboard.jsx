import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi, cropsApi, rolesApi } from "@/lib/api";
import { Package, Plus, Trash2, TrendingUp, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCrop, setEditingCrop] = useState(null);
  const [editValues, setEditValues] = useState({ quantityKg: "", pricePerKg: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [stats, setStats] = useState({
    totalCrops: 0,
    activeCrops: 0,
    totalValue: 0,
  });

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { session } = await authApi.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    // Verify user is a farmer
    const roles = await rolesApi.getMyRoles();
    const role = roles?.[0]?.role;

    if (role !== "farmer") {
      navigate("/buyer-dashboard");
      return;
    }

    await fetchCrops();
  };

  const fetchCrops = async () => {
    try {
      const data = await cropsApi.getMyCrops();
      
      setCrops(data.map((c) => ({
        id: c.id,
        cropName: c.cropName,
        category: c.category,
        quantityKg: Number(c.quantityKg),
        pricePerKg: Number(c.pricePerKg),
        available: c.available,
        locationDistrict: c.locationDistrict,
        createdAt: c.createdAt,
      })));
      
      // Calculate stats
      const activeCrops = data.filter((c) => c.available).length;
      const totalValue = data.reduce((sum, c) => 
        sum + (Number(c.quantityKg) * Number(c.pricePerKg)), 0);
      
      setStats({
        totalCrops: data.length,
        activeCrops,
        totalValue,
      });
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

  const handleDeleteCrop = async (cropId) => {
    try {
      await cropsApi.delete(cropId);

      toast({
        title: "Success",
        description: "Crop deleted successfully",
      });

      await fetchCrops();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleAvailability = async (cropId, currentStatus) => {
    try {
      await cropsApi.update(cropId, { available: !currentStatus });

      toast({
        title: "Success",
        description: currentStatus ? "Crop marked as sold" : "Crop marked as available",
      });

      await fetchCrops();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (crop) => {
    setEditingCrop(crop);
    setEditValues({
      quantityKg: String(crop.quantityKg ?? ""),
      pricePerKg: String(crop.pricePerKg ?? ""),
    });
  };

  const closeEditDialog = () => {
    if (savingEdit) return;
    setEditingCrop(null);
    setEditValues({ quantityKg: "", pricePerKg: "" });
  };

  const handleUpdateCrop = async (e) => {
    e.preventDefault();
    if (!editingCrop) return;

    const quantity = Number(editValues.quantityKg);
    const price = Number(editValues.pricePerKg);

    if (!quantity || quantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity in kg.",
        variant: "destructive",
      });
      return;
    }

    if (!price || price <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price per kg.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingEdit(true);
      await cropsApi.update(editingCrop.id, {
        quantityKg: quantity,
        pricePerKg: price,
      });

      toast({
        title: "Updated",
        description: "Crop details updated successfully.",
      });

      await fetchCrops();
      closeEditDialog();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingEdit(false);
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
                  <div key={crop.id} className="border rounded-lg p-4 flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{crop.cropName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {crop.category} • {crop.locationDistrict}
                      </p>
                      <p className="text-sm mt-1">
                        Quantity: {crop.quantityKg} kg • Price: ₹{crop.pricePerKg}/kg
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                        crop.available ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {crop.available ? 'Available' : 'Sold Out'}
                      </div>
                      <div className="text-lg font-bold">
                        ₹{(crop.quantityKg * crop.pricePerKg).toLocaleString('en-IN')}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(crop)}
                        >
                          Update
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAvailability(crop.id, crop.available)}
                        >
                          {crop.available ? 'Mark as Sold' : 'Mark Available'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCrop(crop.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editingCrop} onOpenChange={(open) => (!open ? closeEditDialog() : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Crop</DialogTitle>
            <DialogDescription>
              Update the available quantity and price per kg for this crop.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCrop} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity (kg)</Label>
              <Input
                id="edit-quantity"
                type="number"
                min="0"
                step="0.01"
                value={editValues.quantityKg}
                onChange={(e) =>
                  setEditValues((prev) => ({ ...prev, quantityKg: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price per kg (₹)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={editValues.pricePerKg}
                onChange={(e) =>
                  setEditValues((prev) => ({ ...prev, pricePerKg: e.target.value }))
                }
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditDialog} disabled={savingEdit}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmerDashboard;

