import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { transportApi } from "@/lib/api";
import { useState } from "react";

const OtpModal = ({ open, onOpenChange, order, onCompleted }) => {
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e?.preventDefault();
    if (!order) return;
    if (!otp || otp.length !== 4) {
      toast({ title: "Invalid code", description: "Enter the 4-digit OTP.", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      const updated = await transportApi.complete(order.id, otp);
      onCompleted?.(updated);
      onOpenChange(false);
      setOtp("");
      toast({ title: "Order completed", description: "Thank you for confirming receipt." });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to complete order.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Delivery Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">4-digit OTP</label>
            <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\\D/g, "").slice(0, 4))} placeholder="1234" />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Close
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OtpModal;




