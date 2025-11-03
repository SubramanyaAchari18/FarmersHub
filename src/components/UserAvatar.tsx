import { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const UserAvatar = () => {
  const [userEmail, setUserEmail] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      } else {
        setUserEmail("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: t("common.success"),
      description: "You have been logged out successfully",
    });
    navigate("/");
  };

  const getInitial = (email: string) => {
    if (!email) return "U";
    const firstChar = email.charAt(0).toUpperCase();
    return firstChar;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
          aria-label="Account menu"
          aria-haspopup="menu"
        >
          <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {userEmail ? getInitial(userEmail) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
        role="menu"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Account</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer focus:bg-accent"
          role="menuitem"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("nav.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar;
