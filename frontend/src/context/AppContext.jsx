import axios from "axios";
import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendurl = "http://localhost:3000";

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      setIsCheckingAuth(true);

      const res = await axios.get(
        `${backendurl}/api/auth/is-auth`,
        { withCredentials: true }
      );

      if (res.data.success && res.data.user) {
        console.log(res.data.user);
        setUser(res.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error(
        "Auth check failed:",
        error?.response?.data?.message || error.message
      );
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  }, [backendurl]);

  const getAllEvents = async () => {
    try {
      setIsLoadingEvents(true);

      const res = await axios.get(
        `${backendurl}/api/events`,
        { withCredentials: true }
      );

      if (res.data.success) {
        setEvents(res.data.events || []);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error(
        "Failed to fetch events:",
        error?.response?.data?.message || error.message
      );
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      await checkAuth();
    };
    initApp();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      getAllEvents();
    } else {
      setEvents([]);
    }
  }, [isAuthenticated]);

  const value = {
    backendurl,

    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    isCheckingAuth,
    checkAuth,
    events,
    setEvents,
    isLoadingEvents,
    getAllEvents,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
