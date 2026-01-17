import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { ref, set, onDisconnect, onValue } from "firebase/database";
import { auth, db } from "../../configuration/firebaseConfig";
import HomeLeft from "../HomeComponents/HomeLeft/HomeLeft";

const RootLayout = () => {
  useEffect(() => {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;

    const connectedRef = ref(db, ".info/connected");
    const onlineRef = ref(db, `users/${uid}/online`);

    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === false) return;

      // user online
      set(onlineRef, true);

      // auto offline on disconnect
      onDisconnect(onlineRef).set(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen">
      <HomeLeft />
      <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
