(function () {
  "use strict";

  const simulator = {
    title: "GC Analyzer Engineering Training Simulator — Level 5",
    subtitle: "Chromatogram Diagnosis Mode",
    passScore: 70,
    scenarios: [
      {
        id: "L5-001",
        title: "Zero Reading Despite Visible Peaks",
        description: "The chromatogram shows visible peaks, but reported compound values are all 0.00 ppb.",
        plotType: "zeroReading",
        question: "What is the most likely root cause?",
        choices: [
          "Detector failure",
          "Retention time misalignment",
          "Carrier gas loss",
          "Column damage"
        ],
        correctAnswer: "Retention time misalignment",
        correctionAction: "Align retention window and verify method timing",
        engineeringNote:
          "If peaks exist visually but the system reports zero, the software may be missing the peaks because the retention windows are misaligned.",
        correctedPlotType: "good"
      },
      {
        id: "L5-002",
        title: "Broad Peaks and Poor Separation",
        description: "The chromatogram shows broad peaks with poor compound separation.",
        plotType: "broadPeaks",
        question: "Which parameter is most likely drifting?",
        choices: [
          "Oven temperature",
          "Detector voltage",
          "Sample bottle concentration",
          "Vent valve label"
        ],
        correctAnswer: "Oven temperature",
        correctionAction: "Restore correct oven temperature control",
        engineeringNote:
          "Broad peaks and poor separation are commonly linked to temperature control issues in the oven or column thermal zone.",
        correctedPlotType: "good"
      },
      {
        id: "L5-003",
        title: "Noisy Baseline",
        description: "The signal baseline is unstable and noisy across the run.",
        plotType: "noisyBaseline",
        question: "What is the most likely cause?",
        choices: [
          "Detector instability",
          "Perfect calibration",
          "Normal baseline behavior",
          "Sample name mismatch"
        ],
        correctAnswer: "Detector instability",
        correctionAction: "Stabilize detector and verify detector conditions",
        engineeringNote:
          "A noisy baseline usually points to detector instability, signal quality issues, or electrical noise affecting the measurement.",
        correctedPlotType: "good"
      },
      {
        id: "L5-004",
        title: "Retention Time Shift",
        description: "Peaks appear in the wrong time positions compared with the expected method windows.",
        plotType: "retentionShift",
        question: "Which parameter should be checked first?",
        choices: [
          "Carrier flow / pressure",
          "Screen brightness",
          "Cabinet door sticker",
          "Keyboard settings"
        ],
        correctAnswer: "Carrier flow / pressure",
        correctionAction: "Check carrier gas flow and pressure stability",
        engineeringNote:
          "Retention time shifts are strongly associated with carrier flow, carrier pressure, or thermal timing changes.",
        correctedPlotType: "good"
      }
    ]
  };

  const state = {
    scenarioIndex: 0,
    score: 0,
    correctCount: 0,
    phase: "diagnose", // diagnose, correct, result, complete
    selectedAnswer: null,
    choices: [],
    awaitingAnimation: false
  };

  function init() {
    const root = document.getElementById("level5-app");
    if (!root) return;
    injectStyles();
    render();
  }

  function injectStyles() {
    if (document.getElementById("level5-styles")) return;

    const style = document.createElement("style");
    style.id = "level5-styles";
    style.textContent = `
      :root{
        --bg:#eef2f7;
        --panel:#0f172a;
        --panel2:#1e293b;
        --card:#ffffff;
        --line:#dbe4ef;
        --text:#0f172a;
        --muted:#64748b;
        --blue:#2563eb;
        --ok:#15803d;
        --warn:#d97706;
        --bad:#dc2626;
      }
      *{box-sizing:border-box}
      body{
        margin:0;
        font-family:Arial,Helvetica,sans-serif;
        background:var(--bg);
        color:var(--text);
      }
      .l5-wrap{
        display:grid;
        grid-template-columns:320px 1fr;
        min-height:100vh;
      }
      .l5-side{
        background:linear-gradient(180deg,var(--panel),var(--panel2));
        color:#e2e8f0;
        padding:20px;
      }
      .l5-side h1{
        margin:0 0 8px;
        font-size:24px;
        line-height:1.2;
      }
      .l5-side p{
        margin:0 0 16px;
        color:#94a3b8;
        line-height:1.45;
      }
      .l5-stats{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
        margin:14px 0 18px;
      }
      .l5-stat{
        background:rgba(255,255,255,.08);
        border-radius:14px;
        padding:12px;
        text-align:center;
      }
      .l5-stat-label{
        display:block;
        font-size:12px;
        color:#94a3b8;
        text-transform:uppercase;
        letter-spacing:.04em;
      }
      .l5-stat-value{
        display:block;
        font-size:22px;
        font-weight:700;
        margin-top:4px;
      }
      .l5-main{
        padding:20px;
      }
      .l5-card{
        background:var(--card);
        border:1px solid var(--line);
        border-radius:20px;
        padding:18px;
        box-shadow:0 10px 28px rgba(15,23,42,.06);
      }
      .l5-header{
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:16px;
        flex-wrap:wrap;
        margin-bottom:16px;
      }
      .l5-header h2{
        margin:0 0 6px;
        font-size:26px;
      }
      .l5-header p{
        margin:0;
        color:var(--muted);
      }
      .l5-chip{
        display:inline-block;
        background:#eff6ff;
        color:#1d4ed8;
        border:1px solid #bfdbfe;
        border-radius:999px;
        padding:8px 12px;
        font-size:12px;
        font-weight:700;
      }
      .l5-grid{
        display:grid;
        grid-template-columns:1.1fr .9fr;
        gap:18px;
      }
      .l5-panel{
        border:1px solid var(--line);
        border-radius:18px;
        padding:16px;
        background:#fff;
      }
      .l5-panel h3{
        margin:0 0 10px;
        font-size:18px;
      }
      .l5-canvas-wrap{
        border:1px solid var(--line);
        border-radius:16px;
        padding:10px;
        background:#f8fafc;
      }
      .l5-meta{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
        margin-top:12px;
      }
      .l5-meta-box{
        border:1px solid var(--line);
        border-radius:14px;
        background:#f8fafc;
        padding:10px 12px;
      }
      .l5-meta-box span{
        display:block;
        color:var(--muted);
        font-size:12px;
        margin-bottom:4px;
      }
      .l5-meta-box strong{
        font-size:14px;
      }
      .l5-question{
        margin-top:8px;
        font-weight:700;
      }
      .l5-choices{
        display:grid;
        gap:10px;
        margin-top:14px;
      }
      .l5-choice{
        width:100%;
        text-align:left;
        border:1px solid var(--line);
        background:#fff;
        border-radius:14px;
        padding:12px 14px;
        font-size:15px;
        cursor:pointer;
      }
      .l5-choice:hover{
        border-color:#94a3b8;
        background:#f8fafc;
      }
      .l5-choice.correct{
        border-color:var(--ok);
        background:#f0fdf4;
      }
      .l5-choice.incorrect{
        border-color:var(--bad);
        background:#fef2f2;
      }
      .l5-choice.disabled{
        cursor:not-allowed;
        opacity:.9;
      }
      .l5-feedback{
        margin-top:14px;
        padding:14px;
        border-radius:14px;
        border:1px solid var(--line);
        background:#f8fafc;
        line-height:1.5;
      }
      .l5-feedback.ok{
        border-color:#bbf7d0;
        background:#f0fdf4;
      }
      .l5-feedback.bad{
        border-color:#fecaca;
        background:#fef2f2;
      }
      .l5-feedback.info{
        border-color:#bfdbfe;
        background:#eff6ff;
      }
      .l5-actions{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        margin-top:14px;
      }
      .l5-btn{
        border:0;
        border-radius:12px;
        padding:11px 14px;
        font-weight:700;
        cursor:pointer;
      }
      .l5-btn.primary{
        background:var(--blue);
        color:#fff;
      }
      .l5-btn.secondary{
        background:#e2e8f0;
        color:#0f172a;
      }
      .l5-btn.success{
        background:var(--ok);
        color:#fff;
      }
      .l5-note{
        color:#334155;
        line-height:1.55;
      }
      .l5-hidden{display:none}
      .l5-complete{
        display:grid;
        gap:12px;
      }
      .l5-result{
        border:1px solid var(--line);
        border-radius:14px;
        background:#f8fafc;
        padding:12px;
      }
      @media (max-width: 980px){
        .l5-wrap,.l5-grid{
          grid-template-columns:1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function render() {
    const root = document.getElementById("level5-app");
    if (!root) return;

    if (state.phase === "complete") {
      renderCompletion(root);
      return;
    }

    const scenario = simulator.scenarios[state.scenarioIndex];
    if (!state.choices.length) {
      state.choices = shuffleArray(scenario.choices);
    }

    root.innerHTML = `
      <div class="l5-wrap">
        <aside class="l5-side">
          <h1>${escapeHtml(simulator.title)}</h1>
          <p>${escapeHtml(simulator.subtitle)}</p>

          <div class="l5-stats">
            <div class="l5-stat">
              <span class="l5-stat-label">Score</span>
              <span class="l5-stat-value">${state.score}</span>
            </div>
            <div class="l5-stat">
              <span class="l5-stat-label">Progress</span>
              <span class="l5-stat-value">${state.scenarioIndex + 1} / ${simulator.scenarios.length}</span>
            </div>
            <div class="l5-stat">
              <span class="l5-stat-label">Correct</span>
              <span class="l5-stat-value">${state.correctCount}</span>
            </div>
            <div class="l5-stat">
              <span class="l5-stat-label">Pass Target</span>
              <span class="l5-stat-value">${simulator.passScore}</span>
            </div>
          </div>

          <div class="l5-note">
            <strong>Mode flow</strong><br>
            1. Inspect chromatogram<br>
            2. Diagnose fault<br>
            3. Apply correction<br>
            4. Review corrected result
          </div>
        </aside>

        <main class="l5-main">
          <div class="l5-card">
            <div class="l5-header">
              <div>
                <h2>${escapeHtml(scenario.title)}</h2>
                <p>${escapeHtml(scenario.description)}</p>
              </div>
              <span class="l5-chip">Scenario ${state.scenarioIndex + 1}</span>
            </div>

            <div class="l5-grid">
              <section class="l5-panel">
                <h3>Chromatogram View</h3>
                <div class="l5-canvas-wrap">
                  <canvas id="l5-plot" width="760" height="300" style="width:100%;height:auto;display:block;"></canvas>
                </div>
                <div class="l5-meta">
                  <div class="l5-meta-box">
                    <span>Status</span>
                    <strong>${formatPhase(state.phase)}</strong>
                  </div>
                  <div class="l5-meta-box">
                    <span>Expected outcome</span>
                    <strong>${state.phase === "result" ? "Corrected run" : "Fault diagnosis"}</strong>
                  </div>
                </div>
              </section>

              <section class="l5-panel">
                <h3>Diagnosis Panel</h3>
                <div class="l5-question">${escapeHtml(scenario.question)}</div>
                <div class="l5-choices" id="l5-choices">
                  ${renderChoices()}
                </div>
                <div id="l5-feedback">${renderFeedback()}</div>
                <div class="l5-actions">
                  ${renderActions()}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    `;

    bindEvents();
    drawPlot(state.phase === "result" ? scenario.correctedPlotType : scenario.plotType);
  }

  function renderChoices() {
    return state.choices
      .map((choice, index) => {
        let cls = "l5-choice";
        if (state.phase !== "diagnose") {
          cls += " disabled";
          if (choice === currentScenario().correctAnswer) cls += " correct";
          if (state.selectedAnswer === choice && choice !== currentScenario().correctAnswer) cls += " incorrect";
        }
        return `
          <button class="${cls}" data-choice="${escapeHtml(choice)}" ${state.phase !== "diagnose" ? "disabled" : ""}>
            ${String.fromCharCode(65 + index)}. ${escapeHtml(choice)}
          </button>
        `;
      })
      .join("");
  }

  function renderFeedback() {
    const scenario = currentScenario();

    if (state.phase === "diagnose") return "";

    if (state.phase === "correct") {
      const ok = state.selectedAnswer === scenario.correctAnswer;
      return `
        <div class="l5-feedback ${ok ? "ok" : "bad"}">
          <strong>${ok ? "Correct diagnosis" : "Incorrect diagnosis"}</strong><br><br>
          <strong>Correct answer:</strong> ${escapeHtml(scenario.correctAnswer)}<br>
          <strong>Engineering note:</strong> ${escapeHtml(scenario.engineeringNote)}
        </div>
      `;
    }

    if (state.phase === "result") {
      return `
        <div class="l5-feedback info">
          <strong>Correction applied:</strong> ${escapeHtml(scenario.correctionAction)}<br>
          <strong>Result:</strong> The corrected chromatogram now shows improved analytical performance.
        </div>
      `;
    }

    return "";
  }

  function renderActions() {
    const scenario = currentScenario();

    if (state.phase === "diagnose") {
      return `<button class="l5-btn secondary" id="l5-restart-btn">Restart Level</button>`;
    }

    if (state.phase === "correct") {
      return `
        <button class="l5-btn success" id="l5-apply-btn">Apply Correction</button>
        <button class="l5-btn secondary" id="l5-restart-btn">Restart Level</button>
      `;
    }

    if (state.phase === "result") {
      return `
        <button class="l5-btn primary" id="l5-next-btn">${state.scenarioIndex === simulator.scenarios.length - 1 ? "Finish Level" : "Next Scenario"}</button>
        <button class="l5-btn secondary" id="l5-restart-btn">Restart Level</button>
      `;
    }

    return `
      <button class="l5-btn secondary" id="l5-restart-btn">Restart Level</button>
    `;
  }

  function bindEvents() {
    document.querySelectorAll(".l5-choice").forEach((btn) => {
      btn.addEventListener("click", function () {
        if (state.phase !== "diagnose") return;
        state.selectedAnswer = this.getAttribute("data-choice");
        const correct = state.selectedAnswer === currentScenario().correctAnswer;
        if (correct) {
          state.score += 25;
          state.correctCount += 1;
        }
        state.phase = "correct";
        render();
      });
    });

    const applyBtn = document.getElementById("l5-apply-btn");
    if (applyBtn) {
      applyBtn.addEventListener("click", function () {
        state.phase = "result";
        render();
      });
    }

    const nextBtn = document.getElementById("l5-next-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (state.scenarioIndex >= simulator.scenarios.length - 1) {
          state.phase = "complete";
          render();
        } else {
          state.scenarioIndex += 1;
          state.phase = "diagnose";
          state.selectedAnswer = null;
          state.choices = [];
          render();
        }
      });
    }

    const restartBtn = document.getElementById("l5-restart-btn");
    if (restartBtn) {
      restartBtn.addEventListener("click", restartLevel);
    }
  }

  function drawPlot(type) {
    const canvas = document.getElementById("l5-plot");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    drawGrid(ctx, w, h);
    drawAxes(ctx, w, h);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#2563eb";
    ctx.beginPath();

    for (let x = 0; x <= w; x += 1) {
      const t = x / w;
      let y = baseline(t);

      if (type === "zeroReading") {
        y -= gaussian(t, 0.22, 0.010, 65);
        y -= gaussian(t, 0.42, 0.008, 160);
        y -= gaussian(t, 0.50, 0.009, 115);
        y -= gaussian(t, 0.62, 0.012, 60);
      } else if (type === "broadPeaks") {
        y -= gaussian(t, 0.24, 0.018, 55);
        y -= gaussian(t, 0.43, 0.022, 120);
        y -= gaussian(t, 0.58, 0.030, 85);
      } else if (type === "noisyBaseline") {
        y -= gaussian(t, 0.28, 0.010, 60);
        y -= gaussian(t, 0.51, 0.012, 75);
        y -= gaussian(t, 0.72, 0.015, 55);
        y += (Math.sin(t * 120) * 10) + (Math.cos(t * 80) * 6);
      } else if (type === "retentionShift") {
        y -= gaussian(t, 0.30, 0.010, 70);
        y -= gaussian(t, 0.50, 0.010, 90);
        y -= gaussian(t, 0.70, 0.014, 65);
      } else if (type === "good") {
        y -= gaussian(t, 0.22, 0.008, 80);
        y -= gaussian(t, 0.40, 0.007, 135);
        y -= gaussian(t, 0.51, 0.008, 115);
        y -= gaussian(t, 0.72, 0.012, 70);
      }

      const px = x;
      const py = clamp(y, 25, h - 30);

      if (x === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    ctx.stroke();

    if (type === "good") {
      labelPeak(ctx, w, h, 0.22, "Benzene");
      labelPeak(ctx, w, h, 0.40, "Toluene");
      labelPeak(ctx, w, h, 0.51, "Ethylbenzene");
      labelPeak(ctx, w, h, 0.72, "Xylene");
    }

    if (type === "zeroReading") {
      labelPeak(ctx, w, h, 0.22, "0.00");
      labelPeak(ctx, w, h, 0.42, "0.00");
      labelPeak(ctx, w, h, 0.50, "0.00");
      labelPeak(ctx, w, h, 0.62, "0.00");
    }
  }

  function drawGrid(ctx, w, h) {
    ctx.strokeStyle = "#e5edf6";
    ctx.lineWidth = 1;

    for (let i = 0; i < 10; i += 1) {
      const x = 50 + i * ((w - 80) / 9);
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, h - 30);
      ctx.stroke();
    }

    for (let i = 0; i < 6; i += 1) {
      const y = 20 + i * ((h - 50) / 5);
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
    }
  }

  function drawAxes(ctx, w, h) {
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(50, 20);
    ctx.lineTo(50, h - 30);
    ctx.lineTo(w - 20, h - 30);
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = "12px Arial";
    ctx.fillText("Signal", 12, 24);
    ctx.fillText("Time", w / 2 - 10, h - 8);
  }

  function labelPeak(ctx, w, h, t, text) {
    const x = t * w;
    const y = clamp(baseline(t) - 90, 40, h - 60);

    ctx.fillStyle = "rgba(15,23,42,.88)";
    roundRect(ctx, x - 28, y - 24, 70, 24, 6, true, false);

    ctx.fillStyle = "#ffffff";
    ctx.font = "11px Arial";
    ctx.fillText(text, x - 20, y - 8);
  }

  function baseline(t) {
    return 210 + Math.sin(t * 18) * 6 + Math.cos(t * 9) * 3;
  }

  function gaussian(t, center, width, amp) {
    return amp * Math.exp(-Math.pow((t - center) / width, 2));
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === "number") {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function renderCompletion(root) {
    const totalPossible = simulator.scenarios.length * 25;
    const percent = totalPossible ? Math.round((state.score / totalPossible) * 100) : 0;
    const passed = state.score >= simulator.passScore;

    root.innerHTML = `
      <div class="l5-wrap">
        <aside class="l5-side">
          <h1>${escapeHtml(simulator.title)}</h1>
          <p>${escapeHtml(simulator.subtitle)}</p>
          <div class="l5-stats">
            <div class="l5-stat">
              <span class="l5-stat-label">Final Score</span>
              <span class="l5-stat-value">${state.score}</span>
            </div>
            <div class="l5-stat">
              <span class="l5-stat-label">Accuracy</span>
              <span class="l5-stat-value">${percent}%</span>
            </div>
            <div class="l5-stat">
              <span class="l5-stat-label">Correct</span>
              <span class="l5-stat-value">${state.correctCount}</span>
            </div>
            <div class="l5-stat">
              <span class="l5-stat-label">Pass</span>
              <span class="l5-stat-value">${passed ? "Yes" : "No"}</span>
            </div>
          </div>
        </aside>

        <main class="l5-main">
          <div class="l5-card">
            <div class="l5-complete">
              <div class="l5-feedback ${passed ? "ok" : "bad"}">
                <strong>${passed ? "Level 5 Complete" : "Level 5 Complete — Review Recommended"}</strong><br><br>
                ${passed
                  ? "You successfully diagnosed chromatogram faults and selected corrective actions."
                  : "You completed the mode. Review the scenarios and repeat for a stronger score."}
              </div>

              <div class="l5-result"><strong>Badge:</strong> Chromatogram Diagnosis Specialist</div>
              <div class="l5-result"><strong>Scenarios completed:</strong> ${simulator.scenarios.length}</div>
              <div class="l5-result"><strong>Correct diagnoses:</strong> ${state.correctCount}</div>

              <div class="l5-actions">
                <button class="l5-btn primary" id="l5-replay-btn">Play Again</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;

    document.getElementById("l5-replay-btn").addEventListener("click", restartLevel);
  }

  function restartLevel() {
    state.scenarioIndex = 0;
    state.score = 0;
    state.correctCount = 0;
    state.phase = "diagnose";
    state.selectedAnswer = null;
    state.choices = [];
    render();
  }

  function currentScenario() {
    return simulator.scenarios[state.scenarioIndex];
  }

  function formatPhase(phase) {
    if (phase === "diagnose") return "Diagnosis";
    if (phase === "correct") return "Correction Selection";
    if (phase === "result") return "Corrected Run";
    return "Complete";
  }

  function shuffleArray(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
