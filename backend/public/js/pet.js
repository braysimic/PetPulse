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
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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


// ================= MEDICAL RECORDS =================

const medicalForm = document.getElementById("medicalForm");
const medicalList = document.getElementById("medicalList");

let editingRecordId = null;
let allRecords = [];

// 🔥 FIXED DATE FUNCTION
function formatDate(dateString) {
  const d = new Date(dateString);
  const fixed = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  return fixed.toLocaleDateString();
}


// LOAD
async function loadMedicalRecords() {
  const res = await fetch(`/api/medical/${petId}`, {
    credentials: "include"
  });

  allRecords = await res.json();
  renderMedicalRecords(allRecords);
}


// RENDER
function renderMedicalRecords(records) {

  medicalList.innerHTML = "";

  if (!records.length) {
    medicalList.innerHTML =
      "<p class='text-muted'>No records found</p>";
    return;
  }

  records.forEach(r => {

    const div = document.createElement("div");

    div.className =
      "border p-2 rounded mb-2 d-flex justify-content-between align-items-center";

    div.innerHTML = `
      <div>
        <strong>${r.type.toUpperCase()}</strong>

        <div>${r.description}</div>

        <div class="small text-muted">
          ${formatDate(r.date)}
        </div>

        ${
          r.fileUrl
            ? `<a href="${r.fileUrl}" target="_blank">View File</a>`
            : ""
        }
      </div>

      <div class="d-flex gap-2">

        <button class="btn btn-sm btn-outline-secondary editRecord"
                data-id="${r._id}">
          ✏️
        </button>

        <button class="btn btn-sm btn-outline-danger deleteRecord"
                data-id="${r._id}">
          🗑
        </button>

      </div>
    `;

    medicalList.appendChild(div);
  });

  attachMedicalHandlers();
}


// CREATE + UPDATE
medicalForm?.addEventListener("submit", async (e) => {

  e.preventDefault();

  const formData = new FormData();

  formData.append("petId", petId);
  formData.append("type", medicalType.value);
  formData.append("date", medicalDate.value);
  formData.append("description", medicalDescription.value);

  if (medicalFile.files[0]) {
    formData.append("file", medicalFile.files[0]);
  }

  let url = "/api/medical";
  let method = "POST";

  if (editingRecordId) {
    url = `/api/medical/${editingRecordId}`;
    method = "PUT";
  }

  const res = await fetch(url, {
    method,
    credentials: "include",
    body: formData
  });

  if (res.ok) {
    medicalForm.reset();
    editingRecordId = null;

    medicalForm.querySelector("button").innerText = "Save Record";

    loadMedicalRecords();
  }
});


// HANDLERS
function attachMedicalHandlers() {

  document.querySelectorAll(".deleteRecord").forEach(btn => {
    btn.onclick = async () => {

      if (!confirm("Delete this record?")) return;

      await fetch(`/api/medical/${btn.dataset.id}`, {
        method: "DELETE",
        credentials: "include"
      });

      loadMedicalRecords();
    };
  });

  document.querySelectorAll(".editRecord").forEach(btn => {
    btn.onclick = () => {

      const record = allRecords.find(r => r._id === btn.dataset.id);

      medicalType.value = record.type;
      medicalDescription.value = record.description;
      medicalDate.value = record.date.split("T")[0];

      editingRecordId = record._id;

      medicalForm.querySelector("button").innerText = "Update Record";

      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  });
}


// SEARCH
document.getElementById("searchKeyword")?.addEventListener("input", filterRecords);
document.getElementById("searchDate")?.addEventListener("input", filterRecords);

function filterRecords() {

  const keyword = searchKeyword.value.toLowerCase();
  const date = searchDate.value;

  const filtered = allRecords.filter(r => {

    const matchKeyword =
      r.description.toLowerCase().includes(keyword) ||
      r.type.toLowerCase().includes(keyword);

    const matchDate =
      !date || r.date.startsWith(date);

    return matchKeyword && matchDate;
  });

  renderMedicalRecords(filtered);
}


// ================= INIT =================
loadPet();
loadReminders();
loadMedicalRecords();