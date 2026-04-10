import { useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";

const TYPES    = ["Room", "Self-Contained", "Apartment", "House", "Shop", "Office", "Boys Quarter", "Villa", "Other"];
const STATUSES = ["Available", "Sold", "Rented", "Pending"];

export default function PostForm({ initial = {}, onSubmit, loading }) {
  // features may come from DB as an array ["balcony","parking"] OR a comma string — always use string
  const toFeaturesString = (f) => {
    if (!f) return "";
    if (Array.isArray(f)) return f.join(",");
    return String(f);
  };

  const [form, setForm] = useState({
    title:          initial.title          || "",
    description:    initial.description    || "",
    price:          initial.price          || "",
    location:       initial.location       || "",
    type:           initial.type           || "",
    contactPhone:   initial.contactPhone   || "",
    status:         initial.status         || "Available",
    addressDetails: initial.addressDetails || "",
    features:       toFeaturesString(initial.features),
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.price)              e.price       = "Price is required";
    if (!form.location.trim())    e.location    = "Location is required";
    if (!form.type)               e.type        = "Property type is required";
    if (!form.contactPhone.trim()) e.contactPhone = "Contact phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <Input
        label="Title *"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        error={errors.title}
        placeholder="e.g. Modern 2-bedroom apartment"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-stone-700">Property Type *</label>
          <select
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            className="px-3 py-2.5 rounded border border-stone-300 text-sm outline-none bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-400"
          >
            <option value="">Select type</option>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          {errors.type && <p className="text-xs text-red-600">{errors.type}</p>}
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-stone-700">Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="px-3 py-2.5 rounded border border-stone-300 text-sm outline-none bg-white focus:border-brand-500"
          >
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Price */}
        <Input
          label="Price (GMD) *"
          type="number"
          value={form.price}
          onChange={(e) => set("price", e.target.value)}
          error={errors.price}
          placeholder="e.g. 4500"
        />

        {/* Contact Phone */}
        <Input
          label="Contact Phone *"
          value={form.contactPhone}
          onChange={(e) => set("contactPhone", e.target.value)}
          error={errors.contactPhone}
          placeholder="e.g. 7777777"
        />

        {/* Location */}
        <Input
          label="Location *"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          error={errors.location}
          placeholder="e.g. Kanifing"
        />

        {/* Address Details */}
        <Input
          label="Address Details"
          value={form.addressDetails}
          onChange={(e) => set("addressDetails", e.target.value)}
          placeholder="e.g. Near GTBank traffic lights"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-stone-700">Description *</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          placeholder="Describe the property in detail..."
          className="px-3 py-2.5 rounded border border-stone-300 text-sm outline-none resize-none focus:border-brand-500 focus:ring-1 focus:ring-brand-400"
        />
        {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
      </div>

      {/* Features */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-stone-700">
          Features{" "}
          <span className="text-stone-400 font-normal">(comma-separated)</span>
        </label>
        <input
          value={form.features}
          onChange={(e) => set("features", e.target.value)}
          placeholder="e.g. balcony,parking,water,generator"
          className="px-3 py-2.5 rounded border border-stone-300 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-400"
        />
        {/* Preview chips */}
        {form.features && typeof form.features === "string" && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {form.features.split(",").map((f) => f.trim()).filter(Boolean).map((f) => (
              <span key={f} className="px-2.5 py-0.5 bg-brand-50 text-brand-700 text-xs rounded-full border border-brand-100">
                {f}
              </span>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" loading={loading} size="lg" className="w-full">
        {initial._id ? "Update Listing" : "Create Listing"}
      </Button>
    </form>
  );
}
