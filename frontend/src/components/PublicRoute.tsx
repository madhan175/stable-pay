interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute - No redirects, always allows access
 * Removed all redirect logic - users can access any page regardless of login status
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  // Always allow access - no redirects
  return <>{children}</>;
};

export default PublicRoute;

