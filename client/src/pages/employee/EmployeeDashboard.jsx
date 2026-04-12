import React, { useEffect, useState } from "react";
import {
  getEmployeeDashboardStatsRequest,
  getEmployeeRatingsRequest,
} from "../../helper_module/authHelper";
import toast from "react-hot-toast";
import "./EmployeeDashboard.css";

function Stars({ rating }) {
  return (
    <div className="ed-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <i
          key={n}
          className={`fa-${n <= rating ? "solid" : "regular"} fa-star${n > rating ? " ed-star-empty" : ""}`}
        ></i>
      ))}
    </div>
  );
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({
    activeTasks: 0,
    overdueTasks: 0,
    pendingLeave: 0,
  });
  const [ratings, setRatings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    getEmployeeDashboardStatsRequest()
      .then((data) => setStats(data.stats))
      .catch((err) => toast.error(err.message || "Failed to load stats"));
  }, []);

  useEffect(() => {
    getEmployeeRatingsRequest(page)
      .then((data) => {
        setRatings(data.ratings || []);
        setTotal(data.total || 0);
      })
      .catch((err) => toast.error(err.message || "Failed to load ratings"));
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="ed-page">
      {/* ── Stat Cards ── */}
      <div className="ed-stats-row">
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

      {/* ── Recent Ratings ── */}
      <div className="ed-ratings-card">
        <div className="ed-ratings-header">
          <div>
            <h3 className="ed-ratings-title">My Recent Ratings</h3>
            <p className="ed-ratings-sub">
              Feedback from <a href="#">project managers</a> on recent
              milestones.
            </p>
          </div>
          <button className="ed-view-btn">
            <i className="fa-solid fa-clock-rotate-left"></i>
            View Full History
          </button>
        </div>

        <table className="ed-table">
          <thead>
            <tr>
              <th>Task Description</th>
              <th>Performance Rating</th>
              <th>Manager Comments</th>
              <th>Date</th>
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
                      <span className="ed-task-dot"></span>
                      {r.title}
                    </span>
                  </td>
                  <td>
                    <Stars rating={r.rating} />
                  </td>
                  <td>
                    <span className="ed-comment">
                      {r.ratingComment ? `"${r.ratingComment}"` : "—"}
                    </span>
                  </td>
                  <td>
                    <span className="ed-date">{fmtDate(r.dueDate)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {total > limit && (
          <div className="ed-pagination">
            <span className="ed-page-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="ed-page-btn"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`ed-page-btn${n === page ? " current" : ""}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="ed-page-btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
