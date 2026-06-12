import React, { useState, useEffect } from "react";
import "./TurnoverAlerts.css";
import {
  predictTurnoverRequest,
  getTurnoverAlertsRequest,
  acknowledgeAlertRequest,
  getNeedHelpAlertsRequest,
} from "../../../helper_module/authHelper";

const TurnoverAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("open,acknowledged");

  const fetchAlerts = async (statuses = statusFilter) => {
    setLoading(true);
    setError("");
    try {
      const res = await getTurnoverAlertsRequest(statuses);
      const alertData = res?.data || [];
      setAlerts(alertData);
      return { alerts: alertData };
    } catch (err) {
      setError(err.message || "Failed to fetch alerts");
      setAlerts([]);
      return { alerts: [] };
    } finally {
      setLoading(false);
    }
  };

  const handlePredictTurnover = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await predictTurnoverRequest();
      const result = await fetchAlerts(statusFilter);
      setMessage(
        `${result?.alerts?.length ?? 0} turnover result(s) detected and displayed.`,
      );
    } catch (err) {
      setError(err.message || "Failed to run turnover prediction.");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Need Help Alerts state ────────────────────────────────────────────────
  const [nhAlerts, setNhAlerts] = useState([]);
  const [nhLoading, setNhLoading] = useState(true);
  const [nhPage, setNhPage] = useState(1);
  const [nhTotalPages, setNhTotalPages] = useState(1);
  const [nhTotal, setNhTotal] = useState(0);
  const fetchNeedHelpAlerts = (p = nhPage) => {
    setNhLoading(true);
    getNeedHelpAlertsRequest(p)
      .then((data) => {
        setNhAlerts(data.alerts || []);
        setNhTotal(data.total || 0);
        setNhTotalPages(data.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setNhLoading(false));
  };

  // ── Turnover confirm modal state ──────────────────────────────────────────
  const [confirmAlertId, setConfirmAlertId] = useState(null);

  const handleAcknowledgeAlert = async (id) => {
    setConfirmAlertId(id);
  };

  const confirmAcknowledge = async () => {
    if (!confirmAlertId) return;

    setLoading(true);
    setError("");
    try {
      await acknowledgeAlertRequest(confirmAlertId);
      await fetchAlerts(statusFilter);
      setMessage("Alert acknowledged. Feed refreshed.");
    } catch (err) {
      setError(err.message || "Failed to acknowledge alert");
    } finally {
      setLoading(false);
      setConfirmAlertId(null);
    }
  };

  const cancelAcknowledge = () => {
    setConfirmAlertId(null);
  };

  useEffect(() => {
    fetchAlerts(statusFilter);
    fetchNeedHelpAlerts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchNeedHelpAlerts(nhPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nhPage]);

  const handleStatusFilterChange = async (statuses) => {
    setStatusFilter(statuses);
    await fetchAlerts(statuses);
  };

  return (
    <>
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
            <button
              className="ta-primary-btn"
              onClick={handlePredictTurnover}
              disabled={loading}
            >
              <i className="fa-solid fa-gear"></i>
              {loading ? "Predicting..." : "Predict Turnover"}
            </button>
          </div>
        </div>

        <div className="ta-filter-row">
          <label className="ta-filter-label" htmlFor="turnover-status-filter">
            Status Filter:
          </label>
          <select
            id="turnover-status-filter"
            className="ta-filter-select"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value="open,acknowledged">All</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
          </select>
        </div>

        {error && <div className="ta-error">{error}</div>}
        {message && <div className="ta-info">{message}</div>}

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
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <tr key={`${alert.userId}-${alert.createdAt}-${alert.id}`}>
                  <td>
                    <div className="ta-alert-type">
                      <span className="ta-type-label">{alert.type}</span>
                    </div>
                  </td>
                  <td>
                    <div className="ta-employee">
                      <div className="ta-emp-avatar">
                        {alert.name?.split(" ")[0]?.[0] || "U"}
                      </div>
                      <div>
                        <div className="ta-emp-name">{alert.name}</div>
                        <div className="ta-emp-role">{alert.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="ta-reason">{alert.reason}</td>
                  <td className="ta-date">
                    {new Date(alert.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <span className={`ta-status ${alert.status.toLowerCase()}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td>
                    {alert.status === "Open" ? (
                      <button
                        className="ta-action-close"
                        type="button"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="ta-no-action">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="ta-empty">
                  No active alerts at this time
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Need Help Alerts card (view-only for admin) ── */}
      <div className="ta-feed-card ta-nh-card">
        <div className="ta-feed-header">
          <div>
            <p className="ta-feed-title">Need Help Alerts</p>
          </div>
          <span className="ta-nh-count-badge">{nhTotal} total</span>
        </div>

        <table className="ta-table">
          <thead>
            <tr>
              <th>Alert Type</th>
              <th>Employee</th>
              <th>Reason</th>
              <th>Created Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {nhLoading ? (
              <tr>
                <td colSpan={6} className="ta-empty">
                  <i className="fa-solid fa-spinner fa-spin"></i> Loading…
                </td>
              </tr>
            ) : nhAlerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="ta-empty">No need-help alerts on record</td>
              </tr>
            ) : (
              nhAlerts.map((a) => (
                <tr key={a.AlertID}>
                  <td>
                    <div className="ta-alert-type">
                      <span className="ta-type-label">Need Help</span>
                    </div>
                  </td>
                  <td>
                    <div className="ta-employee">
                      <div className="ta-emp-avatar ta-nh-avatar">
                        {a.name?.split(" ")[0]?.[0] || "?"}
                      </div>
                      <div>
                        <div className="ta-emp-name">{a.name || "—"}</div>
                        <div className="ta-emp-role">{a.email || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="ta-reason">{a.reason || "—"}</td>
                  <td className="ta-date">
                    {a.createdAt ? new Date(a.createdAt).toLocaleString() : "—"}
                  </td>
                  <td>
                    <span className={`ta-status ${(a.status || "").toLowerCase()}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {nhTotalPages > 1 && (
          <div className="ta-feed-footer">
            <span className="ta-showing">Page {nhPage} of {nhTotalPages}</span>
            <div className="ta-pag">
              <button
                className="ta-pag-arrow"
                disabled={nhPage === 1 || nhLoading}
                onClick={() => setNhPage((p) => p - 1)}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <span className="ta-pag-info">{nhPage}</span>
              <button
                className="ta-pag-arrow"
                disabled={nhPage === nhTotalPages || nhLoading}
                onClick={() => setNhPage((p) => p + 1)}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmAlertId && (
        <div className="ta-modal-overlay">
          <div className="ta-modal-card">
            <h3>Confirm Acknowledge</h3>
            <p>Are you sure you want to acknowledge this alert?</p>
            <div className="ta-modal-actions">
              <button
                className="ta-modal-cancel"
                type="button"
                onClick={cancelAcknowledge}
              >
                Cancel
              </button>
              <button
                className="ta-modal-confirm"
                type="button"
                onClick={confirmAcknowledge}
                disabled={loading}
              >
                {loading ? "Acknowledging..." : "Yes, Acknowledge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TurnoverAlerts;
