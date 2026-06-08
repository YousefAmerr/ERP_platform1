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
    openProjects: 0,
    teamEmployees: 0,
    teamTasks: 0,
    overdueTasks: 0,
    teamAlerts: 0,
    leaveRequests: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [filterProject, setFilterProject] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");

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
          <div className="mgr-stat-label">Open Projects</div>
          <div className="mgr-stat-number blue">
            {loadingStats ? "—" : pad(stats.openProjects)}
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-label">Team Employees</div>
          <div className="mgr-stat-number">
            {loadingStats ? "—" : pad(stats.teamEmployees)}
          </div>

        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-label">Team Tasks</div>
          <div className="mgr-stat-number">
            {loadingStats ? "—" : stats.teamTasks}
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-label">Overdue Tasks</div>
          <div className="mgr-stat-number red">
            {loadingStats ? "—" : pad(stats.overdueTasks)}
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-label">Need Help Alerts</div>
          <div className="mgr-stat-number orange">
            {loadingStats ? "—" : pad(stats.teamAlerts)}
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-label">Recent Leave Requests</div>
          <div className="mgr-stat-number">
            {loadingStats ? "—" : pad(stats.leaveRequests)}
          </div>
        </div>
      </div>

      {/* ── Recent Team Alerts (empty table — no DB call) ── */}
      <div className="mgr-section-card">
        <div className="mgr-section-header">
          <h6 className="mgr-section-title">Recent Need Help Alerts</h6>
        </div>
        <table className="mgr-alerts-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Employee</th>
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
          <div className="mgr-task-filters">
            <select
              className="mgr-filter-select"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            >
              <option value="">All Projects</option>
              {[...new Set(tasks.map((t) => t.projectName).filter(Boolean))].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              className="mgr-filter-select"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
            >
              <option value="">All Employees</option>
              {[...new Set(tasks.map((t) => t.employeeName).filter(Boolean))].map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
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
              tasks
                .filter((t) => !filterProject || t.projectName === filterProject)
                .filter((t) => !filterEmployee || t.employeeName === filterEmployee)
                .map((t) => (
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
