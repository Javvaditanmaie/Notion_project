import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import DocumentNavbar from "../components/DocumentNavbar";

function DocumentPage() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState("no-access");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "documents", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "Untitled Page");
          setAccess(data.access || "no-access");
        } else {
          setAccess("no-access");
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setAccess("no-access");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (access === "no-access") {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <span className="text-xl font-semibold">🚫</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">No access to this page</h2>
        <p className="text-gray-600 mb-4">
          You don't have permission to view this document.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <DocumentNavbar docId={id} />

      {editingTitle ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={async () => {
            setEditingTitle(false);
            if (title.trim()) {
              await updateDoc(doc(db, "documents", id), {
                title: title.trim(),
              });
            }
          }}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              setEditingTitle(false);
              if (title.trim()) {
                await updateDoc(doc(db, "documents", id), {
                  title: title.trim(),
                });
              }
            }
          }}
          className="text-2xl font-semibold mb-4 border-b focus:outline-none w-full"
        />
      ) : (
        <h1
          className="text-2xl font-semibold mb-4 cursor-pointer"
          onClick={() => setEditingTitle(true)}
        >
          {title}
        </h1>
      )}

      <p className="text-gray-500">
        {access === "edit" ? "📝 You can edit this document." : "👁️ You can only view this document."}
      </p>
    </div>
  );
}

export default DocumentPage;
