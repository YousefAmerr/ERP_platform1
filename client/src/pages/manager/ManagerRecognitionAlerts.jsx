import React, { useState } from "react";
import "./ManagerRecognitionAlerts.css";

const TOTAL_PAGES = 3; // placeholder — no DB calls

export default function ManagerRecognitionAlerts() {
  const [page, setPage] = useState(1);

  // Empty rows — backend not connected yet
  const rows = [];
  const total = 0;

  return (
    <div className="mra-page">
      <div className="mra-card">
        {/* Header */}
        <div className="mra-card-header">
          <div className="mra-header-left">
            <h2 className="mra-card-title">Recent Alerts</h2>
            <p className="mra-card-subtitle">
              Review and manage recent <strong>employee recognition</strong>{" "}
              notifications.
            </p>
          </div>
          <div className="mra-header-actions">
            <button className="mra-filter-btn">
              <i className="fa-solid fa-filter"></i>
              Filter
            </button>
            <button className="mra-export-btn">
              <i className="fa-solid fa-file-csv"></i>
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mra-table-wrap">
          <table className="mra-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr className="mra-empty-row">
                  <td colSpan={5}>No recent alerts</td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <div className="mra-emp-cell">
                        <div
                          className="mra-avatar"
                          style={{ background: row.avatarColor }}
                        >
                          {row.initials}
                        </div>
                        <div>
                          <div className="mra-emp-name">{row.name}</div>
                          <div className="mra-emp-dept">{row.dept}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="mra-reason-title">{row.reasonTitle}</div>
                      <div className="mra-reason-sub">{row.reasonSub}</div>
                    </td>
                    <td>
                      <span className="mra-date">{row.date}</span>
                    </td>
                    <td>
                      <span className={`mra-status-badge ${row.statusClass}`}>
                        {row.statusLabel}
                      </span>
                    </td>
                    <td>
                      <button className="mra-dots-btn" title="Options">
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mra-card-footer">
          <span className="mra-footer-info">
            Showing <strong>{rows.length}</strong> of <strong>{total}</strong>{" "}
            alerts
          </span>
          <div className="mra-pagination">
            <button
              className="mra-page-btn"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              <i
                className="fa-solid fa-chevron-left"
                style={{ fontSize: "0.65rem" }}
              ></i>
            </button>
            {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`mra-page-btn${page === p ? " active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="mra-page-btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === TOTAL_PAGES}
            >
              <i
                className="fa-solid fa-chevron-right"
                style={{ fontSize: "0.65rem" }}
              ></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
