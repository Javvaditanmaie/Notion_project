import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardSidebar({ title, setTitle, handleCreate, docs, handleOpen, setShowFavorites }) {

  const { currentUser } = useAuth();

  return (
    <div className="w-80 bg-white border-r border-gray-300 p-6 overflow-y-auto h-screen shadow-lg">
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          👋 Welcome, {currentUser?.displayName || currentUser?.email?.split("@")[0]}
        </h2>
      </div>

      
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Menu</h3>
      <ul className="space-y-3 mb-6 text-base font-medium text-gray-800">
  <li
    className="cursor-pointer hover:text-blue-600"
    onClick={() => setShowFavorites(true)}
  >
    ⭐ Favorite Pages
  </li>
   <li
          className="cursor-pointer hover:text-blue-600"
          onClick={() => setShowFavorites(false)} 
        >
          📄 My Documents
        </li>
        
  
</ul>


      
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">Created Pages</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          {docs.length === 0 ? (
            <li className="text-gray-400">No pages yet</li>
          ) : (
            docs.map((doc) => (
              <li
                key={doc.id}
                className="cursor-pointer hover:text-blue-600 truncate"
                onClick={() => handleOpen(doc.id)}
              >
                {doc.title}
              </li>
            ))
          )}
        </ul>
      </div>

     
      <div>
        <input
          type="text"
          placeholder="New page title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={handleCreate} className="btn w-full">
          Create Page
        </button>
      </div>
    </div>
  );
}
