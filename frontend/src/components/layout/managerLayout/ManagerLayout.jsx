import React from "react";
import { Outlet } from "react-router";
import ManagerLeftSideBar from "./ManagerLeftSideBar";
import ManagerTopBar from "./ManagerTopBar";
import "./managerBar.css";

const ManagerLayout = () => {
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
};

export default ManagerLayout;
