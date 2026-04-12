import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { getMeRequest } from "../../../helper_module/authHelper";
import "./employeeBar.css";

const pageTitles = {
  "/employee/dashboard": "Dashboard",
  "/employee/tasks": "My Tasks",
  "/employee/leave": "My Leave",
};

const EmployeeTopBar = () => {
  const location = useLocation();
  const [name, setName] = useState("");

  const pageTitle = pageTitles[location.pathname] || "ERP Portal";

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
    <header className="emp-topbar">
      <h5 className="emp-topbar-title">{pageTitle}</h5>
      <div className="emp-topbar-right">
        <div className="emp-role-badge">
          <span className="emp-role-dot"></span>
          EMPLOYEE
        </div>
        <div className="emp-topbar-avatar">{initial}</div>
      </div>
    </header>
  );
};

export default EmployeeTopBar;
