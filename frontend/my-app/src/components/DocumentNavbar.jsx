import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiStar } from "react-icons/fi";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../App.css"
export default function DocumentNavbar({ docId }) {
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [starred, setStarred] = useState(false);
  const [accessLevel, setAccessLevel] = useState("no-access");
  const [copySuccess, setCopySuccess] = useState(false);
  
  const dropdownRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "documents", docId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setStarred(data.starred || false);
        setAccessLevel(data.access || "no-access");
      }
    };
    fetchData();
  }, [docId]);

  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  const handleAccessChange = async (value) => {
    setAccessLevel(value); 
    await updateDoc(doc(db, "documents", docId), { access: value }); 
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/doc/${docId}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const toggleStarred = async () => {
    const newStatus = !starred;
    setStarred(newStatus);
    await updateDoc(doc(db, "documents", docId), { starred: newStatus });
  };

  return (
    <div className="w-full flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm relative">
      <button
        onClick={() => navigate("/dashboard")}
        className="btn-backdashboard"
      >
        ← Back to Dashboard
      </button>

      <div className="flex items-center space-x-4">
       
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShareOpen((prev) => !prev)}
            className="btn-share"
          >
            Share
          </button>

          {shareOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow z-50 p-3">
              <p className="text-sm font-medium mb-2">Anyone with the link:</p>

              <div className="space-y-1 mb-3">
                {["view", "edit", "no-access"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="access"
                      value={opt}
                      checked={accessLevel === opt}
                      onChange={() => handleAccessChange(opt)}
                    />
                    <span className="capitalize">
                      {opt === "no-access" ? "Cannot access" : `Can ${opt}`}
                    </span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full bg-gray-100 hover:bg-gray-200 text-sm px-3 py-2 rounded"
              >
                {copySuccess ? "Copied!" : "Copy link"}
              </button>
            </div>
          )}
        </div>

        {/* Star Button */}
        {/* <button
          onClick={toggleStarred}
          className="ml-2 p-2 hover:bg-gray-100 rounded"
          title="Star"
        >
          <FiStar
            className={`w-5 h-5 ${starred ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`}
          />
        </button> */}
      </div>
    </div>
  );
}
