import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getDashboardStatsRequest,
  getMeRequest,
} from "../../helper_module/authHelper";
import "./admin_dashboard.css";

// Contains a render crash (e.g. a chart) so it never blanks the whole page
class ChartBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error("Dashboard chart failed to render:", error);
  }
  render() {
    if (this.state.failed) {
      return <div className="dash-chart-empty">Chart unavailable</div>;
    }
    return this.props.children;
  }
}

const fmt = (n) => Number(n).toLocaleString();

const pad = (n) => String(n).padStart(2, "0");

const formatDate = (d) => {
  const dt = new Date(d);
  return `${dt.toLocaleString("default", { month: "short" })} ${dt.getDate()}`;
};

const truncate = (text, max = 45) =>
  text && text.length > max ? text.slice(0, max) + "…" : text || "";

// Donut chart with a centered total; falls back to a message when empty
const DonutChart = ({ data, centerLabel }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return <div className="dash-chart-empty">No data yet</div>;
  }
  return (
    <div className="dash-donut-wrap">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={78}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="dash-donut-center">
        <div className="dash-donut-total">{total}</div>
        <div className="dash-donut-sub">{centerLabel}</div>
      </div>
    </div>
  );
};

const ChartLegend = ({ data }) => (
  <div className="dash-legend">
    {data.map((d) => (
      <div key={d.name} className="dash-legend-item">
        <span className="dash-legend-dot" style={{ background: d.color }} />
        {d.name} <strong>{d.value}</strong>
      </div>
    ))}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  const navigate = useNavigate();

  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("alerts");

  useEffect(() => {
    Promise.all([getDashboardStatsRequest(), getMeRequest()])
      .then(([s, me]) => {
        setStats(s);
        setUserName(me.name || "Admin");
      })
      .catch((err) => {
        console.error("Dashboard load failed:", err);
        setLoadError(err.message || "Failed to load dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="dash-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>&nbsp; Loading…
      </div>
    );

  if (loadError || !stats)
    return (
      <div className="dash-loading">
        <i className="fa-solid fa-triangle-exclamation"></i>&nbsp;
        {loadError || "No dashboard data available."}
      </div>
    );

  const T = stats.trends || {};

  const ts = stats.taskStatus || { inProgress: 0, done: 0, overdue: 0 };
  const taskData = [
    { name: "In Progress", value: ts.inProgress, color: "#3776fd" },
    { name: "Done", value: ts.done, color: "#22c55e" },
    { name: "Overdue", value: ts.overdue, color: "#e05252" },
  ];

  const riskData = [
    { name: "Turnover", value: stats.turnoverAlerts || 0, color: "#f43f5e" },
    { name: "Need Help", value: stats.needHelpAlerts || 0, color: "#f59e0b" },
  ];

  const projects = stats.projectsOverview || [];
  const openAlerts = stats.openAlerts || [];

  const kpiCards = [
    {
      key: "employees",
      label: "Total Employees",
      value: stats.totalEmployees,
      icon: "fa-users",
      iconTone: "blue",
      trend: { dir: T.employees?.dir || "flat", text: T.employees?.text || "—", tone: "good" },
    },
    {
      key: "managers",
      label: "Total Managers",
      value: stats.totalManagers,
      icon: "fa-user-tie",
      iconTone: "blue",
      trend: { dir: T.managers?.dir || "flat", text: T.managers?.text || "—", tone: "good" },
    },
    {
      key: "projects",
      label: "Active Projects",
      value: stats.activeProjects,
      icon: "fa-folder-open",
      iconTone: "blue",
      trend: { dir: T.projects?.dir || "flat", text: T.projects?.text || "—", tone: "good" },
    },
    {
      key: "tasks",
      label: "Open Tasks",
      value: stats.openTasks,
      icon: "fa-list-check",
      iconTone: "blue",
      trend: { dir: T.tasks?.dir || "flat", text: T.tasks?.text || "—", tone: "neutral" },
    },
    {
      key: "recognition",
      label: "Recognition Alerts",
      value: stats.recognitionAlerts,
      icon: "fa-trophy",
      iconTone: "purple",
      trend: { dir: T.recognition?.dir || "flat", text: T.recognition?.text || "—", tone: "good" },
    },
    {
      key: "turnover",
      label: "Turnover Alerts",
      value: stats.turnoverAlerts,
      icon: "fa-arrow-right-from-bracket",
      iconTone: "red",
      tint: stats.turnoverAlerts > 0 ? "tint-red" : "",
      trend: { dir: T.turnover?.dir || "flat", text: T.turnover?.text || "—", tone: "bad" },
    },
    {
      key: "needhelp",
      label: "Need Help Alerts",
      value: stats.needHelpAlerts,
      icon: "fa-circle-question",
      iconTone: "orange",
      tint: stats.needHelpAlerts > 0 ? "tint-orange" : "",
      trend: { dir: T.needHelp?.dir || "flat", text: T.needHelp?.text || "—", tone: "bad" },
    },
    {
      key: "leave",
      label: "Pending Leave",
      value: stats.pendingLeaveCount,
      icon: "fa-calendar-days",
      iconTone: "purple",
      trend: { dir: T.leave?.dir || "flat", text: T.leave?.text || "—", tone: "neutral" },
    },
  ];

  const trendArrow = (dir) =>
    dir === "up"
      ? "fa-arrow-up"
      : dir === "down"
        ? "fa-arrow-down"
        : "fa-minus";

  return (
    <div>
      {/* Greeting row */}
      <div className="dash-greeting-row">
        <h2 className="dash-greeting">
          {greeting}, {userName.charAt(0).toUpperCase() + userName.slice(1)}
        </h2>
        <span className="dash-greeting-sub">Action Center</span>
      </div>

      {/* ── ROW 1 — Urgent KPI cards ── */}
      <div className="dash-kpi-grid">
        {kpiCards.map((c) => (
          <div key={c.key} className={`dash-kpi-card ${c.tint || ""}`}>
            <div className="dash-kpi-top">
              <span className="dash-kpi-label">{c.label}</span>
              <span className={`dash-kpi-icon ${c.iconTone}`}>
                <i className={`fa-solid ${c.icon}`}></i>
              </span>
            </div>
            <div className="dash-kpi-number">{pad(c.value)}</div>
            <div className={`dash-kpi-trend ${c.trend.tone}`}>
              <i className={`fa-solid ${trendArrow(c.trend.dir)}`}></i>
              {c.trend.text}
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW 2 — The "Why": Flight Risk (actionable) + Task Status ── */}
      <div className="dash-row2-grid">
        {/* Workforce Flight Risk — statistical donut only */}
        <div className="dash-section-card">
          <div className="dash-section-header">
            <h6 className="dash-section-title">Employees Risks</h6>
          </div>
          <ChartBoundary>
            <DonutChart data={riskData} centerLabel="Alerts" />
            <ChartLegend data={riskData} />
          </ChartBoundary>
        </div>

        {/* Task Status donut */}
        <div className="dash-section-card">
          <div className="dash-section-header">
            <h6 className="dash-section-title">Task Status</h6>
          </div>
          <ChartBoundary>
            <DonutChart data={taskData} centerLabel="Tasks" />
            <ChartLegend data={taskData} />
          </ChartBoundary>
        </div>
      </div>

      {/* ── ROW 3 — The "What": operational tables ── */}
      <div className="dash-section-card dash-projects-card">
        <div className="dash-section-header">
          <h6 className="dash-section-title">Current Projects</h6>
          <span
            className="dash-section-link"
            onClick={() => navigate("/admin/users")}
          >
            {projects.length} active
          </span>
        </div>
        <table className="dash-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Progress</th>
              <th>Tasks</th>
              <th>Overdue</th>
              <th>Team</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="dash-empty">
                  No active projects
                </td>
              </tr>
            ) : (
              projects.map((p) => {
                const pct = p.total
                  ? Math.round((p.done / p.total) * 100)
                  : 0;
                return (
                  <tr key={p.ProjectID}>
                    <td>
                      <div className="dash-employee-name">{p.projectName}</div>
                    </td>
                    <td>
                      <div className="dash-progress-cell">
                        <div className="dash-progress-track">
                          <div
                            className="dash-progress-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="dash-progress-pct">{pct}%</span>
                      </div>
                    </td>
                    <td>
                      {p.done}/{p.total}
                    </td>
                    <td>
                      {p.overdue > 0 ? (
                        <span className="dash-overdue-pill">{p.overdue}</span>
                      ) : (
                        <span className="dash-muted">0</span>
                      )}
                    </td>
                    <td>{p.team}</td>
                    <td>
                      <span className="status-badge status-active">
                        {p.Project_status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Consolidated tabbed widget: Alerts / Leave */}
      <div className="dash-section-card">
        <div className="dash-tabs">
          <button
            className={`dash-tab ${activeTab === "alerts" ? "active" : ""}`}
            onClick={() => setActiveTab("alerts")}
          >
            <i className="fa-solid fa-triangle-exclamation"></i> Alerts
            <span className="dash-tab-count">{openAlerts.length}</span>
          </button>
          <button
            className={`dash-tab ${activeTab === "leave" ? "active" : ""}`}
            onClick={() => setActiveTab("leave")}
          >
            <i className="fa-solid fa-calendar-days"></i> Leave
            <span className="dash-tab-count">
              {stats.pendingLeave?.length || 0}
            </span>
          </button>
        </div>

        {activeTab === "alerts" ? (
          <table className="dash-table">
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
              {openAlerts.length > 0 ? (
                openAlerts.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span className="dash-type-pill">{a.type}</span>
                    </td>
                    <td>
                      <div className="dash-employee-name">{a.name}</div>
                      {a.reason && (
                        <div className="dash-employee-dates">
                          {truncate(a.reason)}
                        </div>
                      )}
                    </td>
                    <td>{formatDate(a.createdAt)}</td>
                    <td>
                      <span
                        className={`status-badge status-${String(a.status).toLowerCase()}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="dash-review-btn"
                        onClick={() => navigate("/admin/alerts/turnover")}
                      >
                        Review Metrics
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="dash-empty">
                    No alerts to display
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.pendingLeave?.length ? (
                  stats.pendingLeave.map((lr) => (
                    <tr key={lr.LeaveRequestID}>
                      <td>
                        <div className="dash-employee-name">{lr.name}</div>
                        <div className="dash-employee-dates">
                          {formatDate(lr.startDate)} – {formatDate(lr.endDate)}
                        </div>
                      </td>
                      <td>
                        <span className="dash-type-pill">{lr.type}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="dash-review-btn"
                          onClick={() => navigate("/admin/leave")}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="dash-empty">
                      No pending leave requests for this month
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {stats.pendingLeaveMore && (
              <div className="dash-table-footer">
                <span>
                  Showing 10 of {fmt(stats.pendingLeaveCount)} pending leave
                  requests this month.
                </span>
                <button
                  type="button"
                  className="dash-view-more-btn"
                  onClick={() => navigate("/admin/leave")}
                >
                  See all
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
