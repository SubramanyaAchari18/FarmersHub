import { useEffect, useState } from "react";
import { authApi, transportApi, rolesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, CheckCircle, Clock, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import ConfirmOrderModal from "@/components/ConfirmOrderModal";
import CancelOrderModal from "@/components/CancelOrderModal";

const Transportation = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [workingId, setWorkingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { session } = await authApi.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);

    try {
      const roles = await rolesApi.getMyRoles();
      if (roles && roles.length > 0) {
        const role = roles[0].role;
        setUserRole(role);
        await fetchTransportRequests(session.user.id, role);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const fetchTransportRequests = async (userId, role) => {
    try {
      // Use role-specific endpoints that include crop and profile data
      const data = role === "farmer" ? await transportApi.getFarmerMine() : await transportApi.getBuyerMine();
      setRequests(data || []);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="h-5 w-5" />;
      case "picked_up": return <Truck className="h-5 w-5" />;
      case "in_transit": return <Truck className="h-5 w-5" />;
      case "delivered": return <CheckCircle className="h-5 w-5" />;
      case "cancelled": return <XCircle className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-warning/10 text-warning";
      case "picked_up": return "bg-info/10 text-info";
      case "in_transit": return "bg-primary/10 text-primary";
      case "delivered": return "bg-success/10 text-success";
      case "cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-muted";
    }
  };

  const handleAction = async (order, action) => {
    try {
      setWorkingId(order.id);
      let updated;
      switch (action) {
        case "ship":
          updated = await transportApi.ship(order.id);
          break;
        case "deliver":
          updated = await transportApi.deliver(order.id);
          break;
        default:
          return;
      }
      setRequests((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      toast({ title: "Success", description: `Order ${action}ed successfully!` });
    } catch (error) {
      toast({ title: "Error", description: error.message || "Action failed.", variant: "destructive" });
    } finally {
      setWorkingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={false} userRole={null} />
        <div className="container mx-auto px-4 py-8 text-center">
          <Card className="max-w-md mx-auto p-8">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please log in to track your transportation requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = "/auth"}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} userRole={userRole} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary" />
            Transportation Tracking
          </h1>
          <p className="text-muted-foreground">
            Track your crop deliveries in real-time
          </p>
        </div>

        {loading ? (
          <p>Loading transportation requests...</p>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Transportation Requests</h3>
            <p className="text-muted-foreground">
              You don't have any active transportation requests yet
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {request.crop?.cropName || "Unknown Crop"}
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Quantity: {request.quantityKg ?? 0} kg
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Pickup Location</p>
                      <p className="text-sm text-muted-foreground">{request.pickupLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Delivery Location</p>
                      <p className="text-sm text-muted-foreground">
                        {request.deliveryLocation || "To be decided"}
                      </p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${request.status !== 'cancelled' ? 'bg-success' : 'bg-muted'}`}>
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Requested</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.requestedAt).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {request.pickedUpAt && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-success">
                            <Truck className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Picked Up</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.pickedUpAt).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      )}

                      {request.deliveredAt && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-success">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Delivered</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.deliveredAt).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.trackingNotes && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1">Tracking Notes</p>
                      <p className="text-sm text-muted-foreground">{request.trackingNotes}</p>
                    </div>
                  )}
                  {userRole === "farmer" && request.status === "pending" && (
                    <div className="border-t pt-4 flex flex-col sm:flex-row gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          setActiveOrder(request);
                          setConfirmOpen(true);
                        }}
                        className="w-full sm:w-auto"
                      >
                        Confirm
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          setActiveOrder(request);
                          setCancelOpen(true);
                        }}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {userRole === "farmer" && request.status === "confirmed" && (
                    <div className="border-t pt-4">
                      <Button
                        onClick={() => handleAction(request, "ship")}
                        disabled={workingId === request.id}
                        className="w-full sm:w-auto"
                      >
                        {workingId === request.id ? "Processing..." : "Ship"}
                      </Button>
                    </div>
                  )}
                  {userRole === "farmer" && request.status === "in_transit" && (
                    <div className="border-t pt-4">
                      <Button
                        onClick={() => handleAction(request, "deliver")}
                        disabled={workingId === request.id}
                        className="w-full sm:w-auto"
                      >
                        {workingId === request.id ? "Processing..." : "Deliver"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <ConfirmOrderModal
        key={activeOrder?.id ? `confirm-${activeOrder.id}` : "confirm-none"}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        order={activeOrder}
        onConfirmed={(updated) => {
          setRequests((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        }}
      />
      <CancelOrderModal
        key={activeOrder?.id ? `cancel-${activeOrder.id}` : "cancel-none"}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        order={activeOrder}
        onCancelled={(updated) => {
          setRequests((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        }}
      />
    </div>
  );
};

export default Transportation;

