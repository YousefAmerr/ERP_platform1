import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router";
import "./managerBar.css";
import ERPLogo from "../../../assets/ERP_system_logo.png";

const ManagerLeftSideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const onAlertsRoute = location.pathname.startsWith("/alerts");
  const [alertsOpen, setAlertsOpen] = useState(onAlertsRoute);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <aside className="mgr-sidebar">
      <div className="mgr-brand">
        <img src={ERPLogo} alt="ERP Logo" className="mgr-brand-logo" />
        <span className="mgr-brand-title">ERP Platform</span>
      </div>

      <nav className="mgr-nav">
        <NavLink
          to="/manager/dashboard"
          className={({ isActive }) =>
            `mgr-nav-link${isActive ? " active" : ""}`
          }
        >
          <i className="fa-solid fa-table-cells-large"></i>
          Dashboard
        </NavLink>

        <NavLink
          to="/manager/tasks"
          className={({ isActive }) =>
            `mgr-nav-link${isActive ? " active" : ""}`
          }
        >
          <i className="fa-regular fa-clipboard"></i>
          Projects
        </NavLink>

        {/* Collapsible Alerts group */}
        <div
          className={`mgr-nav-link mgr-nav-group${onAlertsRoute ? " active" : ""}`}
          onClick={() => setAlertsOpen((o) => !o)}
          style={{ cursor: "pointer", userSelect: "none" }}
        >
          <i className="fa-regular fa-bell"></i>
          Alerts
          <i
            className={`fa-solid fa-chevron-${alertsOpen ? "up" : "down"} mgr-nav-chevron`}
          ></i>
        </div>
        {alertsOpen && (
          <div className="mgr-subnav">
            <NavLink
              to="/manager/alerts/need-help"
              className={({ isActive }) =>
                `mgr-subnav-link${isActive ? " active" : ""}`
              }
            >
              Need Help Alerts
            </NavLink>
            <NavLink
              to="/alerts/recognition"
              className={({ isActive }) =>
                `mgr-subnav-link${isActive ? " active" : ""}`
              }
            >
              Recognition Alerts
            </NavLink>
          </div>
        )}

        <NavLink
          to="/manager/leave"
          className={({ isActive }) =>
            `mgr-nav-link${isActive ? " active" : ""}`
          }
        >
          <i className="fa-regular fa-calendar-days"></i>
          Leave
        </NavLink>
      </nav>

      <div className="mgr-sidebar-footer">
        <button className="mgr-logout" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default ManagerLeftSideBar;
