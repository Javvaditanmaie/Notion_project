import { BubbleMenu } from "@tiptap/react/menus";
import { useState } from "react";
import { Mark } from "@tiptap/core";
import "../App.css"

export const CommentMark = Mark.create({
  name: "comment",
  addAttributes() {
    return {
      text: { default: "" },
      color: { default: "yellow" },
      user: { default: "" }, 
    };
  },
  parseHTML() {
    return [
      {
        tag: "span[data-comment]",
        getAttrs: (node) => {
          if (typeof node === "string") return false;
          return {
            text: node.getAttribute("data-comment"),
            user: node.getAttribute("data-user") || "",
            color: node.style.backgroundColor || "yellow",
          };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        "data-comment": HTMLAttributes.text,
        "data-user": HTMLAttributes.user,
        title: `${HTMLAttributes.text} (by ${HTMLAttributes.user})`,
        style: `background-color: ${HTMLAttributes.color}; cursor: pointer;`,
      },
      0,
    ];
  },
  addCommands() {
    return {
      setComment:
        (text, color = "yellow", user = "") =>
        ({ commands }) =>
          commands.setMark(this.name, { text, color, user }),
      unsetComment:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

export function BubbleMenuComponent({ editor }) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");

  if (!editor) return null;

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const userName = editor?.options?.userName || "Anonymous";
    editor
      .chain()
      .focus()
      .setComment(commentText, "yellow", userName)
      .run();

    setCommentText("");
    setShowCommentInput(false);
  };

  const handleRemoveComment = () => {
    editor.chain().focus().unsetComment().run();
  };

  return (
    <BubbleMenu editor={editor} tippyOptions={{ placement: "bottom", offset: [0, 8] }}>
      <div className="bubble-menu flex flex-col gap-2 bg-white shadow-md border rounded px-3 py-2">
        <div className="flex gap-2">
          <button onClick={() => editor.chain().focus().toggleBold().run()} type="button">
            <strong>B</strong>
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} type="button">
            <em>I</em>
          </button>
          <button onClick={() => setShowCommentInput((prev) => !prev)} type="button">
            💬 comment
          </button>
          <button onClick={handleRemoveComment} type="button">
            ❌ Remove
          </button>
        </div>
        {showCommentInput && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Type a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="border px-2 py-1 rounded"
            />
            <button
              onClick={handleAddComment}
              className="btn-add"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </BubbleMenu>
  );
}
