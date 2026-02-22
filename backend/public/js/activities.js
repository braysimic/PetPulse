const listDiv = document.getElementById("activityList");
const form = document.getElementById("activityForm");

async function loadActivities() {
  const res = await fetch("/api/activities", {
    credentials: "include",
  });

  if (res.status === 401) {
    window.location.href = "/";
    return;
  }

  const activities = await res.json();

  listDiv.innerHTML = "";

  if (!activities.length) {
    listDiv.innerHTML = "<p class='text-muted'>No activities yet.</p>";
    return;
  }

  activities.forEach((a) => {
    const div = document.createElement("div");
    div.className = "card p-3 mb-2";

    div.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong ${a.completed ? "style='text-decoration:line-through'" : ""}>
            ${a.title}
          </strong>
          <div class="small text-muted">
            ${new Date(a.date).toLocaleString()}
          </div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-primary toggle-btn">
            ${a.completed ? "Undo" : "Done"}
          </button>
          <button class="btn btn-sm btn-primary delete-btn">
            Delete
          </button>
        </div>
      </div>
    `;

    div.querySelector(".toggle-btn").onclick = async () => {
      await fetch("/api/activities/" + a._id, {
        method: "PUT",
        credentials: "include",
      });
      loadActivities();
    };

    div.querySelector(".delete-btn").onclick = async () => {
      await fetch("/api/activities/" + a._id, {
        method: "DELETE",
        credentials: "include",
      });
      loadActivities();
    };

    listDiv.appendChild(div);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const date = document.getElementById("date").value;

  await fetch("/api/activities", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, date }),
  });

  form.reset();
  loadActivities();
});

loadActivities();
