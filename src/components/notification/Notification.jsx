import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, off } from "firebase/database";

const Notification = () => {
  const db = getDatabase();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const r = ref(db, "notifications");

    const unsubscribe = onValue(r, (snap) => {
      if (!snap.exists()) {
        setNotifications([]);
        return;
      }

      const arr = Object.entries(snap.val()).map(([id, v]) => ({
        id,
        ...v,
      }));

      arr.sort((a, b) => b.createdAt - a.createdAt);

      setNotifications(arr);
    });

    // 🔥 cleanup
    return () => off(r);
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>

      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className="border p-3 mb-2 rounded bg-white"
          >
            <p className="font-semibold">{n.userName}</p>
            <p className="text-sm text-gray-600">{n.text}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Notification;