import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import toast from "react-hot-toast";
import {
  getProjectByIdRequest,
  getProjectTasksRequest,
  getProjectEmployeesRequest,
  createProjectTaskRequest,
  editProjectTaskRequest,
  deleteProjectTaskRequest,
  getDoneTasksRequest,
  rateTaskRequest,
} from "../../helper_module/authHelper";
import "./InsideManagerTask.css";

const AVATAR_COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
// A task is "late" when still in progress and past its due date.
function isLate(task) {
  if (!task || task.Task_status !== "In_progress" || !task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.dueDate) < today;
}
function statusLabel(task) {
  if (isLate(task)) return "Overdue";
  if (task.Task_status === "In_progress") return "In Progress";
  if (task.Task_status === "done")
    // Completed, but the DB flagged it as having passed its due date.
    return Number(task.was_overdue) === 1 ? "Done (Overdue)" : "Done";
  return task.Task_status || "";
}
function statusClass(task) {
  if (isLate(task)) return "overdue";
  if (task.Task_status === "In_progress") return "in_progress";
  if (task.Task_status === "done")
    return Number(task.was_overdue) === 1 ? "done-overdue" : "done";
  return "";
}

const BLANK_TASK = {
  title: "",
  description: "",
  assignedTo: "",
  dueDate: "",
  Task_status: "In_progress",
  workLoadPoints: "",
};

export default function InsideManagerTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: navState } = useLocation();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [projectEmployees, setProjectEmployees] = useState([]);

  // Filters for Team Tasks table — pre-seeded from Need Help Alert navigation
  const [filterEmployee, setFilterEmployee] = useState(
    navState?.employeeId ? String(navState.employeeId) : ""
  );
  const [filterStatus, setFilterStatus] = useState("");

  // Create / Edit modal state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(BLANK_TASK);
  const [createFile, setCreateFile] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);

  const [editTask, setEditTask] = useState(null); // the task being edited
  const [editForm, setEditForm] = useState(BLANK_TASK);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null); // the task being deleted
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Rate Completed Tasks state
  const [doneTasks, setDoneTasks] = useState([]);
  const [rateFilterEmployee, setRateFilterEmployee] = useState("");
  // per-task rating inputs: { [TaskID]: { rating: '', ratingComment: '' } }
  const [rateInputs, setRateInputs] = useState({});
  const [rateLoading, setRateLoading] = useState({});

  // ── data fetchers ──────────────────────────────────────────
  const fetchProject = useCallback(async () => {
    try {
      const data = await getProjectByIdRequest(id);
      setProject(data.project);
    } catch (err) {
      toast.error(err.message || "Failed to load project");
    }
  }, [id]);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getProjectTasksRequest(id, {
        employee: filterEmployee,
        status: filterStatus,
      });
      setTasks(data.tasks || []);
    } catch (err) {
      toast.error(err.message || "Failed to load tasks");
    }
  }, [id, filterEmployee, filterStatus]);

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await getProjectEmployeesRequest(id);
      setAllEmployees(data.allEmployees || []);
      setProjectEmployees(data.projectEmployees || []);
    } catch (err) {
      toast.error(err.message || "Failed to load employees");
    }
  }, [id]);

  const fetchDoneTasks = useCallback(async () => {
    try {
      const data = await getDoneTasksRequest(id, rateFilterEmployee);
      setDoneTasks(data.tasks || []);
    } catch (err) {
      toast.error(err.message || "Failed to load completed tasks");
    }
  }, [id, rateFilterEmployee]);

  useEffect(() => {
    fetchProject();
    fetchEmployees();
  }, [fetchProject, fetchEmployees]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchDoneTasks();
  }, [fetchDoneTasks]);

  // ── create task ────────────────────────────────────────────
  async function handleCreate(e) {
    e.preventDefault();
    if (
      !createForm.title.trim() ||
      !createForm.assignedTo ||
      !createForm.workLoadPoints
    ) {
      toast.error("Title, employee and workload are required");
      return;
    }
    setCreateLoading(true);
    try {
      await createProjectTaskRequest(id, createForm, createFile);
      toast.success("Task created");
      setShowCreate(false);
      setCreateForm(BLANK_TASK);
      setCreateFile(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.message || "Failed to create task");
    } finally {
      setCreateLoading(false);
    }
  }

  // ── edit task ──────────────────────────────────────────────
  function openEdit(task) {
    setEditTask(task);
    setEditForm({
      title: task.title || "",
      description: task.description || "",
      assignedTo: task.assignedTo || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      Task_status: task.Task_status || "In_progress",
      workLoadPoints: task.workLoadPoints ?? "",
    });
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (!editForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setEditLoading(true);
    try {
      await editProjectTaskRequest(id, editTask.TaskID, editForm);
      toast.success("Task updated");
      setEditTask(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.message || "Failed to update task");
    } finally {
      setEditLoading(false);
    }
  }

  // ── delete task ────────────────────────────────────────────
  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await deleteProjectTaskRequest(id, deleteTarget.TaskID);
      toast.success("Task deleted");
      setDeleteTarget(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.message || "Failed to delete task");
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── rate task ──────────────────────────────────────────────
  async function handleRate(taskId) {
    const input = rateInputs[taskId] || {};
    const rating = parseInt(input.rating, 10);
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please enter a rating between 1 and 5");
      return;
    }
    setRateLoading((prev) => ({ ...prev, [taskId]: true }));
    try {
      await rateTaskRequest(id, taskId, {
        rating,
        ratingComment: input.ratingComment || "",
      });
      toast.success("Rating submitted");
      setRateInputs((prev) => {
        const copy = { ...prev };
        delete copy[taskId];
        return copy;
      });
      fetchDoneTasks();
    } catch (err) {
      toast.error(err.message || "Failed to submit rating");
    } finally {
      setRateLoading((prev) => ({ ...prev, [taskId]: false }));
    }
  }

  function setRateField(taskId, field, value) {
    setRateInputs((prev) => ({
      ...prev,
      [taskId]: { ...(prev[taskId] || {}), [field]: value },
    }));
  }

  return (
    <div className="imt-page">
      {/* Back button */}
      <div className="imt-back-row">
        <button
          className="imt-back-btn"
          onClick={() => navigate("/manager/tasks")}
        >
          <i className="fa-solid fa-arrow-left"></i>
          Back to Projects
        </button>
      </div>

      {/* Project brief — name, description & attachments */}
      <div className="imt-brief-card">
        <div className="imt-brief-head">
          <div className="imt-project-icon">
            <i className="fa-solid fa-diagram-project"></i>
          </div>
          <div className="imt-brief-headinfo">
            <h2 className="imt-project-name">
              {project ? project.projectName : "Loading…"}
            </h2>
            <span className="imt-brief-meta">
              <i className="fa-solid fa-paperclip"></i>
              {project?.attachments?.length
                ? `${project.attachments.length} attachment${
                    project.attachments.length > 1 ? "s" : ""
                  }`
                : "No attachments"}
            </span>
          </div>
          {project && (
            <span
              className={`imt-proj-status-badge ${
                project.Project_status === "Active" ? "active" : "done"
              }`}
            >
              {project.Project_status}
            </span>
          )}
        </div>

        <div className="imt-brief-section">
          <span className="imt-brief-label">
            <i className="fa-solid fa-align-left"></i> Project Description
          </span>
          <div className="imt-brief-desc">
            {project
              ? project.projectDescription || "No description provided."
              : "Loading…"}
          </div>
        </div>

        {project?.attachments?.length > 0 && (
          <div className="imt-brief-section">
            <span className="imt-brief-label">
              <i className="fa-solid fa-folder-open"></i> Attachments
            </span>
            <div className="imt-attach-grid">
              {project.attachments.map((a) => {
                const meta = fileMeta(a.originalName);
                return (
                  <a
                    key={a.AttachmentID}
                    href={`/assets/uploads/${a.filePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="imt-attach-card"
                    title={a.originalName}
                  >
                    <span className={`imt-attach-icon ${meta.cls}`}>
                      <i className={`fa-solid ${meta.icon}`}></i>
                    </span>
                    <span className="imt-attach-info">
                      <span className="imt-attach-name">{a.originalName}</span>
                      <span className="imt-attach-action">
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

      {/* ── Team Tasks ─────────────────────────────────────── */}
      <div className="imt-section-header">
        <h3 className="imt-section-title">Team Tasks</h3>
        <button className="imt-create-btn" onClick={() => setShowCreate(true)}>
          <i className="fa-solid fa-plus"></i>
          Create New Task
        </button>
      </div>

      {/* Alert context banner — shown when navigated from a Need Help alert */}
      {navState?.employeeId && (
        <div className="imt-alert-banner">
          <i className="fa-solid fa-triangle-exclamation"></i>
          Filtered to <strong>{navState.employeeName}</strong>'s tasks — triggered by a Need Help alert.
          <button className="imt-alert-banner-clear" onClick={() => setFilterEmployee("")}>
            Clear filter
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="imt-filters-row">
        <select
          className="imt-filter-select"
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
        >
          <option value="">All Employees</option>
          {allEmployees.map((emp) => (
            <option key={emp.UserID} value={emp.UserID}>
              {emp.Name}
            </option>
          ))}
        </select>
        <select
          className="imt-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="In_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Tasks table */}
      <div className="imt-table-card">
        <table className="imt-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Employee</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Workload</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr className="imt-empty-row">
                <td colSpan={6}>No tasks found.</td>
              </tr>
            ) : (
              tasks.map((t) => (
                <tr key={t.TaskID}>
                  <td>
                    <span className="imt-task-title">{t.title}</span>
                  </td>
                  <td>
                    <div className="imt-emp-cell">
                      <div
                        className="imt-emp-avatar"
                        style={{
                          background: avatarColor(t.employeeName || ""),
                        }}
                      >
                        {initials(t.employeeName || "?")}
                      </div>
                      <span className="imt-emp-name">
                        {t.employeeName || "—"}
                      </span>
                    </div>
                  </td>
                  <td>{fmtDate(t.dueDate)}</td>
                  <td>
                    <span
                      className={`imt-task-status ${statusClass(t)}`}
                    >
                      {statusLabel(t)}
                    </span>
                  </td>
                  <td>
                    <span className="imt-workload">
                      {t.workLoadPoints ?? "—"}
                    </span>
                  </td>
                  <td>
                    <div className="imt-action-cell">
                      <button
                        className="imt-edit-btn"
                        onClick={() => openEdit(t)}
                      >
                        Edit
                      </button>
                      <button
                        className="imt-delete-btn"
                        onClick={() => setDeleteTarget(t)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Rate Completed Tasks ────────────────────────────── */}
      <div className="imt-rate-section-header">
        <h3 className="imt-section-title">Rate Completed Tasks</h3>
        <select
          className="imt-filter-select"
          value={rateFilterEmployee}
          onChange={(e) => setRateFilterEmployee(e.target.value)}
        >
          <option value="">All Employees</option>
          {projectEmployees.map((emp) => (
            <option key={emp.UserID} value={emp.UserID}>
              {emp.Name}
            </option>
          ))}
        </select>
      </div>

      <div className="imt-table-card">
        <table className="imt-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Employee</th>
              <th>Rating (1–5)</th>
              <th>Comment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doneTasks.length === 0 ? (
              <tr className="imt-empty-row">
                <td colSpan={5}>No completed tasks to rate yet.</td>
              </tr>
            ) : (
              doneTasks.map((t) => (
                <tr key={t.TaskID}>
                  <td>
                    <span className="imt-task-title">{t.title}</span>
                  </td>
                  <td>
                    <div className="imt-emp-cell">
                      <div
                        className="imt-emp-avatar"
                        style={{
                          background: avatarColor(t.employeeName || ""),
                        }}
                      >
                        {initials(t.employeeName || "?")}
                      </div>
                      <span className="imt-emp-name">
                        {t.employeeName || "—"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="imt-form-input imt-rating-input"
                      min="1"
                      max="5"
                      placeholder="1–5"
                      value={rateInputs[t.TaskID]?.rating || ""}
                      onChange={(e) =>
                        setRateField(t.TaskID, "rating", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="imt-form-input imt-comment-input"
                      placeholder="Optional comment"
                      value={rateInputs[t.TaskID]?.ratingComment || ""}
                      onChange={(e) =>
                        setRateField(t.TaskID, "ratingComment", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="imt-rate-btn"
                      onClick={() => handleRate(t.TaskID)}
                      disabled={rateLoading[t.TaskID]}
                    >
                      {rateLoading[t.TaskID] ? "Saving…" : "Rate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create Task Modal ───────────────────────────────── */}
      {showCreate && (
        <div className="imt-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="imt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="imt-modal-header">
              <h4 className="imt-modal-title">Create New Task</h4>
              <button
                className="imt-modal-close"
                onClick={() => setShowCreate(false)}
              >
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="imt-form-group">
                <label className="imt-form-label">Title *</label>
                <input
                  className="imt-form-input"
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, title: e.target.value })
                  }
                  placeholder="Task title"
                  required
                />
              </div>
              <div className="imt-form-group">
                <label className="imt-form-label">Description</label>
                <textarea
                  className="imt-form-textarea"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Optional description"
                />
              </div>
              <div className="imt-form-group">
                <label className="imt-form-label">Assign To *</label>
                <select
                  className="imt-form-select"
                  value={createForm.assignedTo}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, assignedTo: e.target.value })
                  }
                  required
                >
                  <option value="">Select employee</option>
                  {allEmployees.map((emp) => (
                    <option key={emp.UserID} value={emp.UserID}>
                      {emp.Name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="imt-form-group">
                <label className="imt-form-label">Due Date</label>
                <input
                  type="date"
                  className="imt-form-input"
                  value={createForm.dueDate}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, dueDate: e.target.value })
                  }
                />
              </div>
              <div className="imt-form-group">
                <label className="imt-form-label">Workload *</label>
                <select
                  className="imt-form-select"
                  value={createForm.workLoadPoints}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      workLoadPoints: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select workload</option>
                  <option value="Light">Light</option>
                  <option value="Medium">Medium</option>
                  <option value="Heavy">Heavy</option>
                </select>
              </div>
              <div className="imt-form-group">
                <label className="imt-form-label">Attachment</label>
                <label className="imt-file-label">
                  <i className="fa-solid fa-paperclip"></i>
                  <span>{createFile ? createFile.name : "Click to upload a file"}</span>
                  <input
                    type="file"
                    className="imt-file-input"
                    onChange={(e) => setCreateFile(e.target.files[0] || null)}
                  />
                </label>
                {createFile && (
                  <button
                    type="button"
                    className="imt-file-remove"
                    onClick={() => setCreateFile(null)}
                  >
                    <i className="fa-solid fa-xmark"></i> Remove
                  </button>
                )}
              </div>
              <div className="imt-modal-footer">
                <button
                  type="button"
                  className="imt-modal-cancel"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="imt-modal-submit"
                  disabled={createLoading}
                >
                  {createLoading ? "Creating…" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Task Modal ─────────────────────────────────── */}
      {editTask && (
        <div className="imt-modal-overlay" onClick={() => setEditTask(null)}>
          <div className="imt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="imt-modal-header">
              <h4 className="imt-modal-title">Edit Task</h4>
              <button
                className="imt-modal-close"
                onClick={() => setEditTask(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="imt-form-group">
                <label className="imt-form-label">Title *</label>
                <input
                  className="imt-form-input"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="imt-form-group">
                <label className="imt-form-label">Description</label>
                <textarea
                  className="imt-form-textarea"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>
              <div className="imt-form-group">
                <label className="imt-form-label">Assign To</label>
                <select
                  className="imt-form-select"
                  value={editForm.assignedTo}
                  onChange={(e) =>
                    setEditForm({ ...editForm, assignedTo: e.target.value })
                  }
                >
                  <option value="">Select employee</option>
                  {allEmployees.map((emp) => (
                    <option key={emp.UserID} value={emp.UserID}>
                      {emp.Name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="imt-form-group">
                <label className="imt-form-label">Due Date</label>
                <input
                  type="date"
                  className="imt-form-input"
                  value={editForm.dueDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dueDate: e.target.value })
                  }
                />
              </div>
              <div className="imt-form-group">
                <label className="imt-form-label">Status</label>
                <select
                  className="imt-form-select"
                  value={editForm.Task_status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, Task_status: e.target.value })
                  }
                >
                  <option value="In_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="imt-form-group">
                <label className="imt-form-label">Workload *</label>
                <select
                  className="imt-form-select"
                  value={editForm.workLoadPoints}
                  onChange={(e) =>
                    setEditForm({ ...editForm, workLoadPoints: e.target.value })
                  }
                  required
                >
                  <option value="">Select workload</option>
                  <option value="Light">Light</option>
                  <option value="Medium">Medium</option>
                  <option value="Heavy">Heavy</option>
                </select>
              </div>
              <div className="imt-modal-footer">
                <button
                  type="button"
                  className="imt-modal-cancel"
                  onClick={() => setEditTask(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="imt-modal-submit"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ───────────────────────── */}
      {deleteTarget && (
        <div className="imt-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="imt-modal imt-modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="imt-modal-header">
              <h4 className="imt-modal-title">Delete Task</h4>
              <button
                className="imt-modal-close"
                onClick={() => setDeleteTarget(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <p className="imt-delete-text">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.title}</strong>? This action cannot be
              undone.
            </p>
            <div className="imt-modal-footer">
              <button
                type="button"
                className="imt-modal-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="imt-delete-confirm-btn"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
