import React, { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import "./login.css";
import { loginRequest } from "../../helper_module/authHelper";
import ERPLogo from "../../assets/ERP_system_logo.png";

const ROLE_CONFIG = [
  { key: "ADMIN", label: "ADMIN", icon: "fa-solid fa-shield-halved" },
  { key: "MANAGER", label: "MANAGER", icon: "fa-solid fa-people-group" },
  { key: "EMPLOYEE", label: "EMPLOYEE", icon: "fa-solid fa-user-tie" },
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    try {
      const data = await loginRequest({
        email,
        password,
        role: selectedRole,
      });

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      localStorage.setItem("role", selectedRole);

      toast.success("login success");

      const routeByRole = {
        ADMIN: "/admin/dashboard",
        MANAGER: "/manager_dashboard",
        EMPLOYEE: "/employee_dashboard",
      };

      navigate(routeByRole[selectedRole]);
      setEmail("");
      setPassword("");
    } catch (error) {
      toast.error(error?.message || "login failed");
    }
  };

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-left-content">
          {/* Logo */}
          <div className="login-logo">
            <img src={ERPLogo} alt="ERP Platform Logo" />
            <span>ERP Platform</span>
          </div>

          {/* Heading */}
          <h1 className="login-title">LOGIN</h1>
          <p className="login-subtitle">
            Enterprise Resource Planning Intelligence.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="login-field">
              <label>EMAIL ADDRESS</label>
              <div className="login-input-wrapper">
                <i className="fa-solid fa-at login-input-icon"></i>
                <input
                  type="email"
                  placeholder="admin@architechterp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="login-field">
              <label>PASSWORD</label>
              <div className="login-input-wrapper">
                <i className="fa-solid fa-lock login-input-icon"></i>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="login-field">
              <label>SELECT ACCESS ROLE</label>
              <div
                className="login-roles"
                role="group"
                aria-label="Select role"
              >
                {ROLE_CONFIG.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    type="button"
                    className={`login-role-card ${selectedRole === key ? "active" : ""}`}
                    onClick={() => setSelectedRole(key)}
                    aria-pressed={selectedRole === key}
                  >
                    <i className={icon}></i>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={!email || !password || !selectedRole}
            >
              Log In to Dashboard
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <hr />
            <div className="login-footer-content">
              <span>&copy; 2026 ERP PLATFORM INTELLIGENCE</span>
              <div className="login-footer-links">
                <a>PRIVACY</a>
                <a>SECURITY</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-right-overlay">
          <div className="login-right-card">
            <div className="login-right-label">
              <span className="login-right-dash"></span>
              WORKFORCE INTELLIGENCE
            </div>
            <h2 className="login-right-heading">
              Retaining Talent.
              <br />
              Empowering Teams.
            </h2>
            <p className="login-right-desc">
              A smart platform designed to help organizations monitor employee
              performance, reduce turnover, and improve workforce engagement
              through data-driven insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
