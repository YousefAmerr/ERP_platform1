import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getEmployeeDashboardStatsRequest,
  getEmployeeMonthlyCompletedRequest,
  getEmployeeActiveTasksRequest,
  getEmployeeRatingsRequest,
  getEmployeeRecognitionRequest,
} from "../../helper_module/authHelper";
import toast from "react-hot-toast";
import "./EmployeeDashboard.css";

// Wraps a chart so a render crash never blanks the whole dashboard
class ChartBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error("Employee chart failed to render:", error);
  }
  render() {
    if (this.state.failed)
      return <div className="ed-chart-empty">Chart unavailable</div>;
    return this.props.children;
  }
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function renderStars(rating) {
  const n = Number(rating) || 0;
  return Array.from({ length: 5 }, (_, i) => (
    <i
      key={i}
      className={`fa-star ${i < n ? "fa-solid" : "fa-regular ed-star-empty"}`}
    />
  ));
}

// Returns the formatted due date + whether it is overdue (past) or due soon (≤2 days)
function dueInfo(dueDate) {
  if (!dueDate) return { text: "No due date", soon: false, overdue: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due - today) / 86400000);
  return { text: fmtDate(dueDate), soon: days >= 0 && days <= 2, overdue: days < 0 };
}

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({
    completedTasks: 0,
    activeTasks: 0,
    overdueTasks: 0,
    pendingLeave: 0,
  });
  const [monthly, setMonthly] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [ratings, setRatings] = useState([]);
  const [ratingsPage, setRatingsPage] = useState(1);
  const [ratingsTotalPages, setRatingsTotalPages] = useState(1);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    getEmployeeDashboardStatsRequest()
      .then((data) => setStats(data.stats))
      .catch((err) => toast.error(err.message || "Failed to load stats"));

    // Employee of the Month banner — fail silently so it never breaks the page
    getEmployeeRecognitionRequest()
      .then((data) => setRecognition(data))
      .catch(() => {});

    getEmployeeMonthlyCompletedRequest()
      .then((data) => setMonthly(data.months || []))
      .catch((err) => toast.error(err.message || "Failed to load history"));

    getEmployeeActiveTasksRequest()
      .then((data) => setActiveTasks(data.tasks || []))
      .catch((err) => toast.error(err.message || "Failed to load active tasks"))
      .finally(() => setLoadingTasks(false));
  }, []);

  useEffect(() => {
    getEmployeeRatingsRequest(ratingsPage)
      .then((data) => {
        setRatings(data.ratings || []);
        setRatingsTotalPages(data.totalPages || 1);
      })
      .catch((err) => toast.error(err.message || "Failed to load ratings"));
  }, [ratingsPage]);

  // Build a full Jan–Dec series, filling months with no completions as 0
  const chartData = MONTH_LABELS.map((label, i) => {
    const found = monthly.find((m) => m.month === i + 1);
    return { month: label, count: found ? found.count : 0 };
  });

  return (
    <div className="ed-page">
      {/* ── Employee of the Month celebration banner ── */}
      {recognition?.recognized && (
        <div className="ed-eotm-banner">
          <div className="ed-eotm-medal">
            <i className="fa-solid fa-trophy"></i>
          </div>
          <div className="ed-eotm-content">
            <span className="ed-eotm-pill">
              <i className="fa-solid fa-star"></i> Employee of the Month
            </span>
            <h2 className="ed-eotm-title">
              Congratulations,{" "}
              {recognition.name?.split(" ")[0] || "Champion"}! 🎉
            </h2>
            <p className="ed-eotm-text">
              {recognition.reason ? (
                recognition.reason
              ) : (
                <>
                  You've been named our <strong>Employee of the Month</strong>.
                  Your dedication, consistency, and outstanding work set the
                  standard for the entire team. Keep shining — you've truly
                  earned it!
                </>
              )}
            </p>
          </div>
          <i className="fa-solid fa-award ed-eotm-watermark"></i>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="ed-stats-row">
        <div className="ed-stat-card">
          <div className="ed-stat-top">
            <div className="ed-stat-icon green">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <span className="ed-stat-badge completed">Completed</span>
          </div>
          <p className="ed-stat-label">My Completed Tasks</p>
          <p className="ed-stat-value">
            {String(stats.completedTasks).padStart(2, "0")}
          </p>
        </div>

        <div className="ed-stat-card">
          <div className="ed-stat-top">
            <div className="ed-stat-icon blue">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <span className="ed-stat-badge on-track">On Track</span>
          </div>
          <p className="ed-stat-label">My Active Tasks</p>
          <p className="ed-stat-value">
            {String(stats.activeTasks).padStart(2, "0")}
          </p>
        </div>

        <div className="ed-stat-card">
          <div className="ed-stat-top">
            <div className="ed-stat-icon red">
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
            <span className="ed-stat-badge immediate">Immediate Action</span>
          </div>
          <p className="ed-stat-label">My Overdue Tasks</p>
          <p className="ed-stat-value">
            {String(stats.overdueTasks).padStart(2, "0")}
          </p>
        </div>

        <div className="ed-stat-card">
          <div className="ed-stat-top">
            <div className="ed-stat-icon orange">
              <i className="fa-regular fa-calendar-days"></i>
            </div>
            <span className="ed-stat-badge awaiting">Awaiting</span>
          </div>
          <p className="ed-stat-label">Pending Leave Requests</p>
          <p className="ed-stat-value">
            {String(stats.pendingLeave).padStart(2, "0")}
          </p>
        </div>
      </div>

      {/* ── Productivity history + Active tasks inbox ── */}
      <div className="ed-analytics-row">
        {/* Monthly Productivity History — bar chart */}
        <div className="ed-panel">
          <div className="ed-panel-head">
            <div>
              <h3 className="ed-panel-title">My Completed Tasks History</h3>
              <p className="ed-panel-sub">Tasks completed per month this year</p>
            </div>
            <span className="ed-panel-pill">
              <i className="fa-solid fa-chart-column"></i> {new Date().getFullYear()}
            </span>
          </div>
          <ChartBoundary>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
                barCategoryGap="22%"
              >
                <CartesianGrid vertical={false} stroke="#eef2f7" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#8a96a8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#8a96a8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f6f8fb" }}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    fontSize: "0.8rem",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Completed"
                  fill="#0d9488"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartBoundary>
        </div>

        {/* Active Tasks Inbox — table */}
        <div className="ed-panel">
          <div className="ed-panel-head">
            <div>
              <h3 className="ed-panel-title">Active Tasks Inbox</h3>
              <p className="ed-panel-sub">Tasks currently in progress</p>
            </div>
            <span className="ed-panel-pill blue">
              <i className="fa-solid fa-bolt"></i> {activeTasks.length}
            </span>
          </div>

          {loadingTasks ? (
            <div className="ed-inbox-empty">
              <i className="fa-solid fa-spinner fa-spin"></i> Loading…
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="ed-inbox-empty">
              <i className="fa-solid fa-mug-hot ed-inbox-empty-icon"></i>
              <p className="ed-inbox-empty-title">All caught up!</p>
              <p className="ed-inbox-empty-sub">No active tasks assigned.</p>
            </div>
          ) : (
            <div className="ed-inbox-scroll">
              <table className="ed-inbox-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTasks.map((t) => {
                    const due = dueInfo(t.dueDate);
                    return (
                      <tr key={t.TaskID}>
                        <td>
                          <div className="ed-inbox-task-title">{t.title}</div>
                          <div className="ed-inbox-task-project">
                            <i className="fa-solid fa-folder"></i> {t.projectName}
                          </div>
                        </td>
                        <td>
                          {due.overdue ? (
                            <span className="ed-due-overdue">
                              <i className="fa-solid fa-triangle-exclamation"></i>{" "}
                              {due.text} · Overdue
                            </span>
                          ) : due.soon ? (
                            <span className="ed-due-soon">
                              <i className="fa-solid fa-triangle-exclamation"></i>{" "}
                              {due.text}
                            </span>
                          ) : (
                            <span className="ed-due-normal">{due.text}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── My Recent Ratings ── */}
      <div className="ed-ratings-card" style={{ marginTop: 20 }}>
        <div className="ed-ratings-header">
          <div>
            <h3 className="ed-ratings-title">My Recent Ratings</h3>
            <p className="ed-ratings-sub">Feedback from your manager on completed tasks</p>
          </div>
        </div>

        <table className="ed-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Date</th>
              <th>Comment</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {ratings.length === 0 ? (
              <tr className="ed-empty-row">
                <td colSpan={4}>No ratings yet.</td>
              </tr>
            ) : (
              ratings.map((r) => (
                <tr key={r.TaskID}>
                  <td>
                    <span className="ed-task-name">
                      <span className="ed-task-dot" />
                      {r.title}
                    </span>
                  </td>
                  <td>
                    <span className="ed-date">{fmtDate(r.dueDate)}</span>
                  </td>
                  <td>
                    <span className="ed-comment">{r.ratingComment || "—"}</span>
                  </td>
                  <td>
                    <span className="ed-stars">{renderStars(r.rating)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {ratingsTotalPages > 1 && (
          <div className="ed-pagination">
            <span className="ed-page-info">
              Page {ratingsPage} of {ratingsTotalPages}
            </span>
            <button
              className="ed-page-btn"
              disabled={ratingsPage === 1}
              onClick={() => setRatingsPage((p) => p - 1)}
            >
              ‹
            </button>
            <button
              className="ed-page-btn current"
              disabled
            >
              {ratingsPage}
            </button>
            <button
              className="ed-page-btn"
              disabled={ratingsPage === ratingsTotalPages}
              onClick={() => setRatingsPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
