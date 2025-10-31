import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute - No redirects, always allows access
 * Removed all redirect logic - users can access any page regardless of login status
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Always allow access - no redirects
  return <>{children}</>;
};

export default ProtectedRoute;

