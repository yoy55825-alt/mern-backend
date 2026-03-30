import { useContext } from "react";
import { UserContext } from "../context/userContext";
import { Navigate, Outlet } from "react-router-dom";

const RequiredRole = ({ allowedRole }) => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <div>loading...</div>;
  }

  if (!allowedRole.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RequiredRole;
