import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import UserAvatar from "@/components/UserAvatar";

const Navbar = ({ isAuthenticated, userRole }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
              <UserAvatar />
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

