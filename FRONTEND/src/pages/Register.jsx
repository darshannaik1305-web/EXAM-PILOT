import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import AuthFormCard from "../components/common/AuthFormCard";
import { AuthContext } from "../context/AuthContext";
import { register as apiRegister, login as apiLogin } from "../services/authService";
import { validateRegister } from "../utils/validators";

function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  async function handleRegister(e) {
    e.preventDefault();

    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    const errors = validateRegister(username, email, password, confirmPassword);

    if (errors.username || errors.email || errors.password || errors.confirmPassword) {
      setUsernameError(errors.username || "");
      setEmailError(errors.email || "");
      setPasswordError(errors.password || "");
      setConfirmPasswordError(errors.confirmPassword || "");
      return;
    }

    setLoading(true);
    try {
      const regData = await apiRegister(username, email, password);

      if (regData.token || regData.message === "Registration Successful") {
        toast.success("Account created successfully! Logging in...");

        try {
          const logData = await apiLogin(email, password);
          if (logData.token) {
            login(logData.token, false);
            navigate("/student/workspace");
          } else {
            toast.error("Registration completed. Please sign in manually.");
            navigate("/login");
          }
        } catch (loginErr) {
          console.error(loginErr);
          toast.error("Account created. Please log in manually.");
          navigate("/login");
        }
      } else {
        toast.error(regData.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Registration failed");
      } else {
        toast.error("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormCard title="Create Student Account" subtitle="Parse past papers and simulate online mock exams in minutes">
      <form onSubmit={handleRegister} className="space-y-5">
        {/* Username */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-muted" htmlFor="username-input">
            Username
          </label>
          <Input
            id="username-input"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            error={usernameError}
            autoComplete="username"
          />
        </div>

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
              placeholder="Min 8 chars, 1 upper, 1 lower, 1 digit"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              error={passwordError}
              autoComplete="new-password"
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

        {/* Confirm Password */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-muted" htmlFor="confirm-password-input">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirm-password-input"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              error={confirmPasswordError}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
              className="absolute right-3.5 top-3.5 text-muted hover:text-text focus:outline-none cursor-pointer"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" loading={loading} className="w-full py-3.5 mt-2">
          Sign Up
        </Button>

        {/* Footer links */}
        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:opacity-90 font-semibold">
            Login here
          </Link>
        </p>
      </form>
    </AuthFormCard>
  );
}

export default Register;