const params = new URLSearchParams(window.location.search);
const petId = params.get("petId");

const form = document.getElementById("petForm");
const message = document.getElementById("petMessage");
const deleteBtn = document.getElementById("deletePetBtn");

const reminderForm = document.getElementById("reminderForm");
const reminderList = document.getElementById("reminderList");


// ================= LOAD PET =================
async function loadPet() {

  try {

    const res = await fetch(`/api/pets/${petId}`, {
      credentials: "include"
    });

    if (!res.ok) {
      window.location.href = "/dashboard.html";
      return;
    }

    const pet = await res.json();

    petName.value = pet.name;
    petSpecies.value = pet.species;
    petBreed.value = pet.breed;

  } catch {

    window.location.href = "/dashboard.html";

  }

}


// ================= UPDATE PET =================
form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const body = {
    name: petName.value,
    species: petSpecies.value,
    breed: petBreed.value
  };

  const res = await fetch(`/api/pets/${petId}`, {

    method: "PUT",

    headers: {
      "Content-Type": "application/json"
    },

    credentials: "include",

    body: JSON.stringify(body)

  });

  const data = await res.json();

  if (!res.ok) {

    message.innerHTML =
      `<div class="alert alert-danger">${data.error}</div>`;

    return;

  }

  message.innerHTML =
    `<div class="alert alert-success">Pet updated successfully</div>`;

});


// ================= DELETE PET =================
deleteBtn.addEventListener("click", async () => {

  if (!confirm("Delete this pet permanently?")) return;

  const res = await fetch(`/api/pets/${petId}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (res.ok) {
    window.location.href = "/dashboard.html";
  }

});


// ================= LOAD REMINDERS =================
async function loadReminders() {

  const res = await fetch("/api/reminders", {
    credentials: "include"
  });

  const reminders = await res.json();

  const petReminders = reminders.filter(
    r => r.pet._id === petId
  );

  reminderList.innerHTML = "";

  if (!petReminders.length) {

    reminderList.innerHTML =
      "<p class='text-muted'>No reminders yet</p>";

    return;

  }

  petReminders.forEach(reminder => {

    const div = document.createElement("div");

    div.className =
      "d-flex justify-content-between align-items-center mb-2 border p-2 rounded";

    div.innerHTML = `

      <div>

        <input
        type="checkbox"
        ${reminder.completed ? "checked" : ""}
        class="completeReminder"
        data-id="${reminder._id}"
        />

        <strong class="${
          reminder.completed ? "text-decoration-line-through text-muted" : ""
        }">
        ${reminder.task}
        </strong>

        <div class="small text-muted">
        ${new Date(reminder.date).toLocaleString()}
        </div>

      </div>

      <button
      class="btn btn-sm btn-outline-danger deleteReminder"
      data-id="${reminder._id}">
      🗑
      </button>

    `;

    reminderList.appendChild(div);

  });

  attachReminderHandlers();

}


// ================= CREATE REMINDER =================
reminderForm?.addEventListener("submit", async (e) => {

  e.preventDefault();

  const body = {

    petId,

    task: reminderTask.value,

    date: reminderDate.value,

    repeat: reminderRepeat.value

  };

  const res = await fetch("/api/reminders", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    credentials: "include",

    body: JSON.stringify(body)

  });

  if (res.ok) {

    reminderForm.reset();
    loadReminders();

  }

});


// ================= REMINDER HANDLERS =================
function attachReminderHandlers() {

  document.querySelectorAll(".completeReminder").forEach(box => {

    box.onclick = async () => {

      await fetch(`/api/reminders/${box.dataset.id}`, {

        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        credentials: "include",

        body: JSON.stringify({
          completed: box.checked
        })

      });

      loadReminders();

    };

  });


  document.querySelectorAll(".deleteReminder").forEach(btn => {

    btn.onclick = async () => {

      if (!confirm("Delete this reminder?")) return;

      await fetch(`/api/reminders/${btn.dataset.id}`, {

        method: "DELETE",
        credentials: "include"

      });

      loadReminders();

    };

  });

}


// ================= INIT =================
loadPet();
loadReminders();