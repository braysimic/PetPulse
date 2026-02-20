const backToAdminBtn = document.getElementById("backToAdminBtn");
const logoutBtn = document.getElementById("logoutBtn");
const activityContainer = document.getElementById("dashboardActivities");

// ===== Check Authentication =====
async function checkAuth() {
  try {
    const res = await fetch("/api/users/me", {
      credentials: "include",
    });

    if (res.status === 401) {
      window.location.href = "/";
      return;
    }

    const user = await res.json();

    if (user.role === "admin") {
      backToAdminBtn.classList.remove("d-none");
    }

  } catch (err) {
    window.location.href = "/";
  }
}

// ===== Load Activity Preview =====
async function loadDashboardActivities() {
  try {
    const res = await fetch("/api/activities", {
      credentials: "include",
    });

    if (!res.ok) {
      activityContainer.innerHTML =
        "<p class='text-muted'>Unable to load activities.</p>";
      return;
    }

    const activities = await res.json();

    if (!activities.length) {
      activityContainer.innerHTML =
        "<p class='text-muted'>No activities yet.</p>";
      return;
    }

    // Show next 5 upcoming incomplete
    const upcoming = activities
      .filter(a => !a.completed)
      .slice(0, 5);

    activityContainer.innerHTML = "";

    upcoming.forEach((a) => {
      const div = document.createElement("div");
      div.className = "mb-3 activity-item";

      div.innerHTML = `
        <strong>${a.title}</strong>
        <div class="small text-muted">
          ${new Date(a.date).toLocaleString()}
        </div>
      `;

      activityContainer.appendChild(div);
    });

  } catch (err) {
    activityContainer.innerHTML =
      "<p class='text-muted'>Error loading activities.</p>";
  }
}

// ===== Admin Button =====
backToAdminBtn.addEventListener("click", () => {
  window.location.href = "/admin.html";
});

// ===== Logout =====
logoutBtn.addEventListener("click", async () => {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  window.location.href = "/";
});

checkAuth();
loadDashboardActivities();
