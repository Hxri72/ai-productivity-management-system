import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import Loader from "../components/ui/Loader";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
