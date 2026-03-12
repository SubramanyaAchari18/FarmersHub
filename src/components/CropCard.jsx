import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { transportApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";

export default function CropCard({ crop }) {
  const [open, setOpen] = useState(false);
  const [quantityKg, setQuantityKg] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

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

    if (!quantityKg || Number(quantityKg) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity.",
        variant: "destructive",
      });
      return;
    }
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
        title: "Success",
        description: "Order created successfully!",
      });
      setOpen(false);
      setQuantityKg("");
      setDeliveryLocation("");
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to create order.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!crop) return null;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-xl">{crop.cropName}</CardTitle>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm capitalize">
              {crop.category}
            </span>
          </div>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {crop.locationVillage || crop.locationDistrict}, {crop.locationState}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {crop.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{crop.description}</p>
          )}

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available:</span>
              <span className="font-semibold">{Number(crop.quantityKg)} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price per kg:</span>
              <span className="font-semibold text-primary">₹{Number(crop.pricePerKg)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">Total Value:</span>
              <span className="font-bold text-lg">
                ₹{(Number(crop.quantityKg) * Number(crop.pricePerKg)).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">
              Farmer: {crop.farmer?.profile?.fullName || "Unknown"}
            </p>
          </div>

          <Button className="w-full" onClick={() => setOpen(true)}>
            Buy Now
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy {crop.cropName}</DialogTitle>
            <DialogDescription>
              Enter the quantity and delivery location to place your order.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  placeholder="e.g., 10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery">Delivery Location</Label>
                <Input
                  id="delivery"
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="e.g., 221B Baker Street, City"
                  required
                />
              </div>
              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Price:</span>
                  <span className="text-2xl font-bold">₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>
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
}






















