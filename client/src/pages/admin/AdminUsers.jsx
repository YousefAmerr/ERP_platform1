import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getUsersRequest,
  addUserRequest,
  editUserRequest,
  deactivateUserRequest,
  activateUserRequest,
  deleteUserRequest,
} from "../../helper_module/authHelper";
import "./AdminUsers.css";

const LIMIT = 10;

const AVATAR_COLORS = [
  "#3776fd",
  "#8b5cf6",
  "#f57c00",
  "#16a34a",
  "#e05252",
  "#0891b2",
  "#be185d",
  "#65a30d",
  "#d97706",
  "#7c3aed",
];

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: user.Name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "EMPLOYEE",
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast.error("Name and email are required");
      return;
    }
    setSaving(true);
    try {
      await editUserRequest(user.UserID, form);
      toast.success("User updated");
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h6 className="modal-title">Edit User</h6>
        <div className="modal-grid">
          <div className="users-field">
            <label>Full Name</label>
            <input
              value={form.name}
              onChange={set("name")}
              placeholder="Full name"
            />
          </div>
          <div className="users-field">
            <label>Email Address</label>
            <input
              value={form.email}
              onChange={set("email")}
              placeholder="Email"
            />
          </div>
          <div className="users-field">
            <label>Contact Number</label>
            <input
              value={form.phone}
              onChange={set("phone")}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="users-field">
            <label>Role Profile</label>
            <select value={form.role} onChange={set("role")}>
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="modal-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ user, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUserRequest(user.UserID);
      toast.success("User deleted");
      onDeleted();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h6 className="modal-title">Delete User</h6>
        <p className="modal-confirm-text">
          Are you sure you want to delete <strong>{user.Name}</strong>?<br />
          This action cannot be undone.
        </p>
        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="modal-delete-btn"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [delUser, setDelUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "EMPLOYEE",
    password: "",
  });
  const [adding, setAdding] = useState(false);

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsersRequest(page, LIMIT);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and password are required");
      return;
    }
    setAdding(true);
    try {
      await addUserRequest({ ...form, role: form.role.toUpperCase() });
      toast.success("User added");
      setForm({
        name: "",
        email: "",
        phone: "",
        role: "EMPLOYEE",
        password: "",
      });
      setPage(1);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      if (user.active) {
        await deactivateUserRequest(user.UserID);
        toast.success("User deactivated");
      } else {
        await activateUserRequest(user.UserID);
        toast.success("User activated");
      }
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      {/* ── Add New User ── */}
      <div className="users-add-card">
        <div className="users-add-title">Add New User</div>
        <div className="users-form-row">
          <div className="users-field">
            <label>Full Name</label>
            <input
              value={form.name}
              onChange={setF("name")}
              placeholder="e.g. Julian Casablancas"
            />
          </div>
          <div className="users-field">
            <label>Email Address</label>
            <input
              value={form.email}
              onChange={setF("email")}
              placeholder="julian@architect.io"
            />
          </div>
          <div className="users-field">
            <label>Contact Number</label>
            <input
              value={form.phone}
              onChange={setF("phone")}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
        <div className="users-form-row-2">
          <div className="users-field">
            <label>Role Profile</label>
            <select value={form.role} onChange={setF("role")}>
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          <div className="users-field">
            <label>Initial Password</label>
            <input
              type="password"
              value={form.password}
              onChange={setF("password")}
              placeholder="••••••••"
            />
          </div>
          <button
            className="users-add-btn"
            onClick={handleAdd}
            disabled={adding}
          >
            <i className="fa-solid fa-user-plus"></i>
            {adding ? "Adding…" : "Add User"}
          </button>
        </div>
      </div>

      {/* ── Active Directory ── */}
      <div className="users-dir-card">
        <div className="users-dir-header">
          <div>
            <p className="users-dir-title">Active Directory</p>
            <p className="users-dir-subtitle">
              Manage permissions and account lifecycles
            </p>
          </div>
          <div className="users-dir-actions">
            <button className="users-dir-icon-btn" title="Filter">
              <i className="fa-solid fa-sliders"></i>
            </button>
            <button className="users-dir-icon-btn" title="Export">
              <i className="fa-solid fa-download"></i>
            </button>
          </div>
        </div>

        <table className="users-table">
          <thead>
            <tr>
              <th>Identity</th>
              <th>Contact Detail</th>
              <th>Access Role</th>
              <th>Account Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="users-empty">
                  <i className="fa-solid fa-spinner fa-spin"></i> Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="users-empty">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.UserID}>
                  <td>
                    <div className="users-identity">
                      <div
                        className="users-avatar"
                        style={{ background: getAvatarColor(u.Name) }}
                      >
                        {getInitials(u.Name)}
                      </div>
                      <div>
                        <div className="users-id-name">{u.Name}</div>
                        <div className="users-id-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.phone || "—"}</td>
                  <td>
                    <span className="users-role-badge">{u.role}</span>
                  </td>
                  <td>
                    <div className="users-status">
                      <span
                        className={`users-status-dot ${u.active ? "active" : "inactive"}`}
                      ></span>
                      {u.active ? "Active" : "Inactive"}
                    </div>
                  </td>
                  <td>
                    <div
                      className="users-actions"
                      style={{ justifyContent: "flex-end" }}
                    >
                      <button
                        className="users-act-btn edit"
                        onClick={() => setEditUser(u)}
                      >
                        <i className="fa-regular fa-pen-to-square"></i> EDIT
                      </button>
                      {u.active ? (
                        <button
                          className="users-act-btn deactivate"
                          onClick={() => handleToggleActive(u)}
                        >
                          <i className="fa-solid fa-ban"></i> DEACTIVATE
                        </button>
                      ) : (
                        <button
                          className="users-act-btn activate"
                          onClick={() => handleToggleActive(u)}
                        >
                          <i className="fa-regular fa-circle-check"></i>{" "}
                          ACTIVATE
                        </button>
                      )}
                      <button
                        className="users-act-btn delete"
                        onClick={() => setDelUser(u)}
                      >
                        <i className="fa-regular fa-trash-can"></i> DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="users-pagination">
          <span className="users-showing">
            Showing {users.length} of {total} system users
          </span>
          <div className="users-pag-btns">
            <button
              className="users-pag-btn"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
            >
              Previous
            </button>
            <button
              className="users-pag-btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {editUser && (
        <EditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => {
            setEditUser(null);
            fetchUsers();
          }}
        />
      )}
      {delUser && (
        <DeleteModal
          user={delUser}
          onClose={() => setDelUser(null)}
          onDeleted={() => {
            setDelUser(null);
            if (users.length === 1 && page > 1) setPage((p) => p - 1);
            else fetchUsers();
          }}
        />
      )}
    </>
  );
};

export default AdminUsers;
