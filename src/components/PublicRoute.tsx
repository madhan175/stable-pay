import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute - Guards routes that should only be accessible when NOT logged in
 * Redirects logged-in users to the dashboard
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, check what they should access
  if (user) {
    // Check if user needs to complete onboarding (phone not verified OR KYC not done)
    const needsOnboarding = !user.phone_verified || user.kyc_status === 'none' || user.kyc_status === 'pending';
    
    if (needsOnboarding) {
      // User needs to complete onboarding - ALWAYS allow access to onboarding/KYC pages
      // This ensures they can complete the verification flow even if user data exists
      const currentPath = window.location.pathname;
      if (currentPath === '/onboarding' || currentPath === '/kyc' || currentPath === '/') {
        return <>{children}</>;
      }
      // Otherwise redirect to onboarding to complete setup
      return <Navigate to="/onboarding" replace />;
    }

    // User is fully logged in and verified
    const currentPath = window.location.pathname;
    
    // Always redirect login/intro pages away (these should never be accessed when logged in)
    if (currentPath === '/login' || currentPath === '/intro') {
      return <Navigate to="/home" replace />;
    }
    
    // For onboarding page: If user has COMPLETED both phone verification AND KYC,
    // they should NEVER be able to access onboarding again - redirect immediately
    if ((currentPath === '/onboarding' || currentPath === '/')) {
      if (user.phone_verified && user.kyc_status === 'verified') {
        // User is fully set up and data is in Supabase - prevent access to onboarding
        return <Navigate to="/home" replace />;
      }
    }
    
    // Otherwise allow access (they're in the middle of onboarding)
    return <>{children}</>;
  }

  // User is not logged in, allow access to public routes
  return <>{children}</>;
};

export default PublicRoute;

