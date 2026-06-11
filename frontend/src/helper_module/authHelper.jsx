export async function loginRequest(payload) {
  const res = await fetch("/api/v1/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : { message: await res.text() };

  if (!res.ok) {
    throw new Error(data?.message || "Login failed");
  }

  return data;
}

export async function getMeRequest() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/v1/user/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : { message: await res.text() };

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch user info");
  }

  return data;
}

export async function getDashboardStatsRequest() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/v1/admin/dashboard/stats", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : { message: await res.text() };

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch dashboard stats");
  }

  return data;
}


export async function predictTurnoverRequest() {
  const res = await fetch("/api/admin/predict-turnover", {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to predict turnover");
  return data;
}


export async function getTurnoverAlertsRequest(statuses = "open,acknowledged") {
  const query = new URLSearchParams({ statuses }).toString();
  const res = await fetch(`/api/admin/alerts/turnover?${query}`, {
    method: "GET",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch alerts");
  return data;
}

export async function acknowledgeAlertRequest(id) {
  const res = await fetch(`/api/admin/alerts/${id}/acknowledge`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to acknowledge alert");
  return data;
}

// ─── Users Management ────────────────────────────────────────────────────────

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export async function getUsersRequest(page = 1, limit = 10) {
  const res = await fetch(`/api/v1/admin/users?page=${page}&limit=${limit}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch users");
  return data;
}

export async function addUserRequest(payload) {
  const res = await fetch("/api/v1/admin/users", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to add user");
  return data;
}

export async function editUserRequest(id, payload) {
  const res = await fetch(`/api/v1/admin/users/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update user");
  return data;
}

export async function deactivateUserRequest(id) {
  const res = await fetch(`/api/v1/admin/users/${id}/deactivate`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to deactivate user");
  return data;
}

export async function activateUserRequest(id) {
  const res = await fetch(`/api/v1/admin/users/${id}/activate`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to activate user");
  return data;
}

export async function deleteUserRequest(id) {
  const res = await fetch(`/api/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to delete user");
  return data;
}

// ─── Leave Management ─────────────────────────────────────────────────────────

export async function getLeaveStatsRequest() {
  const res = await fetch("/api/v1/admin/leave/stats", {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch leave stats");
  return data;
}

export async function getLeaveListRequest(page = 1, limit = 10) {
  const res = await fetch(`/api/v1/admin/leave?page=${page}&limit=${limit}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.message || "Failed to fetch leave requests");
  return data;
}

export async function approveLeaveRequest(id) {
  const res = await fetch(`/api/v1/admin/leave/${id}/approve`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to approve leave");
  return data;
}

export async function rejectLeaveRequest(id) {
  const res = await fetch(`/api/v1/admin/leave/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to reject leave");
  return data;
}

// ─── Manager Dashboard ────────────────────────────────────────────────────────

export async function getNeedHelpAlertsRequest(page = 1) {
  const res = await fetch(`/api/v1/manager/alerts/need-help?page=${page}`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || 'Failed to fetch need-help alerts')
  return data
}

export async function acknowledgeNeedHelpAlertRequest(id) {
  const res = await fetch(`/api/v1/manager/alerts/${id}/acknowledge`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || 'Failed to acknowledge alert')
  return data
}

export async function resolveNeedHelpAlertRequest(id) {
  const res = await fetch(`/api/v1/manager/alerts/${id}/resolve`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || 'Failed to resolve alert')
  return data
}

export async function getManagerDashboardStatsRequest() {
  const res = await fetch("/api/v1/manager/dashboard/stats", {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.message || "Failed to fetch manager stats");
  return data;
}

export async function getManagerCompletedTasksRequest() {
  const res = await fetch("/api/v1/manager/dashboard/completed-tasks", {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.message || "Failed to fetch completed tasks");
  return data;
}

export async function getManagerLeaveRequest(
  page = 1,
  limit = 5,
  status = null,
) {
  const params = new URLSearchParams({ page, limit });
  if (status && status !== "all") params.append("status", status);
  const res = await fetch(`/api/v1/manager/leave?${params.toString()}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.message || "Failed to fetch leave requests");
  return data;
}

export async function getManagerProjectsRequest() {
  const res = await fetch("/api/v1/manager/tasks/projects", {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch projects");
  return data;
}

export async function createManagerProjectRequest(body) {
  const res = await fetch("/api/v1/manager/tasks/projects", {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create project");
  return data;
}

export async function updateManagerProjectStatusRequest(id, Project_status) {
  const res = await fetch(`/api/v1/manager/tasks/projects/${id}/status`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ Project_status }),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.message || "Failed to update project status");
  return data;
}

export async function getProjectByIdRequest(id) {
  const res = await fetch(`/api/v1/manager/tasks/projects/${id}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch project");
  return data;
}

export async function getProjectTasksRequest(id, filters = {}) {
  const params = new URLSearchParams();
  if (filters.employee) params.append("employee", filters.employee);
  if (filters.status) params.append("status", filters.status);
  const res = await fetch(
    `/api/v1/manager/tasks/projects/${id}/tasks?${params.toString()}`,
    { headers: authHeaders() },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch tasks");
  return data;
}

export async function getProjectEmployeesRequest(id) {
  const res = await fetch(`/api/v1/manager/tasks/projects/${id}/employees`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch employees");
  return data;
}

export async function createProjectTaskRequest(id, body, file) {
  const form = new FormData();
  Object.entries(body).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") form.append(k, v);
  });
  if (file) form.append("attachment", file);
  const res = await fetch(`/api/v1/manager/tasks/projects/${id}/tasks`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create task");
  return data;
}

export async function editProjectTaskRequest(id, taskId, body) {
  const res = await fetch(
    `/api/v1/manager/tasks/projects/${id}/tasks/${taskId}`,
    {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update task");
  return data;
}

export async function deleteProjectTaskRequest(id, taskId) {
  const res = await fetch(
    `/api/v1/manager/tasks/projects/${id}/tasks/${taskId}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to delete task");
  return data;
}

export async function getDoneTasksRequest(id, employee = "") {
  const params = new URLSearchParams();
  if (employee) params.append("employee", employee);
  const res = await fetch(
    `/api/v1/manager/tasks/projects/${id}/done-tasks?${params.toString()}`,
    { headers: authHeaders() },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch done tasks");
  return data;
}

export async function rateTaskRequest(id, taskId, body) {
  const res = await fetch(
    `/api/v1/manager/tasks/projects/${id}/tasks/${taskId}/rate`,
    {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to submit rating");
  return data;
}

export async function getEmployeeDashboardStatsRequest() {
  const res = await fetch("/api/v1/employee/dashboard/stats", {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch stats");
  return data;
}

export async function getEmployeeRatingsRequest(page = 1) {
  const res = await fetch(`/api/v1/employee/dashboard/ratings?page=${page}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch ratings");
  return data;
}

export async function getEmployeeMonthlyCompletedRequest() {
  const res = await fetch("/api/v1/employee/dashboard/monthly-completed", {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.message || "Failed to fetch monthly history");
  return data;
}

export async function getEmployeeActiveTasksRequest() {
  const res = await fetch("/api/v1/employee/dashboard/active-tasks", {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch active tasks");
  return data;
}

export async function submitEmployeeLeaveRequest(body, file = null) {
  const form = new FormData();
  Object.entries(body).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") form.append(k, v);
  });
  if (file) form.append("attachment", file);
  const res = await fetch("/api/v1/employee/leave", {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.message || "Failed to submit leave request");
  return data;
}

export async function getEmployeeLeavesRequest(page = 1, month = null, year = null) {
  const params = new URLSearchParams({ page });
  if (month) params.set("month", month);
  if (year)  params.set("year",  year);
  const res = await fetch(`/api/v1/employee/leave?${params}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.message || "Failed to fetch leave requests");
  return data;
}

export async function getEmployeeLeaveYears() {
  const res = await fetch("/api/v1/employee/leave/years", {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.message || "Failed to fetch leave years");
  return data.years;
}

export async function getEmployeeProjectsRequest() {
  const res = await fetch("/api/v1/employee/tasks/projects", {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch projects");
  return data;
}

export async function getEmployeeProjectTasksRequest(projectId) {
  const res = await fetch(
    `/api/v1/employee/tasks/projects/${projectId}/tasks`,
    { headers: authHeaders() },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch tasks");
  return data;
}

export async function getEmployeeTaskDetailRequest(projectId, taskId) {
  const res = await fetch(
    `/api/v1/employee/tasks/projects/${projectId}/tasks/${taskId}`,
    { headers: authHeaders() },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch task");
  return data;
}

export async function updateEmployeeTaskStatusRequest(
  projectId,
  taskId,
  status,
) {
  const res = await fetch(
    `/api/v1/employee/tasks/projects/${projectId}/tasks/${taskId}/status`,
    {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update status");
  return data;
}
