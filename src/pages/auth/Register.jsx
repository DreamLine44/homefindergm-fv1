import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../api/authApi";
import { useAuth } from "../../auth/useAuth";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirm: "",
  });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim())  e.lastName  = "Last name is required";
    if (!form.email)            e.email     = "Email is required";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");
    try {
      const { confirm, ...payload } = form; // strip confirm field
      const res = await signup(payload);
      login(res.data);                       // synchronous — sets user state immediately
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
          Create account
        </h1>
        <p className="text-stone-500 text-sm">
          Join thousands of property seekers on HomeFinderGM
        </p>
      </div>

      {serverError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="e.g. Amara"
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            error={errors.firstName}
          />
          <Input
            label="Last Name"
            placeholder="e.g. Jallow"
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            error={errors.lastName}
          />
        </div>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          error={errors.password}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={form.confirm}
          onChange={(e) => set("confirm", e.target.value)}
          error={errors.confirm}
        />
        <p className="text-xs text-stone-400">
          By registering, you agree to our Terms of Service and Privacy Policy.
        </p>
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-stone-500 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
