import { useState } from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSent(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-stone-900 mb-3">Get In Touch</h1>
        <p className="text-stone-500">Have a question or need help? We're here for you.</p>
      </div>
      {sent ? (
        <div className="text-center py-12 bg-green-50 rounded-2xl border border-green-100">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
          <p className="text-green-600">We'll get back to you within 24 hours.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-stone-100 p-8">
          <Input label="Your Name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="John Doe" />
          <Input label="Email Address" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Message</label>
            <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={5} className="px-3 py-2.5 rounded border border-stone-300 text-sm outline-none resize-none focus:border-brand-400" placeholder="How can we help?" />
          </div>
          <Button type="submit" size="lg" className="w-full">Send Message</Button>
        </form>
      )}
    </div>
  );
}
