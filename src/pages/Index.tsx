import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Users, TrendingUp, Truck, MessageSquare, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-farmland.jpg";
import { useTranslation } from "react-i18next";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"farmer" | "buyer" | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        // Get user role
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setUserRole(data.role);
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setUserRole(data.role);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} userRole={userRole} />

      {/* Hero Section */}
      <section 
        className="relative h-[600px] bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
        <div className="container mx-auto px-4 relative z-10 text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-3xl">
            {t("home.heroTitle")}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl opacity-95">
            {t("home.heroSubtitle")}
          </p>
          <div className="flex gap-4">
            <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}>
              {t("home.getStarted")}
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur border-white hover:bg-white/20 text-white" onClick={() => navigate("/marketplace")}>
              {t("home.browseMarket")}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t("home.features")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering farmers and connecting them with buyers across India
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t("home.directSales")}</CardTitle>
                <CardDescription>
                  {t("home.directSalesDesc")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t("home.pricePrediction")}</CardTitle>
                <CardDescription>
                  {t("home.pricePredictionDesc")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Truck className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t("home.transportation")}</CardTitle>
                <CardDescription>
                  {t("home.transportationDesc")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t("home.aiAssistant")}</CardTitle>
                <CardDescription>
                  {t("home.aiAssistantDesc")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Trust & Transparency</CardTitle>
                <CardDescription>
                  Rating system and verified profiles ensure trustworthy transactions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Sprout className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Regional Search</CardTitle>
                <CardDescription>
                  Find crops by location, variety, and price range across all Indian states
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-primary mb-2">{t("home.commissionValue")}</div>
              <div className="text-xl text-muted-foreground">{t("home.commission")}</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">{t("home.supportValue")}</div>
              <div className="text-xl text-muted-foreground">{t("home.support")}</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">{t("home.coverageValue")}</div>
              <div className="text-xl text-muted-foreground">{t("home.coverage")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {t("home.ctaTitle")}
          </h2>
          <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto">
            {t("home.ctaDesc")}
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}>
            {t("home.createAccount")}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>{t("home.footer")}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;