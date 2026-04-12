import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { getEmployeeProjectTasksRequest } from "../../helper_module/authHelper";
import "./EmployeeProjectTasks.css";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function statusLabel(s) {
  if (s === "done") return "done";
  if (s === "In_progress") return "In Progress";
  if (s === "overdue") return "Overdue";
  return s;
}

function statusClass(s) {
  if (s === "done") return "done";
  if (s === "In_progress") return "in-progress";
  return "overdue";
}

export default function EmployeeProjectTasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployeeProjectTasksRequest(projectId)
      .then((data) => {
        setProjectName(data.projectName || "");
        setTasks(data.tasks || []);
      })
      .catch((err) => toast.error(err.message || "Failed to load tasks"))
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <div className="ept-page">
      {/* Header card */}
      <div className="ept-header-card">
        <button
          className="ept-back-btn"
          onClick={() => navigate("/employee/tasks")}
        >
          <i className="fa-solid fa-arrow-left"></i>
          Back to Projects
        </button>
        <h2 className="ept-project-title">{projectName || "Project"}</h2>
      </div>

      {/* Tasks table card */}
      <div className="ept-tasks-card">
        <div className="ept-tasks-header">My Tasks</div>

        {loading ? (
          <table className="ept-table">
            <tbody>
              <tr className="ept-empty">
                <td colSpan={6}>Loading…</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table className="ept-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Workload</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr className="ept-empty">
                  <td colSpan={6}>No tasks found for this project.</td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.TaskID}>
                    <td className="ept-title">{t.title}</td>
                    <td className="ept-desc">{t.description}</td>
                    <td className="ept-date">{fmtDate(t.dueDate)}</td>
                    <td>
                      <span
                        className={`ept-status ${statusClass(t.Task_status)}`}
                      >
                        {statusLabel(t.Task_status)}
                      </span>
                    </td>
                    <td>{t.workLoadPoints}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="ept-view-btn"
                        onClick={() =>
                          navigate(
                            `/employee/tasks/${projectId}/task/${t.TaskID}`,
                          )
                        }
                      >
                        View More
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
