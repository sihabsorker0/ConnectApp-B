import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import { UploadProgress } from "./components/UploadProgress";

// Pages
import Home from "./pages/Home";
import VideoPage from "./pages/VideoPage";
import ChannelPage from "./pages/ChannelPage";
import UploadPage from "./pages/UploadPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import ExplorePage from "./pages/ExplorePage";
import LibraryPage from "./pages/LibraryPage";
import LikedVideosPage from "./pages/LikedVideosPage";
import WatchLaterPage from "./pages/WatchLaterPage";
import HelpPage from "./pages/HelpPage";
import FeedbackPage from "./pages/FeedbackPage";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { UploadProvider } from "@/hooks/use-upload";
import { ProtectedRoute, AdminProtectedRoute } from "@/lib/protected-route";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLogin from "./pages/admin/Login";
import AdminVideos from "./pages/admin/Videos";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";

function Router() {
  const [location] = useLocation();
  
  // Check if the current path is an admin route
  const isAdminRoute = location.startsWith('/admin');
  
  // If it's an admin route, use the admin layout (except for login)
  if (isAdminRoute) {
    if (location === '/admin/login') {
      return (
        <Switch>
          <Route path="/admin/login" component={AdminLogin} />
        </Switch>
      );
    }
    
    return (
      <AdminLayout>
        <Switch>
          <AdminProtectedRoute path="/admin" component={AdminDashboard} />
          <AdminProtectedRoute path="/admin/videos" component={AdminVideos} />
          <AdminProtectedRoute path="/admin/users" component={AdminUsers} />
          <AdminProtectedRoute path="/admin/settings" component={AdminSettings} />
          {/* Additional admin routes can be added here */}
          <Route component={NotFound} />
        </Switch>
      </AdminLayout>
    );
  }
  
  // For the auth page, don't use the standard layout
  if (location === '/auth') {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
      </Switch>
    );
  }
  
  // Otherwise use the standard layout
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/watch" component={VideoPage} />
        <Route path="/channel/:username" component={ChannelPage} />
        <Route path="/explore" component={ExplorePage} />
        <ProtectedRoute path="/upload" component={UploadPage} />
        <ProtectedRoute path="/subscriptions" component={SubscriptionsPage} />
        <ProtectedRoute path="/history" component={HistoryPage} />
        <ProtectedRoute path="/library" component={LibraryPage} />
        <ProtectedRoute path="/liked-videos" component={LikedVideosPage} />
        <ProtectedRoute path="/watch-later" component={WatchLaterPage} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <Route path="/help" component={HelpPage} />
        <Route path="/feedback" component={FeedbackPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UploadProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <UploadProgress />
          </TooltipProvider>
        </UploadProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
