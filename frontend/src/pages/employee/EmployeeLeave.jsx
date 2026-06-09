import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  submitEmployeeLeaveRequest,
  getEmployeeLeavesRequest,
  getEmployeeLeaveYears,
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

function statusClass(status) {
  if (!status) return "pending";
  return status.toLowerCase();
}

const MONTH_OPTIONS = [
  { val: "1", label: "January" },
  { val: "2", label: "February" },
  { val: "3", label: "March" },
  { val: "4", label: "April" },
  { val: "5", label: "May" },
  { val: "6", label: "June" },
  { val: "7", label: "July" },
  { val: "8", label: "August" },
  { val: "9", label: "September" },
  { val: "10", label: "October" },
  { val: "11", label: "November" },
  { val: "12", label: "December" },
];

export default function EmployeeLeave() {
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    type: "Annual",
    reason: "",
  });
  const [attachFile, setAttachFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [yearOptions, setYearOptions] = useState([]);
  const limit = 10;

  // Fetch available years from DB once on mount
  useEffect(() => {
    getEmployeeLeaveYears()
      .then((yrs) => setYearOptions(yrs))
      .catch(() => {});
  }, []);

  const loadLeaves = useCallback(
    (p = page, month = filterMonth, year = filterYear) => {
      getEmployeeLeavesRequest(p, month || null, year || null)
        .then((data) => {
          setRequests(data.requests || []);
          setTotal(data.total || 0);
        })
        .catch((err) =>
          toast.error(err.message || "Failed to load leave requests"),
        );
    },
    [page, filterMonth, filterYear],
  );

  useEffect(() => {
    loadLeaves(page, filterMonth, filterYear);
  }, [loadLeaves, page, filterMonth, filterYear]);

  function handleMonthChange(e) {
    setFilterMonth(e.target.value);
    setPage(1);
  }

  function handleYearChange(e) {
    setFilterYear(e.target.value);
    setPage(1);
  }

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
      await submitEmployeeLeaveRequest(
        {
          startDate: form.startDate,
          endDate: form.endDate,
          type: form.type,
          reason: form.reason.trim(),
        },
        attachFile,
      );
      toast.success("Leave request submitted!");
      setForm({ startDate: "", endDate: "", type: "Annual", reason: "" });
      setAttachFile(null);
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
      <h2 className="el-history-title mb-3">Submit Leave Request</h2>
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

          <div className="el-row">
            <div className="el-field full">
              <label className="el-label">
                Attachment{" "}
                <span
                  style={{
                    color: "#9ca3af",
                    textTransform: "none",
                    fontWeight: 400,
                    letterSpacing: 0,
                  }}
                >
                  (Optional)
                </span>
              </label>
              <label className="el-file-label">
                <i className="fa-solid fa-paperclip"></i>
                <span>
                  {attachFile ? attachFile.name : "Click to upload a file"}
                </span>
                <input
                  type="file"
                  className="el-file-input"
                  onChange={(e) => setAttachFile(e.target.files[0] || null)}
                />
              </label>
              {attachFile && (
                <button
                  type="button"
                  className="el-file-remove"
                  onClick={() => setAttachFile(null)}
                >
                  <i className="fa-solid fa-xmark"></i> Remove
                </button>
              )}
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
            <select
              className="el-month-select"
              value={filterYear}
              onChange={handleYearChange}
            >
              <option value="">All Years</option>
              {yearOptions.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            <select
              className="el-month-select"
              value={filterMonth}
              onChange={handleMonthChange}
            >
              <option value="">All Months</option>
              {MONTH_OPTIONS.map((o) => (
                <option key={o.val} value={o.val}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="el-table-card">
          <table className="el-table">
            <thead>
              <tr>
                <th>Request Date</th>
                <th>Leave Date</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Attachment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr className="el-empty-row">
                  <td colSpan={6}>No leave requests found.</td>
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
                          {days} Leave Day{days !== 1 ? "s" : ""}
                        </div>
                      </td>
                      <td>
                        <span className="el-type-text">
                          {typeLabel(r.type)}
                        </span>
                      </td>
                      <td>
                        <div className="el-reason-cell">{r.Leave_reason}</div>
                      </td>
                      <td>
                        {r.leave_attachments_path ? (
                          <a
                            href={`/assets/uploads/${r.leave_attachments_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="el-attach-link"
                          >
                            <i className="fa-solid fa-paperclip"></i> View
                          </a>
                        ) : (
                          <span className="el-no-attach">—</span>
                        )}
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
