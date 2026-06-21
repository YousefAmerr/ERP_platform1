import React from "react";
import { NavLink, useNavigate } from "react-router";
import "./employeeBar.css";

const EmployeeLeftSideBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <aside className="emp-sidebar">
      <div className="emp-brand">
        <img src="/assets/brand-logo.svg" alt="فن الامتياز" className="emp-brand-logo" />
        <div className="emp-brand-text">
          <span className="emp-brand-title">فن الامتياز</span>
          <span className="emp-brand-sub">REAL ESTATE</span>
        </div>
      </div>

      <nav className="emp-nav">
        <NavLink
          to="/employee/dashboard"
          className={({ isActive }) =>
            `emp-nav-link${isActive ? " active" : ""}`
          }
        >
          <i className="fa-solid fa-table-cells-large"></i>
          Dashboard
        </NavLink>

        <NavLink
          to="/employee/tasks"
          className={({ isActive }) =>
            `emp-nav-link${isActive ? " active" : ""}`
          }
        >
          <i className="fa-regular fa-square-check"></i>
          Tasks
        </NavLink>

        <NavLink
          to="/employee/leave"
          className={({ isActive }) =>
            `emp-nav-link${isActive ? " active" : ""}`
          }
        >
          <i className="fa-regular fa-calendar-days"></i>
          Leave
        </NavLink>
      </nav>

      <div className="emp-sidebar-footer">
        <button className="emp-logout" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default EmployeeLeftSideBar;
