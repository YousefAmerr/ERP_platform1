import React, { useState } from "react";
import "./RecognitionAlerts.css";

const RecognitionAlerts = () => {
  const [page, setPage] = useState(1);
  const total = 0;
  const limit = 10;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const startRow = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, total);

  return (
    <>
      {/* ── Stat Cards ── */}
      <div className="ra-stats-row">
        {/* Open Alerts */}
        <div className="ra-stat-card">
          <div className="ra-stat-top">
            <div className="ra-stat-icon-wrap purple">
              <i className="fa-regular fa-face-smile"></i>
            </div>
            <span className="ra-stat-badge">—</span>
          </div>
          <div className="ra-stat-label">Open Alerts</div>
          <div className="ra-stat-number">—</div>
        </div>

        {/* Resolved Today */}
        <div className="ra-stat-card">
          <div className="ra-stat-top">
            <div className="ra-stat-icon-wrap blue">
              <i className="fa-regular fa-circle-check"></i>
            </div>
            <span className="ra-stat-badge gray">—</span>
          </div>
          <div className="ra-stat-label">Resolved Today</div>
          <div className="ra-stat-number">—</div>
        </div>

        {/* Total Recognitions */}
        <div className="ra-stat-card">
          <div className="ra-stat-top">
            <div className="ra-stat-icon-wrap orange">
              <i className="fa-solid fa-trophy"></i>
            </div>
            <span className="ra-stat-badge orange">—</span>
          </div>
          <div className="ra-stat-label">Total Recognitions</div>
          <div className="ra-stat-number">—</div>
        </div>
      </div>

      {/* ── Recent Alerts Table ── */}
      <div className="ra-feed-card">
        <div className="ra-feed-header">
          <h6 className="ra-feed-title">Recent Alerts</h6>
          <div className="ra-feed-header-right">
            <span className="ra-showing">
              Showing {startRow}
              {endRow > 0 ? `–${endRow}` : ""} of {total}
            </span>
            <div className="ra-pag-group">
              <button
                className="ra-pag-arrow"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                className="ra-pag-arrow"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
            <button className="ra-export-btn">
              <i className="fa-solid fa-file-export"></i>
              Export CSV
            </button>
          </div>
        </div>

        <table className="ra-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Created Date</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="ra-empty">
                No recognition alerts at this time
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default RecognitionAlerts;
