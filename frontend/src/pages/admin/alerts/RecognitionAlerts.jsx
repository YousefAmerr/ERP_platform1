import React, { useEffect, useState } from "react";
import "./RecognitionAlerts.css";

const RecognitionAlerts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");

  useEffect(() => {
    let mounted = true;
    fetch("/api/recognition")
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        if (json && json.success && Array.isArray(json.data)) {
          setData(json.data);
        } else {
          setError("Invalid response from server");
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || String(err));
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  // compute years present in DB results
  const years = React.useMemo(() => {
    const s = new Set();
    data.forEach((r) => {
      const d = new Date(r.createdAt);
      if (!Number.isNaN(d.getTime())) s.add(d.getFullYear());
    });
    return Array.from(s).sort((a, b) => b - a);
  }, [data]);

  const months = React.useMemo(
    () => [
      { value: "All", label: "All Months" },
      { value: 0, label: "January" },
      { value: 1, label: "February" },
      { value: 2, label: "March" },
      { value: 3, label: "April" },
      { value: 4, label: "May" },
      { value: 5, label: "June" },
      { value: 6, label: "July" },
      { value: 7, label: "August" },
      { value: 8, label: "September" },
      { value: 9, label: "October" },
      { value: 10, label: "November" },
      { value: 11, label: "December" },
    ],
    [],
  );

  const filtered = React.useMemo(() => {
    return data.filter((r) => {
      const d = new Date(r.createdAt);
      if (Number.isNaN(d.getTime())) return false;
      if (selectedYear !== "All" && d.getFullYear() !== Number(selectedYear))
        return false;
      if (selectedMonth !== "All" && d.getMonth() !== Number(selectedMonth))
        return false;
      return true;
    });
  }, [data, selectedYear, selectedMonth]);

  const latest = data.length > 0 ? data[0] : null; // most recent overall

  const monthYear = (createdAt) => {
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, { month: "long", year: "numeric" });
  };

  // Export all recognition records (all years/months) to CSV
  const exportCSV = () => {
    // use full `data` (all records fetched from DB)
    const rows = [];
    // header
    rows.push(["AlertID", "UserID", "Name", "Reason", "CreatedAt"]);
    data.forEach((r) => {
      rows.push([
        r.alertId ?? r.AlertID ?? "",
        r.userId ?? r.UserID ?? "",
        r.name ?? r.Name ?? "",
        r.Alert_reason ?? r.reason ?? "",
        r.createdAt ?? r.created_at ?? "",
      ]);
    });

    const csv = rows
      .map((row) =>
        row
          .map((field) => {
            const s = String(field ?? "");
            return '"' + s.replace(/"/g, '""') + '"';
          })
          .join(","),
      )
      .join("\r\n");

    // prepend BOM for Excel compatibility
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const now = new Date();
    a.setAttribute(
      "download",
      `recognition_export_${now.toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="ra-feed-title">
          Recognition — Best Employee of the Month
        </h2>
        <p className="ra-feed-subtitle">Spotlight on recent recognitions.</p>
      </div>

      {error && <div className="ra-error">{error}</div>}

      {/* Hero Spotlight */}
      <section className="ra-hero-section">
        {loading ? (
          <div className="ra-feed-card">Loading...</div>
        ) : latest ? (
          <div className="ra-eotm-banner">
            <div className="ra-eotm-medal">
              <i className="fa-solid fa-trophy"></i>
            </div>
            <div className="ra-eotm-content">
              <span className="ra-eotm-pill">
                <i className="fa-solid fa-star"></i> Employee of the Month
                {monthYear(latest.createdAt) && (
                  <> · {monthYear(latest.createdAt)}</>
                )}
              </span>
              <h2 className="ra-eotm-title">{latest.name}</h2>
              <p className="ra-eotm-text">
                {latest.Alert_reason || latest.reason}
              </p>
            </div>
            <i className="fa-solid fa-award ra-eotm-watermark"></i>
          </div>
        ) : (
          <div className="ra-feed-card">No recognition entries yet</div>
        )}
      </section>

      {/* History Table */}
      <section>
        <div className="ra-feed-card">
          <div className="ra-feed-header">
            <h6 className="ra-feed-title">Recognition History</h6>
            <div className="ra-feed-header-right">
              <div className="ra-filter-group">
                <label className="ra-filter-label">Filter by Year</label>
                <select
                  className="ra-filter-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="All">All</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <label className="ra-filter-label">Filter by Month</label>
                <select
                  className="ra-filter-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <button className="ra-export-btn" onClick={exportCSV}>
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="ra-table">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Month</th>
                  <th>Award Type</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="ra-empty">
                      No recognition alerts at this time
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.alertId}>
                      <td>
                        <div className="ra-employee">
                          <div className="ra-emp-avatar">
                            {(row.name || "U").charAt(0)}
                          </div>
                          <div>
                            <div className="ra-emp-name">{row.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="ra-date">{monthYear(row.createdAt)}</td>
                      <td>
                        <span className="ra-award-badge">
                          Employee of the Month
                        </span>
                      </td>
                      <td className="ra-reason">
                        {row.Alert_reason || row.reason || ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
};

export default RecognitionAlerts;
