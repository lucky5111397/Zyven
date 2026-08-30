import { useEffect, useState, useRef } from "react";
import { Route, Routes } from "react-router-dom";
import axios from "axios";
import Home from "./pages/Home";
import Generate from "./pages/Generate";
import { useDispatch, useSelector } from "react-redux";
import {
  setallComponents,
  setUserData,
} from "./redux/userSlice";
import AdminDashboard from "./pages/AdminDashboard";
import AllComponents from "./pages/AllComponents";
import MyComponents from "./pages/MyComponents";
import Pricing from "./pages/Pricing";
import { getRedirectResult, onAuthStateChanged } from "firebase/auth";
import { auth } from "./utils/firebase";
import { Toaster } from "react-hot-toast";

export const serverURL = "http://localhost:8000";

function App() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const [authChecked, setAuthChecked] = useState(false);

  // Track if we have already successfully initialized the auth session
  const isInitialized = useRef(false);
  // Track if a sync with the backend is currently in progress
  const isSyncing = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Prevent overlapping syncs if Firebase fires multiple state changes rapidly
      if (isSyncing.current) return;
      isSyncing.current = true;

      try {
        let userToLogin = firebaseUser;

        // 1. If this is the initial load, wait for redirect result.
        // It might contain the user even if firebaseUser is initially null.
        if (!isInitialized.current) {
          try {
            const redirectResult = await getRedirectResult(auth);
            if (redirectResult && redirectResult.user) {
              userToLogin = redirectResult.user;
            }
          } catch {
            // Silently ignore expected redirect cancellation errors
          }
        }

        // 2. Check if the backend already has an active session
        let backendUser = null;
        try {
          const userRes = await axios.get(`${serverURL}/api/user/current-user`, {
            withCredentials: true,
          });
          backendUser = userRes.data;
        } catch {
          // 401 Unauthorized expected if no session exists
        }

        // 3. If Firebase has a user but backend doesn't, authenticate the backend
        if (!backendUser && userToLogin) {
          await axios.post(
            `${serverURL}/api/auth/google`,
            {
              name: userToLogin.displayName || userToLogin.email,
              email: userToLogin.email,
            },
            { withCredentials: true }
          );

          // Verify the backend session was created successfully
          const newUserRes = await axios.get(`${serverURL}/api/user/current-user`, {
            withCredentials: true,
          });
          backendUser = newUserRes.data;
        }

        // 4. Finalize state
        if (backendUser) {
          dispatch(setUserData(backendUser));
        } else {
          dispatch(setUserData(null));
        }

        isInitialized.current = true;
      } catch {
        // Catch any unexpected network/server errors during initialization
      } finally {
        isSyncing.current = false;
        setAuthChecked(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  useEffect(() => {
    const fetchAllComponents = async () => {
      try {
        const componentsRes = await axios.get(
          `${serverURL}/api/component/all-components`,
          { withCredentials: true }
        );
        dispatch(setallComponents(componentsRes.data?.components || componentsRes.data));
      } catch {
        dispatch(setallComponents([]));
      }
    };

    fetchAllComponents();
  }, [userData, dispatch]);

  return (
    <>
      {!authChecked && (
        <div className="fixed top-0 left-0 w-full h-1 bg-[#35ebff] animate-pulse z-50"></div>
      )}

      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/component" element={<AllComponents />} />
        <Route path="/mycomponents" element={<MyComponents />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </>
  );
}

export default App;