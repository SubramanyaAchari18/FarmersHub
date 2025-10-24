import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  isAuthenticated?: boolean;
  userRole?: "farmer" | "buyer" | null;
}

const Navbar = ({ isAuthenticated, userRole }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
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

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to={userRole === "farmer" ? "/farmer-dashboard" : "/buyer-dashboard"}>
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="ghost">Marketplace</Button>
              </Link>
              <Link to="/price-prediction">
                <Button variant="ghost">Price Prediction</Button>
              </Link>
              <Link to="/chatbot">
                <Button variant="ghost">AI Assistant</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/auth">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;