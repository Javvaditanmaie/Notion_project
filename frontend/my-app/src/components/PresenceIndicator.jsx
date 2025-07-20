import React, { useEffect, useState } from "react";

export default function PresenceIndicator({ awareness }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!awareness) return;

    const updateUsers = () => {
      const states = Array.from(awareness.getStates().values());
      const online = states.map((state) => state.user).filter(Boolean);
      setUsers(online);
    };

    awareness.on("change", updateUsers);
    updateUsers(); // initial fetch

    return () => awareness.off("change", updateUsers);
  }, [awareness]);

  if (!users.length) {
    return (
      <div className="mt-3 text-sm text-gray-600 italic">
        No one else is viewing.
      </div>
    );
  }

  return (
    <div className="mt-3 text-sm text-gray-700 flex items-center gap-3 flex-wrap">
      <span className="font-medium">Currently viewing:</span>
      {users.map((user, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: user.color }}
          ></span>
          <span>{user.name}</span>
        </div>
      ))}
    </div>
  );
}
