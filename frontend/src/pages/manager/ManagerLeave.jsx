import React, { useState, useEffect, useRef } from "react";
import { getManagerLeaveRequest } from "../../helper_module/authHelper";
import "./ManagerLeave.css";

const LIMIT = 5;

const AVATAR_COLORS = [
  "#4f46e5",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0284c7",
  "#65a30d",
];

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

function getAvatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysBetween(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 1;
}

function formatDateRange(start, end) {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s === e) return s;
  return `${s} - ${e}`;
}

function formatType(type) {
  const map = {
    Annual: "Annual Leave",
    Sick: "Sick Leave",
    Emergency: "Emergency Leave",
  };
  return map[type] || type;
}

const FILTER_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "Pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function ManagerLeave() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    async function loadManagerLeave() {
      setLoading(true);
      try {
        const data = await getManagerLeaveRequest(page, LIMIT, status);
        setRows(data.rows || []);
        setTotal(data.total || 0);
      } catch {
        setRows([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }

    loadManagerLeave();
  }, [page, status]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const currentLabel =
    FILTER_OPTIONS.find((o) => o.value === status)?.label || "All Status";

  function handleStatusChange(val) {
    setStatus(val);
    setPage(1);
    setDropOpen(false);
  }

  function statusBadgeClass(s) {
    if (!s) return "pending";
    const l = s.toLowerCase();
    if (l === "approved") return "approved";
    if (l === "rejected") return "rejected";
    return "pending";
  }

  function statusLabel(s) {
    if (!s) return "Pending";
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  return (
    <div className="mgl-page">
      {/* Header */}
      <div className="mgl-header">
        <div className="mgl-breadcrumb">
          <span className="mgl-breadcrumb-item">Leave Management</span>
          <span className="mgl-breadcrumb-sep">|</span>
          <span className="mgl-breadcrumb-item active">Reports</span>
        </div>
        <h1 className="mgl-title">Leave Management</h1>
        <p className="mgl-subtitle">
          <strong>Monitor</strong> and <strong>review</strong> department leave
          schedules and <strong>pending requests.</strong>
        </p>
      </div>

      {/* Table Card */}
      <div className="mgl-card">
        {/* Card Header */}
        <div className="mgl-card-header">
          <div className="mgl-card-title-row">
            <h2 className="mgl-card-title">Team Leave Requests</h2>
            <span className="mgl-view-only-badge">(View Only)</span>
          </div>

          {/* Filter */}
          <div style={{ position: "relative" }} ref={dropRef}>
            <button
              className="mgl-filter-btn"
              onClick={() => setDropOpen((p) => !p)}
            >
              <i className="fa-solid fa-filter"></i>
              {currentLabel}
              <i className="fa-solid fa-chevron-down"></i>
            </button>
            {dropOpen && (
              <div className="mgl-filter-dropdown">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`mgl-filter-option${status === opt.value ? " selected" : ""}`}
                    onClick={() => handleStatusChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="mgl-table-wrap">
          <table className="mgl-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Dates</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="mgl-empty-row">
                  <td colSpan={5}>Loading...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr className="mgl-empty-row">
                  <td colSpan={5}>No leave requests found.</td>
                </tr>
              ) : (
                rows.map((row) => {
                  const days = daysBetween(row.startDate, row.endDate);
                  return (
                    <tr key={row.LeaveRequestID}>
                      {/* Employee */}
                      <td>
                        <div className="mgl-employee-cell">
                          <div
                            className="mgl-avatar"
                            style={{
                              background: getAvatarColor(
                                row.employeeName || "",
                              ),
                            }}
                          >
                            {getInitials(row.employeeName || "")}
                          </div>
                          <div>
                            <div className="mgl-emp-name">
                              {row.employeeName}
                            </div>
                            <div className="mgl-emp-role">
                              {row.employeeRole
                                ? row.employeeRole.charAt(0).toUpperCase() +
                                  row.employeeRole.slice(1).toLowerCase()
                                : ""}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Dates */}
                      <td>
                        <div className="mgl-date-range">
                          {formatDateRange(row.startDate, row.endDate)}
                        </div>
                        <div className="mgl-day-count">
                          {days} Day{days !== 1 ? "s" : ""} total
                        </div>
                      </td>

                      {/* Type */}
                      <td>
                        <span className="mgl-type-text">
                          {formatType(row.type)}
                        </span>
                      </td>

                      {/* Reason */}
                      <td>
                        <span
                          className="mgl-reason-text"
                          title={row.Leave_reason}
                        >
                          {row.Leave_reason}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`mgl-status-badge ${statusBadgeClass(row.Leave_status)}`}
                        >
                          {statusLabel(row.Leave_status)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="mgl-card-footer">
          <span className="mgl-footer-info">
            Showing {rows.length} of {total} active requests
          </span>
          <div className="mgl-pagination">
            <button
              className="mgl-page-btn"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              <i
                className="fa-solid fa-chevron-left"
                style={{ fontSize: "0.65rem" }}
              ></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`mgl-page-btn${page === p ? " active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="mgl-page-btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
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
