import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router";
import "./bar.css";

const LeftSideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const onAlertsRoute = location.pathname.startsWith("/admin/alerts");
  const [alertsOpen, setAlertsOpen] = useState(onAlertsRoute);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">ERP Platform</div>
      <nav className="sidebar-nav">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `sidebar-link${isActive ? " active" : ""}`
          }
        >
          <i className="fa-solid fa-gauge"></i>
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `sidebar-link${isActive ? " active" : ""}`
          }
        >
          <i className="fa-solid fa-users"></i>
          Users
        </NavLink>

        {/* ── Alerts group ── */}
        <div className="sidebar-group">
          <button
            className={`sidebar-group-toggle${onAlertsRoute || alertsOpen ? " open" : ""}`}
            onClick={() => setAlertsOpen((o) => !o)}
          >
            <i className="fa-solid fa-bell"></i>
            Alerts
            <i className="fa-solid fa-chevron-down sidebar-group-arrow"></i>
          </button>

          {(alertsOpen || onAlertsRoute) && (
            <div className="sidebar-subnav">
              <NavLink
                to="/admin/alerts/turnover"
                className={({ isActive }) =>
                  `sidebar-sublink${isActive ? " active" : ""}`
                }
              >
                Turnover/Need help Alerts
              </NavLink>
              <NavLink
                to="/admin/alerts/recognition"
                className={({ isActive }) =>
                  `sidebar-sublink${isActive ? " active" : ""}`
                }
              >
                Recognition Alerts
              </NavLink>
            </div>
          )}
        </div>

        <NavLink
          to="/admin/leave"
          className={({ isActive }) =>
            `sidebar-link${isActive ? " active" : ""}`
          }
        >
          <i className="fa-solid fa-calendar-days"></i>
          Leave
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default LeftSideBar;
