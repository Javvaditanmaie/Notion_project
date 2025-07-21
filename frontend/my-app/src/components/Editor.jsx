import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import BulletList from "@tiptap/extension-bullet-list";
import CodeBlock from "@tiptap/extension-code-block";
import TextAlign from "@tiptap/extension-text-align";

import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { Mark } from "@tiptap/core";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { debounce } from "lodash";
import DocumentNavbar from "../components/DocumentNavbar";
import { BubbleMenuComponent, CommentMark } from "./BubbleMenu";
import "../App.css";
import PresenceIndicator from "../components/PresenceIndicator";

// Custom FontSize Mark
const FontSize = Mark.create({
  name: "fontSize",
  addAttributes() {
    return { size: { default: "16px" } };
  },
  parseHTML() {
    return [{ style: "font-size" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", { style: `font-size: ${HTMLAttributes.size}` }, 0];
  },
  addCommands() {
    return {
      setFontSize: (size) => ({ commands }) =>
        commands.setMark(this.name, { size }),
    };
  },
});

export default function Editor() {
  const { docId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [showToolbar, setShowToolbar] = useState(false);
  const hasInitializedContent = useRef(false);

  const ydoc = useMemo(() => new Y.Doc(), [docId]);
  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("reloaded");

    if (!hasReloaded) {
      sessionStorage.setItem("reloaded", "true");
      window.location.reload();
    } else {
      sessionStorage.removeItem("reloaded");
    }
  }, []);

  const provider = useMemo(() => {
    return docId
      ? new WebrtcProvider(`document-${docId}`, ydoc, {
          signaling: ["ws://localhost:4444"],
        })
      : null;
  }, [docId, ydoc]);
  const awareness = provider?.awareness;
  const editor = useEditor({
    editable: false,
    autofocus: true,
    extensions: [
      StarterKit.configure({ codeBlock: false,heading: { levels: [1, 2] },}),
      BulletList,
      CodeBlock,
      Underline,
      Link.configure({ openOnClick: false }),
      
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      FontSize,
      CommentMark,
      Collaboration.configure({ document: ydoc }),
      CollaborationCaret.configure({
        provider,
        user: {
          name: currentUser?.email || "Anonymous",
          color: "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"),
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[500px] border border-gray-300 p-4 rounded bg-white focus:outline-none scrollbar-hide",
        spellCheck: "false",
      },
    },
    content: "",
  });
  useEffect(() => {
  if (!provider || !currentUser) return;

  const userColor =
    "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");

  provider.awareness.setLocalStateField("user", {
    name: currentUser.email || "Anonymous",
    color: userColor,
  });
if (editor && currentUser) {
  editor.options.userName = currentUser.email || "Anonymous";
}
  return () => {
    provider.awareness.setLocalStateField("user", null);
  };
}, [provider, currentUser]);


  // Load document content and JWT
  useEffect(() => {
    const loadInitialContent = async () => {
      if (!currentUser || !editor) return;

      try {
        const idToken = await currentUser.getIdToken();
        const { data } = await axios.post("http://localhost:5000/api/token", {}, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setJwt(data.token);

        const res = await axios.get(`http://localhost:5000/api/docs/${docId}`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });

        const found = res.data;
        const isOwner = found.owner === currentUser.uid;
        const isEditable = isOwner || found.access === "edit";

        editor.setEditable(isEditable);
        setDoc(found);

        if (!hasInitializedContent.current && editor.isEmpty) {
          editor.commands.setContent(found.content || "");
          hasInitializedContent.current = true;
        }
      } catch (err) {
        console.error("❌ Access error:", err);
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    };

    loadInitialContent();
    return () => provider?.destroy();
  }, [currentUser, editor, docId]);

  // Auto-save logic on Yjs updates
  useEffect(() => {
    if (!editor || !jwt || !docId || !ydoc) return;

    const saveToBackend = debounce(() => {
      const html = editor.getHTML();
      axios.put(`http://localhost:5000/api/docs/${docId}`, {
        content: html,
      }, {
        headers: { Authorization: `Bearer ${jwt}` },
      }).catch((err) => console.error("❌ Auto-save failed:", err));
    }, 2000);

    ydoc.on("update", saveToBackend);
    return () => ydoc.off("update", saveToBackend);
  }, [editor, jwt, docId, ydoc]);

  const handleAccessUpdate = (level) => {
    if (doc?.owner === currentUser?.uid) {
      setDoc((prev) => ({ ...prev, access: level }));
      editor?.setEditable(level === "edit");
    }
  };

  const increaseFont = () => {
    const newSize = Math.min(fontSize + 2, 48);
    setFontSize(newSize);
    editor?.chain().focus().setFontSize(`${newSize}px`).run();
  };

  const decreaseFont = () => {
    const newSize = Math.max(fontSize - 2, 10);
    setFontSize(newSize);
    editor?.chain().focus().setFontSize(`${newSize}px`).run();
  };

  if (loading || !editor) return <div>Loading...</div>;
  if (accessDenied) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl">Access Denied</h2>
        <button
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      onClick={() => navigate("/")}
    >
      Back to Dashboard
    </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        {doc?.owner === currentUser?.uid ? (
  <DocumentNavbar
    docId={docId}
    accessLevel={doc.access}
    setAccessLevel={handleAccessUpdate}
  />
) : (
  <div className="text-center mt-6">
    <button
      className="btn-back"
      onClick={() => navigate("/dashboard")}
    >
      Back to Dashboard
    </button>
  </div>
)}

        


        {(editor.isEditable || doc?.owner === currentUser?.uid) ? (
          <input
            value={doc?.title || ""}
            onChange={(e) => setDoc((prev) => ({ ...prev, title: e.target.value }))}
            onBlur={async () => {
              try {
                await axios.put(`http://localhost:5000/api/docs/${docId}`, { title: doc.title }, {
                  headers: { Authorization: `Bearer ${jwt}` },
                });
              } catch (err) {
                console.error("❌ Title save failed:", err);
              }
            }}
            className="text-3xl font-bold mb-6 w-full text-center"
            placeholder="Untitled Document"
          />
        ) : (
          <div className="text-center mb-6">
    <h1 className="text-3xl font-bold mb-6">{doc?.title || "Untitled"}</h1>

    {/* Back to Dashboard Button */}
    {/* <div className="text-center">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => navigate("/")}
      >
        Back to Dashboard
      </button>
    </div> */}
  </div>
           
        )}

        {editor.isEditable && (
          <div className="text-center mb-4">
            <button onClick={() => setShowToolbar(!showToolbar)} className="btn-toolbar">
              {showToolbar ? "Hide Toolbar" : "Show Toolbar"}
            </button>
            {showToolbar && (
              <div className="mt-3 flex flex-wrap justify-center gap-2 bg-white p-2 border rounded shadow">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className="btn-tools">B</button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className="btn-tools">I</button>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="btn-tools">U</button>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="btn-tools">•</button>
                <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className="btn-tools">Left</button>
                <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className="btn-tools">Center</button>
                <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className="btn-tools">Right</button>
                <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="btn-tools">{`</>`}</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="btn-tools">H2</button>
                <button onClick={increaseFont} className="btn-tools">A+</button>
                <button onClick={decreaseFont} className="btn-tools">A-</button>
              </div>
            )}
          </div>
        )}

        <div className="max-h-[500px] overflow-y-auto border rounded p-2 scrollbar-hide">
          <EditorContent editor={editor} />
          <BubbleMenuComponent editor={editor} />
          <PresenceIndicator awareness={awareness} />
        </div>
        
      </div>
    </div>
  );
}
