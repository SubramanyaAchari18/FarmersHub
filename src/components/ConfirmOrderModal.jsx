// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { useToast } from "@/hooks/use-toast";
// import { transportApi } from "@/lib/api";
// import { useState } from "react";

// const ConfirmOrderModal = ({ open, onOpenChange, order, onConfirmed }) => {
//   const { toast } = useToast();
//   const [date, setDate] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const onSubmit = async (e) => {
//     e?.preventDefault();
//     if (!order) return;
//     if (!date) {
//       toast({ title: "Date required", description: "Please select an estimated delivery date.", variant: "destructive" });
//       return;
//     }
//     try {
//       setSubmitting(true);
//       const updated = await transportApi.confirm(order.id, date);
//       onConfirmed?.(updated);
//       onOpenChange(false);
//       setDate("");
//       toast({ title: "Order confirmed", description: "Estimated delivery date saved." });
//     } catch (err) {
//       toast({ title: "Error", description: err.message || "Failed to confirm order.", variant: "destructive" });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Confirm Order</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={onSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <label className="text-sm font-medium">Estimated Delivery Date</label>
//             <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
//           </div>
//           <DialogFooter className="gap-2">
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={submitting}>
//               {submitting ? "Confirming..." : "Confirm"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default ConfirmOrderModal;


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
import { useToast } from "@/hooks/use-toast";
import { transportApi } from "@/lib/api";
import React, { useState } from "react";

export function ConfirmOrderModal({ open, onOpenChange, order, onConfirmed }) {
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [startShipping, setStartShipping] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Get tomorrow's date as the minimum
  const getMinDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const onSubmit = async (e) => {
    e?.preventDefault();
    if (!order) return;
    if (!date) {
      toast({
        title: "Date required",
        description: "Please select an estimated delivery date.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      // Send estimated date plus shipping details; optionally start shipping immediately
      const updated = await transportApi.confirm(order.id, date, {
        driverName: driverName || undefined,
        driverPhone: driverPhone || undefined,
        vehicleNumber: vehicleNumber || undefined,
        currentLocation: currentLocation || undefined,
        startShipping,
      });
      onConfirmed?.(updated); // Update the main page
      onOpenChange(false); // Close the modal
      // Reset the form
      setDate("");
      setDriverName("");
      setDriverPhone("");
      setVehicleNumber("");
      setCurrentLocation("");
      setStartShipping(true);
      toast({
        title: startShipping ? "Shipping started!" : "Order confirmed!",
        description: startShipping
          ? "Buyer notified. Shipment marked as in transit."
          : "Buyer notified. You can start shipping when ready.",
      });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to confirm order.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Order: {order?.crop?.cropName}</DialogTitle>
          <DialogDescription>
            Select an estimated delivery date. This will be shown to the buyer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delivery-date">Estimated Delivery Date</Label>
            <Input
              id="delivery-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={getMinDate()} // Prevent picking today or past dates
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="driver-name">Driver Name</Label>
              <Input id="driver-name" value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Ex: Ramesh K" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver-phone">Driver Phone</Label>
              <Input id="driver-phone" value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} placeholder="Ex: 9876543210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle-number">Vehicle Number</Label>
              <Input id="vehicle-number" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="Ex: KA-30-1234" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-location">Current Location</Label>
              <Input id="current-location" value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} placeholder="Village, Taluk, District" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              id="start-shipping"
              type="checkbox"
              checked={startShipping}
              onChange={(e) => setStartShipping(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="start-shipping">Start shipping now (mark as In Transit)</Label>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Close
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Confirming..." : "Confirm Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmOrderModal;