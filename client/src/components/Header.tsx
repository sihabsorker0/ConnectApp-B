import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu,
  Search,
  Video,
  User,
  LogIn,
  LogOut,
  Settings,
} from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown"; // Added import
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEFAULT_AVATAR } from "@/lib/constants";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logoutMutation } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background z-50 border-b border-border shadow-sm">
      <div className="container mx-auto h-full px-4">
        <div className="flex items-center justify-between h-full">
          {/* Logo and menu */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-4"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link href="/" className="flex items-center space-x-2">
              <span className="text-primary text-2xl font-bold">
                Lo<span className="text-foreground">go</span>
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-3xl mx-8"
          >
            <div className="relative w-full flex">
              <Input
                type="text"
                placeholder="Search videos, channels, and more"
                className="w-full rounded-l-full border-r-0 focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                className="rounded-l-none rounded-r-full"
                variant="secondary"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/upload")}
            >
              <Video className="h-5 w-5" />
            </Button>

            <NotificationsDropdown /> {/* Added NotificationsDropdown */}

            <div className="flex items-center space-x-2">
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
              <span className="text-xs hidden sm:inline">
                {theme === "dark" ? "Dark" : "Light"}
              </span>
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src={user.avatar || DEFAULT_AVATAR}
                      alt={user.displayName}
                    />
                    <AvatarFallback>
                      {user.displayName?.charAt(0) || (
                        <User className="h-5 w-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href={`/channel/${user.username}`}>
                      <span className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span
                      className="flex items-center"
                      onClick={() => navigate("/settings")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>
                      {logoutMutation.isPending ? "Logging out..." : "Log out"}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleLogin}
                variant="secondary"
                size="sm"
                className="flex items-center"
              >
                <LogIn className="mr-2 h-4 w-4" />
                <span>Log in</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}