import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    if (!user) {
      axios
        .get('/profile')
        .then(({ data }) => {
          setUser(data);
          setReady(true);
          setLoading(false); // Set loading to false after the data is fetched
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          setLoading(false); // Set loading to false in case of an error
        });
    }
  }, [user]);

  // Render loading state while waiting for the data
  if (loading) {
    return 'Loading...';
  }

  return (
    <UserContext.Provider value={{ user, setUser, ready, setReady}}>
      {children}
    </UserContext.Provider>
  );
}