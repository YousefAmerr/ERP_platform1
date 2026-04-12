import React, { useState } from "react";
import "./TurnoverAlerts.css";

/* bar chart column heights (decorative) */
const BAR_HEIGHTS = [20, 32, 24, 42, 36, 54, 46];

const TurnoverAlerts = () => {
  const [page, setPage] = useState(1);
  const totalPages = 0; // will be set when backend is connected

  return (
    <>
      {/* ── Stat Cards Row ── */}
      <div className="ta-stats-row">
        {/* Critical Retention */}
        <div className="ta-stat-card">
          <div className="ta-stat-icon-wrap orange">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="ta-stat-label">Critical Retention</div>
          <div className="ta-stat-number">—</div>
          <div className="ta-stat-delta up">
            <i className="fa-solid fa-arrow-trend-up"></i>
            <span>No data yet</span>
          </div>
        </div>

        {/* Support Requests */}
        <div className="ta-stat-card">
          <div className="ta-stat-icon-wrap blue">
            <i className="fa-solid fa-headset"></i>
          </div>
          <div className="ta-stat-label">Support Requests</div>
          <div className="ta-stat-number">—</div>
          <div className="ta-stat-delta down">
            <i className="fa-solid fa-arrow-trend-down"></i>
            <span>No data yet</span>
          </div>
        </div>

        {/* Resolution Efficiency */}
        <div className="ta-eff-card">
          <div className="ta-eff-left">
            <div className="ta-eff-label">Resolution Efficiency</div>
            <div className="ta-eff-value">—</div>
            <div className="ta-eff-bar-track">
              <div className="ta-eff-bar-fill" style={{ width: "0%" }}></div>
            </div>
            <div className="ta-eff-goal">
              Goal: 90% resolution within 24 hours
            </div>
          </div>
          <div className="ta-eff-chart">
            {BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className={`ta-eff-bar-col${i === BAR_HEIGHTS.length - 1 ? " highlight" : ""}`}
                style={{ height: h }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active Alert Feed ── */}
      <div className="ta-feed-card">
        <div className="ta-feed-header">
          <div>
            <p className="ta-feed-title">Active Alert Feed</p>
            <p className="ta-feed-subtitle">
              Real-time monitoring of turnover indicators and employee help
              requests.
            </p>
          </div>
          <div className="ta-feed-actions">
            <button className="ta-export-btn">Export PDF</button>
            <button className="ta-filter-btn">
              <i className="fa-solid fa-sliders"></i>
              Filter View
            </button>
          </div>
        </div>

        <table className="ta-table">
          <thead>
            <tr>
              <th>Alert Type</th>
              <th>Employee</th>
              <th>Reason</th>
              <th>Created Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="ta-empty">
                No active alerts at this time
              </td>
            </tr>
          </tbody>
        </table>

        <div className="ta-feed-footer">
          <span className="ta-showing">Showing 0 active alerts</span>
          <div className="ta-pag">
            <button
              className="ta-pag-arrow"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <span className="ta-pag-info">
              {page} / {Math.max(totalPages, 1)}
            </span>
            <button
              className="ta-pag-arrow"
              disabled={page >= Math.max(totalPages, 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TurnoverAlerts;
