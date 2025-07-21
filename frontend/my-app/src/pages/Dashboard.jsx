import { auth } from "../firebase";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import DashboardSidebar from "../components/DashboardSidebar";

import "../style/dashboard.css";

import { FaRegStar, FaStar } from "react-icons/fa"; // ⭐️ Icons for favorite

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [jwt, setJwt] = useState(null);
  const { currentUser } = useAuth();
  const [showFavorites, setShowFavorites] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocs = async () => {
      if (!currentUser) return;

      try {
        const firebaseToken = await auth.currentUser.getIdToken(true);
        const jwtRes = await axios.post("http://localhost:5000/api/token", {}, {
          headers: {
            Authorization: `Bearer ${firebaseToken}`,
          },
        });

        const jwtToken = jwtRes.data.token;
        setJwt(jwtToken);

        const docsRes = await axios.get("http://localhost:5000/api/docs", {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        setDocs(docsRes.data);
      } catch (err) {
        console.error("❌ Error:", err.response?.data || err.message);
        alert("Authentication failed. Please login again.");
      }
    };

    fetchDocs();
  }, [currentUser]);

  const handleCreate = async () => {
    if (!title.trim()) return alert("Please enter a document title.");
    if (!jwt || !currentUser) return alert("User not authenticated.");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/docs",
        { title, content: "" },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      navigate(`/doc/${res.data.id}`);
    } catch (err) {
      alert("Failed to create document.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleDelete = async (id) => {
    try {
      const firebaseToken = await auth.currentUser.getIdToken(true);
      const jwtRes = await axios.post("http://localhost:5000/api/token", {}, {
        headers: {
          Authorization: `Bearer ${firebaseToken}`,
        },
      });

      const jwt = jwtRes.data.token;

      await axios.delete(`http://localhost:5000/api/docs/${id}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      setDocs(docs.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

  
  const toggleFavorite = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/docs/${id}/favorite`,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      setDocs((prev) =>
        prev.map((doc) =>
          doc.id === id ? { ...doc, favorite: res.data.favorite } : doc
        )
      );
    } catch (err) {
      console.error("❌ Toggle favorite failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex">
    
      <DashboardSidebar
  title={title}
  setTitle={setTitle}
  handleCreate={handleCreate}
  docs={docs}
  handleOpen={(id) => navigate(`/doc/${id}`)}
  setShowFavorites={setShowFavorites}
/>


      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Documents</h1>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {docs.length === 0 ? (
            <p className="text-gray-500 text-center">No documents found.</p>
          ) : (
            (showFavorites ? docs.filter((d) => d.favorite) : docs).map((doc) => (

              <div
                key={doc.id}
                className="bg-white shadow p-4 rounded flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-800 font-medium">{doc.title}</span>
                  <button onClick={() => toggleFavorite(doc.id)}>
                    {doc.favorite ? (
                      <FaStar className="text-yellow-400" />
                    ) : (
                      <FaRegStar className="text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="space-x-2">
                  <button
                    onClick={() => navigate(`/doc/${doc.id}`)}
                    className="btn-open"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
