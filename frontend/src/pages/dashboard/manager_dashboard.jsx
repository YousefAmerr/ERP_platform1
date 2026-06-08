import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getManagerDashboardStatsRequest,
  getManagerCompletedTasksRequest,
} from "../../helper_module/authHelper";
import "./manager_dashboard.css";

const AVATAR_COLORS = [
  "#3776fd",
  "#8b5cf6",
  "#f57c00",
  "#16a34a",
  "#e05252",
  "#0891b2",
  "#be185d",
  "#65a30d",
  "#d97706",
  "#7c3aed",
];

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function StarRating({ rating = 0 }) {
  return (
    <div className="mgr-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <i
          key={s}
          className={`fa-star ${s <= Math.round(rating) ? "fa-solid filled" : "fa-regular empty"}`}
        ></i>
      ))}
    </div>
  );
}

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    teamEmployees: 0,
    teamTasks: 0,
    overdueTasks: 0,
    teamAlerts: 0,
    leaveRequests: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    getManagerDashboardStatsRequest()
      .then(setStats)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoadingStats(false));

    getManagerCompletedTasksRequest()
      .then((d) => setTasks(d.tasks))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoadingTasks(false));
  }, []);

  return (
    <>

      {/* ── Stat Cards ── */}
      <div className="mgr-stat-row">
        <div className="mgr-stat-card">
          <div className="mgr-stat-label">Team Employees</div>
          <div className="mgr-stat-number">
            {loadingStats ? "—" : pad(stats.teamEmployees)}
          </div>
          <div className="mgr-stat-sub blue">
            <i className="fa-solid fa-users"></i>
            Full Capacity
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-label">Team Tasks</div>
          <div className="mgr-stat-number">
            {loadingStats ? "—" : stats.teamTasks}
          </div>
          <div className="mgr-stat-sub green">
            <i className="fa-solid fa-arrow-trend-up"></i>
            +12% this week
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-label">Overdue Tasks</div>
          <div className="mgr-stat-number red">
            {loadingStats ? "—" : pad(stats.overdueTasks)}
          </div>
          <div className="mgr-stat-sub red">
            <i className="fa-solid fa-triangle-exclamation"></i>
            Action Required
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-label">Team Alerts</div>
          <div className="mgr-stat-number orange">
            {loadingStats ? "—" : pad(stats.teamAlerts)}
          </div>
          <div className="mgr-stat-sub orange">
            <i className="fa-regular fa-circle-dot"></i>
            Active Now
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-label">Leave Requests</div>
          <div className="mgr-stat-number">
            {loadingStats ? "—" : pad(stats.leaveRequests)}
          </div>
          <div className="mgr-stat-sub gray">
            <i className="fa-regular fa-calendar-check"></i>
            Pending Approval
          </div>
        </div>
      </div>

      {/* ── Recent Team Alerts (empty table — no DB call) ── */}
      <div className="mgr-section-card">
        <div className="mgr-section-header">
          <h6 className="mgr-section-title">Recent Team Alerts</h6>
        </div>
        <table className="mgr-alerts-table">
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
              <td colSpan={5} className="mgr-empty">
                No recent alerts
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Recent Completed Tasks ── */}
      <div className="mgr-section-card">
        <div className="mgr-section-header">
          <h6 className="mgr-section-title">Recent Completed Tasks</h6>
          <div className="mgr-section-icons">
            <button className="mgr-icon-btn" title="Filter">
              <i className="fa-solid fa-sliders"></i>
            </button>
            <button className="mgr-icon-btn" title="More">
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
          </div>
        </div>
        <table className="mgr-tasks-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Employee</th>
              <th>Rating</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {loadingTasks ? (
              <tr>
                <td colSpan={4} className="mgr-empty">
                  <i className="fa-solid fa-spinner fa-spin"></i> Loading…
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="mgr-empty">
                  No completed tasks yet
                </td>
              </tr>
            ) : (
              tasks.map((t) => (
                <tr key={t.TaskID}>
                  <td>
                    <div className="mgr-task-title">{t.title}</div>
                    {t.projectName && (
                      <div className="mgr-task-dept">{t.projectName}</div>
                    )}
                  </td>
                  <td>
                    <div className="mgr-task-emp">
                      <div
                        className="mgr-task-avatar"
                        style={{
                          background: getAvatarColor(t.employeeName || ""),
                        }}
                      >
                        {getInitials(t.employeeName || "?")}
                      </div>
                      <span className="mgr-task-emp-name">
                        {t.employeeName || "—"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <StarRating rating={t.rating} />
                  </td>
                  <td>
                    <span className="mgr-task-comment" title={t.ratingComment}>
                      {t.ratingComment ? `"${t.ratingComment}"` : "—"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ManagerDashboard;
