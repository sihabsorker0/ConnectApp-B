import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Redirect, Route } from 'wouter';

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}

export function AdminProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // Check if admin is authenticated by looking at localStorage/sessionStorage
  const isAdminAuthenticated = () => {
    const adminAuth = localStorage.getItem('adminAuth') || sessionStorage.getItem('adminAuth');
    if (!adminAuth) return false;
    
    try {
      const auth = JSON.parse(adminAuth);
      return auth && auth.isAdmin;
    } catch (e) {
      return false;
    }
  };
  
  const adminAuthed = isAdminAuthenticated();

  if (!adminAuthed) {
    return (
      <Route path={path}>
        <Redirect to="/admin/login" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
