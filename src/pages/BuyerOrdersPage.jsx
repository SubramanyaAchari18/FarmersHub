import Navbar from "@/components/Navbar";
import OtpModal from "@/components/OtpModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authApi, rolesApi, transportApi } from "@/lib/api";
import { CheckCircle, Clock, Package, RefreshCw, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BuyerOrdersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [otpOpen, setOtpOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

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

    await fetchOrders();
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await transportApi.getBuyerMine();
      setOrders(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load orders.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <Package className="h-4 w-4" />;
      case "in_transit":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "in_transit":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-muted";
    }
  };

  const handleConfirmReceiptClick = (order) => {
    setActiveOrder(order);
    setOtpOpen(true);
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              My Orders
            </h1>
            <p className="text-muted-foreground">Track your crop orders</p>
          </div>
          <Button variant="outline" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders</h3>
            <p className="text-muted-foreground">You don't have any orders yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const canConfirmReceipt = order.status === "delivered";
              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2 mb-2">
                          {order.crop?.cropName || `Order ${order.id.slice(0, 8)}`}
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status.replace("_", " ")}</span>
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Farmer: {order.farmer?.profile?.fullName || "Unknown"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Quantity</p>
                        <p className="text-sm text-muted-foreground">{Number(order.quantityKg)} kg</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Total Price</p>
                        <p className="text-sm text-muted-foreground">₹{Number(order.totalPrice).toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Pickup Location</p>
                        <p className="text-sm text-muted-foreground">
                          {order.pickupLocation || order.crop?.locationVillage || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Delivery Location</p>
                        <p className="text-sm text-muted-foreground">{order.deliveryLocation || "-"}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Requested:</span>
                        <span>{new Date(order.requestedAt).toLocaleString("en-IN")}</span>
                      </div>
                      {order.otp && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Your Delivery Code:</span>
                          <span className="font-semibold tracking-widest">{order.otp}</span>
                        </div>
                      )}
                      {order.pickedUpAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Picked Up:</span>
                          <span>{new Date(order.pickedUpAt).toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      {order.deliveredAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Delivered:</span>
                          <span>{new Date(order.deliveredAt).toLocaleString("en-IN")}</span>
                        </div>
                      )}
                    </div>

                    {canConfirmReceipt && (
                      <div className="border-t pt-4">
                        <Button
                          onClick={() => handleConfirmReceiptClick(order)}
                          disabled={workingId === order.id}
                          className="w-full sm:w-auto"
                        >
                          {workingId === order.id ? "Processing..." : "Confirm Receipt"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <OtpModal
        open={otpOpen}
        onOpenChange={setOtpOpen}
        order={activeOrder}
        onCompleted={(updated) => {
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        }}
      />
    </div>
  );
};

export default BuyerOrdersPage;

