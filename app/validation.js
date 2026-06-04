window.EDutiValidation = (function () {
  function isRequired(field, values) {
    if (field.mandatory) return true;
    if (field.requiredWhen === "individual") return values.type === "0";
    if (field.requiredWhen === "individualCitizen") return values.type === "0" && values.nationality === "1";
    if (field.requiredWhen === "individualNonCitizen") return values.type === "0" && values.nationality === "2";
    if (field.requiredWhen === "company") return values.type === "1";
    return false;
  }

  function isValidDate(value) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!match) return false;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function labelWithContext(context, field) {
    if (!context || !context.title) return field.label;
    return `${context.title}: ${field.label}`;
  }

  function validateField(field, values, applicationType, context) {
    const errors = [];
    const value = values[field.key] || "";
    const maxLength = window.EDutiConfig.getFieldMaxLength(field, applicationType);
    const label = labelWithContext(context, field);

    if (isRequired(field, values) && !value) {
      if (field.key === "icNo") errors.push(`${label} is required for Individual Citizen.`);
      else if (field.key === "pasportNo") errors.push(`${label} is required for Individual Non-Citizen.`);
      else if (field.key === "pasportCountry") errors.push(`${label} is required for Individual Non-Citizen.`);
      else if (field.key === "rocNo") errors.push(`${label} is required for Company.`);
      else if (field.key === "nationality") errors.push(`${label} is required for Individual.`);
      else errors.push(`${label} is required.`);
      return errors;
    }

    if (!value) return errors;

    if (maxLength && value.length > maxLength) {
      errors.push(`${label} exceeds ${maxLength} characters.`);
    }

    if (field.minLength && value.length < field.minLength) {
      errors.push(`${label} must be at least ${field.minLength} characters.`);
    }

    if (field.dataType === "number" && !/^[-]?\d+$/.test(value)) {
      errors.push(`${label} must contain numbers only.`);
    }

    if (field.dataType === "decimal" && !/^\d+(\.\d{1,2})?$/.test(value)) {
      errors.push(`${label} must be a valid decimal number with up to 2 decimal places.`);
    }

    if (field.dataType === "date" && !isValidDate(value)) {
      errors.push(`${label}: Invalid date format. Use DD/MM/YYYY.`);
    }

    if (field.dataType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push(`${label} must be a valid email address.`);
    }

    if (field.allowedValues && value && !field.allowedValues.includes(value)) {
      errors.push(`${label} contains an unsupported value.`);
    }

    return errors;
  }

  function sanitizeData(data) {
    const applicationType = data.applicationType;
    const instrumentFields = window.EDutiConfig.getFieldsForApplication(applicationType);
    return {
      applicationType,
      instrument: window.EDutiSanitizer.sanitizeObject(data.instrument || {}, instrumentFields, applicationType),
      transferors: (data.transferors || []).map((party) => window.EDutiSanitizer.sanitizeObject(party, window.EDutiConfig.partyFields, applicationType)),
      transferees: (data.transferees || []).map((party) => window.EDutiSanitizer.sanitizeObject(party, window.EDutiConfig.partyFields, applicationType)),
      attachments: data.attachments || []
    };
  }

  function validateData(rawData) {
    const data = sanitizeData(rawData);
    const errors = [];
    const fieldErrors = {};
    const applicationType = data.applicationType;

    if (!applicationType) {
      errors.push("Application Type is required.");
      fieldErrors.applicationType = ["Application Type is required."];
      return { valid: false, data, errors, fieldErrors };
    }

    window.EDutiConfig.getFieldsForApplication(applicationType).forEach((field) => {
      const fieldMessages = validateField(field, data.instrument, applicationType);
      if (fieldMessages.length) {
        fieldErrors[`instrument.${field.key}`] = fieldMessages;
        errors.push(...fieldMessages);
      }
    });

    if (!data.transferors.length) errors.push("At least one Transferor is required.");
    if (!data.transferees.length) errors.push("At least one Transferee is required.");

    data.transferors.forEach((party, index) => {
      window.EDutiConfig.partyFields.forEach((field) => {
        const fieldMessages = validateField(field, party, applicationType, { title: `Transferor ${index + 1}` });
        if (fieldMessages.length) {
          fieldErrors[`transferors.${index}.${field.key}`] = fieldMessages;
          errors.push(...fieldMessages);
        }
      });
    });

    data.transferees.forEach((party, index) => {
      window.EDutiConfig.partyFields.forEach((field) => {
        const fieldMessages = validateField(field, party, applicationType, { title: `Transferee ${index + 1}` });
        if (fieldMessages.length) {
          fieldErrors[`transferees.${index}.${field.key}`] = fieldMessages;
          errors.push(...fieldMessages);
        }
      });
    });

    if (!data.attachments.length) {
      errors.push("At least one attachment is required.");
      fieldErrors.attachments = ["At least one attachment is required."];
    }

    return { valid: errors.length === 0, data, errors, fieldErrors };
  }

  return { validateData, validateField, isValidDate };
})();
