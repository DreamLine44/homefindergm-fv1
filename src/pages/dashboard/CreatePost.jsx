import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../../api/postApi";
import PostForm from "../../components/posts/PostForm";

export default function CreatePost() {
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images,  setImages]  = useState([]);
  const [error,   setError]   = useState("");

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined) fd.append(k, v);
      });
      images.forEach((img) => fd.append("images", img));
      await createPost(fd);
      navigate("/properties");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Append new files rather than replacing so users can add photos incrementally
  const handleFileChange = (e) => {
    const remaining = Math.max(0, 5 - images.length);
    if (remaining <= 0) return;
    const added = Array.from(e.target.files).slice(0, remaining);
    setImages((prev) => [...prev, ...added]);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-3xl animate-fade-up">
      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-brand-600 transition-colors mb-6"
      >
        ← Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-900 mb-1">New Listing</h1>
        <p className="text-stone-500">Fill in the details to publish your property listing.</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Image upload */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-6">
        <h2 className="font-semibold text-stone-900 mb-1">
          Property Images{" "}
          <span className="text-stone-400 font-normal">(up to 5)</span>
        </h2>
        <p className="text-xs text-stone-400 mb-4">PNG, JPG, WEBP — max 10 MB each</p>

        {images.length < 5 && (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-xl p-8 text-center hover:border-brand-300 transition-colors cursor-pointer mb-4">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-stone-600 font-medium text-sm">Click to upload photos</p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}

        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <PostForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
