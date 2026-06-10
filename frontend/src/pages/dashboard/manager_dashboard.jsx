import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import {
  getManagerDashboardStatsRequest,
  getManagerCompletedTasksRequest,
} from "../../helper_module/authHelper";
import "./manager_dashboard.css";

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return `${dt.toLocaleString("default", { month: "short" })} ${dt.getDate()}`;
}

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

// Performance bar color by average rating (strong → weak)
function ratingBarColor(avg) {
  if (avg >= 4) return "#0d9488"; // teal — strong
  if (avg >= 3) return "#3b82f6"; // blue — steady
  return "#e05252"; // coral — needs support
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
    needHelpCount: 0,
    leaveRequests: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [filterProject, setFilterProject] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const navigate = useNavigate();

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

  const projectStatusData = stats.projectStatus || [];
  const needHelpAlerts = stats.needHelpAlerts || [];
  const performance = stats.performanceByEmployee || [];
  const matrix = stats.utilizationMatrix || [];

  // Real DB count of active "Need Help" alerts; never mock, defaults to 0.
  const needHelpCount = stats.needHelpCount || 0;

  // Conditional accent flags (Action Center cues)
  const overdueAlarm = !loadingStats && stats.overdueTasks > 5;
  const needHelpUrgent = !loadingStats && needHelpCount > 0;

  // ── Project Health Matrix: one wide row per active project ──
  // Headcount assigned to each project (distinct employees from the task matrix)
  const projUserIds = new Map();
  matrix.forEach((m) => {
    if (!projUserIds.has(m.projectName)) projUserIds.set(m.projectName, new Set());
    projUserIds.get(m.projectName).add(m.userId);
  });
  const healthProjects = projectStatusData.map((p) => {
    const total = p.inProgress + p.done + p.overdue;
    const completed = p.done;
    const openInProgress = total - completed; // in-progress + overdue (not done)
    const pct = total ? Math.round((completed / total) * 100) : 0;
    return {
      name: p.name,
      team: (projUserIds.get(p.name) || new Set()).size,
      total,
      openInProgress,
      completed,
      pct,
    };
  });

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

        <div className={`mgr-stat-card ${overdueAlarm ? "alarm" : ""}`}>
          <div className="mgr-stat-label">Overdue Tasks</div>
          <div className={`mgr-stat-number ${overdueAlarm ? "danger" : ""}`}>
            {loadingStats ? "—" : pad(stats.overdueTasks)}
          </div>
          {overdueAlarm && (
            <div className="mgr-stat-flag">
              <i className="fa-solid fa-triangle-exclamation"></i> Above safe
              threshold
            </div>
          )}
        </div>

        <div className={`mgr-stat-card ${needHelpUrgent ? "warn" : ""}`}>
          <div className="mgr-stat-label">Need Help Alerts</div>
          <div className={`mgr-stat-number ${needHelpUrgent ? "soft-red" : ""}`}>
            {loadingStats ? "—" : pad(needHelpCount)}
          </div>
          {needHelpUrgent && (
            <div className="mgr-stat-flag">
              <i className="fa-solid fa-circle-exclamation"></i> Needs attention
            </div>
          )}
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-label">Recent Leave Requests</div>
          <div className="mgr-stat-number">
            {loadingStats ? "—" : pad(stats.leaveRequests)}
          </div>
        </div>
      </div>

      {/* ── ROW 2 — Need Help Alerts feed + Team Performance ── */}
      <div className="mgr-charts-row2">
        {/* Need Help Alerts feed (real blockers, admin-style table) */}
        <div className="mgr-section-card mgr-chart-card">
          <div className="mgr-section-header">
            <h6 className="mgr-section-title">Need Help Alerts</h6>
            {needHelpAlerts.length > 0 && (
              <span
                className="mgr-view-all"
                onClick={() => navigate("/manager/alerts/need-help")}
              >
                View all
              </span>
            )}
          </div>
          <table className="mgr-alerts-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Employee</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {needHelpAlerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="mgr-empty">
                    No active help requests
                  </td>
                </tr>
              ) : (
                needHelpAlerts.map((a) => (
                  <tr key={a.AlertID}>
                    <td>
                      <span className="mgr-alert-type-badge attendance">
                        Need Help
                      </span>
                    </td>
                    <td>
                      <div className="mgr-alert-emp">
                        <div
                          className="mgr-alert-avatar"
                          style={{ background: getAvatarColor(a.name || "") }}
                        >
                          {getInitials(a.name || "?")}
                        </div>
                        <span className="mgr-alert-emp-name">
                          {a.name || "—"}
                        </span>
                      </div>
                    </td>
                    <td>{formatDate(a.createdAt)}</td>
                    <td>
                      <span
                        className={`mgr-alert-status ${String(a.status).toLowerCase()}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="mgr-review-blocker"
                        onClick={() => navigate("/manager/alerts/need-help")}
                      >
                        <i className="fa-solid fa-headset"></i> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Team Performance — scrollable, scales to many employees */}
        <div className="mgr-section-card mgr-chart-card">
          <div className="mgr-section-header">
            <h6 className="mgr-section-title">Team Performance</h6>
            <span className="mgr-chart-hint">Avg rating · out of 5</span>
          </div>
          {performance.length === 0 ? (
            <div className="mgr-chart-empty">No ratings yet</div>
          ) : (
            <div className="mgr-perf-scroll">
              {performance.map((e) => {
                const avg = e.avgRating || 0;
                const widthPct = Math.round((avg / 5) * 100);
                return (
                  <div className="mgr-perf-row" key={e.email || e.name}>
                    <div
                      className="mgr-perf-avatar"
                      style={{ background: getAvatarColor(e.name || "") }}
                    >
                      {getInitials(e.name || "?")}
                    </div>
                    <div className="mgr-perf-body">
                      <div className="mgr-perf-top">
                        <span className="mgr-perf-name" title={e.name}>
                          {e.name}
                        </span>
                        <span className="mgr-perf-score">
                          {avg.toFixed(1)}
                          <small>/5</small>
                        </span>
                      </div>
                      <div className="mgr-perf-track">
                        <div
                          className="mgr-perf-fill"
                          style={{
                            width: `${widthPct}%`,
                            background: ratingBarColor(avg),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 3 — Project Health Matrix ── */}
      <div className="mgr-section-card">
        <div className="mgr-section-header">
          <h6 className="mgr-section-title">Project Health Matrix</h6>
          <span className="mgr-chart-hint">{healthProjects.length} active</span>
        </div>
        {healthProjects.length === 0 ? (
          <div className="mgr-chart-empty">No active projects</div>
        ) : (
          <div className="mgr-matrix">
            <div className="mgr-matrix-row mgr-matrix-head">
              <span>Project</span>
              <span>Team</span>
              <span>Total Tasks</span>
              <span>In Progress</span>
              <span>Completed</span>
            </div>
            {healthProjects.map((p) => (
              <div className="mgr-matrix-row" key={p.name}>
                <div className="mgr-matrix-name" title={p.name}>
                  <span className="mgr-matrix-dot" />
                  {p.name}
                </div>
                <div className="mgr-matrix-cell">
                  <i className="fa-solid fa-users"></i> {p.team}
                </div>
                <div className="mgr-matrix-cell">{p.total}</div>
                <div className="mgr-matrix-cell">
                  <span
                    className={
                      p.openInProgress > 0 ? "mgr-matrix-open" : "mgr-matrix-muted"
                    }
                  >
                    {p.openInProgress}
                  </span>
                </div>
                <div className="mgr-matrix-complete">
                  <div className="mgr-matrix-complete-top">
                    <span>
                      {p.completed}/{p.total}
                    </span>
                    <span className="mgr-matrix-pct">{p.pct}%</span>
                  </div>
                  <div className="mgr-matrix-track">
                    <div
                      className="mgr-matrix-fill"
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
