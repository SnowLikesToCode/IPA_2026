(() => {
  "use strict";

  const STORAGE_KEY = "ipaChecklistState.v2";
  const EXPORT_VERSION = 3;
  const WORK_DAYS = [
    "3/9/26",
    "3/10/26",
    "3/11/26",
    "3/12/26",
    "3/13/26",
    "3/16/26",
    "3/17/26",
    "3/18/26",
    "3/19/26",
    "3/20/26",
    "3/23/26",
  ];
  const KANBAN_COLUMNS = [
    { id: "todo", label: "To Do" },
    { id: "doing", label: "Doing" },
    { id: "done", label: "Done" },
  ];

  document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("ipa-checklist-app");
    if (!app) return;
    initChecklist(app).catch((error) => {
      app.innerHTML = `<p class="ipa-checklist__message ipa-checklist__message--error">Die Kriterien konnten nicht geladen werden: ${escapeHtml(String(error.message || error))}</p>`;
    });
  });

  async function initChecklist(root) {
    const urlCandidates = buildCriteriaUrlCandidates(root.dataset.criteriaUrl || "");
    const payload = await fetchCriteriaPayload(urlCandidates);
    if (!payload || !Array.isArray(payload.criteria)) {
      throw new Error("Ungültiges Datenformat: Feld 'criteria' fehlt.");
    }

    const criteria = payload.criteria;
    const requirementKeys = buildRequirementKeySet(criteria);
    const state = loadState(requirementKeys);

    render(root, criteria, state);
    setupStickyOffset(root);
    bindEvents(root, criteria, requirementKeys, state);
    refreshUi(root, criteria, state);
  }

  async function fetchCriteriaPayload(urlCandidates) {
    let lastError = null;
    for (const url of urlCandidates) {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          lastError = new Error(`HTTP ${response.status} beim Laden von ${url}`);
          continue;
        }
        return await response.json();
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Kriterien-URL fehlt oder ist ungültig.");
  }

  function buildCriteriaUrlCandidates(configuredUrl) {
    const candidates = [];
    const trimmed = String(configuredUrl || "").trim();
    const basePath = getSiteBasePath();

    if (trimmed && !trimmed.includes("{{")) {
      candidates.push(trimmed);

      // Resolve relative paths against base path when needed.
      if (isRelativePath(trimmed)) {
        candidates.push(joinPath(basePath, trimmed));
      }

      if (trimmed.startsWith("./") || trimmed.startsWith("../")) {
        candidates.push(new URL(trimmed, window.location.href).toString());
      }
    }

    candidates.push(joinPath(basePath, "data/criterias.json"));
    candidates.push("/data/criterias.json");

    return Array.from(new Set(candidates));
  }

  function getSiteBasePath() {
    const logoHref = document.querySelector(".site-logo")?.getAttribute("href");
    if (logoHref) {
      try {
        const path = new URL(logoHref, window.location.origin).pathname || "/";
        return path.endsWith("/") ? path : `${path}/`;
      } catch (_) {
        // Fallback below.
      }
    }

    const segments = window.location.pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      return `/${segments[0]}/`;
    }
    return "/";
  }

  function isRelativePath(value) {
    if (!value) return false;
    return !value.startsWith("/") && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value);
  }

  function joinPath(basePath, relativePath) {
    const left = String(basePath || "/").replace(/\/+$/, "");
    const right = String(relativePath || "").replace(/^\/+/, "");
    return `${left}/${right}`;
  }

  function buildRequirementKeySet(criteria) {
    const keys = new Set();
    criteria.forEach((item) => {
      (item.requirements || []).forEach((_, requirementIndex) => {
        keys.add(makeRequirementKey(item.id, requirementIndex));
      });
    });
    return keys;
  }

  function render(root, criteria, state) {
    const cardsHtml = criteria
      .map((item) => {
        const requirements = (item.requirements || [])
          .map((requirementText, requirementIndex) => {
            const requirementKey = makeRequirementKey(item.id, requirementIndex);
            const checked = Boolean(state.checked[requirementKey]);
            const noteText = state.requirementNotes[requirementKey] || "";
            return `
              <div class="ipa-criterion__requirement">
                <label class="ipa-criterion__requirement-main">
                  <input
                    type="checkbox"
                    data-requirement-key="${escapeHtml(requirementKey)}"
                    ${checked ? "checked" : ""}
                  />
                  <span>${escapeHtml(requirementText)}</span>
                </label>
                <label class="ipa-criterion__requirement-note">
                  <span>Notiz / Nachweis</span>
                  <textarea
                    rows="2"
                    data-requirement-note="${escapeHtml(requirementKey)}"
                    placeholder="z. B. Datei/Kapitel und kurze Begründung..."
                  >${escapeHtml(noteText)}</textarea>
                </label>
              </div>
            `;
          })
          .join("");

        const gradingRows = Object.entries(item.grading || {})
          .sort((a, b) => Number(b[0]) - Number(a[0]))
          .map(
            ([grade, description]) =>
              `<li><strong>${escapeHtml(grade)}:</strong> ${escapeHtml(description)}</li>`
          )
          .join("");

        return `
          <article class="ipa-criterion" data-criterion-id="${escapeHtml(item.id)}">
            <header class="ipa-criterion__header">
              <div>
                <p class="ipa-criterion__id">${escapeHtml(item.id)}</p>
                <h3 class="ipa-criterion__title">${escapeHtml(item.title || "")}</h3>
                <p class="ipa-criterion__question">${escapeHtml(item.question || "")}</p>
              </div>
              <div class="ipa-criterion__summary">
                <p class="ipa-criterion__progress" data-criterion-progress="${escapeHtml(item.id)}">0/0</p>
                <p class="ipa-criterion__points" data-criterion-points="${escapeHtml(item.id)}">0/0</p>
                <button type="button" class="ipa-criterion__copy-btn" data-copy-criterion="${escapeHtml(item.id)}">
                  Kopieren
                </button>
              </div>
            </header>

            <section class="ipa-criterion__requirements">
              ${requirements}
            </section>

            <details class="ipa-criterion__grading">
              <summary>Bewertungsskala</summary>
              <ul>${gradingRows}</ul>
            </details>
          </article>
        `;
      })
      .join("");

    const dayButtonsHtml = WORK_DAYS.map(
      (day) => `
        <button type="button" class="ipa-days__day-btn" data-day="${escapeHtml(day)}">
          ${escapeHtml(day)}
        </button>
      `
    ).join("");

    root.innerHTML = `
      <section class="ipa-checklist">
        <header class="ipa-checklist__header">
          <div>
            <h2>IPA-Kriterien-Checklist</h2>
            <p class="ipa-checklist__subtitle">Fortschritt pro Requirement und pro Kriterium.</p>
          </div>
          <div class="ipa-checklist__actions">
            <button type="button" data-action="export">Exportieren</button>
            <button type="button" data-action="import">Importieren</button>
            <button type="button" data-action="reset" class="is-danger">Zurücksetzen</button>
            <input type="file" accept="application/json" data-import-file hidden />
          </div>
        </header>

        <nav class="ipa-tabs" aria-label="Checklist-Ansichten">
          <button type="button" class="ipa-tabs__tab" data-tab-target="checklist">Checklist</button>
          <button type="button" class="ipa-tabs__tab" data-tab-target="days">Tage</button>
        </nav>

        <section class="ipa-tab-panel" data-tab-panel="checklist">
          <div class="ipa-gradebar" data-gradebar>
            <p class="ipa-gradebar__label">Aktuelle Note</p>
            <p class="ipa-gradebar__value" data-grade-value>1.00</p>
            <p class="ipa-gradebar__formula" data-grade-formula>(0/0*5+1)</p>
          </div>

          <section class="ipa-checklist__stats">
            <div class="ipa-stat">
              <p class="ipa-stat__label">Requirements</p>
              <p class="ipa-stat__value" data-total-progress>0/0 (0%)</p>
            </div>
            <div class="ipa-stat">
              <p class="ipa-stat__label">Vollständige Kriterien</p>
              <p class="ipa-stat__value" data-criteria-progress>0/0</p>
            </div>
            <div class="ipa-stat ipa-stat--message">
              <p class="ipa-stat__label">Status</p>
              <p class="ipa-stat__value" data-status-message>Bereit.</p>
            </div>
          </section>

          <section class="ipa-checklist__list">
            ${cardsHtml}
          </section>
        </section>

        <section class="ipa-tab-panel" data-tab-panel="days">
          <div class="ipa-days">
            <div class="ipa-days__selector">
              ${dayButtonsHtml}
            </div>
            <div class="ipa-days__content" data-days-content></div>
          </div>
        </section>
      </section>
    `;
  }

  function setupStickyOffset(root) {
    const applyOffset = () => {
      const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
      root.style.setProperty("--checklist-sticky-top", `${headerHeight + 8}px`);
    };

    applyOffset();
    window.addEventListener("resize", applyOffset);
  }

  function bindEvents(root, criteria, requirementKeys, state) {
    root.addEventListener("click", (event) => {
      const tabButton = event.target.closest("[data-tab-target]");
      if (tabButton) {
        const tab = tabButton.dataset.tabTarget;
        if (tab === "checklist" || tab === "days") {
          state.activeTab = tab;
          persistAndRefresh(root, criteria, state);
        }
        return;
      }

      const dayButton = event.target.closest("[data-day]");
      if (dayButton) {
        const day = dayButton.dataset.day;
        if (WORK_DAYS.includes(day)) {
          state.activeDay = day;
          persistAndRefresh(root, criteria, state);
        }
        return;
      }

      const copyButton = event.target.closest("[data-copy-criterion]");
      if (copyButton) {
        const criterionId = copyButton.dataset.copyCriterion;
        if (!criterionId) return;
        const criterion = criteria.find((item) => item.id === criterionId);
        if (!criterion) return;

        copyCriterionText(root, criterion);
        return;
      }

      const addCardButton = event.target.closest("[data-add-card]");
      if (addCardButton) {
        const column = addCardButton.dataset.addCard;
        const input = root.querySelector(`[data-new-card-input='${cssEscape(column)}']`);
        if (!input) return;
        const text = String(input.value || "").trim();
        if (!text) return;
        const dayState = getDayState(state, state.activeDay);
        dayState.kanban[column].push({ id: createCardId(), text });
        input.value = "";
        persistAndRefresh(root, criteria, state);
        return;
      }

      const cardAction = event.target.closest("[data-card-action]");
      if (cardAction) {
        const action = cardAction.dataset.cardAction;
        const cardId = cardAction.dataset.cardId;
        const column = cardAction.dataset.columnId;
        if (!cardId || !column) return;
        handleCardAction(root, criteria, state, { action, cardId, column });
      }
    });

    root.addEventListener("change", (event) => {
      const checkbox = event.target.closest("input[type='checkbox'][data-requirement-key]");
      if (checkbox) {
        const key = checkbox.dataset.requirementKey;
        if (!key) return;
        state.checked[key] = checkbox.checked;
        persistAndRefresh(root, criteria, state, { skipDayRender: true });
      }
    });

    root.addEventListener("input", (event) => {
      const notes = event.target.closest("[data-day-notes]");
      if (notes) {
        const day = notes.dataset.dayNotes;
        getDayState(state, day).notes = notes.value;
        persistAndRefresh(root, criteria, state, { skipDayRender: true, silentStatus: true });
        return;
      }

      const requirementNote = event.target.closest("[data-requirement-note]");
      if (requirementNote) {
        const key = requirementNote.dataset.requirementNote;
        if (!key) return;
        const value = requirementNote.value;
        if (value && value.trim()) {
          state.requirementNotes[key] = value;
        } else {
          delete state.requirementNotes[key];
        }
        persistAndRefresh(root, criteria, state, { skipDayRender: true, silentStatus: true });
        return;
      }

      const risks = event.target.closest("[data-day-risks]");
      if (risks) {
        const day = risks.dataset.dayRisks;
        getDayState(state, day).risks = risks.value;
        persistAndRefresh(root, criteria, state, { skipDayRender: true, silentStatus: true });
      }
    });

    const exportButton = root.querySelector("[data-action='export']");
    if (exportButton) {
      exportButton.addEventListener("click", () => exportState(state));
    }

    const importButton = root.querySelector("[data-action='import']");
    const importFileInput = root.querySelector("[data-import-file]");
    if (importButton && importFileInput) {
      importButton.addEventListener("click", () => importFileInput.click());
      importFileInput.addEventListener("change", async () => {
        const file = importFileInput.files && importFileInput.files[0];
        if (!file) return;

        try {
          const parsed = JSON.parse(await file.text());
          const imported = sanitizeImportedState(parsed, requirementKeys);
          state.version = imported.version;
          state.checked = imported.checked;
          state.requirementNotes = imported.requirementNotes;
          state.daily = imported.daily;
          state.activeTab = imported.activeTab;
          state.activeDay = imported.activeDay;
          persistAndRefresh(root, criteria, state);
          setStatus(root, "Import erfolgreich.");
        } catch (error) {
          setStatus(root, `Import fehlgeschlagen: ${error.message || error}`, true);
        } finally {
          importFileInput.value = "";
        }
      });
    }

    const resetButton = root.querySelector("[data-action='reset']");
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        if (!window.confirm("Bearbeitungsstand wirklich zurücksetzen?")) return;
        const resetState = sanitizeImportedState({}, requirementKeys);
        state.version = resetState.version;
        state.checked = resetState.checked;
        state.requirementNotes = resetState.requirementNotes;
        state.daily = resetState.daily;
        state.activeTab = resetState.activeTab;
        state.activeDay = resetState.activeDay;
        persistAndRefresh(root, criteria, state);
        setStatus(root, "Bearbeitungsstand wurde zurückgesetzt.");
      });
    }
  }

  function handleCardAction(root, criteria, state, payload) {
    const { action, cardId, column } = payload;
    const dayState = getDayState(state, state.activeDay);
    const columnCards = dayState.kanban[column] || [];
    const cardIndex = columnCards.findIndex((entry) => entry.id === cardId);
    if (cardIndex < 0) return;

    if (action === "delete") {
      columnCards.splice(cardIndex, 1);
      persistAndRefresh(root, criteria, state);
      return;
    }

    if (action === "edit") {
      const previous = columnCards[cardIndex].text;
      const next = window.prompt("Karteninhalt bearbeiten:", previous);
      if (next === null) return;
      const trimmed = next.trim();
      if (!trimmed) return;
      columnCards[cardIndex].text = trimmed;
      persistAndRefresh(root, criteria, state);
      return;
    }

    const targetColumn = action === "move-left" ? getAdjacentColumn(column, -1) : getAdjacentColumn(column, 1);
    if (!targetColumn) return;
    const [card] = columnCards.splice(cardIndex, 1);
    dayState.kanban[targetColumn].push(card);
    persistAndRefresh(root, criteria, state);
  }

  async function copyCriterionText(root, criterion) {
    const text = formatCriterionForClipboard(criterion);
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(text);
        setStatus(root, `Kriterium ${criterion.id} in Zwischenablage kopiert.`);
        return;
      }
      fallbackCopyText(text);
      setStatus(root, `Kriterium ${criterion.id} in Zwischenablage kopiert.`);
    } catch (error) {
      setStatus(root, `Kopieren fehlgeschlagen: ${error.message || error}`, true);
    }
  }

  function formatCriterionForClipboard(criterion) {
    const title = String(criterion.title || "").trim();
    const question = String(criterion.question || "").trim();
    const lines = (criterion.requirements || []).map((requirement, index) => `${index + 1}: ${requirement}`);
    return `"${title}; ${question}:\n\n${lines.join("\n")}"`;
  }

  function fallbackCopyText(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "readonly");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  function getAdjacentColumn(current, direction) {
    const index = KANBAN_COLUMNS.findIndex((column) => column.id === current);
    if (index < 0) return null;
    const target = index + direction;
    if (target < 0 || target >= KANBAN_COLUMNS.length) return null;
    return KANBAN_COLUMNS[target].id;
  }

  function refreshUi(root, criteria, state, options = {}) {
    syncChecklistCheckboxes(root, state);
    syncRequirementNotes(root, state);
    updateProgress(root, criteria, state);
    updateTabState(root, state);
    updateDaySelectorState(root, state);
    if (!options.skipDayRender) {
      renderDayContent(root, state);
    }
    if (!options.silentStatus) {
      setStatus(root, "Bereit.");
    }
  }

  function persistAndRefresh(root, criteria, state, options = {}) {
    state.updatedAt = new Date().toISOString();
    saveState(state);
    refreshUi(root, criteria, state, options);
  }

  function syncChecklistCheckboxes(root, state) {
    root.querySelectorAll("input[type='checkbox'][data-requirement-key]").forEach((checkbox) => {
      const key = checkbox.dataset.requirementKey;
      checkbox.checked = Boolean(key && state.checked[key]);
    });
  }

  function updateTabState(root, state) {
    root.querySelectorAll("[data-tab-target]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.tabTarget === state.activeTab);
    });
    root.querySelectorAll("[data-tab-panel]").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.tabPanel === state.activeTab);
    });
  }

  function syncRequirementNotes(root, state) {
    root.querySelectorAll("textarea[data-requirement-note]").forEach((textarea) => {
      const key = textarea.dataset.requirementNote;
      if (!key) return;
      const nextValue = state.requirementNotes[key] || "";
      if (textarea.value !== nextValue) {
        textarea.value = nextValue;
      }
    });
  }

  function updateDaySelectorState(root, state) {
    root.querySelectorAll("[data-day]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.day === state.activeDay);
    });
  }

  function renderDayContent(root, state) {
    const container = root.querySelector("[data-days-content]");
    if (!container) return;
    const dayState = getDayState(state, state.activeDay);

    const columnsHtml = KANBAN_COLUMNS.map((column) => {
      const cardsHtml = (dayState.kanban[column.id] || [])
        .map((card, index) => {
          return `
            <article class="ipa-kanban__card">
              <p>${escapeHtml(card.text)}</p>
              <div class="ipa-kanban__card-actions">
                <button type="button" data-card-action="move-left" data-card-id="${escapeHtml(card.id)}" data-column-id="${escapeHtml(column.id)}" ${column.id === "todo" ? "disabled" : ""}>←</button>
                <button type="button" data-card-action="move-right" data-card-id="${escapeHtml(card.id)}" data-column-id="${escapeHtml(column.id)}" ${column.id === "done" ? "disabled" : ""}>→</button>
                <button type="button" data-card-action="edit" data-card-id="${escapeHtml(card.id)}" data-column-id="${escapeHtml(column.id)}">Bearbeiten</button>
                <button type="button" data-card-action="delete" data-card-id="${escapeHtml(card.id)}" data-column-id="${escapeHtml(column.id)}">Löschen</button>
              </div>
            </article>
          `;
        })
        .join("");

      return `
        <section class="ipa-kanban__column">
          <header class="ipa-kanban__column-header">
            <h4>${escapeHtml(column.label)}</h4>
            <span class="ipa-kanban__count">${(dayState.kanban[column.id] || []).length} Karten</span>
          </header>
          <div class="ipa-kanban__cards">${cardsHtml || "<p class='ipa-kanban__empty'>Keine Karten</p>"}</div>
          <div class="ipa-kanban__add">
            <input type="text" data-new-card-input="${escapeHtml(column.id)}" placeholder="Neue Karte..." />
            <button type="button" data-add-card="${escapeHtml(column.id)}">Hinzufügen</button>
          </div>
        </section>
      `;
    }).join("");

    container.innerHTML = `
      <section class="ipa-days__fields">
        <div class="ipa-days__field">
          <label for="day-notes">Notizen (${escapeHtml(state.activeDay)})</label>
          <textarea id="day-notes" data-day-notes="${escapeHtml(state.activeDay)}" rows="6">${escapeHtml(dayState.notes)}</textarea>
        </div>
        <div class="ipa-days__field">
          <label for="day-risks">Risiken (${escapeHtml(state.activeDay)})</label>
          <textarea id="day-risks" data-day-risks="${escapeHtml(state.activeDay)}" rows="6">${escapeHtml(dayState.risks)}</textarea>
        </div>
      </section>
      <section class="ipa-kanban">
        ${columnsHtml}
      </section>
    `;
  }

  function updateProgress(root, criteria, state) {
    let checkedRequirements = 0;
    let totalRequirements = 0;
    let fullyCompletedCriteria = 0;
    let earnedPoints = 0;
    let possiblePoints = 0;

    criteria.forEach((item) => {
      const total = (item.requirements || []).length;
      let done = 0;

      (item.requirements || []).forEach((_, requirementIndex) => {
        totalRequirements += 1;
        const key = makeRequirementKey(item.id, requirementIndex);
        if (state.checked[key]) {
          done += 1;
          checkedRequirements += 1;
        }
      });

      if (total > 0 && done === total) {
        fullyCompletedCriteria += 1;
      }

      const criterionProgress = root.querySelector(`[data-criterion-progress='${cssEscape(item.id)}']`);
      if (criterionProgress) {
        criterionProgress.textContent = `${done}/${total}`;
      }

      const points = computeCriterionPoints(item, done, total);
      earnedPoints += points.points;
      possiblePoints += points.maxPoints;

      const criterionPoints = root.querySelector(`[data-criterion-points='${cssEscape(item.id)}']`);
      if (criterionPoints) {
        criterionPoints.textContent = `${points.points}/${points.maxPoints}`;
      }

      const criterionCard = root.querySelector(`[data-criterion-id='${cssEscape(item.id)}']`);
      if (criterionCard) {
        criterionCard.classList.toggle("is-complete", total > 0 && done === total);
      }

      (item.requirements || []).forEach((_, requirementIndex) => {
        const key = makeRequirementKey(item.id, requirementIndex);
        const checkbox = root.querySelector(`input[data-requirement-key='${cssEscape(key)}']`);
        const requirementRow = checkbox?.closest(".ipa-criterion__requirement");
        if (requirementRow) {
          requirementRow.classList.toggle("is-checked", Boolean(state.checked[key]));
        }
      });
    });

    const percent = totalRequirements > 0 ? Math.round((checkedRequirements / totalRequirements) * 100) : 0;
    const totalProgressElement = root.querySelector("[data-total-progress]");
    if (totalProgressElement) {
      totalProgressElement.textContent = `${checkedRequirements}/${totalRequirements} (${percent}%)`;
    }

    const criteriaProgressElement = root.querySelector("[data-criteria-progress]");
    if (criteriaProgressElement) {
      criteriaProgressElement.textContent = `${fullyCompletedCriteria}/${criteria.length}`;
    }

    const grade = possiblePoints > 0 ? (earnedPoints / possiblePoints) * 5 + 1 : 1;
    const gradeValueElement = root.querySelector("[data-grade-value]");
    if (gradeValueElement) {
      gradeValueElement.textContent = grade.toFixed(2);
    }

    const gradeFormulaElement = root.querySelector("[data-grade-formula]");
    if (gradeFormulaElement) {
      gradeFormulaElement.textContent = `(${earnedPoints}/${possiblePoints}*5+1)`;
    }
  }

  function loadState(requirementKeys) {
    let parsed;
    try {
      parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (_) {
      parsed = {};
    }
    return sanitizeImportedState(parsed, requirementKeys);
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function sanitizeImportedState(input, requirementKeys) {
    const rawChecked = input && typeof input === "object" ? input.checked : {};
    const checked = {};

    if (rawChecked && typeof rawChecked === "object") {
      Object.entries(rawChecked).forEach(([key, value]) => {
        if (requirementKeys.has(key) && typeof value === "boolean") {
          checked[key] = value;
        }
      });
    }

    const requirementNotes = {};
    const rawRequirementNotes =
      input && typeof input === "object" && input.requirementNotes && typeof input.requirementNotes === "object"
        ? input.requirementNotes
        : {};
    Object.entries(rawRequirementNotes).forEach(([key, value]) => {
      if (requirementKeys.has(key) && typeof value === "string" && value.trim()) {
        requirementNotes[key] = value;
      }
    });

    const daily = {};
    const rawDaily = input && typeof input === "object" && input.daily && typeof input.daily === "object" ? input.daily : {};
    WORK_DAYS.forEach((day) => {
      const rawDay = rawDaily[day] && typeof rawDaily[day] === "object" ? rawDaily[day] : {};
      const notes = typeof rawDay.notes === "string" ? rawDay.notes : "";
      const risks = typeof rawDay.risks === "string" ? rawDay.risks : "";
      const kanban = {};
      const rawKanban = rawDay.kanban && typeof rawDay.kanban === "object" ? rawDay.kanban : {};
      KANBAN_COLUMNS.forEach((column) => {
        const rawCards = Array.isArray(rawKanban[column.id]) ? rawKanban[column.id] : [];
        kanban[column.id] = rawCards
          .map((entry, index) => normalizeCard(entry, day, column.id, index))
          .filter(Boolean);
      });
      daily[day] = { notes, risks, kanban };
    });

    const activeTab = input && input.activeTab === "days" ? "days" : "checklist";
    const requestedDay = input && typeof input.activeDay === "string" ? input.activeDay : WORK_DAYS[0];
    const activeDay = WORK_DAYS.includes(requestedDay) ? requestedDay : WORK_DAYS[0];

    return {
      version: EXPORT_VERSION,
      updatedAt: new Date().toISOString(),
      checked,
      requirementNotes,
      daily,
      activeTab,
      activeDay,
    };
  }

  function exportState(state) {
    const exportPayload = {
      version: EXPORT_VERSION,
      updatedAt: new Date().toISOString(),
      checked: state.checked,
      requirementNotes: state.requirementNotes,
      daily: state.daily,
      activeTab: state.activeTab,
      activeDay: state.activeDay,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ipa-checklist-state-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function setStatus(root, message, isError = false) {
    const element = root.querySelector("[data-status-message]");
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("is-error", Boolean(isError));
  }

  function makeRequirementKey(criterionId, requirementIndex) {
    return `${criterionId}:${requirementIndex}`;
  }

  function getDayState(state, day) {
    if (!state.daily[day]) {
      state.daily[day] = {
        notes: "",
        risks: "",
        kanban: {
          todo: [],
          doing: [],
          done: [],
        },
      };
    }
    return state.daily[day];
  }

  function normalizeCard(entry, day, column, index) {
    if (typeof entry === "string" && entry.trim()) {
      return { id: `${day}-${column}-${index}`, text: entry.trim() };
    }
    if (entry && typeof entry === "object" && typeof entry.text === "string" && entry.text.trim()) {
      return {
        id: typeof entry.id === "string" && entry.id ? entry.id : `${day}-${column}-${index}`,
        text: entry.text.trim(),
      };
    }
    return null;
  }

  function createCardId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function computeCriterionPoints(criterion, done, total) {
    const gradeKeys = Object.keys(criterion.grading || {})
      .map((key) => Number(key))
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);

    if (gradeKeys.length === 0) {
      return { points: 0, maxPoints: 0 };
    }

    const maxPoints = gradeKeys[gradeKeys.length - 1];
    const minDoneByGrade = deriveMinDoneByGrade(criterion.grading || {}, gradeKeys, total, maxPoints);

    let points = 0;
    gradeKeys.forEach((grade) => {
      const minDone = minDoneByGrade[grade];
      if (done >= minDone) {
        points = grade;
      }
    });

    return { points, maxPoints };
  }

  function deriveMinDoneByGrade(grading, gradeKeys, total, maxPoints) {
    const result = {};

    gradeKeys.forEach((grade) => {
      const description = String(grading[String(grade)] || "").toLowerCase();
      const explicit = extractMinDoneFromDescription(description, total);

      if (explicit !== null) {
        result[grade] = explicit;
        return;
      }

      if (grade <= 0) {
        result[grade] = 0;
        return;
      }

      if (total > 0 && maxPoints > 0) {
        result[grade] = Math.ceil((grade / maxPoints) * total);
      } else {
        result[grade] = 0;
      }
    });

    let previous = 0;
    gradeKeys.forEach((grade) => {
      if (result[grade] < previous) {
        result[grade] = previous;
      }
      previous = result[grade];
    });

    return result;
  }

  function extractMinDoneFromDescription(description, total) {
    if (!description) return null;

    const directMatch = description.match(/(\d+)\s+von\s+\d+/);
    if (directMatch) {
      return Number(directMatch[1]);
    }

    if (description.includes("weniger als")) {
      return 0;
    }

    const values = [];
    const numericMatches = description.match(/\d+/g) || [];
    numericMatches.forEach((value) => values.push(Number(value)));

    const wordMap = {
      ein: 1,
      eins: 1,
      einen: 1,
      eine: 1,
      zwei: 2,
      drei: 3,
      vier: 4,
      fünf: 5,
      sechs: 6,
      sieben: 7,
      acht: 8,
      neun: 9,
      zehn: 10,
    };

    Object.entries(wordMap).forEach(([word, value]) => {
      const regex = new RegExp(`\\b${word}\\b`);
      if (regex.test(description)) {
        values.push(value);
      }
    });

    const filtered = values.filter((value) => value <= total || total === 0);
    if (filtered.length > 0) {
      return Math.min(...filtered);
    }

    return null;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") {
      return window.CSS.escape(value);
    }
    return String(value).replace(/['"\\]/g, "\\$&");
  }
})();
