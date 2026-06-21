import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router";
import {
  getManagerProjectsRequest,
  createManagerProjectRequest,
  updateManagerProjectStatusRequest,
} from "../../helper_module/authHelper";
import "./ManagerTasks.css";

export default function ManagerTasks() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { state: navState } = useLocation();
  // employeeId / employeeName passed from ManagerNeedHelpAlerts "View Tasks"
  const focusEmployee = navState?.employeeId ? navState : null;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    projectName: "",
    projectDescription: "",
    Project_status: "Active",
  });
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function loadProjects() {
    setLoading(true);
    getManagerProjectsRequest()
      .then((d) => setProjects(d.projects || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProjects();
  }, []);

  // Status toggle
  async function handleStatusChange(projectId, newStatus) {
    // Optimistic update
    setProjects((prev) =>
      prev.map((p) =>
        p.ProjectID === projectId ? { ...p, Project_status: newStatus } : p,
      ),
    );
    try {
      await updateManagerProjectStatusRequest(projectId, newStatus);
    } catch (e) {
      toast.error(e.message);
      loadProjects(); // rollback
    }
  }

  // Modal handlers
  function openModal() {
    setForm({
      projectName: "",
      projectDescription: "",
      Project_status: "Active",
    });
    setAttachments([]);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handleAddFiles(e) {
    const picked = Array.from(e.target.files || []);
    if (picked.length) {
      // Append so the manager can add files across multiple picks
      setAttachments((prev) => [...prev, ...picked]);
    }
    e.target.value = ""; // allow re-selecting the same file
  }

  function removeAttachment(index) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    setSubmitting(true);
    try {
      await createManagerProjectRequest(form, attachments);
      toast.success("Project created successfully");
      closeModal();
      loadProjects();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Helpers
  function completionPct(total, completed) {
    if (!total || total === 0) return 0;
    return Math.round((Number(completed || 0) / Number(total)) * 100);
  }

  return (
    <div className="mgt-page">
      {/* Focus banner — shown when navigated from a Need Help alert */}
      {focusEmployee && (
        <div className="mgt-focus-banner">
          <i className="fa-solid fa-triangle-exclamation"></i>
          Viewing tasks for <strong>{focusEmployee.employeeName}</strong> — select a project below to see their assigned tasks.
        </div>
      )}

      {/* Top row */}
      <div className="mgt-top-row">
        <button className="mgt-add-btn" onClick={openModal}>
          <i className="fa-solid fa-plus"></i>
          Add New Project
        </button>
      </div>

      {/* Project cards */}
      {loading ? (
        <div className="mgt-empty">Loading projects…</div>
      ) : projects.length === 0 ? (
        <div className="mgt-empty">
          No projects found. Create your first project!
        </div>
      ) : (
        projects.map((p) => {
          const total = Number(p.totalTasks || 0);
          const completed = Number(p.completedTasks || 0);
          const pending = Number(p.pendingTasks || 0);
          const pct = completionPct(total, completed);
          const isActive = p.Project_status === "Active";

          return (
            <div
              className="mgt-project-card"
              key={p.ProjectID}
              onClick={() =>
                navigate(`/manager/tasks/${p.ProjectID}`, {
                  state: focusEmployee
                    ? { employeeId: focusEmployee.employeeId, employeeName: focusEmployee.employeeName }
                    : undefined,
                })
              }
            >
              <div className="mgt-card-body">
                <h3 className="mgt-project-name">{p.projectName}</h3>

                {/* Completion bar */}
                <div className="mgt-completion-row">
                  <span className="mgt-completion-label">Completion</span>
                  <div className="mgt-progress-track">
                    <div
                      className="mgt-progress-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="mgt-completion-pct">{pct}%</span>
                </div>

                {/* Stats */}
                <div className="mgt-stats-row">
                  <div className="mgt-stat">
                    <span className="mgt-stat-label">Total Tasks</span>
                    <span className="mgt-stat-value">{total}</span>
                  </div>
                  <div className="mgt-stat">
                    <span className="mgt-stat-label">Completed</span>
                    <span className="mgt-stat-value completed">
                      {completed}
                    </span>
                  </div>
                  <div className="mgt-stat">
                    <span className="mgt-stat-label">Pending</span>
                    <span className="mgt-stat-value pending">{pending}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mgt-card-actions">
                <button
                  className={`mgt-btn-active${isActive ? " selected" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(p.ProjectID, "Active");
                  }}
                >
                  Active
                </button>
                <button
                  className={`mgt-btn-done${!isActive ? " selected" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(p.ProjectID, "done");
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* ── Add New Project Modal ── */}
      {modalOpen && (
        <div className="mgt-modal-overlay" onClick={closeModal}>
          <div className="mgt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mgt-modal-header">
              <h4 className="mgt-modal-title">Add New Project</h4>
              <button className="mgt-modal-close" onClick={closeModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="mgt-form-group">
                <label className="mgt-form-label">Project Name</label>
                <input
                  className="mgt-form-input"
                  type="text"
                  placeholder="Enter project name"
                  value={form.projectName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, projectName: e.target.value }))
                  }
                />
              </div>

              <div className="mgt-form-group">
                <label className="mgt-form-label">Project Description</label>
                <textarea
                  className="mgt-form-textarea"
                  placeholder="Enter project description"
                  value={form.projectDescription}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      projectDescription: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="mgt-form-group">
                <label className="mgt-form-label">Project Status</label>
                <select
                  className="mgt-form-select"
                  value={form.Project_status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, Project_status: e.target.value }))
                  }
                >
                  <option value="Active">Active</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="mgt-form-group">
                <label className="mgt-form-label">
                  Attachments
                  <span className="mgt-form-hint"> (add as many as you need)</span>
                </label>
                <label className="mgt-file-drop">
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>Click to add files</span>
                  <input
                    type="file"
                    multiple
                    className="mgt-file-input"
                    onChange={handleAddFiles}
                  />
                </label>

                {attachments.length > 0 && (
                  <ul className="mgt-file-list">
                    {attachments.map((file, i) => (
                      <li className="mgt-file-item" key={`${file.name}-${i}`}>
                        <i className="fa-solid fa-paperclip mgt-file-icon"></i>
                        <span className="mgt-file-name" title={file.name}>
                          {file.name}
                        </span>
                        <button
                          type="button"
                          className="mgt-file-remove"
                          onClick={() => removeAttachment(i)}
                          aria-label="Remove file"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mgt-modal-footer">
                <button
                  type="button"
                  className="mgt-modal-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mgt-modal-submit"
                  disabled={submitting}
                >
                  {submitting ? "Creating…" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
