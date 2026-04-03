// ================= ELEMENTS =================
const reminderContainer = document.getElementById("dashboardReminders");
const petCardsContainer = document.getElementById("petCardsContainer");
const petStatsContainer = document.getElementById("petStatsContainer");

const input = document.getElementById("AIChatInput");
const sendBtn = document.getElementById("AIChatSendBtn");
const count = document.getElementById("chatCharCount");
const chips = document.querySelectorAll(".ai-chip");
const chatContainer = document.getElementById("AIChatResponse");


// ================= LOAD REMINDERS =================
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


// ================= LOAD PET CARDS =================
async function loadPetCards() {
  try {

    const [petsRes, remindersRes] = await Promise.all([
      fetch("/api/pets", { credentials: "include" }),
      fetch("/api/reminders", { credentials: "include" })
    ]);

    const pets = await petsRes.json();
    const reminders = await remindersRes.json();

    petCardsContainer.innerHTML = "";

    if (!pets.length) {
      petCardsContainer.innerHTML =
        "<p class='text-muted'>No pets yet. Add one!</p>";
      return;
    }

    pets.forEach(pet => {

      const petReminders = reminders.filter(r => r.pet._id === pet._id);

      const nextReminder = petReminders
        .filter(r => !r.completed)
        .sort((a,b) => new Date(a.date) - new Date(b.date))[0];

      const completedCount =
        petReminders.filter(r => r.completed).length;

      const col = document.createElement("div");
      col.className = "col-md-6";

      col.innerHTML = `
        <div class="card shadow-sm dashboard-card p-4 h-100 pet-card"
             style="cursor:pointer"
             data-id="${pet._id}">

          <h5 class="fw-bold">🐾 ${pet.name}</h5>

          <ul class="text-muted small">
            <li><strong>Breed:</strong> ${pet.breed}</li>

            <li>
              <strong>Next Reminder:</strong>
              ${nextReminder
                ? new Date(nextReminder.date).toLocaleString()
                : "None"}
            </li>

            <li>
              <strong>Completed Tasks:</strong>
              ${completedCount}
            </li>
          </ul>

          <button class="btn btn-primary w-100 mt-auto">
            View Profile
          </button>

        </div>
      `;

      petCardsContainer.appendChild(col);
    });

    attachPetCardHandlers();

  } catch (err) {
    console.error(err);
  }
}


// ================= LOAD PET STATS =================
async function loadPetStats() {
  try {

    const petsRes = await fetch("/api/pets", {
      credentials: "include"
    });

    const pets = await petsRes.json();

    petStatsContainer.innerHTML = "";

    if (!pets.length) {
      petStatsContainer.innerHTML =
        "<p class='text-muted'>No pets yet</p>";
      return;
    }

    for (const pet of pets) {

      let stats = {
        walk: 0,
        feeding: 0,
        medication: 0,
        bath: 0
      };

      try {
        const res = await fetch(`/api/reminders/stats/${pet._id}`, {
          credentials: "include"
        });

        if (res.ok) {
          stats = await res.json();
        }

      } catch {
        console.log("Stats failed for", pet.name);
      }

      const div = document.createElement("div");
      div.className = "mb-3 border-bottom pb-2";

      div.innerHTML = `
        <strong>🐾 ${pet.name}</strong>

        <div class="small text-muted">
          🐾 ${stats.walk} walks •
          🍽️ ${stats.feeding} meals •
          💊 ${stats.medication} meds •
          🛁 ${stats.bath} baths
        </div>
      `;

      petStatsContainer.appendChild(div);
    }

  } catch {
    petStatsContainer.innerHTML =
      "<p class='text-muted'>Error loading stats</p>";
  }
}


// ================= PET CARD CLICK =================
function attachPetCardHandlers() {
  document.querySelectorAll(".pet-card").forEach(card => {
    card.onclick = () => {
      const id = card.dataset.id;
      window.location.href = `/pet.html?petId=${id}`;
    };
  });
}


// ================= AI CHAT =================

// Character counter
input?.addEventListener("input", () => {
  count.textContent = input.value.length;
});

// Chips autofill
chips.forEach(chip => {
  chip.addEventListener("click", () => {
    input.value = chip.textContent;
    count.textContent = input.value.length;
    input.focus();
  });
});

// Enter key
input?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

// Send message
sendBtn?.addEventListener("click", async () => {

  const message = input.value.trim();
  if (!message) return;

  // USER MESSAGE
  const userMsg = document.createElement("div");
  userMsg.className = "ai-message ai-message-user";
  userMsg.innerHTML = `<div class="ai-bubble">${message}</div>`;
  chatContainer.appendChild(userMsg);

  input.value = "";
  count.textContent = "0";

  try {

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    // BOT RESPONSE
    const botMsg = document.createElement("div");
    botMsg.className = "ai-message ai-message-bot";

    botMsg.innerHTML = `
      <div class="ai-avatar">
        <i class="bi bi-robot"></i>
      </div>
      <div class="ai-bubble">
        ${data.reply}
      </div>
    `;

    chatContainer.appendChild(botMsg);

    // AUTO SCROLL
    const chatBox = document.getElementById("aiChatContainer");
    chatBox.scrollTop = chatBox.scrollHeight;

  } catch {
    console.log("AI error");
  }

});


// ================= INIT =================
loadDashboardReminders();
loadPetCards();
loadPetStats();