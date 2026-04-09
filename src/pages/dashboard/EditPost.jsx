import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPost, updatePost, deletePostImage } from "../../api/postApi";
import PostForm from "../../components/posts/PostForm";
import Loader from "../../components/common/Loader";

export default function EditPost() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [post,       setPost]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [newImages,  setNewImages]  = useState([]);
  const [error,      setError]      = useState("");
  const [imgError,   setImgError]   = useState("");
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    getPost(id)
      .then((r) => {
        const data = r.data?.data || r.data?.post || r.data;
        if (!data || !data._id) { setFetchError("Listing not found."); return; }
        if (Array.isArray(data.features)) {
          data.features = data.features.join(",");
        }
        setPost(data);
      })
      .catch((e) => {
        setFetchError(
          e.response?.data?.msg || e.response?.data?.message || "Failed to load listing. Please try again."
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();

      Object.entries(formData).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined) fd.append(k, v);
      });

      newImages.forEach((img) => fd.append("images", img));

      await updatePost(id, fd);
      navigate("/dashboard/posts");
    } catch (e) {
      setError(e.response?.data?.msg || e.response?.data?.message || "Failed to update listing.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Remove this image from the listing?")) return;
    setImgError("");
    try {
      await deletePostImage(id, imageId);
      setPost((p) => ({
        ...p,
        images: p.images.filter((img) => img._id !== imageId)
      }));
    } catch (e) {
      setImgError(e.response?.data?.msg || e.response?.data?.message || "Failed to remove image.");
    }
  };

  const handleNewImageChange = (e) => {
    const existing = post?.images?.length || 0;
    const remaining = Math.max(0, 5 - existing - newImages.length);
    if (remaining <= 0) return;

    const added = Array.from(e.target.files).slice(0, remaining);
    setNewImages((prev) => [...prev, ...added]);

    e.target.value = "";
  };

  const removeNewImage = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  if (loading) return <Loader />;

  if (fetchError) {
    return (
      <div className="max-w-3xl animate-fade-up">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mb-6">
          Edit Listing
        </h1>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-4">
          <p className="text-red-700 font-medium">⚠️ {fetchError}</p>
          <p className="text-sm text-red-600">
            This could be because the listing doesn't exist, you don't have permission to edit it, or your session has expired.
          </p>

          <Link to="/dashboard/posts" className="inline-block text-sm text-brand-600 hover:underline">
            ← Back to My Listings
          </Link>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const totalImages   = (post.images?.length || 0) + newImages.length;
  const maxMoreImages = Math.max(0, 5 - totalImages);

  return (
    <div className="max-w-3xl animate-fade-up">
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mb-1">
            Edit Listing
          </h1>
          <p className="text-stone-500 text-sm">
            Update your property listing details.
          </p>
        </div>

        <Link to="/dashboard/posts" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
          ← My Listings
        </Link>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Existing images */}
      {post.images?.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-6 mb-6">
          <h2 className="font-semibold text-stone-900 mb-1">Current Photos</h2>

          {imgError && <p className="text-xs text-red-600 mb-3">{imgError}</p>}

          <p className="text-xs text-stone-400 mb-4">
            Hover over a photo and click <strong>Remove</strong> to delete it.
          </p>

          <div className="flex flex-wrap gap-3">
            {post.images.map((img) => (
              <div
                key={img._id}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden group border border-stone-100"
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = "none"; }}
                />

                <button
                  type="button"
                  onClick={() => handleDeleteImage(img._id)}
                  className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ FIXED: Always visible */}
      <div className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-6 mb-6">
        <h2 className="font-semibold text-stone-900 mb-1">
          Add More Photos{" "}
          <span className="text-stone-400 font-normal">
            (up to {maxMoreImages} more)
          </span>
        </h2>

        <p className="text-xs text-stone-400 mb-4">
          New photos will be <strong>added alongside</strong> existing ones — not replaced.
        </p>

        {/* Always show previews */}
        {newImages.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {newImages.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(img)}
                  alt=""
                  className="w-full h-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Disable instead of hide */}
        <label
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 text-center transition-colors
          ${maxMoreImages === 0
            ? "border-stone-200 opacity-50 cursor-not-allowed"
            : "border-stone-200 hover:border-brand-300 cursor-pointer"
          }`}
        >
          <div className="text-3xl mb-2">📷</div>

          <p className="text-stone-600 font-medium text-sm">
            {maxMoreImages === 0
              ? "Maximum images reached (5)"
              : newImages.length > 0
              ? "Add more photos"
              : "Click to select photos"}
          </p>

          <p className="text-xs text-stone-400 mt-1">
            {maxMoreImages} slot{maxMoreImages !== 1 ? "s" : ""} remaining
          </p>

          <input
            type="file"
            accept="image/*"
            multiple
            disabled={maxMoreImages === 0}
            className="hidden"
            onChange={handleNewImageChange}
          />
        </label>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-6">
        <PostForm initial={post} onSubmit={handleSubmit} loading={saving} />
      </div>
    </div>
  );
}