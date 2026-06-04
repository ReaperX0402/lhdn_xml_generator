(function () {
  const state = {
    applicationType: "43",
    instrument: {},
    transferors: [],
    transferees: [],
    attachments: [],
    latestXml: "",
    latestValidation: null
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    bindElements();
    resetState();
    renderApplicationOptions();
    renderAll();
    bindEvents();
    updateComplianceStatus(null);
  }

  function bindElements() {
    Object.assign(els, {
      applicationType: document.getElementById("applicationType"),
      generalFields: document.getElementById("generalFields"),
      instrumentFields: document.getElementById("instrumentFields"),
      exemptionFields: document.getElementById("exemptionFields"),
      transferors: document.getElementById("transferors"),
      transferees: document.getElementById("transferees"),
      addTransferor: document.getElementById("addTransferor"),
      addTransferee: document.getElementById("addTransferee"),
      attachmentInput: document.getElementById("attachmentInput"),
      attachmentList: document.getElementById("attachmentList"),
      attachmentMessages: document.getElementById("attachmentMessages"),
      previewXml: document.getElementById("previewXml"),
      downloadXml: document.getElementById("downloadXml"),
      clearForm: document.getElementById("clearForm"),
      xmlPreview: document.getElementById("xmlPreview"),
      complianceStatus: document.getElementById("complianceStatus")
    });
  }

  function bindEvents() {
    els.applicationType.addEventListener("change", () => {
      state.applicationType = els.applicationType.value;
      state.instrument = {};
      state.latestXml = "";
      els.xmlPreview.value = "";
      renderAll();
      updateComplianceStatus(null);
    });

    els.addTransferor.addEventListener("click", () => {
      state.transferors.push(emptyParty());
      renderParties();
    });

    els.addTransferee.addEventListener("click", () => {
      state.transferees.push(emptyParty());
      renderParties();
    });

    els.attachmentInput.addEventListener("change", handleAttachments);
    els.previewXml.addEventListener("click", previewXml);
    els.downloadXml.addEventListener("click", downloadXml);
    els.clearForm.addEventListener("click", () => {
      resetState();
      renderAll();
      updateComplianceStatus(null);
    });
  }

  function resetState() {
    state.applicationType = "43";
    state.instrument = {};
    state.transferors = [emptyParty()];
    state.transferees = [emptyParty()];
    state.attachments = [];
    state.latestXml = "";
    state.latestValidation = null;
    if (els.xmlPreview) els.xmlPreview.value = "";
    if (els.attachmentInput) els.attachmentInput.value = "";
  }

  function emptyParty() {
    const party = {};
    window.EDutiConfig.partyFields.forEach((field) => party[field.key] = "");
    return party;
  }

  function renderApplicationOptions() {
    els.applicationType.innerHTML = window.EDutiConfig.APPLICATION_TYPES
      .map((type) => `<option value="${type.value}">${type.label}</option>`)
      .join("");
    els.applicationType.value = state.applicationType;
  }

  function renderAll() {
    els.applicationType.value = state.applicationType;
    renderSection("general", els.generalFields);
    renderSection("instrument", els.instrumentFields);
    renderSection("exemption", els.exemptionFields);
    renderParties();
    renderAttachments();
    clearFieldErrors();
    els.downloadXml.disabled = !state.latestXml;
  }

  function renderSection(section, container) {
    const fields = window.EDutiConfig.getFieldsForApplication(state.applicationType, section);
    container.innerHTML = fields.map((field) => fieldHtml(field, `instrument.${field.key}`, state.instrument[field.key] || "")).join("");
    fields.forEach((field) => bindField(container, field, state.instrument, field.key));
  }

  function renderParties() {
    renderPartyGroup("transferors", els.transferors, "Transferor");
    renderPartyGroup("transferees", els.transferees, "Transferee");
  }

  function renderPartyGroup(collectionName, container, title) {
    const parties = state[collectionName];
    container.innerHTML = parties.map((party, index) => {
      const fields = window.EDutiConfig.partyFields.map((field) => fieldHtml(field, `${collectionName}.${index}.${field.key}`, party[field.key] || "")).join("");
      const removeButton = parties.length > 1 ? `<button type="button" class="secondary small" data-remove-party="${collectionName}" data-index="${index}">Remove ${title}</button>` : "";
      return `<article class="party-card"><div class="party-card__header"><h3>${title} ${index + 1}</h3>${removeButton}</div><div class="field-grid">${fields}</div></article>`;
    }).join("");

    parties.forEach((party, index) => {
      window.EDutiConfig.partyFields.forEach((field) => bindField(container, field, party, field.key, `${collectionName}.${index}.${field.key}`));
    });

    container.querySelectorAll("[data-remove-party]").forEach((button) => {
      button.addEventListener("click", () => {
        const name = button.dataset.removeParty;
        const index = Number(button.dataset.index);
        state[name].splice(index, 1);
        state.latestXml = "";
        els.xmlPreview.value = "";
        els.downloadXml.disabled = true;
        renderParties();
        updateComplianceStatus(null);
      });
    });
  }

  function fieldHtml(field, errorKey, value) {
    const required = field.mandatory ? " required" : "";
    const placeholder = field.placeholder ? ` placeholder="${field.placeholder}"` : "";
    const maxLength = window.EDutiConfig.getFieldMaxLength(field, state.applicationType);
    const hint = maxLength ? `<span class="hint">Max ${maxLength} characters</span>` : "";
    let input = "";

    if (field.inputType === "select") {
      input = `<select data-error-key="${errorKey}" data-key="${field.key}">${field.options.map((option) => `<option value="${option.value}"${option.value === value ? " selected" : ""}>${option.label}</option>`).join("")}</select>`;
    } else if (field.inputType === "textarea") {
      input = `<textarea data-error-key="${errorKey}" data-key="${field.key}"${placeholder}>${escapeHtml(value)}</textarea>`;
    } else {
      input = `<input type="text" data-error-key="${errorKey}" data-key="${field.key}" value="${escapeHtml(value)}"${placeholder}>`;
    }

    return `<label class="field"><span>${field.label}${required}</span>${input}${hint}<span class="field-error" data-error-for="${errorKey}"></span></label>`;
  }

  function bindField(container, field, target, key, explicitErrorKey) {
    const selector = explicitErrorKey ? `[data-error-key="${explicitErrorKey}"]` : `[data-error-key="instrument.${field.key}"]`;
    const input = container.querySelector(selector);
    if (!input) return;
    input.addEventListener("input", () => {
      const sanitized = window.EDutiSanitizer.sanitizeValue(input.value, field.sanitize);
      if (sanitized !== input.value) input.value = sanitized;
      target[key] = sanitized;
      state.latestXml = "";
      els.xmlPreview.value = "";
      els.downloadXml.disabled = true;
      clearOneError(input.dataset.errorKey);
    });
    input.addEventListener("change", () => {
      target[key] = window.EDutiSanitizer.sanitizeValue(input.value, field.sanitize);
      input.value = target[key];
    });
  }

  async function handleAttachments(event) {
    const result = await window.EDutiFileHandler.processFiles(event.target.files);
    state.attachments.push(...result.accepted);
    state.latestXml = "";
    els.xmlPreview.value = "";
    els.downloadXml.disabled = true;
    renderAttachments(result.errors, result.warnings);
    event.target.value = "";
  }

  function renderAttachments(errors, warnings) {
    els.attachmentList.innerHTML = state.attachments.length
      ? state.attachments.map((file, index) => `<li><span>${escapeHtml(file.name)} (${window.EDutiFileHandler.formatBytes(file.size)})</span><button type="button" class="secondary small" data-remove-attachment="${index}">Remove</button></li>`).join("")
      : `<li class="empty">No attachments added.</li>`;

    els.attachmentList.querySelectorAll("[data-remove-attachment]").forEach((button) => {
      button.addEventListener("click", () => {
        state.attachments.splice(Number(button.dataset.removeAttachment), 1);
        state.latestXml = "";
        els.xmlPreview.value = "";
        els.downloadXml.disabled = true;
        renderAttachments();
      });
    });

    const messages = [];
    (errors || []).forEach((message) => messages.push(`<p class="error-text">${escapeHtml(message)}</p>`));
    (warnings || []).forEach((message) => messages.push(`<p class="warning-text">${escapeHtml(message)}</p>`));
    els.attachmentMessages.innerHTML = messages.join("");
  }

  function collectRawData() {
    return {
      applicationType: state.applicationType,
      instrument: state.instrument,
      transferors: state.transferors,
      transferees: state.transferees,
      attachments: state.attachments
    };
  }

  function previewXml() {
    const result = window.EDutiValidation.validateData(collectRawData());
    state.latestValidation = result;
    applySanitizedData(result.data);
    showValidationResult(result);

    if (!result.valid) {
      state.latestXml = "";
      els.xmlPreview.value = "";
      els.downloadXml.disabled = true;
      return;
    }

    state.latestXml = window.EDutiXmlGenerator.generateXml(result.data);
    els.xmlPreview.value = state.latestXml;
    els.downloadXml.disabled = false;
  }

  function downloadXml() {
    if (!state.latestXml) previewXml();
    if (!state.latestXml) return;
    const blob = new Blob([state.latestXml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = window.EDutiXmlGenerator.buildDownloadName();
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function applySanitizedData(data) {
    state.instrument = data.instrument;
    state.transferors = data.transferors;
    state.transferees = data.transferees;
    renderAll();
  }

  function showValidationResult(result) {
    clearFieldErrors();
    Object.entries(result.fieldErrors).forEach(([key, messages]) => {
      const target = document.querySelector(`[data-error-for="${cssEscape(key)}"]`);
      if (target) target.textContent = messages[0];
    });
    updateComplianceStatus(result);
  }

  function clearFieldErrors() {
    document.querySelectorAll(".field-error").forEach((el) => el.textContent = "");
  }

  function clearOneError(key) {
    const target = document.querySelector(`[data-error-for="${cssEscape(key)}"]`);
    if (target) target.textContent = "";
  }

  function updateComplianceStatus(result) {
    if (!result) {
      els.complianceStatus.innerHTML = `<h3>XML Compliance Status</h3><p>Select an application type, complete the form, add at least one attachment, then preview XML.</p>`;
      return;
    }

    if (result.valid) {
      els.complianceStatus.innerHTML = `
        <h3>XML Compliance Status</h3>
        <ul class="status-list success">
          <li>[OK] Required fields validated</li>
          <li>[OK] Data types validated</li>
          <li>[OK] Conditional mandatory fields validated</li>
          <li>[OK] Attachments validated</li>
          <li>[OK] XML structure ready</li>
        </ul>
        <p class="status-ready">Ready for XML generation</p>`;
      return;
    }

    els.complianceStatus.innerHTML = `
      <h3>XML Compliance Status</h3>
      <ul class="status-list failure">${result.errors.map((message) => `<li>[X] ${escapeHtml(message)}</li>`).join("")}</ul>
      <p class="status-blocked">XML generation unavailable</p>`;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(value);
    return String(value).replace(/[^A-Za-z0-9_-]/g, "\\$&");
  }
})();

