window.EDutiSanitizer = (function () {
  const sanitizer = {
    digitsOnly(value) {
      return String(value || "").replace(/[^0-9]/g, "");
    },

    decimalNumber(value) {
      const cleaned = String(value || "").replace(/[^0-9.]/g, "");
      const parts = cleaned.split(".");
      return parts.length <= 1 ? cleaned : `${parts[0]}.${parts.slice(1).join("")}`;
    },

    alphanumeric(value) {
      return String(value || "").replace(/[^A-Za-z0-9]/g, "");
    },

    phone(value) {
      return String(value || "").replace(/[^0-9+\- ]/g, "");
    },

    date(value) {
      return String(value || "").replace(/[^0-9/]/g, "").slice(0, 10);
    },

    email(value) {
      return String(value || "").replace(/[\x00-\x1F\x7F]/g, "").trim();
    },

    textFlexible(value) {
      return String(value || "")
        .replace(/[\x00-\x1F\x7F]/g, "")
        .replace(/[^A-Za-z0-9 .,'"()\-_/&:@#%+]/g, "")
        .trimStart();
    }
  };

  function sanitizeValue(value, type) {
    const fn = sanitizer[type] || sanitizer.textFlexible;
    return fn(value);
  }

  function sanitizeObject(values, fields, applicationType) {
    const output = {};
    fields.forEach((field) => {
      output[field.key] = sanitizeValue(values[field.key], field.sanitize);
    });
    return output;
  }

  return { sanitizeValue, sanitizeObject };
})();

