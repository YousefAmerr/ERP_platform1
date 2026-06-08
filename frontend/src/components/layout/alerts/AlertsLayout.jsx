import React from "react";
import { Outlet } from "react-router";
import LeftSideBar from "../adminLayout/leftSideBar";
import TopBar from "../adminLayout/topBar";
import ManagerLeftSideBar from "../managerLayout/ManagerLeftSideBar";
import ManagerTopBar from "../managerLayout/ManagerTopBar";

const AlertsLayout = () => {
  const role = (localStorage.getItem("role") || "").toLowerCase();
  const isManager = role === "manager";

  if (isManager) {
    return (
      <div className="mgr-layout">
        <ManagerLeftSideBar />
        <div className="mgr-main">
          <ManagerTopBar />
          <main className="mgr-content">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <LeftSideBar />
      <div className="admin-main">
        <TopBar />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AlertsLayout;
