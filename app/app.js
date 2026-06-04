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
  const toastTimers = new Map();
  const toastLastSeen = new Map();
  const toastDurationMs = 3000;
  const toastDedupeMs = 2000;

  window.EDutiAppFeedback = {
    getSanitizationMessage,
    createToast,
    toastDurationMs,
    toastDedupeMs
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    bindElements();
    resetState();
    renderApplicationOptions();
    renderAll();
    bindEvents();
    runRealtimeValidation();
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
      complianceStatus: document.getElementById("complianceStatus"),
      toastContainer: document.getElementById("toastContainer")
    });
  }

  function bindEvents() {
    els.applicationType.addEventListener("change", () => {
      state.applicationType = els.applicationType.value;
      state.instrument = {};
      invalidatePreview(false);
      renderAll();
      runRealtimeValidation();
    });

    els.addTransferor.addEventListener("click", () => {
      state.transferors.push(emptyParty());
      renderParties();
      runRealtimeValidation();
    });

    els.addTransferee.addEventListener("click", () => {
      state.transferees.push(emptyParty());
      renderParties();
      runRealtimeValidation();
    });

    els.attachmentInput.addEventListener("change", handleAttachments);
    els.previewXml.addEventListener("click", previewXml);
    els.downloadXml.addEventListener("click", downloadXml);
    els.clearForm.addEventListener("click", () => {
      resetState();
      renderAll();
      runRealtimeValidation();
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
        invalidatePreview(true);
        renderParties();
        runRealtimeValidation();
      });
    });
  }

  function fieldHtml(field, errorKey, value) {
    const requiredMark = field.mandatory ? ` <span class="required-mark" aria-hidden="true">*</span>` : "";
    const placeholder = field.placeholder ? ` placeholder="${field.placeholder}"` : "";
    let input = "";

    if (field.inputType === "select") {
      input = `<select data-error-key="${errorKey}" data-key="${field.key}">${field.options.map((option) => `<option value="${option.value}"${option.value === value ? " selected" : ""}>${option.label}</option>`).join("")}</select>`;
    } else if (field.inputType === "textarea") {
      input = `<textarea data-error-key="${errorKey}" data-key="${field.key}"${placeholder}>${escapeHtml(value)}</textarea>`;
    } else {
      input = `<input type="text" data-error-key="${errorKey}" data-key="${field.key}" value="${escapeHtml(value)}"${placeholder}>`;
    }

    return `<label class="field" data-field-wrapper="${errorKey}"><span class="field-label-text">${field.label}${requiredMark}</span>${input}<span class="field-message" data-message-for="${errorKey}"></span></label>`;
  }

  function bindField(container, field, target, key, explicitErrorKey) {
    const selector = explicitErrorKey ? `[data-error-key="${explicitErrorKey}"]` : `[data-error-key="instrument.${field.key}"]`;
    const input = container.querySelector(selector);
    if (!input) return;

    const syncInput = () => {
      const rawValue = input.value;
      const sanitized = window.EDutiSanitizer.sanitizeValue(rawValue, field.sanitize);
      if (sanitized !== rawValue) {
        input.value = sanitized;
        showToast(getSanitizationMessage(field), "info");
      }
      target[key] = sanitized;
      invalidatePreview(true);
      runRealtimeValidation();
    };

    input.addEventListener("input", syncInput);
    input.addEventListener("change", syncInput);
    input.addEventListener("blur", syncInput);
  }

  async function handleAttachments(event) {
    const result = await window.EDutiFileHandler.processFiles(event.target.files);
    state.attachments.push(...result.accepted);
    invalidatePreview(true);
    renderAttachments(result.errors, result.warnings);
    if (result.errors.length) showToast("Only PDF, JPEG, PNG and GIF files are accepted.", "warning");
    if (result.accepted.length) showToast("Attachment added.", "success");
    event.target.value = "";
    runRealtimeValidation();
  }

  function renderAttachments(errors, warnings) {
    els.attachmentList.innerHTML = state.attachments.length
      ? state.attachments.map((file, index) => `<li><span>${escapeHtml(file.name)} (${window.EDutiFileHandler.formatBytes(file.size)})</span><button type="button" class="secondary small" data-remove-attachment="${index}">Remove</button></li>`).join("")
      : `<li class="empty">No attachments added.</li>`;

    els.attachmentList.querySelectorAll("[data-remove-attachment]").forEach((button) => {
      button.addEventListener("click", () => {
        state.attachments.splice(Number(button.dataset.removeAttachment), 1);
        invalidatePreview(true);
        renderAttachments();
        runRealtimeValidation();
      });
    });

    const messages = [];
    if (!state.attachments.length) messages.push(`<p class="warning-text">Only PDF, JPEG, PNG and GIF files are accepted. At least one attachment is required.</p>`);
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
      invalidatePreview(false);
      showToast("XML generation unavailable. Fix validation errors first.", "error");
      return;
    }

    state.latestXml = window.EDutiXmlGenerator.generateXml(result.data);
    els.xmlPreview.value = state.latestXml;
    els.downloadXml.disabled = false;
    showToast("XML preview generated.", "success");
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

  function invalidatePreview(showChangedToast) {
    const hadPreview = Boolean(state.latestXml || (els.xmlPreview && els.xmlPreview.value));
    state.latestXml = "";
    if (els.xmlPreview) els.xmlPreview.value = "";
    if (els.downloadXml) els.downloadXml.disabled = true;
    if (showChangedToast && hadPreview) showToast("Form changed. XML preview must be regenerated.", "warning");
  }

  function runRealtimeValidation() {
    const result = window.EDutiValidation.validateData(collectRawData());
    state.latestValidation = result;
    showValidationResult(result);
    return result;
  }

  function showValidationResult(result) {
    const fieldErrors = result.fieldErrors || {};
    clearFieldMessages();
    renderFieldMessages(fieldErrors);
    updateComplianceStatus(result);
  }

  function clearFieldMessages() {
    document.querySelectorAll(".field-message").forEach((el) => {
      el.textContent = "";
      el.classList.remove("field-message--helper", "field-message--warning", "field-message--error");
    });
    document.querySelectorAll(".field.has-error").forEach((el) => el.classList.remove("has-error"));
  }

  function renderFieldMessages(fieldErrors) {
    window.EDutiConfig.getFieldsForApplication(state.applicationType).forEach((field) => {
      renderSingleFieldMessage(field, state.instrument[field.key] || "", `instrument.${field.key}`, fieldErrors[`instrument.${field.key}`]);
    });
    state.transferors.forEach((party, index) => {
      window.EDutiConfig.partyFields.forEach((field) => renderSingleFieldMessage(field, party[field.key] || "", `transferors.${index}.${field.key}`, fieldErrors[`transferors.${index}.${field.key}`]));
    });
    state.transferees.forEach((party, index) => {
      window.EDutiConfig.partyFields.forEach((field) => renderSingleFieldMessage(field, party[field.key] || "", `transferees.${index}.${field.key}`, fieldErrors[`transferees.${index}.${field.key}`]));
    });
  }

  function renderSingleFieldMessage(field, value, key, errors) {
    const target = document.querySelector(`[data-message-for="${cssEscape(key)}"]`);
    const wrapper = document.querySelector(`[data-field-wrapper="${cssEscape(key)}"]`);
    if (!target) return;

    const message = getGuidanceMessage(field, value, errors);
    target.textContent = message.text;
    target.classList.toggle("field-message--error", message.type === "error");
    target.classList.toggle("field-message--warning", message.type === "warning");
    target.classList.toggle("field-message--helper", message.type === "helper");
    if (wrapper) wrapper.classList.toggle("has-error", message.type === "error");
  }

  function getGuidanceMessage(field, value, errors) {
    if (errors && errors.length) return { type: "error", text: normalizeValidationMessage(field, errors[0]) };
    const warning = getFieldWarning(field, value);
    if (warning) return { type: "warning", text: warning };
    const helper = getFieldHelper(field, value);
    return helper ? { type: "helper", text: helper } : { type: "", text: "" };
  }

  function normalizeValidationMessage(field, message) {
    const maxLength = window.EDutiConfig.getFieldMaxLength(field, state.applicationType);
    if (maxLength && message.includes(`exceeds ${maxLength} characters`)) {
      return `${field.label} must not exceed ${maxLength} characters.`;
    }
    return message;
  }

  function getFieldWarning(field, value) {
    const maxLength = window.EDutiConfig.getFieldMaxLength(field, state.applicationType);
    if (field.key === "icNo" && value && value.length > 0 && value.length < 12) return "IC Number should contain 12 digits.";
    if (field.key === "telNo" && value && value.length > 20) return "Telephone Number should not exceed 20 characters.";
    if (maxLength && value && value.length >= Math.ceil(maxLength * 0.9) && value.length <= maxLength) {
      return `Approaching maximum length: ${value.length}/${maxLength} characters.`;
    }
    return "";
  }

  function getFieldHelper(field, value) {
    const maxLength = window.EDutiConfig.getFieldMaxLength(field, state.applicationType);
    return maxLength ? `Max ${maxLength} characters` : "";
  }

  function getSanitizationMessage(fieldOrType) {
    const sanitize = typeof fieldOrType === "string" ? fieldOrType : fieldOrType.sanitize;
    if (sanitize === "digitsOnly") return "Only numbers are allowed. Invalid characters were removed.";
    if (sanitize === "decimalNumber") return "Only decimal numbers are allowed. Invalid characters were removed.";
    if (sanitize === "date") return "Use date format DD/MM/YYYY.";
    if (sanitize === "phone") return "Only phone number characters are allowed.";
    if (sanitize === "alphanumeric") return "Only letters and numbers are allowed.";
    if (sanitize === "textFlexible") return "Unsupported characters were removed.";
    return "Unsupported characters were removed.";
  }

  function showToast(message, type) {
    if (!els.toastContainer) return null;
    return createToast(els.toastContainer, message, type || "info");
  }

  function createToast(container, message, type) {
    const now = Date.now();
    const existing = container.querySelector(`[data-toast-message="${cssEscape(message)}"]`);
    if (existing && now - Number(existing.dataset.lastSeen || 0) < toastDedupeMs) {
      existing.dataset.lastSeen = String(now);
      scheduleToastRemoval(existing, message);
      return existing;
    }
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = `toast toast--${type || "info"}`;
    toast.dataset.toastMessage = message;
    toast.dataset.lastSeen = String(now);
    toast.innerHTML = `<span class="toast__message">${escapeHtml(message)}</span><button type="button" class="toast__close" aria-label="Close notification">&times;</button>`;
    toast.querySelector("button").addEventListener("click", () => removeToast(toast, message));
    container.appendChild(toast);
    scheduleToastRemoval(toast, message);
    return toast;
  }

  function scheduleToastRemoval(toast, message) {
    if (toastTimers.has(message)) clearTimeout(toastTimers.get(message));
    toastTimers.set(message, setTimeout(() => removeToast(toast, message), toastDurationMs));
  }

  function removeToast(toast, message) {
    if (toastTimers.has(message)) {
      clearTimeout(toastTimers.get(message));
      toastTimers.delete(message);
    }
    if (toast && toast.parentNode) toast.remove();
  }

  function getComplianceIssues(result) {
    if (!result || result.valid) return [];
    return (result.errors || []).map(summarizeComplianceError);
  }

  function updateComplianceStatus(result) {
    if (!result) {
      els.complianceStatus.innerHTML = `<h3>XML Compliance Status</h3><p>Complete the form and add at least one attachment.</p>`;
      return;
    }

    const issues = getComplianceIssues(result);
    if (!issues.length) {
      els.complianceStatus.innerHTML = `
        <h3>XML Compliance Status</h3>
        <ul class="status-list success">
          <li>✓ All required fields completed</li>
          <li>✓ Attachments validated</li>
          <li>✓ XML structure ready</li>
        </ul>
        <p class="status-ready">✓ Ready for XML generation</p>`;
      return;
    }

    els.complianceStatus.innerHTML = `
      <h3>XML Compliance Status</h3>
      <ul class="status-list failure">${issues.map((message) => `<li>[X] ${escapeHtml(message)}</li>`).join("")}</ul>
      <p class="status-blocked">XML generation unavailable</p>`;
  }

  function summarizeComplianceError(message) {
    return message
      .replace("Applicant Reference Number is required.", "Applicant Reference Number missing")
      .replace("Instrument Date is required.", "Instrument Date missing")
      .replace("Principal / Subsidiary is required.", "Principal / Subsidiary missing")
      .replace("At least one attachment is required.", "Attachment missing")
      .replace(" is required.", " missing")
      .replace(": Invalid date format. Use DD/MM/YYYY.", " invalid. Use DD/MM/YYYY.");
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




