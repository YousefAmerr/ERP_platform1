import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import toast from "react-hot-toast";
import {
  getEmployeeTaskDetailRequest,
  updateEmployeeTaskStatusRequest,
} from "../../helper_module/authHelper";
import "./EmployeeTaskDetail.css";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

const STATUS_OPTIONS = [
  { value: "In_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "overdue", label: "Overdue" },
];

export default function EmployeeTaskDetail() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getEmployeeTaskDetailRequest(projectId, taskId)
      .then((data) => {
        setTask(data.task);
        setStatus(data.task.Task_status);
      })
      .catch((err) => toast.error(err.message || "Failed to load task"));
  }, [projectId, taskId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEmployeeTaskStatusRequest(projectId, taskId, status);
      toast.success("Status updated!");
      setTask((prev) => ({ ...prev, Task_status: status }));
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="etd-page">
      <div className="etd-card">
        <button
          className="etd-back-btn"
          onClick={() => navigate(`/employee/tasks/${projectId}`)}
        >
          <i className="fa-solid fa-arrow-left"></i>
          Back to Tasks
        </button>

        <h3 className="etd-card-title">Task Details</h3>

        {!task ? (
          <p style={{ color: "#9ca3af" }}>Loading…</p>
        ) : (
          <>
            <div className="etd-row">
              <span className="etd-row-label">Task Title:</span>
              <span className="etd-row-value">{task.title}</span>
            </div>

            <div className="etd-row">
              <span className="etd-row-label">Project:</span>
              <span className="etd-row-value">{task.projectName}</span>
            </div>

            <div className="etd-row">
              <span className="etd-row-label">Description:</span>
              <span className="etd-row-value neutral">{task.description}</span>
            </div>

            <div className="etd-row">
              <span className="etd-row-label">Due Date:</span>
              <span className="etd-row-value">{fmtDate(task.dueDate)}</span>
            </div>

            <div className="etd-row">
              <span className="etd-row-label">Workload:</span>
              <span className="etd-row-value neutral">
                {task.workLoadPoints}
              </span>
            </div>

            <div className="etd-row">
              <span className="etd-row-label">Status:</span>
              <select
                className="etd-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="etd-save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              <i className="fa-solid fa-floppy-disk"></i>
              {saving ? "Saving…" : "Save Status"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
