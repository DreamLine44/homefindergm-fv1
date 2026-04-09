import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { timeAgo, getInitials } from "../../utils/helpers";
import Button from "../common/Button";
import Modal from "../common/Modal";
import {
  likeComment,
  deleteComment, updateComment, replyComment,
} from "../../api/commentApi";
import { createReport } from "../../api/reportApi";

const REPORT_REASONS = ["Spam", "Harassment", "Inappropriate Content", "Misinformation", "Other"];

// Safely get avatar URL from {url, publicId} object or plain string
const avatarSrc = (avatar) => avatar?.url || (typeof avatar === "string" ? avatar : null);

export default function CommentItem({ comment, postId, onRefresh, depth = 0 }) {
  const { user } = useAuth();
  const [replying,   setReplying]   = useState(false);
  const [editing,    setEditing]    = useState(false);
  const [editText,   setEditText]   = useState(comment.text || comment.content || "");
  const [replyText,  setReplyText]  = useState("");
  const [loading,    setLoading]    = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ reason: "Spam", details: "" });
  const [reporting,  setReporting]  = useState(false);

  // Backend populates either comment.author or comment.userId — check both
  const authorObj =
    (comment.author && typeof comment.author === "object" ? comment.author : null) ||
    (comment.userId && typeof comment.userId === "object" ? comment.userId : null) ||
    {};

  const authorId = authorObj?._id || comment.author || comment.userId;
  const userId   = user?._id || user?.id;
  const isOwner  = user && userId && String(userId) === String(authorId);

  // Real name from populated object, fall back to email prefix
  const displayName = authorObj?.firstName
    ? `${authorObj.firstName} ${authorObj.lastName || ""}`.trim()
    : authorObj?.username || authorObj?.email?.split("@")[0] || "User";

  const src         = avatarSrc(authorObj?.avatar);
  const displayText = comment.text || comment.content || "";

  const handleLike = async () => {
    try { await likeComment(comment._id); onRefresh(); } catch (e) {}
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    try { await deleteComment(postId, comment._id); onRefresh(); } catch (e) {}
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    setLoading(true);
    try {
      await updateComment(postId, comment._id, { text: editText });
      setEditing(false);
      onRefresh();
    } catch (e) {} finally { setLoading(false); }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      await replyComment(postId, comment._id, { text: replyText });
      setReplyText("");
      setReplying(false);
      onRefresh();
    } catch (e) {} finally { setLoading(false); }
  };

  const handleReport = async () => {
    if (!reportForm.details.trim()) { alert("Please describe the issue."); return; }
    setReporting(true);
    try {
      await createReport({
        targetId:   comment._id,
        targetType: "comment",
        reason:     reportForm.reason,
        details:    reportForm.details,
      });
      setReportOpen(false);
      setReportForm({ reason: "Spam", details: "" });
      alert("Report submitted. Thank you.");
    } catch (e) {
      alert(e.response?.data?.message || "Failed to submit report.");
    } finally { setReporting(false); }
  };

  return (
    <div className={depth > 0 ? "ml-8 pl-4 border-l-2 border-stone-100" : ""}>
      <div className="flex gap-3 py-3">

        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold overflow-hidden">
          {src
            ? <img src={src} alt="" className="w-full h-full object-cover" />
            : getInitials(displayName)}
        </div>

        <div className="flex-1 min-w-0">

          {/* Author name + time */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-medium text-stone-800">{displayName}</span>
            <span className="text-xs text-stone-400">{timeAgo(comment.createdAt)}</span>
          </div>

          {/* Comment text — proper wrapping, no overflow mess */}
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm outline-none resize-none focus:border-brand-400"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit} loading={loading}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-700 break-words whitespace-pre-wrap leading-relaxed max-w-prose">
              {displayText}
            </p>
          )}

          {/* Action buttons — larger tap targets for mobile */}
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50 min-w-[40px]"
            >
              ♥ <span>{comment.likes?.length || 0}</span>
            </button>

            {user && !editing && (
              <button
                onClick={() => setReplying(!replying)}
                className="text-xs text-stone-500 hover:text-brand-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-brand-50"
              >
                Reply
              </button>
            )}

            {isOwner && !editing && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-stone-500 hover:text-brand-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-brand-50"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs text-stone-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </>
            )}

            {/* Report — only for other logged-in users, never for own comment */}
            {user && !isOwner && !editing && (
              <button
                onClick={() => setReportOpen(true)}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
              >
                🚩 Report
              </button>
            )}
          </div>

          {/* Reply box */}
          {replying && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                placeholder="Write a reply…"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm outline-none resize-none focus:border-brand-400"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply} loading={loading}>Post Reply</Button>
                <Button size="sm" variant="ghost" onClick={() => setReplying(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply._id}
          comment={reply}
          postId={postId}
          onRefresh={onRefresh}
          depth={depth + 1}
        />
      ))}

      {/* Report Modal */}
      <Modal isOpen={reportOpen} onClose={() => setReportOpen(false)} title="Report Comment">
        <div className="space-y-4">
          <p className="text-sm text-stone-600">Tell us what's wrong with this comment.</p>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Reason</label>
            <select
              value={reportForm.reason}
              onChange={(e) => setReportForm((f) => ({ ...f, reason: e.target.value }))}
              className="px-3 py-2.5 rounded border border-stone-300 text-sm outline-none bg-white"
            >
              {REPORT_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Details</label>
            <textarea
              value={reportForm.details}
              onChange={(e) => setReportForm((f) => ({ ...f, details: e.target.value }))}
              rows={3}
              placeholder="Describe the issue…"
              className="px-3 py-2.5 rounded border border-stone-300 text-sm outline-none resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReport} loading={reporting} className="flex-1">Submit</Button>
            <Button variant="outline" onClick={() => setReportOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
