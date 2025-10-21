import apiClient from "@/lib/apiClient";
import { useAppStore } from "@/stores/useAppStore";
import { GET_USER_INFO } from "@/utils/constants";
import { useEffect, useState } from "react";

const useAuth = () => {
  const { userInfo, logout, setUser } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await apiClient.get(GET_USER_INFO);
        let user = response.data;
        // If backend returns { user: { ... } }, extract user
        if (user && user.user) user = user.user;
        if (response.status === 200 && user && user._id) {
          setUser(user);
          console.log("User data fetched:", user);
        } else {
          logout();
          setUser(undefined);
        }
      } catch {
        setUser(undefined);
      } finally {
        setLoading(false);
      }
    };

    if (!userInfo) {
      getUserData();
    } else {
      setLoading(false);
    }

    return () => {};
  }, [userInfo, setUser, logout]);
  return { userInfo, loading };
};

export default useAuth;
export { useAuth };
