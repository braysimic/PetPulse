const reminderContainer = document.getElementById("dashboardReminders");

// LOAD DASHBOARD REMINDERS
async function loadDashboardReminders() {

try {

const res = await fetch("/api/reminders", {
credentials: "include"
});

if (!res.ok) {

reminderContainer.innerHTML =
"<p class='text-muted'>Unable to load reminders</p>";

return;

}

const reminders = (await res.json())
.filter(r => !r.completed)
.sort((a,b) => new Date(a.date) - new Date(b.date));

if (!reminders.length) {

reminderContainer.innerHTML =
"<p class='text-muted'>No upcoming reminders</p>";

return;

}

reminderContainer.innerHTML = "";

reminders.slice(0,5).forEach(reminder => {

const div = document.createElement("div");

div.className = "mb-3 border-bottom pb-2";

div.innerHTML = `
<strong>🐾 ${reminder.pet.name}</strong>
<div>${reminder.task}</div>
<div class="small text-muted">
${new Date(reminder.date).toLocaleString()}
</div>
`;

reminderContainer.appendChild(div);

});

} catch {

reminderContainer.innerHTML =
"<p class='text-muted'>Error loading reminders</p>";

}

}

// INIT
loadDashboardReminders();