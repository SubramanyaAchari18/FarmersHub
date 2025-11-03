import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface NavbarProps {
  isAuthenticated?: boolean;
  userRole?: "farmer" | "buyer" | null;
}

const Navbar = ({ isAuthenticated, userRole }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: t("common.success"),
      description: "You have been logged out successfully",
    });
    navigate("/");
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="bg-primary p-2 rounded-lg">
            <Sprout className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-primary">Farmer Hub</span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              <Link to={userRole === "farmer" ? "/farmer-dashboard" : "/buyer-dashboard"}>
                <Button variant="ghost">{t("nav.dashboard")}</Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="ghost">{t("nav.marketplace")}</Button>
              </Link>
              <Link to="/price-prediction">
                <Button variant="ghost">{t("nav.pricePrediction")}</Button>
              </Link>
              <Link to="/chatbot">
                <Button variant="ghost">{t("nav.aiAssistant")}</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t("nav.logout")}
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost">{t("nav.login")}</Button>
              </Link>
              <Link to="/auth">
                <Button>{t("nav.signup")}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;