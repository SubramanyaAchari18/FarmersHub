// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import { transportApi } from "@/lib/api";
// import { useState } from "react";

// const CancelOrderModal = ({ open, onOpenChange, order, onCancelled }) => {
//   const { toast } = useToast();
//   const [reason, setReason] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const onSubmit = async (e) => {
//     e?.preventDefault();
//     if (!order) return;
//     if (!reason.trim()) {
//       toast({ title: "Reason required", description: "Please provide a reason for cancellation.", variant: "destructive" });
//       return;
//     }
//     try {
//       setSubmitting(true);
//       const updated = await transportApi.cancel(order.id, reason.trim());
//       onCancelled?.(updated);
//       onOpenChange(false);
//       setReason("");
//       toast({ title: "Order cancelled", description: "The order has been cancelled." });
//     } catch (err) {
//       toast({ title: "Error", description: err.message || "Failed to cancel order.", variant: "destructive" });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Cancel Order</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={onSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <label className="text-sm font-medium">Reason for cancellation</label>
//             <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Out of stock, Delivery delay, etc." />
//           </div>
//           <DialogFooter className="gap-2">
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
//               Close
//             </Button>
//             <Button type="submit" variant="destructive" disabled={submitting}>
//               {submitting ? "Cancelling..." : "Cancel Order"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CancelOrderModal;


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { transportApi } from "@/lib/api";

export function CancelOrderModal({ open, onOpenChange, order, onCancelled }) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e?.preventDefault();
    if (!order) return;
    if (!reason.trim()) {
      toast({ title: "Reason required", description: "Please provide a reason for cancellation.", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const updated = await transportApi.cancel(order.id, reason.trim());
      onCancelled?.(updated);
      onOpenChange(false);
      setReason("");
      toast({ title: "Order cancelled", description: "The order has been cancelled." });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to cancel order.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Order: {order?.crop?.cropName}</DialogTitle>
          <DialogDescription>
            Please provide a reason for cancelling. This message will be shown to
            the buyer (e.g., "Out of stock," "Delivery delay").
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason for Cancellation</Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Type your message to the buyer here..."
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Back
            </Button>
            <Button type="submit" variant="destructive" disabled={submitting}>
              {submitting ? "Cancelling..." : "Cancel Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CancelOrderModal;