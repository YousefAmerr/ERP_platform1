import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import {
  getNeedHelpAlertsRequest,
  acknowledgeNeedHelpAlertRequest,
} from "../../helper_module/authHelper";
import "./ManagerNeedHelpAlerts.css";

export default function ManagerNeedHelpAlerts() {
  const navigate = useNavigate();

  const [alerts, setAlerts]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [confirmId, setConfirmId] = useState(null);
  const [actioning, setActioning] = useState(false);

  const fetchAlerts = (p = page) => {
    setLoading(true);
    getNeedHelpAlertsRequest(p)
      .then((data) => {
        setAlerts(data.alerts || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch((e) => toast.error(e.message || "Failed to load alerts"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts(page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const confirmAcknowledge = async () => {
    if (!confirmId) return;
    setActioning(true);
    try {
      await acknowledgeNeedHelpAlertRequest(confirmId);
      toast.success("Alert acknowledged");
      fetchAlerts(page);
    } catch (e) {
      toast.error(e.message || "Failed to acknowledge");
    } finally {
      setActioning(false);
      setConfirmId(null);
    }
  };

  return (
    <>
      <div className="mnha-page">
        {/* Breadcrumb */}
        <div className="mnha-breadcrumb">
          <span className="mnha-bc-parent">ERP Manager</span>
          <span className="mnha-bc-sep">/</span>
          <span className="mnha-bc-current">Need Help Alerts</span>
        </div>

        {/* Card — same structure as admin Turnover card */}
        <div className="ta-feed-card">
          <div className="ta-feed-header">
            <div>
              <p className="ta-feed-title">Need Help Alerts</p>
              <p className="ta-feed-subtitle">
                Rule-engine alerts triggered by deadline, quality, or capacity risks.
              </p>
            </div>
            <span className="mnha-total-badge">
              {loading ? "…" : `${total} total`}
            </span>
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="ta-empty">
                    <i className="fa-solid fa-spinner fa-spin"></i> Loading…
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="ta-empty">
                    No need-help alerts — team is on track!
                  </td>
                </tr>
              ) : (
                alerts.map((a) => (
                  <tr key={a.AlertID}>
                    {/* Alert type */}
                    <td>
                      <div className="ta-alert-type">
                        <span className="ta-type-label">Need Help</span>
                      </div>
                    </td>

                    {/* Employee */}
                    <td>
                      <div className="ta-employee">
                        <div className="ta-emp-avatar">
                          {a.name?.split(" ")[0]?.[0] || "?"}
                        </div>
                        <div>
                          <div className="ta-emp-name">{a.name || "—"}</div>
                          <div className="ta-emp-role">{a.email || ""}</div>
                        </div>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="ta-reason">{a.reason || "—"}</td>

                    {/* Date */}
                    <td className="ta-date">
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : "—"}
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`ta-status ${(a.status || "").toLowerCase()}`}>
                        {a.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="mnha-row-actions">
                        {(a.status || "").toLowerCase() === "open" && (
                          <button
                            className="ta-action-close"
                            onClick={() => setConfirmId(a.AlertID)}
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          className="mnha-view-tasks-btn"
                          onClick={() =>
                            navigate("/manager/tasks", {
                              state: { employeeId: a.userId, employeeName: a.name },
                            })
                          }
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                          View Tasks
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination footer */}
          {totalPages > 1 && (
            <div className="ta-feed-footer">
              <span className="ta-showing">
                Page {page} of {totalPages}
              </span>
              <div className="ta-pag">
                <button
                  className="ta-pag-arrow"
                  disabled={page === 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <span className="ta-pag-info">{page}</span>
                <button
                  className="ta-pag-arrow"
                  disabled={page === totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm acknowledge modal — same pattern as Turnover alerts */}
      {confirmId && (
        <div className="ta-modal-overlay">
          <div className="ta-modal-card">
            <h3>Confirm Acknowledge</h3>
            <p>
              Acknowledging this alert lets the employee know their situation has been
              seen. You can follow up via their task list.
            </p>
            <div className="ta-modal-actions">
              <button
                className="ta-modal-cancel"
                onClick={() => setConfirmId(null)}
              >
                Cancel
              </button>
              <button
                className="ta-modal-confirm"
                onClick={confirmAcknowledge}
                disabled={actioning}
              >
                {actioning ? "Acknowledging…" : "Yes, Acknowledge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
