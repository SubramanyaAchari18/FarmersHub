import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

interface PredictionResult {
  predicted_price_per_kg: number;
  confidence_score: number;
  explanation: string;
  factors: string[];
  recommendation: string;
}

const PricePrediction = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"farmer" | "buyer" | null>(null);

  const [cropName, setCropName] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [season, setSeason] = useState("");

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsAuthenticated(true);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();
      if (data) setUserRole(data.role);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    try {
      const { data, error } = await supabase.functions.invoke('predict-crop-price', {
        body: { cropName, category, state, season }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setPrediction(data);

      // Save prediction to database
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("price_predictions").insert({
          user_id: session.user.id,
          crop_name: cropName,
          category: category as any,
          location_state: state,
          season,
          predicted_price_per_kg: data.predicted_price_per_kg,
          confidence_score: data.confidence_score,
        });
      }

      toast({
        title: "Prediction Generated!",
        description: "AI has analyzed market conditions for your crop",
      });
    } catch (error: any) {
      console.error('Prediction error:', error);
      toast({
        title: "Prediction Failed",
        description: error.message || "Failed to generate prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} userRole={userRole} />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            AI Price Prediction
          </h1>
          <p className="text-muted-foreground">
            Get ML-powered price predictions to sell at the best time
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Enter Crop Details</CardTitle>
              <CardDescription>Provide information for price analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePredict} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="crop-name">Crop Name *</Label>
                  <Input
                    id="crop-name"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    placeholder="e.g., Basmati Rice, Tomato"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grains">Grains</SelectItem>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                      <SelectItem value="pulses">Pulses</SelectItem>
                      <SelectItem value="spices">Spices</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={state} onValueChange={setState} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="season">Season *</Label>
                  <Select value={season} onValueChange={setSeason} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kharif">Kharif (Monsoon)</SelectItem>
                      <SelectItem value="Rabi">Rabi (Winter)</SelectItem>
                      <SelectItem value="Zaid">Zaid (Summer)</SelectItem>
                      <SelectItem value="Year-round">Year-round</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Market...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Predict Price
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Prediction Results */}
          <div className="space-y-6">
            {prediction ? (
              <>
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-3xl">
                      ₹{prediction.predicted_price_per_kg.toFixed(2)}/kg
                    </CardTitle>
                    <CardDescription>
                      Predicted Market Price
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${prediction.confidence_score * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {(prediction.confidence_score * 100).toFixed(0)}% confident
                          </span>
                        </div>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{prediction.explanation}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Factors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {prediction.factors.map((factor, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                          <span className="text-sm">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-success/10 border-success">
                  <CardHeader>
                    <CardTitle className="text-success">Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{prediction.recommendation}</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center p-12">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Enter crop details to get price prediction</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricePrediction;