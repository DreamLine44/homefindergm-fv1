import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signin } from "../../api/authApi";
import { useAuth } from "../../auth/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]           = useState({ email: "", password: "" });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = "Email is required";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");
    try {
      const res = await signin(form);
      login(res.data);             // res.data = { success, data: { token, user } }
      const role = res.data?.data?.user?.role;
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">
          Welcome back
        </h1>
        <p className="text-stone-500 text-sm">Sign in to your HomeFinderGM account</p>
      </div>

      {serverError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          error={errors.password}
        />
        <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-stone-500 mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-brand-600 font-medium hover:text-brand-700">
          Create one
        </Link>
      </p>
    </div>
  );
}
