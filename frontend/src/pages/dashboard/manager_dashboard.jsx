import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import {
  getManagerDashboardStatsRequest,
  getManagerCompletedTasksRequest,
} from "../../helper_module/authHelper";
import "./manager_dashboard.css";

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
    console.error("Manager chart failed to render:", error);
  }
  render() {
    if (this.state.failed)
      return <div className="mgr-chart-empty">Chart unavailable</div>;
    return this.props.children;
  }
}

// Donut with a centered total; falls back to a message when empty
const DonutChart = ({ data, centerLabel }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <div className="mgr-chart-empty">No data yet</div>;
  return (
    <div className="mgr-donut-wrap">
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
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
      <div className="mgr-donut-center">
        <div className="mgr-donut-total">{total}</div>
        <div className="mgr-donut-sub">{centerLabel}</div>
      </div>
    </div>
  );
};

const ChartLegend = ({ data }) => (
  <div className="mgr-legend">
    {data.map((d) => (
      <div key={d.name} className="mgr-legend-item">
        <span className="mgr-legend-dot" style={{ background: d.color }} />
        {d.name} <strong>{d.value}</strong>
      </div>
    ))}
  </div>
);

// Static legend for the project-health stacked bar
const StaticLegend = ({ items }) => (
  <div className="mgr-legend">
    {items.map((it) => (
      <div key={it.label} className="mgr-legend-item">
        <span className="mgr-legend-dot" style={{ background: it.color }} />
        {it.label}
      </div>
    ))}
  </div>
);

function truncateName(v) {
  return v && v.length > 13 ? v.slice(0, 13) + "…" : v;
}

// Teal (good) → amber (ok) → crimson (weak) by average rating
function ratingColor(r) {
  if (r >= 4) return "#0d9488";
  if (r >= 2.5) return "#f59e0b";
  return "#e11d48";
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

  const ts = stats.taskStatus || { inProgress: 0, done: 0, overdue: 0 };
  const taskData = [
    { name: "In Progress", value: ts.inProgress, color: "#60a5fa" },
    { name: "Done", value: ts.done, color: "#34d399" },
    { name: "Overdue", value: ts.overdue, color: "#fb7185" },
  ];
  const performanceData = stats.performanceByEmployee || [];
  const projectStatusData = stats.projectStatus || [];

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

      {/* ── Charts: row 1 (status + workload) ── */}
      <div className="mgr-charts-row1">
        <div className="mgr-section-card mgr-chart-card">
          <div className="mgr-section-header">
            <h6 className="mgr-section-title">Team Task Status</h6>
          </div>
          <ChartBoundary>
            <DonutChart data={taskData} centerLabel="Tasks" />
            <ChartLegend data={taskData} />
          </ChartBoundary>
        </div>

        <div className="mgr-section-card mgr-chart-card">
          <div className="mgr-section-header">
            <h6 className="mgr-section-title">Team Performance</h6>
            <span className="mgr-chart-hint">Avg rating · out of 5 ★</span>
          </div>
          <ChartBoundary>
            {performanceData.length === 0 ? (
              <div className="mgr-chart-empty">No rated tasks yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  layout="vertical"
                  data={performanceData}
                  margin={{ top: 4, right: 40, left: 8, bottom: 0 }}
                  barCategoryGap="24%"
                >
                  <XAxis type="number" domain={[0, 5]} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={104}
                    tick={{ fontSize: 12, fill: "#1f2a44" }}
                    tickFormatter={truncateName}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f0f4f8" }}
                    formatter={(v, n, p) => [
                      `${v} ★  (${p.payload.ratedTasks} task${p.payload.ratedTasks === 1 ? "" : "s"})`,
                      "Avg rating",
                    ]}
                  />
                  <Bar dataKey="avgRating" radius={[0, 6, 6, 0]} barSize={20}>
                    {performanceData.map((d) => (
                      <Cell key={d.name} fill={ratingColor(d.avgRating)} />
                    ))}
                    <LabelList
                      dataKey="avgRating"
                      position="right"
                      formatter={(v) => `${Number(v).toFixed(1)}★`}
                      fill="#6b7590"
                      fontSize={11}
                      fontWeight={700}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartBoundary>
        </div>
      </div>

      {/* ── Charts: row 2 (project health, full width) ── */}
      <div className="mgr-section-card mgr-chart-card">
        <div className="mgr-section-header">
          <h6 className="mgr-section-title">Project Health</h6>
          <StaticLegend
            items={[
              { label: "In Progress", color: "#6366f1" },
              { label: "Done", color: "#16a34a" },
              { label: "Overdue", color: "#ea580c" },
            ]}
          />
        </div>
        <ChartBoundary>
          {projectStatusData.length === 0 ? (
            <div className="mgr-chart-empty">No active projects</div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(130, projectStatusData.length * 72)}
            >
              <BarChart
                layout="vertical"
                data={projectStatusData}
                margin={{ top: 6, right: 24, left: 8, bottom: 0 }}
              >
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 13, fill: "#1f2a44", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar
                  dataKey="inProgress"
                  name="In Progress"
                  stackId="a"
                  fill="#6366f1"
                  barSize={30}
                  radius={[6, 0, 0, 6]}
                >
                  <LabelList dataKey="inProgress" position="center" fill="#fff" fontSize={12} fontWeight={700} formatter={(v) => (v ? v : "")} />
                </Bar>
                <Bar dataKey="done" name="Done" stackId="a" fill="#16a34a" barSize={30}>
                  <LabelList dataKey="done" position="center" fill="#fff" fontSize={12} fontWeight={700} formatter={(v) => (v ? v : "")} />
                </Bar>
                <Bar
                  dataKey="overdue"
                  name="Overdue"
                  stackId="a"
                  fill="#ea580c"
                  barSize={30}
                  radius={[0, 6, 6, 0]}
                >
                  <LabelList dataKey="overdue" position="center" fill="#fff" fontSize={12} fontWeight={700} formatter={(v) => (v ? v : "")} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartBoundary>
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
