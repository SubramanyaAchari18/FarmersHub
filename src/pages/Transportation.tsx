import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, CheckCircle, Clock, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

interface TransportRequest {
  id: string;
  crop_id: string;
  pickup_location: string;
  delivery_location: string;
  status: string;
  requested_at: string;
  picked_up_at: string | null;
  delivered_at: string | null;
  tracking_notes: string | null;
  crops: {
    crop_name: string;
    quantity_kg: number;
  };
}

const Transportation = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"farmer" | "buyer" | null>(null);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData) {
      setUserRole(roleData.role);
      await fetchTransportRequests(session.user.id, roleData.role);
    }
  };

  const fetchTransportRequests = async (userId: string, role: string) => {
    try {
      const query = supabase
        .from("transportation_requests")
        .select(`
          *,
          crops (
            crop_name,
            quantity_kg
          )
        `)
        .order("requested_at", { ascending: false });

      if (role === "farmer") {
        query.eq("farmer_id", userId);
      } else {
        query.eq("buyer_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-5 w-5" />;
      case "picked_up": return <Truck className="h-5 w-5" />;
      case "in_transit": return <Truck className="h-5 w-5" />;
      case "delivered": return <CheckCircle className="h-5 w-5" />;
      case "cancelled": return <XCircle className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning/10 text-warning";
      case "picked_up": return "bg-info/10 text-info";
      case "in_transit": return "bg-primary/10 text-primary";
      case "delivered": return "bg-success/10 text-success";
      case "cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-muted";
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
                        {request.crops?.crop_name}
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Quantity: {request.crops?.quantity_kg} kg
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Pickup Location</p>
                      <p className="text-sm text-muted-foreground">{request.pickup_location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Delivery Location</p>
                      <p className="text-sm text-muted-foreground">
                        {request.delivery_location || "To be decided"}
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
                            {new Date(request.requested_at).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {request.picked_up_at && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-success">
                            <Truck className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Picked Up</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.picked_up_at).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      )}

                      {request.delivered_at && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-success">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Delivered</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.delivered_at).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.tracking_notes && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1">Tracking Notes</p>
                      <p className="text-sm text-muted-foreground">{request.tracking_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transportation;