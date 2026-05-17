import React from "react";
import { Outlet } from "react-router";
import LeftSideBar from "./leftSideBar";
import TopBar from "./topBar";
import "./bar.css";

const AdminLayout = () => {
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

export default AdminLayout;
