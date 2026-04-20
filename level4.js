(function () {
  "use strict";

  const simulatorData = {
    level: {
      title: "GC Analyzer Training Simulator — Level 4",
      subtitle: "Fault Diagnosis",
      passScore: 70
    },

    scenarios: [
      {
        alarm: "TT-101 LOW",
        desc: "Oven temperature below setpoint",
        values: {
          "TT-101": "183 °C",
          "Setpoint": "200 °C",
          "Flow": "Normal",
          "Pressure": "Normal"
        },
        question: "What is the most likely impact?",
        choices: [
          "Poor chromatographic separation",
          "Detector failure",
          "Gas leakage",
          "Sensor damage"
        ],
        correct: "Poor chromatographic separation",
        explanation: "Low temperature causes poor separation and peak distortion."
      },

      {
        alarm: "FT-102 LOW",
        desc: "Carrier flow below normal",
        values: {
          "Flow": "11 mL/min",
          "Pressure": "0.8 barg",
          "Temp": "Normal"
        },
        question: "What should be checked first?",
        choices: [
          "Pressure regulator",
          "Detector heater",
          "Valve position",
          "Software bug"
        ],
        correct: "Pressure regulator",
        explanation: "Low pressure and low flow together indicate a supply or regulator issue."
      },

      {
        alarm: "PT-101 LOW",
        desc: "Sample pressure low",
        values: {
          "Pressure": "0.7 barg",
          "Flow": "Low",
          "Temp": "Normal"
        },
        question: "What is the most likely cause?",
        choices: [
          "Sample supply issue",
          "Detector overheating",
          "Column blockage",
          "Calibration error"
        ],
        correct: "Sample supply issue",
        explanation: "Low pressure and low flow indicate an upstream sample supply problem."
      }
    ]
  };

  const state = {
    index: 0,
    score: 0,
    locked: false,
    choices: []
  };

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function init() {
    const root = document.getElementById("level4-app");
    if (!root) return;

    injectStyle();
    render();
  }

  function injectStyle() {
    if (document.getElementById("level4-inline-style")) return;

    const s = document.createElement("style");
    s.id = "level4-inline-style";
    s.textContent = `
      .l4-box {
        padding: 20px;
        max-width: 900px;
        margin: 20px auto;
        font-family: Arial, sans-serif;
      }

      .l4-title {
        margin-bottom: 4px;
      }

      .l4-subtitle {
        color: #64748b;
        margin-bottom: 20px;
      }

      .l4-alarm {
        background: #dc2626;
        color: white;
        padding: 12px 14px;
        border-radius: 10px;
        font-weight: bold;
        margin-bottom: 16px;
      }

      .l4-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin: 15px 0 20px;
      }

      .l4-val {
        border: 1px solid #d1d5db;
        padding: 12px;
        border-radius: 8px;
        background: #f8fafc;
      }

      .l4-question {
        margin: 20px 0 12px;
      }

      .l4-btn {
        padding: 12px;
        margin: 6px 0;
        width: 100%;
        cursor: pointer;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        background: white;
        font-size: 15px;
        text-align: left;
      }

      .l4-btn:hover {
        background: #f1f5f9;
      }

      .l4-status {
        margin: 12px 0;
        padding: 12px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
      }

      .l4-correct {
        background: #22c55e;
      }

      .l4-wrong {
        background: #ef4444;
      }

      .l4-feedback {
        margin-top: 16px;
        padding: 14px;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #f8fafc;
      }

      .l4-next {
        margin-top: 12px;
        padding: 10px 16px;
        border: none;
        border-radius: 8px;
        background: #2563eb;
        color: white;
        cursor: pointer;
      }

      .l4-next:hover {
        background: #1d4ed8;
      }
    `;
    document.head.appendChild(s);
  }

  function render() {
    const s = simulatorData.scenarios[state.index];

    state.locked = false;
    state.choices = shuffle(s.choices);

    const valuesHTML = Object.entries(s.values)
      .map(([k, v]) => `<div class="l4-val"><b>${escapeHtml(k)}</b><br>${escapeHtml(v)}</div>`)
      .join("");

    const choicesHTML = state.choices
      .map((c) => `<button class="l4-btn" data-choice="${escapeAttr(c)}">${escapeHtml(c)}</button>`)
      .join("");

    const root = document.getElementById("level4-app");
    root.innerHTML = `
      <div class="l4-box">
        <h2 class="l4-title">${escapeHtml(simulatorData.level.title)}</h2>
        <div class="l4-subtitle">Scenario ${state.index + 1} of ${simulatorData.scenarios.length} | Score: ${state.score}</div>

        <div class="l4-alarm">${escapeHtml(s.alarm)} — ${escapeHtml(s.desc)}</div>

        <div class="l4-grid">${valuesHTML}</div>

        <h3 class="l4-question">${escapeHtml(s.question)}</h3>

        <div id="l4-choices">${choicesHTML}</div>

        <div id="feedback"></div>
      </div>
    `;

    document.querySelectorAll(".l4-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        answer(this.getAttribute("data-choice"));
      });
    });
  }

  function answer(choice) {
    if (state.locked) return;
    state.locked = true;

    const s = simulatorData.scenarios[state.index];
    const correct = choice === s.correct;

    if (correct) state.score += 10;

    const feedback = document.getElementById("feedback");
    feedback.innerHTML = `
      <div class="l4-status ${correct ? "l4-correct" : "l4-wrong"}">
        ${correct ? "Correct" : "Incorrect"}
      </div>
      <div class="l4-feedback">
        <p><strong>Correct answer:</strong> ${escapeHtml(s.correct)}</p>
        <p>${escapeHtml(s.explanation)}</p>
        <button class="l4-next" id="next-btn">Next</button>
      </div>
    `;

    document.getElementById("next-btn").addEventListener("click", next);
  }

  function next() {
    state.index += 1;

    if (state.index >= simulatorData.scenarios.length) {
      const root = document.getElementById("level4-app");
      root.innerHTML = `
        <div class="l4-box">
          <h2>${escapeHtml(simulatorData.level.title)}</h2>
          <div class="l4-feedback">
            <p><strong>Completed</strong></p>
            <p>Final Score: ${state.score}</p>
          </div>
        </div>
      `;
      return;
    }

    render();
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
