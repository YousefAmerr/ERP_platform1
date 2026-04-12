import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { getEmployeeProjectsRequest } from "../../helper_module/authHelper";
import "./EmployeeTasks.css";

/* Deterministic icon + colour per project */
const ICONS = [
  { icon: "fa-chart-bar", bg: "#dbeafe", color: "#2563eb" },
  { icon: "fa-person-running", bg: "#ffedd5", color: "#ea580c" },
  { icon: "fa-shield-halved", bg: "#ede9fe", color: "#7c3aed" },
  { icon: "fa-database", bg: "#dcfce7", color: "#15803d" },
  { icon: "fa-gear", bg: "#fef3c7", color: "#b45309" },
  { icon: "fa-code", bg: "#fee2e2", color: "#dc2626" },
];

function iconFor(id) {
  return ICONS[(id - 1) % ICONS.length];
}

function pad(n) {
  return String(n ?? 0).padStart(2, "0");
}

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function EmployeeTasks() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployeeProjectsRequest()
      .then((data) => setProjects(data.projects || []))
      .catch((err) => toast.error(err.message || "Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="et-page">
      <p className="et-overview-label">Project Overview</p>
      <h2 className="et-overview-title">My Projects</h2>

      {loading ? (
        <div className="et-empty">Loading projects…</div>
      ) : projects.length === 0 ? (
        <div className="et-empty">No projects assigned yet.</div>
      ) : (
        <div className="et-projects-list">
          {projects.map((p) => {
            const style = iconFor(p.ProjectID);
            const due = fmtDate(p.dueDate);
            return (
              <div
                className="et-project-card"
                key={p.ProjectID}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/employee/tasks/${p.ProjectID}`)}
              >
                {/* Icon */}
                <div
                  className="et-proj-icon"
                  style={{ background: style.bg, color: style.color }}
                >
                  <i className={`fa-solid ${style.icon}`}></i>
                </div>

                {/* Name + meta */}
                <div className="et-proj-info">
                  <p className="et-proj-name">{p.projectName}</p>
                  <div className="et-proj-meta">
                    <span
                      className={`et-proj-status ${
                        p.Project_status === "Active" ? "active" : "done"
                      }`}
                    >
                      {p.Project_status}
                    </span>
                    {due && <span className="et-proj-due">Due: {due}</span>}
                  </div>
                </div>

                {/* Stat boxes */}
                <div className="et-proj-stats">
                  <div className="et-stat-box">
                    <div className="et-stat-inner">
                      <span className="et-stat-label">My Tasks</span>
                      <span className="et-stat-value">{pad(p.myTasks)}</span>
                    </div>
                    <div className="et-stat-icon tasks">
                      <i className="fa-regular fa-clipboard"></i>
                    </div>
                  </div>

                  <div className="et-stat-box">
                    <div className="et-stat-inner">
                      <span className="et-stat-label">Completed</span>
                      <span className="et-stat-value">
                        {pad(p.completedTasks)}
                      </span>
                    </div>
                    <div className="et-stat-icon completed">
                      <i className="fa-regular fa-circle-check"></i>
                    </div>
                  </div>

                  <div className="et-stat-box">
                    <div className="et-stat-inner">
                      <span className="et-stat-label">Pending</span>
                      <span className="et-stat-value">
                        {pad(p.pendingTasks)}
                      </span>
                    </div>
                    <div className="et-stat-icon pending">
                      <i className="fa-regular fa-clock"></i>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
