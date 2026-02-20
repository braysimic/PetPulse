const params = new URLSearchParams(window.location.search);
const userId = params.get("id");

const messageDiv = document.getElementById("message");
const deleteBtn = document.getElementById("deleteBtn");

async function loadUser() {
  try {
    const res = await fetch("/api/admin/users/" + userId, {
      credentials: "include"
    });

    if (!res.ok) {
      window.location.href = "/admin.html";
      return;
    }

    const user = await res.json();

    document.getElementById("userEmail").innerText = user.email;
    document.getElementById("userName").innerText = user.name || "-";
    document.getElementById("userRole").innerText = user.role;
    document.getElementById("userStatus").innerText =
      user.isActive ? "Active" : "Disabled";

  } catch (err) {
    messageDiv.innerHTML =
      `<div class="alert alert-danger">Error loading user.</div>`;
  }
}

deleteBtn.addEventListener("click", async () => {
  const confirmed = confirm(
    "Are you sure you want to permanently delete this user?\n\nThis cannot be undone."
  );

  if (!confirmed) return;

  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      messageDiv.innerHTML =
        `<div class="alert alert-danger">${data.error}</div>`;
      return;
    }

    window.location.href = "/admin.html";

  } catch (err) {
    messageDiv.innerHTML =
      `<div class="alert alert-danger">Server error.</div>`;
  }
});

loadUser();
