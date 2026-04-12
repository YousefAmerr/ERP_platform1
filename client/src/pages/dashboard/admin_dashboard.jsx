import React, { useEffect, useState } from "react";
import {
  getDashboardStatsRequest,
  getMeRequest,
} from "../../helper_module/authHelper";
import "./admin_dashboard.css";

const fmt = (n) => Number(n).toLocaleString();

const pad = (n) => String(n).padStart(2, "0");

const formatDate = (d) => {
  const dt = new Date(d);
  return `${dt.toLocaleString("default", { month: "short" })} ${dt.getDate()}`;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  useEffect(() => {
    Promise.all([getDashboardStatsRequest(), getMeRequest()])
      .then(([s, me]) => {
        setStats(s);
        setUserName(me.name || "Admin");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="dash-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>&nbsp; Loading…
      </div>
    );

  return (
    <div>
      {/* Greeting row */}
      <div className="dash-greeting-row">
        <h2 className="dash-greeting">
          {greeting}, {userName.charAt(0).toUpperCase() + userName.slice(1)}
        </h2>
        <button className="dash-export-btn">
          <i className="fa-solid fa-download"></i> Export Report
        </button>
      </div>

      {/* Top 4 stat cards */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div>
            <div className="dash-stat-label">Total Employees</div>
            <div className="dash-stat-number">{fmt(stats.totalEmployees)}</div>
          </div>
          <i className="fa-solid fa-users dash-stat-icon"></i>
        </div>
        <div className="dash-stat-card">
          <div>
            <div className="dash-stat-label">Total Managers</div>
            <div className="dash-stat-number">{fmt(stats.totalManagers)}</div>
          </div>
          <i className="fa-solid fa-user-tie dash-stat-icon"></i>
        </div>
        <div className="dash-stat-card">
          <div>
            <div className="dash-stat-label">Open Tasks</div>
            <div className="dash-stat-number blue">{fmt(stats.openTasks)}</div>
          </div>
          <i className="fa-solid fa-list-check dash-stat-icon"></i>
        </div>
        <div className="dash-stat-card overdue">
          <div>
            <div className="dash-stat-label">Overdue Tasks</div>
            <div className="dash-stat-number red">
              {fmt(stats.overdueTasks)}
            </div>
          </div>
          <i className="fa-solid fa-circle-exclamation dash-stat-icon"></i>
        </div>
      </div>

      {/* Small alert cards */}
      <div className="dash-alert-grid">
        <div className="dash-alert-card">
          <div className="dash-alert-icon-wrap red">
            <i className="fa-solid fa-circle-question"></i>
          </div>
          <div>
            <div className="dash-alert-number">{pad(stats.needHelpAlerts)}</div>
            <div className="dash-alert-label">Need Help Alerts</div>
          </div>
        </div>
        <div className="dash-alert-card">
          <div className="dash-alert-icon-wrap blue">
            <i className="fa-solid fa-trophy"></i>
          </div>
          <div>
            <div className="dash-alert-number">
              {pad(stats.recognitionAlerts)}
            </div>
            <div className="dash-alert-label">Recognition Alerts</div>
          </div>
        </div>
        <div className="dash-alert-card">
          <div className="dash-alert-icon-wrap orange">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </div>
          <div>
            <div className="dash-alert-number">{pad(stats.turnoverAlerts)}</div>
            <div className="dash-alert-label">Turnover Alerts</div>
          </div>
        </div>
        <div className="dash-alert-card">
          <div className="dash-alert-icon-wrap purple">
            <i className="fa-solid fa-calendar-days"></i>
          </div>
          <div>
            <div className="dash-alert-number">
              {pad(stats.pendingLeaveCount)}
            </div>
            <div className="dash-alert-label">Pending Leave</div>
          </div>
        </div>
      </div>

      {/* Bottom two columns */}
      <div className="dash-bottom-row">
        {/* Critical Recent Alerts — empty table */}
        <div className="dash-section-card">
          <div className="dash-section-header">
            <h6 className="dash-section-title">Critical Recent Alerts</h6>
            <span className="dash-section-link">View All Notifications</span>
          </div>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Employee</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="dash-empty">
                  No alerts to display
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pending Leave */}
        <div className="dash-section-card">
          <div className="dash-section-header">
            <h6 className="dash-section-title">Pending Leave</h6>
            <span className="dash-section-link">Approval Queue</span>
          </div>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.pendingLeave.length === 0 ? (
                <tr>
                  <td colSpan={3} className="dash-empty">
                    No pending leave requests
                  </td>
                </tr>
              ) : (
                stats.pendingLeave.map((lr) => (
                  <tr key={lr.LeaveRequestID}>
                    <td>
                      <div className="dash-employee-name">{lr.name}</div>
                      <div className="dash-employee-dates">
                        {formatDate(lr.startDate)} – {formatDate(lr.endDate)}
                      </div>
                    </td>
                    <td>{lr.type}</td>
                    <td>
                      <div className="dash-action-btns">
                        <button
                          className="dash-action-btn approve"
                          title="Approve"
                        >
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button
                          className="dash-action-btn reject"
                          title="Reject"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
