const tableBody = document.getElementById("usersTableBody");
const msg = document.getElementById("adminMessage");
const logoutBtn = document.getElementById("logoutBtn");

// ===== Show Message =====
function showMessage(type, text) {
  msg.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${text}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

// ===== Load All Users =====
async function loadUsers() {
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center text-muted py-4">
        Loading users...
      </td>
    </tr>
  `;

  try {
    const res = await fetch("/api/admin/users", {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();

    // Not admin or not logged in
    if (!res.ok) {
      showMessage("danger", data.error || "Access denied.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
      return;
    }

    if (!data.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-4">
            No users found.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = "";

    data.forEach((user) => {
      const tr = document.createElement("tr");

      const isActiveText = user.isActive ? "Active" : "Disabled";

      tr.innerHTML = `
        <td>${user.email || ""}</td>
        <td>${user.name || "-"}</td>
        <td>
          <span class="badge text-bg-light border">
            ${user.role || "user"}
          </span>
        </td>
        <td>
          <span class="badge text-bg-light border">
            ${isActiveText}
          </span>
        </td>
        <td class="d-flex gap-2">
          <a href="/adminUser.html?id=${user._id}"
             class="btn btn-sm btn-outline-primary">
            View
          </a>

          <button class="btn btn-sm btn-outline-dark delete-btn"
                  data-id="${user._id}">
            Delete
          </button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    // Attach delete handlers
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const userId = btn.getAttribute("data-id");

        const confirmed = confirm(
          "Are you sure you want to permanently delete this user?\n\nThis will remove all associated data."
        );

        if (!confirmed) return;

        await deleteUser(userId);
      });
    });

  } catch (err) {
    showMessage("danger", "Server error while loading users.");
  }
}

// ===== Delete User =====
async function deleteUser(userId) {
  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage("danger", data.error || "Failed to delete user.");
      return;
    }

    showMessage("success", data.message || "User deleted successfully.");
    loadUsers();

  } catch (err) {
    showMessage("danger", "Server error while deleting user.");
  }
}

// ===== Logout =====
logoutBtn.addEventListener("click", async () => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/";
  } catch (err) {
    showMessage("danger", "Logout failed.");
  }
});

// ===== Initialize =====
loadUsers();
