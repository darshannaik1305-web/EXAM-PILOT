import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import AuthFormCard from "../components/common/AuthFormCard";
import { AuthContext } from "../context/AuthContext";
import { login as apiLogin } from "../services/authService";
import { validateLogin } from "../utils/validators";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");

    const errors = validateLogin(email, password);

    if (errors.email || errors.password) {
      setEmailError(errors.email || "");
      setPasswordError(errors.password || "");
      return;
    }

    setLoading(true);
    try {
      const data = await apiLogin(email, password);

      if (data.token) {
        toast.success("Welcome back! Login successful.");
        login(data.token, rememberMe);
        navigate("/student/workspace");
      } else {
        toast.error(data.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Invalid Credentials");
      } else {
        toast.error("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormCard title="Login to Workspace" subtitle="Access your competitive exam mocks and practice metrics">
      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-muted" htmlFor="email-input">
            Email Address
          </label>
          <Input
            id="email-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            error={emailError}
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-muted" htmlFor="password-input">
            Password
          </label>
          <div className="relative">
            <Input
              id="password-input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              error={passwordError}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-3.5 top-3.5 text-muted hover:text-text focus:outline-none cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2 text-muted font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 rounded border-border bg-slate-900 text-primary focus:ring-primary/20 cursor-pointer"
            />
            <span>Remember Me</span>
          </label>
        </div>

        {/* Submit */}
        <Button type="submit" loading={loading} className="w-full py-3.5">
          Sign In
        </Button>

        {/* Footer links */}
        <p className="text-center text-sm text-muted mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:opacity-90 font-semibold">
            Register free
          </Link>
        </p>
      </form>
    </AuthFormCard>
  );
}

export default Login;