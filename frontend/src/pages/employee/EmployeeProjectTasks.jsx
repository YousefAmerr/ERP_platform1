import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import toast from "react-hot-toast";
import {
  getEmployeeProjectTasksRequest,
  updateEmployeeTaskStatusRequest,
} from "../../helper_module/authHelper";
import "./EmployeeProjectTasks.css";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

// A task is "late" when still in progress and past its due date.
function isLate(task) {
  if (!task || task.Task_status !== "In_progress" || !task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.dueDate) < today;
}

function statusLabel(task) {
  if (isLate(task)) return "Overdue";
  if (task.Task_status === "done") return "Done";
  if (task.Task_status === "In_progress") return "In Progress";
  return task.Task_status;
}

function statusClass(task) {
  if (isLate(task)) return "overdue";
  if (task.Task_status === "done") return "done";
  return "in-progress";
}

function truncate(text, max = 50) {
  if (!text) return "—";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

// Pick a coloured file icon based on the attachment's extension.
function fileMeta(name = "") {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return { icon: "fa-file-pdf", cls: "pdf" };
  if (["doc", "docx"].includes(ext)) return { icon: "fa-file-word", cls: "word" };
  if (["xls", "xlsx", "csv"].includes(ext))
    return { icon: "fa-file-excel", cls: "excel" };
  if (["ppt", "pptx"].includes(ext))
    return { icon: "fa-file-powerpoint", cls: "ppt" };
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext))
    return { icon: "fa-file-image", cls: "image" };
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext))
    return { icon: "fa-file-zipper", cls: "zip" };
  if (["txt", "md"].includes(ext)) return { icon: "fa-file-lines", cls: "text" };
  return { icon: "fa-file", cls: "generic" };
}

export default function EmployeeProjectTasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTask, setViewTask] = useState(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    getEmployeeProjectTasksRequest(projectId)
      .then((data) => {
        setProjectName(data.projectName || "");
        setProjectDescription(data.projectDescription || "");
        setAttachments(data.attachments || []);
        setTasks(data.tasks || []);
      })
      .catch((err) => toast.error(err.message || "Failed to load tasks"))
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleMarkDone() {
    if (!viewTask || viewTask.Task_status === "done") return;
    setMarking(true);
    try {
      await updateEmployeeTaskStatusRequest(projectId, viewTask.TaskID, "done");
      toast.success("Task marked as done!");
      setTasks((prev) =>
        prev.map((t) =>
          t.TaskID === viewTask.TaskID ? { ...t, Task_status: "done" } : t,
        ),
      );
      setViewTask((prev) => ({ ...prev, Task_status: "done" }));
    } catch (err) {
      toast.error(err.message || "Failed to update task");
    } finally {
      setMarking(false);
    }
  }

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

      {/* Project brief — instructions & attachments from the manager */}
      {!loading && (
        <div className="ept-brief-card">
          <div className="ept-brief-section">
            <span className="ept-brief-label">
              <i className="fa-solid fa-align-left"></i> Project Instructions
            </span>
            <div className="ept-brief-desc">
              {projectDescription || "No instructions provided for this project."}
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="ept-brief-section">
              <span className="ept-brief-label">
                <i className="fa-solid fa-folder-open"></i> Attachments
              </span>
              <div className="ept-attach-grid">
                {attachments.map((a) => {
                  const meta = fileMeta(a.originalName);
                  return (
                    <a
                      key={a.AttachmentID}
                      href={`/assets/uploads/${a.filePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ept-attach-card"
                      title={a.originalName}
                    >
                      <span className={`ept-attach-icon ${meta.cls}`}>
                        <i className={`fa-solid ${meta.icon}`}></i>
                      </span>
                      <span className="ept-attach-info">
                        <span className="ept-attach-name">{a.originalName}</span>
                        <span className="ept-attach-action">
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                          Open
                        </span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

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
                <th className="ept-th-title">Title</th>
                <th className="ept-th-desc">Description</th>
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
                    <td className="ept-title">{truncate(t.title)}</td>
                    <td className="ept-desc">{truncate(t.description)}</td>
                    <td className="ept-date">{fmtDate(t.dueDate)}</td>
                    <td>
                      <span className={`ept-status ${statusClass(t)}`}>
                        {statusLabel(t)}
                      </span>
                    </td>
                    <td>{t.workLoadPoints}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="ept-view-btn"
                        onClick={() => setViewTask(t)}
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

      {/* ── Task Detail Modal ── */}
      {viewTask && (
        <div className="ept-modal-overlay" onClick={() => setViewTask(null)}>
          <div className="ept-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ept-modal-header">
              <span className="ept-modal-title">Task Details</span>
              <button className="ept-modal-x" onClick={() => setViewTask(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="ept-modal-body">
              {/* Title + Project */}
              <div className="ept-modal-grid">
                <div className="ept-modal-field ept-modal-field--full">
                  <span className="ept-modal-label">Title</span>
                  <div className="ept-modal-title-box">{viewTask.title}</div>
                </div>
                <div className="ept-modal-field">
                  <span className="ept-modal-label">Project</span>
                  <span className="ept-modal-value">{viewTask.projectName}</span>
                </div>
                <div className="ept-modal-field">
                  <span className="ept-modal-label">Due Date</span>
                  <span className="ept-modal-value">{fmtDate(viewTask.dueDate)}</span>
                </div>
                <div className="ept-modal-field">
                  <span className="ept-modal-label">Status</span>
                  <span className={`ept-status ${statusClass(viewTask)}`}>
                    {statusLabel(viewTask)}
                  </span>
                </div>
                <div className="ept-modal-field">
                  <span className="ept-modal-label">Workload Points</span>
                  <span className="ept-modal-value">{viewTask.workLoadPoints}</span>
                </div>
              </div>

              <div className="ept-modal-divider" />

              {/* Description */}
              <div className="ept-modal-section">
                <span className="ept-modal-label">Description</span>
                <div className="ept-modal-desc-box">
                  {viewTask.description || "No description provided."}
                </div>
              </div>

              {/* Attachment */}
              <div className="ept-modal-section">
                <span className="ept-modal-label">Attachment</span>
                {viewTask.attachmentPath ? (
                  <a
                    href={`/assets/uploads/${viewTask.attachmentPath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ept-modal-attach"
                  >
                    <i className="fa-solid fa-paperclip"></i> View Attachment
                  </a>
                ) : (
                  <span className="ept-modal-no-attach">—</span>
                )}
              </div>
            </div>

            <div className="ept-modal-footer">
              <button className="ept-modal-close-btn" onClick={() => setViewTask(null)}>
                Close
              </button>
              <button
                className="ept-modal-done-btn"
                onClick={handleMarkDone}
                disabled={marking || viewTask.Task_status === "done"}
              >
                <i className="fa-solid fa-circle-check"></i>
                {marking ? "Saving…" : viewTask.Task_status === "done" ? "Already Done" : "Mark as Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
