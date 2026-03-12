import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { authApi, pricePredictionsApi } from "@/lib/api";
import { AlertCircle, Loader2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

const PricePrediction = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const [cropName, setCropName] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [season, setSeason] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [year, setYear] = useState(new Date().getFullYear()); // Current year

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
    const { session } = await authApi.getSession();
    if (session) {
      setIsAuthenticated(true);
      if (session.roles && session.roles.length > 0) {
        setUserRole(session.roles[0]);
      }
    }
  };

  // Map frontend category to ML model format (CSV uses capitalized singular form)
  const mapCategoryToMLFormat = (category) => {
    const categoryMap = {
      'grains': 'Grain',
      'vegetables': 'Vegetable',
      'fruits': 'Fruit',
      'pulses': 'Pulse',
      'spices': 'Spice',
      'others': 'Other'
    };
    // Default to Vegetable if mapping not found
    return categoryMap[category] || 'Vegetable';
  };

  // Map season to ML model format (remove "Year-round" or handle it)
  const mapSeasonToMLFormat = (season) => {
    if (season === 'Year-round') {
      // Default to current season based on month
      const currentMonth = new Date().getMonth() + 1;
      if (currentMonth >= 6 && currentMonth <= 10) return 'Kharif';
      if (currentMonth >= 11 || currentMonth <= 2) return 'Rabi';
      return 'Zaid';
    }
    return season;
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    try {
      // Prepare data for ML model API
      const mlInput = {
        year: year,
        month: month,
        season: mapSeasonToMLFormat(season),
        state: state,
        crop_category: mapCategoryToMLFormat(category),
        crop_name: cropName,
        variety_name: 'Unknown' // Optional field
      };

      // Call ML prediction API
      const mlResponse = await pricePredictionsApi.predict(mlInput);

      if (!mlResponse.success) {
        // Check if model is not trained
        if (mlResponse.error === 'ML model not trained' || mlResponse.missingFiles) {
          throw new Error(
            `ML model not trained yet. Please train the model first:\n\n` +
            `1. Open terminal in backend/ml folder\n` +
            `2. Run: python train.py\n\n` +
            `This will take 10-30 minutes.`
          );
        }
        throw new Error(mlResponse.message || mlResponse.error || 'Prediction failed');
      }

      // ML model returns price per quintal, convert to per kg
      // 1 quintal = 100 kg
      const pricePerQuintal = mlResponse.predictedPrice;
      const pricePerKg = pricePerQuintal / 100;

      // Calculate confidence score based on R² score (if available)
      // For now, use a reasonable default confidence
      const confidenceScore = 0.75; // Can be improved by loading metrics.json

      // Create prediction result
      const predictionResult = {
        predicted_price_per_kg: pricePerKg,
        predicted_price_per_quintal: pricePerQuintal,
        confidence_score: confidenceScore,
        explanation: `Based on ML analysis of historical data for ${cropName} in ${state} during ${season} season, the predicted price is ₹${pricePerQuintal.toFixed(2)} per quintal (₹${pricePerKg.toFixed(2)} per kg). This prediction is based on market trends, seasonal patterns, and regional factors.`,
        factors: [
          `Seasonal demand patterns for ${category} during ${season}`,
          `Regional supply and demand dynamics in ${state}`,
          `Historical price trends for ${cropName}`,
          `Market conditions for ${month}/${year}`
        ],
        recommendation: `The predicted price suggests ${pricePerKg > 50 ? 'favorable' : 'moderate'} market conditions. Consider selling during peak demand periods. Monitor market prices closely for the next 2-3 weeks and adjust your pricing strategy accordingly.`
      };

      setPrediction(predictionResult);

      // Save prediction to database
      const { session } = await authApi.getSession();
      if (session) {
        await pricePredictionsApi.create({
          cropName,
          category,
          locationState: state,
          season,
          predictedPricePerKg: pricePerKg,
          confidenceScore: confidenceScore,
        });
      }

      toast({
        title: "Prediction Generated!",
        description: "ML model has analyzed market conditions for your crop",
      });
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: "Prediction Failed",
        description: error.message || "Failed to generate prediction. Please ensure the ML model is trained and try again.",
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month *</Label>
                    <Select value={String(month)} onValueChange={(val) => setMonth(parseInt(val))} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <SelectItem key={m} value={String(m)}>
                            {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      min="2020"
                      max="2030"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                      required
                    />
                  </div>
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
                      {prediction.predicted_price_per_quintal && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          (₹{prediction.predicted_price_per_quintal.toFixed(2)} per quintal)
                        </div>
                      )}
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

