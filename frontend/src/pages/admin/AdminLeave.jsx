import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getLeaveStatsRequest,
  getLeaveListRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "../../helper_module/authHelper";
import "./AdminLeave.css";

const LIMIT = 10;
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

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function businessDays(start, end) {
  let count = 0;
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function typeBadgeClass(type) {
  if (!type) return "";
  const t = type.toLowerCase();
  if (t === "annual") return "annual";
  if (t === "sick") return "sick";
  return "emergency";
}

function typeLabel(type) {
  if (!type) return "";
  if (type === "Annual") return "Annual Leave";
  if (type === "Sick") return "Sick Leave";
  return "Emergency Leave";
}

function getPagesToShow(page, totalPages) {
  if (totalPages <= 5)
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, "...", totalPages];
  if (page >= totalPages - 2)
    return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  return [1, "...", page, "...", totalPages];
}

const AdminLeave = () => {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [requests, setReq] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null); // id of row being actioned

  const totalPages = Math.ceil(total / LIMIT);
  const startRow = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const endRow = Math.min(page * LIMIT, total);

  const fetchStats = () =>
    getLeaveStatsRequest()
      .then(setStats)
      .catch(() => {});

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLeaveListRequest(page, LIMIT);
      setReq(data.requests);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchStats();
  }, []);
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleAction = async (id, action) => {
    setActing(id);
    try {
      if (action === "approve") {
        await approveLeaveRequest(id);
        toast.success("Leave approved");
      } else {
        await rejectLeaveRequest(id);
        toast.success("Leave rejected");
      }
      fetchStats();
      fetchList();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActing(null);
    }
  };

  return (
    <>
      {/* ── Stat Cards ── */}
      <div className="leave-stats-row">
        <div className="leave-stat-card">
          <div>
            <div className="leave-stat-label">Pending Leave Requests</div>
            <div className="leave-stat-number blue">{stats.pending}</div>
            <p className="leave-stat-sub blue">Requires immediate review</p>
          </div>
          <div className="leave-stat-icon-wrap blue">
            <i className="fa-regular fa-clock"></i>
          </div>
        </div>

        <div className="leave-stat-card">
          <div>
            <div className="leave-stat-label">Approved Leave requests</div>
            <div className="leave-stat-number green">{stats.approved}</div>
            <p className="leave-stat-sub green">Total for this month</p>
          </div>
          <div className="leave-stat-icon-wrap green">
            <i className="fa-regular fa-circle-check"></i>
          </div>
        </div>

        <div className="leave-stat-card">
          <div>
            <div className="leave-stat-label">Rejected Leave requests</div>
            <div className="leave-stat-number dark">{stats.rejected}</div>
            <p className="leave-stat-sub green">Total for this month</p>
          </div>
          <div className="leave-stat-icon-wrap red">
            <i className="fa-regular fa-circle-xmark"></i>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="leave-table-card">
        <div className="leave-table-header">
          <h6 className="leave-table-title">Leave Requests Management</h6>
          <div className="leave-header-actions">
            <button className="leave-filter-btn">
              <i className="fa-solid fa-sliders" style={{ marginRight: 6 }}></i>
              Filters
            </button>
          </div>
        </div>

        <table className="leave-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Dates</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="leave-empty">
                  <i className="fa-solid fa-spinner fa-spin"></i> Loading…
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="leave-empty">
                  No leave requests found
                </td>
              </tr>
            ) : (
              requests.map((r) => {
                const days = businessDays(r.startDate, r.endDate);
                const sameDay =
                  formatDate(r.startDate) === formatDate(r.endDate);
                const isPending = r.Leave_status === "Pending";
                const isActing = acting === r.LeaveRequestID;

                return (
                  <tr key={r.LeaveRequestID}>
                    <td>
                      <div className="leave-employee">
                        <div
                          className="leave-avatar"
                          style={{ background: getAvatarColor(r.employeeName) }}
                        >
                          {getInitials(r.employeeName)}
                        </div>
                        <div>
                          <div className="leave-emp-name">{r.employeeName}</div>
                          <div className="leave-emp-role">{r.employeeRole}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="leave-date-range">
                        {sameDay
                          ? formatDate(r.startDate)
                          : `${formatDate(r.startDate)} — ${formatDate(r.endDate)}`}
                      </div>
                      <div className="leave-date-days">
                        {days} Business {days === 1 ? "Day" : "Days"}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`leave-type-badge ${typeBadgeClass(r.type)}`}
                      >
                        {typeLabel(r.type)}
                      </span>
                    </td>
                    <td>
                      <div className="leave-reason" title={r.Leave_reason}>
                        {r.Leave_reason || "—"}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`leave-status-badge ${r.Leave_status?.toLowerCase()}`}
                      >
                        {r.Leave_status?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="leave-actions">
                        <button
                          className="leave-act-btn approve"
                          title="Approve"
                          disabled={!isPending || isActing}
                          onClick={() =>
                            handleAction(r.LeaveRequestID, "approve")
                          }
                        >
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button
                          className="leave-act-btn reject"
                          title="Reject"
                          disabled={!isPending || isActing}
                          onClick={() =>
                            handleAction(r.LeaveRequestID, "reject")
                          }
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="leave-pagination">
          <span className="leave-showing">
            Showing{" "}
            <span>
              {startRow}-{endRow}
            </span>{" "}
            of <span>{total}</span> requests
          </span>
          <div className="leave-pag-controls">
            <button
              className="leave-pag-arrow"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            {getPagesToShow(page, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="leave-pag-dots">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  className={`leave-pag-num ${page === p ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ),
            )}

            <button
              className="leave-pag-arrow"
              disabled={page >= totalPages}
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

export default AdminLeave;
