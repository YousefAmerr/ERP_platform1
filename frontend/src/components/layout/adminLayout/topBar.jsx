import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { getMeRequest } from "../../../helper_module/authHelper";
import "./bar.css";

const pageTitles = {
  "/admin/dashboard": "Dashboard",
  "/admin/users": "Users",
  "/admin/alerts/turnover": "Turnover / Need Help Alerts",
  "/alerts/recognition": "Recognition Alerts",
  "/admin/leave": "Leave",
};

const TopBar = () => {
  const location = useLocation();
  const [role, setRole] = useState("");

  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  useEffect(() => {
    getMeRequest()
      .then((data) => setRole(data.role || ""))
      .catch(() => setRole(localStorage.getItem("role") || ""));
  }, []);

  const initial = role ? (
    role[0].toUpperCase()
  ) : (
    <i className="fa-solid fa-user" style={{ fontSize: "0.8rem" }}></i>
  );

  return (
    <header className="topbar">
      <h5 className="topbar-title">{pageTitle}</h5>
      <div className="topbar-right">
        <span className="topbar-role">{role}</span>
        <div className="topbar-avatar">{initial}</div>
      </div>
    </header>
  );
};

export default TopBar;
