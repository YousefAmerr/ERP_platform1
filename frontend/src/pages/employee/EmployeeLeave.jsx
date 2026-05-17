import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  submitEmployeeLeaveRequest,
  getEmployeeLeavesRequest,
} from "../../helper_module/authHelper";
import "./EmployeeLeave.css";

const LEAVE_TYPES = ["Annual", "Sick", "Emergency"];

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function fmtDateShort(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

function workingDays(start, end) {
  if (!start || !end) return 0;
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

function typeLabel(type) {
  if (type === "Annual") return "Annual Leave";
  if (type === "Sick") return "Sick Leave";
  if (type === "Emergency") return "Emergency Leave";
  return type;
}

function typeDotClass(type) {
  if (type === "Annual") return "annual";
  if (type === "Sick") return "sick";
  return "emergency";
}

function statusClass(status) {
  if (!status) return "pending";
  return status.toLowerCase();
}

export default function EmployeeLeave() {
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    type: "Annual",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const loadLeaves = (p = page) => {
    getEmployeeLeavesRequest(p)
      .then((data) => {
        setRequests(data.requests || []);
        setTotal(data.total || 0);
      })
      .catch((err) =>
        toast.error(err.message || "Failed to load leave requests"),
      );
  };

  useEffect(() => {
    loadLeaves(page);
  }, [page]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error("End date cannot be before start date");
      return;
    }
    setSubmitting(true);
    try {
      await submitEmployeeLeaveRequest({
        startDate: form.startDate,
        endDate: form.endDate,
        type: form.type,
        reason: form.reason.trim(),
      });
      toast.success("Leave request submitted!");
      setForm({ startDate: "", endDate: "", type: "Annual", reason: "" });
      setPage(1);
      loadLeaves(1);
    } catch (err) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="el-page">
      {/* ── Request Form ── */}
      <div className="el-form-card">
        <form onSubmit={handleSubmit}>
          <div className="el-row">
            <div className="el-field">
              <label className="el-label">From Date</label>
              <input
                type="date"
                name="startDate"
                className="el-input"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="el-field">
              <label className="el-label">To Date</label>
              <input
                type="date"
                name="endDate"
                className="el-input"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="el-row">
            <div className="el-field">
              <label className="el-label">Leave Type</label>
              <select
                name="type"
                className="el-select"
                value={form.type}
                onChange={handleChange}
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {typeLabel(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="el-row">
            <div className="el-field full">
              <label className="el-label">
                Reason <span>For Leave</span>
              </label>
              <textarea
                name="reason"
                className="el-textarea"
                placeholder="Please provide a brief reason for your request..."
                value={form.reason}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="el-submit-row">
            <button
              type="submit"
              className="el-submit-btn"
              disabled={submitting}
            >
              <i className="fa-solid fa-arrow-right"></i>
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>

      {/* ── History ── */}
      <div>
        <p className="el-history-label">History</p>
        <div className="el-history-header">
          <h2 className="el-history-title">My Leave Requests</h2>
          <div className="el-history-actions">
            <button className="el-icon-btn" title="Filter">
              <i className="fa-solid fa-filter"></i>
            </button>
            <button className="el-icon-btn" title="Export">
              <i className="fa-solid fa-download"></i>
            </button>
          </div>
        </div>

        <div className="el-table-card">
          <table className="el-table">
            <thead>
              <tr>
                <th>Request Date</th>
                <th>Dates</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr className="el-empty-row">
                  <td colSpan={5}>No leave requests found.</td>
                </tr>
              ) : (
                requests.map((r) => {
                  const days = workingDays(r.startDate, r.endDate);
                  return (
                    <tr key={r.LeaveRequestID}>
                      <td>
                        <span className="el-req-date">
                          {fmtDate(r.created_at)}
                        </span>
                      </td>
                      <td>
                        <div className="el-dates-range">
                          {fmtDateShort(r.startDate)} –{" "}
                          {fmtDateShort(r.endDate)}
                        </div>
                        <div className="el-dates-days">
                          {days} Working Day{days !== 1 ? "s" : ""}
                        </div>
                      </td>
                      <td>
                        <div className="el-type-wrap">
                          <span
                            className={`el-type-dot ${typeDotClass(r.type)}`}
                          ></span>
                          {typeLabel(r.type)}
                        </div>
                      </td>
                      <td>
                        <span className="el-reason" title={r.Leave_reason}>
                          {r.Leave_reason}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`el-status ${statusClass(r.Leave_status)}`}
                        >
                          {r.Leave_status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {total > limit && (
            <div className="el-pagination">
              <span className="el-page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="el-page-btn"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`el-page-btn${n === page ? " current" : ""}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="el-page-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
