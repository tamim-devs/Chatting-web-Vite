import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

const PrivateRoute = ({ children }) => {
  const auth = getAuth();
  const [user, setUser] = useState(undefined); // ⚠️ IMPORTANT

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsub();
  }, []);

  // 🔄 auth checking
  if (user === undefined) {
    return null; // or loader
  }

  // ❌ not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ logged in
  return children;
};

export default PrivateRoute;
