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

  const ts = stats.taskStatus || { inProgress: 0, done: 0, overdue: 0 };
  const taskData = [
    { name: "In Progress", value: ts.inProgress, color: "#3776fd" },
    { name: "Done", value: ts.done, color: "#22c55e" },
    { name: "Overdue", value: ts.overdue, color: "#e05252" },
  ];

  const fr = stats.flightRisk || { atRisk: 0, stable: 0 };
  const riskData = [
    { name: "At Risk", value: fr.atRisk, color: "#f43f5e" },
    { name: "Stable", value: fr.stable, color: "#14b8a6" },
  ];

  const projects = stats.projectsOverview || [];

  return (
    <div>
      {/* Greeting row */}
      <div className="dash-greeting-row">
        <h2 className="dash-greeting">
          {greeting}, {userName.charAt(0).toUpperCase() + userName.slice(1)}
        </h2>
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
            <div className="dash-stat-label">Active Projects</div>
            <div className="dash-stat-number blue">
              {fmt(stats.activeProjects)}
            </div>
          </div>
          <i className="fa-solid fa-folder-open dash-stat-icon"></i>
        </div>
        <div className="dash-stat-card">
          <div>
            <div className="dash-stat-label">Open Tasks</div>
            <div className="dash-stat-number blue">{fmt(stats.openTasks)}</div>
          </div>
          <i className="fa-solid fa-list-check dash-stat-icon"></i>
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

      {/* Charts row */}
      <div className="dash-charts-grid">
        <div className="dash-section-card">
          <div className="dash-section-header">
            <h6 className="dash-section-title">Task Status</h6>
          </div>
          <ChartBoundary>
            <DonutChart data={taskData} centerLabel="Tasks" />
            <ChartLegend data={taskData} />
          </ChartBoundary>
        </div>

        <div className="dash-section-card">
          <div className="dash-section-header">
            <h6 className="dash-section-title">Workforce Flight Risk</h6>
          </div>
          <ChartBoundary>
            <DonutChart data={riskData} centerLabel="Staff" />
            <ChartLegend data={riskData} />
          </ChartBoundary>
        </div>
      </div>

      {/* Current Projects health */}
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

      {/* Bottom two columns */}
      <div className="dash-bottom-row">
        {/* Critical Recent Alerts — empty table */}
        <div className="dash-section-card">
          <div className="dash-section-header">
            <h6 className="dash-section-title">Critical Recent Alerts</h6>
          </div>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Employee</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.openAlerts && stats.openAlerts.length > 0 ? (
                stats.openAlerts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.type}</td>
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
        </div>

        {/* Pending Leave */}
        <div className="dash-section-card">
          <div className="dash-section-header">
            <h6 className="dash-section-title">Pending Leave</h6>
          </div>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.pendingLeave?.length === 0 ? (
                <tr>
                  <td colSpan={3} className="dash-empty">
                    No pending leave requests for this month
                  </td>
                </tr>
              ) : (
                stats.pendingLeave?.map((lr) => (
                  <tr key={lr.LeaveRequestID}>
                    <td>
                      <div className="dash-employee-name">{lr.name}</div>
                      <div className="dash-employee-dates">
                        {formatDate(lr.startDate)} – {formatDate(lr.endDate)}
                      </div>
                    </td>
                    <td>{lr.type}</td>
                    <td>
                      <button
                        type="button"
                        className="dash-view-btn"
                        onClick={() => navigate("/admin/leave")}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
