// ================= ELEMENTS =================
const reminderContainer = document.getElementById("dashboardReminders");
const petCardsContainer = document.getElementById("petCardsContainer");
const petStatsContainer = document.getElementById("petStatsContainer");
const vetContainer = document.getElementById("vetContactContainer");

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

    /*
    if (!pets.length) {
      petCardsContainer.innerHTML =
        "<p class='text-muted'>No pets yet. Add one!</p>";
      return;
    }
      */

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
        "<p class='text-muted'>No pets yet. Add one!</p>";
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


// ================= LOAD VET CONTACT =================
async function loadVetContact() {

  try {

    const res = await fetch("/api/vet", {
      credentials: "include"
    });

    const data = await res.json();

    vetContainer.innerHTML = `
  <div class="mb-3">

    <h6 class="fw-bold">Primary Vet</h6>

    <input id="primaryClinic" class="form-control mb-1"
      placeholder="Clinic Name"
      value="${data.primary?.clinicName || ""}" />

    <input id="primaryVet" class="form-control mb-1"
      placeholder="Vet Name"
      value="${data.primary?.vetName || ""}" />

    <div class="input-group mb-2">
      <input id="primaryPhone" class="form-control"
        placeholder="Phone"
        value="${data.primary?.phone || ""}" />

      <a
        href="tel:${data.primary?.phone || ""}"
        class="btn btn-outline-success"
      >
        📞 Call
      </a>
    </div>

  </div>


  <div class="mb-3">

    <h6 class="fw-bold text-danger">🚨 Emergency Clinic</h6>

    <input id="emergencyClinic" class="form-control mb-1"
      placeholder="Clinic Name"
      value="${data.emergency?.clinicName || ""}" />

    <div class="input-group mb-1">
      <input id="emergencyPhone" class="form-control"
        placeholder="Phone"
        value="${data.emergency?.phone || ""}" />

      <a
        href="tel:${data.emergency?.phone || ""}"
        class="btn btn-outline-danger"
      >
        📞 Call
      </a>
    </div>

    <div class="input-group mb-2">
      <input id="emergencyAddress" class="form-control"
        placeholder="Address"
        value="${data.emergency?.address || ""}" />

      <a
        href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.emergency?.address || "")}"
        target="_blank"
        class="btn btn-outline-primary"
      >
        📍 Maps
      </a>
    </div>

  </div>

  <button class="btn btn-primary w-100" id="saveVetBtn">
    Save Contact Info
  </button>
`;

    attachVetSaveHandler();

  } catch {
    vetContainer.innerHTML =
      "<p class='text-danger'>Failed to load vet info</p>";
  }
}


// ================= SAVE VET =================
function attachVetSaveHandler() {

  document.getElementById("saveVetBtn").onclick = async () => {

    const body = {
      primary: {
        clinicName: primaryClinic.value,
        vetName: primaryVet.value,
        phone: primaryPhone.value
      },
      emergency: {
        clinicName: emergencyClinic.value,
        phone: emergencyPhone.value,
        address: emergencyAddress.value
      }
    };

    const res = await fetch("/api/vet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(body)
    });

    if (res.ok) {
      alert("Saved successfully!");
    }
  };
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
input?.addEventListener("input", () => {
  count.textContent = input.value.length;
});

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    input.value = chip.textContent;
    count.textContent = input.value.length;
    input.focus();
  });
});

input?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

sendBtn?.addEventListener("click", async () => {
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("aiChatContainer");

  // Add user message
  const userMsg = document.createElement("div");
  userMsg.className = "ai-message ai-message-user";
  userMsg.innerHTML = `
    <div class="ai-bubble">
      ${message}
      <div class="ai-message-time">Just now</div>
    </div>
  `;
  chatContainer.appendChild(userMsg);

  // Clear input
  input.value = "";
  count.textContent = "0";

  // Disable input while waiting
  sendBtn.disabled = true;
  input.disabled = true;

  // Add typing indicator
  const typingMsg = document.createElement("div");
  typingMsg.className = "ai-message ai-message-bot ai-typing";
  typingMsg.id = "aiTypingIndicator";
  typingMsg.innerHTML = `
    <div class="ai-avatar">
      <i class="bi bi-robot"></i>
    </div>
    <div class="ai-bubble">
      <div class="ai-typing-dots" aria-label="Assistant is typing">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  chatContainer.appendChild(typingMsg);

  // Scroll to bottom
  chatBox.scrollTop = chatBox.scrollHeight;

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

    // Remove typing indicator
    typingMsg.remove();

    // Add bot response
    const botMsg = document.createElement("div");
    botMsg.className = "ai-message ai-message-bot";
    botMsg.innerHTML = `
      <div class="ai-avatar">
        <i class="bi bi-robot"></i>
      </div>
      <div class="ai-bubble">
        ${data.reply}
        <div class="ai-message-time">Just now</div>
      </div>
    `;

    chatContainer.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (err) {
    console.error("AI error:", err);

    typingMsg.remove();

    const errorMsg = document.createElement("div");
    errorMsg.className = "ai-message ai-message-bot";
    errorMsg.innerHTML = `
      <div class="ai-avatar">
        <i class="bi bi-robot"></i>
      </div>
      <div class="ai-bubble">
        Sorry, I ran into an error getting a response. Please try again.
      </div>
    `;

    chatContainer.appendChild(errorMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  } finally {
    sendBtn.disabled = false;
    input.disabled = false;
    input.focus();
  }
});


// ================= INIT =================
loadDashboardReminders();
loadPetCards();
loadPetStats();
loadVetContact();