class HealthTrackApp {
  constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.init();
  }

  init() {
    this.setupEventListeners();
    if (this.token) {
      this.showDashboard();
    } else {
      this.showAuth();
    }
  }

  setupEventListeners() {
    // Auth tabs
    document
      .getElementById("login-tab")
      .addEventListener("click", () => this.switchAuthTab("login"));
    document
      .getElementById("register-tab")
      .addEventListener("click", () => this.switchAuthTab("register"));

    // Auth form
    document
      .getElementById("auth-form")
      .addEventListener("submit", (e) => this.handleAuth(e));

    // Dashboard navigation
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchTab(e.target.dataset.tab)
      );
    });

    // Logout
    document
      .getElementById("logout-btn")
      .addEventListener("click", () => this.logout());

    // Forms
    document
      .getElementById("health-form")
      .addEventListener("submit", (e) => this.addHealthRecord(e));
    document
      .getElementById("medication-form")
      .addEventListener("submit", (e) => this.addMedication(e));
  }

  switchAuthTab(tab) {
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const registerFields = document.getElementById("register-fields");
    const authBtn = document.getElementById("auth-btn");

    if (tab === "login") {
      loginTab.classList.add("active");
      registerTab.classList.remove("active");
      registerFields.style.display = "none";
      authBtn.textContent = "Login";
    } else {
      registerTab.classList.add("active");
      loginTab.classList.remove("active");
      registerFields.style.display = "block";
      authBtn.textContent = "Register";
    }
  }

  async handleAuth(e) {
    e.preventDefault();
    const isLogin = document
      .getElementById("login-tab")
      .classList.contains("active");
    const endpoint = isLogin
      ? `${this.apiBaseUrl}/api/auth/login`
      : `${this.apiBaseUrl}/api/auth/register`;

    const formData = {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    };

    if (!isLogin) {
      formData.name = document.getElementById("name").value;
      formData.dateOfBirth = document.getElementById("dateOfBirth").value;
      formData.gender = document.getElementById("gender").value;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));
        this.showDashboard();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  }

  showAuth() {
    document.getElementById("auth-section").style.display = "flex";
    document.getElementById("dashboard-section").style.display = "none";
  }

  showDashboard() {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("dashboard-section").style.display = "flex";
    document.getElementById("user-name").textContent = this.user.name;
    this.loadHealthRecords();
    this.loadMedications();
    this.loadStats();
  }

  switchTab(tab) {
    document
      .querySelectorAll(".nav-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));

    document.querySelector(`[data-tab="${tab}"]`).classList.add("active");
    document.getElementById(`${tab}-tab`).classList.add("active");
  }

  async addHealthRecord(e) {
    e.preventDefault();

    const recordData = {
      type: document.getElementById("health-type").value,
      value: document.getElementById("health-value").value,
      unit: document.getElementById("health-unit").value,
      notes: document.getElementById("health-notes").value,
    };

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/health/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(recordData),
      });

      if (response.ok) {
        document.getElementById("health-form").reset();
        this.loadHealthRecords();
      } else {
        alert("Failed to add health record");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  }

  async loadHealthRecords() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/health/records`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      if (response.ok) {
        const data = await response.json();
        this.displayHealthRecords(data.records);
      }
    } catch (error) {
      console.error("Failed to load health records:", error);
    }
  }

  displayHealthRecords(records) {
    const container = document.getElementById("health-records");
    container.innerHTML = records
      .map(
        (record) => `
            <div class="record-item">
                <div class="record-header">
                    <span class="record-type">${record.type.replace(
                      "_",
                      " "
                    )}</span>
                    <span class="record-date">${new Date(
                      record.recordedAt
                    ).toLocaleDateString()}</span>
                </div>
                <div class="record-value">${record.value} ${record.unit}</div>
                ${
                  record.notes
                    ? `<div class="record-notes">${record.notes}</div>`
                    : ""
                }
            </div>
        `
      )
      .join("");
  }

  async addMedication(e) {
    e.preventDefault();

    const medicationData = {
      name: document.getElementById("med-name").value,
      dosage: {
        amount: parseFloat(document.getElementById("med-amount").value),
        unit: document.getElementById("med-unit").value,
      },
      frequency: {
        times: parseInt(document.getElementById("med-times").value),
        period: "daily",
      },
      reminderTimes: [document.getElementById("med-reminder").value],
      startDate: document.getElementById("med-start").value,
      endDate: document.getElementById("med-end").value || null,
      instructions: document.getElementById("med-instructions").value,
    };

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/medications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(medicationData),
      });

      if (response.ok) {
        document.getElementById("medication-form").reset();
        this.loadMedications();
      } else {
        alert("Failed to add medication");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  }

  async loadMedications() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/medications`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      if (response.ok) {
        const data = await response.json();
        this.displayMedications(data.medications);
      }
    } catch (error) {
      console.error("Failed to load medications:", error);
    }
  }

  displayMedications(medications) {
    const container = document.getElementById("medications-list");
    container.innerHTML = medications
      .map(
        (med) => `
            <div class="medication-item">
                <div class="medication-header">
                    <span class="medication-name">${med.name}</span>
                    <span class="medication-schedule">${med.reminderTimes.join(
                      ", "
                    )}</span>
                </div>
                <div class="medication-dosage">${med.dosage.amount} ${
          med.dosage.unit
        } - ${med.frequency.times}x ${med.frequency.period}</div>
                ${
                  med.instructions
                    ? `<div class="medication-instructions">${med.instructions}</div>`
                    : ""
                }
            </div>
        `
      )
      .join("");
  }

  async loadStats() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/health/stats`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      if (response.ok) {
        const data = await response.json();
        this.displayStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }

  displayStats(stats) {
    const container = document.getElementById("stats-content");
    const typeCards = Object.entries(stats.types)
      .map(
        ([type, data]) => `
            <div class="stat-card">
                <div class="stat-number">${data.count}</div>
                <div class="stat-label">${type.replace("_", " ")} Records</div>
            </div>
        `
      )
      .join("");

    container.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${stats.totalRecords}</div>
                <div class="stat-label">Total Records</div>
            </div>
            ${typeCards}
        `;
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.token = null;
    this.user = {};
    this.showAuth();
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new HealthTrackApp();
});
