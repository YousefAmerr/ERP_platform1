import React from "react";
import { Outlet } from "react-router";
import EmployeeLeftSideBar from "./EmployeeLeftSideBar";
import EmployeeTopBar from "./EmployeeTopBar";
import "./employeeBar.css";

const EmployeeLayout = () => {
  return (
    <div className="emp-layout">
      <EmployeeLeftSideBar />
      <div className="emp-main">
        <EmployeeTopBar />
        <main className="emp-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
