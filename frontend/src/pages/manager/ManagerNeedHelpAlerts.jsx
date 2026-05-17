import React, { useState } from "react";
import "./ManagerNeedHelpAlerts.css";

const LIMIT = 5;
const TOTAL_PAGES = 4; // placeholder total for UI

export default function ManagerNeedHelpAlerts() {
  const [page, setPage] = useState(1);

  // Empty rows — no DB calls yet
  const rows = [];

  return (
    <div className="mnha-page">
      {/* Breadcrumb */}
      <div className="mnha-breadcrumb">
        <span className="mnha-bc-parent">ERP Manager</span>
        <span className="mnha-bc-sep">/</span>
        <span className="mnha-bc-current">Need Help Alerts</span>
      </div>

      {/* Card */}
      <div className="mnha-card">
        {/* Header */}
        <div className="mnha-card-header">
          <div className="mnha-header-left">
            <h2 className="mnha-card-title">Recent Alerts</h2>
            <span className="mnha-entry-count">Showing 0 entries</span>
          </div>
          <div className="mnha-header-icons">
            <button className="mnha-icon-btn" title="Filter">
              <i className="fa-solid fa-bars-filter"></i>
            </button>
            <button className="mnha-icon-btn" title="More options">
              <i className="fa-solid fa-sliders"></i>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mnha-table-wrap">
          <table className="mnha-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr className="mnha-empty-row">
                  <td colSpan={5}>No recent alerts</td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <div className="mnha-emp-cell">
                        <div
                          className="mnha-avatar"
                          style={{ background: row.avatarColor }}
                        >
                          {row.initials}
                        </div>
                        <div>
                          <div className="mnha-emp-name">{row.name}</div>
                          <div className="mnha-emp-dept">{row.dept}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="mnha-reason">{row.reason}</span>
                    </td>
                    <td>
                      <div className="mnha-date-main">{row.date}</div>
                      <div className="mnha-date-time">{row.time}</div>
                    </td>
                    <td>
                      <span className={`mnha-status-badge ${row.statusClass}`}>
                        {row.statusLabel}
                      </span>
                    </td>
                    <td>
                      <button className="mnha-view-btn">View Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mnha-card-footer">
          <span className="mnha-page-info">
            Page {page} of {TOTAL_PAGES}
          </span>
          <div className="mnha-pagination">
            <button
              className="mnha-page-btn"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
              className="mnha-page-btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === TOTAL_PAGES}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
