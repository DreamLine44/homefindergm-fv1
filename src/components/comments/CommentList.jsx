import { useState, useEffect, useRef } from "react";
import { getComments, createComment } from "../../api/commentApi";
import { useAuth } from "../../auth/useAuth";
import CommentItem from "./CommentItem";
import Button from "../common/Button";
import Loader from "../common/Loader";

export default function CommentList({ postId }) {
  const { user }  = useAuth();
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [text,     setText]     = useState("");
  const [posting,  setPosting]  = useState(false);

  // Ref on the section heading — we scroll here after posting so the user
  // sees their new comment (backend sorts newest-first, so it's at the top)
  const headingRef  = useRef(null);
  const justPosted  = useRef(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getComments(postId);
      setComments(res.data?.comments || res.data?.data || res.data || []);
    } catch (e) { setComments([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [postId]);

  // After reload triggered by a new post → scroll the heading into view
  // so the user sees their new comment at the top of the list
  useEffect(() => {
    if (justPosted.current && !loading) {
      justPosted.current = false;
      // Small delay ensures the DOM has repainted with the new comment
      setTimeout(() => {
        headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [comments, loading]);

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await createComment(postId, { text });
      setText("");
      justPosted.current = true;
      await load();
    } catch (e) {}
    finally { setPosting(false); }
  };

  return (
    <div>
      {/* Heading — used as the scroll target after a new comment is posted */}
      <h3 ref={headingRef} className="text-xl font-semibold text-stone-900 mb-4 scroll-mt-24">
        Comments{" "}
        {comments.length > 0 && (
          <span className="text-stone-400 text-base">({comments.length})</span>
        )}
      </h3>

      {/* Comments list — always first */}
      {loading ? (
        <Loader text="Loading comments..." />
      ) : (
        <div className="divide-y divide-stone-50">
          {comments.length === 0 ? (
            <p className="text-stone-400 text-sm py-4">No comments yet. Be the first!</p>
          ) : (
            comments.map((c) => (
              <CommentItem key={c._id} comment={c} postId={postId} onRefresh={load} />
            ))
          )}
        </div>
      )}

      {/* Comment form — always below comment texts */}
      {user && (
        <div className="mt-6 pt-6 border-t border-stone-100 space-y-3">
          <p className="text-sm font-medium text-stone-700">Leave a comment</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Share your thoughts…"
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none resize-none focus:border-brand-400 focus:ring-1 focus:ring-brand-300"
          />
          <Button onClick={handlePost} loading={posting} size="sm" className="w-full">Post Comment</Button>
        </div>
      )}
    </div>
  );
}
