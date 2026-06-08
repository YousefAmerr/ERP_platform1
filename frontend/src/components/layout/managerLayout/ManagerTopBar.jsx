import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { getMeRequest } from "../../../helper_module/authHelper";
import "./managerBar.css";

const pageTitles = {
  "/manager/dashboard": "Dashboard",
  "/manager/tasks": "Project Management",
  "/manager/alerts/need-help": "Need Help Alerts",
  "/alerts/recognition": "Recognition Alerts",
  "/manager/leave": "Leave",
};

const ManagerTopBar = () => {
  const location = useLocation();
  const [name, setName] = useState("");

  const pageTitle = pageTitles[location.pathname];

  useEffect(() => {
    getMeRequest()
      .then((data) => setName(data.name || data.Name || ""))
      .catch(() => setName(""));
  }, []);

  const initial = name ? (
    name[0].toUpperCase()
  ) : (
    <i className="fa-solid fa-user" style={{ fontSize: "0.8rem" }}></i>
  );

  return (
    <header className="mgr-topbar">
      <h5 className="mgr-topbar-title">{pageTitle}</h5>
      <div className="mgr-topbar-right">
        <div className="mgr-role-badge">
          <span className="mgr-role-dot"></span>
          MANAGER
        </div>
        <div className="mgr-topbar-avatar">{initial}</div>
      </div>
    </header>
  );
};

export default ManagerTopBar;
