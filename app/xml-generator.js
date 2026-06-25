window.EDutiXmlGenerator = (function () {
  function escapeXml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function tag(name, value, indentLevel) {
    const indent = "  ".repeat(indentLevel || 0);
    return `${indent}<${name}>${escapeXml(value)}</${name}>`;
  }

  function attachmentTag(attachment, indentLevel) {
    const indent = "  ".repeat(indentLevel || 0);
    return `${indent}<attachment name="${escapeXml(attachment.name)}">${escapeXml(attachment.base64)}</attachment>`;
  }

  function partyXml(nodeName, party, indentLevel) {
    const lines = [];
    const indent = "  ".repeat(indentLevel || 0);
    lines.push(`${indent}<${nodeName}>`);
    window.EDutiConfig.partyFields.forEach((field) => {
      lines.push(tag(field.xmlTag, party[field.key] || "", indentLevel + 1));
    });
    lines.push(`${indent}</${nodeName}>`);
    return lines;
  }

  function instrumentXml(data, indentLevel) {
    const applicationType = data.applicationType;
    const fieldByKey = {};
    window.EDutiConfig.instrumentFields.forEach((field) => {
      fieldByKey[field.key] = field;
    });

    const lines = [];
    const indent = "  ".repeat(indentLevel || 0);
    lines.push(`${indent}<instrument>`);

    window.EDutiConfig.xmlOrder[applicationType].forEach((key) => {
      if (key === "transferor") {
        data.transferors.forEach((party) => lines.push(...partyXml("transferor", party, (indentLevel || 0) + 1)));
        return;
      }
      if (key === "transferee") {
        data.transferees.forEach((party) => lines.push(...partyXml("transferee", party, (indentLevel || 0) + 1)));
        return;
      }
      if (key === "attachment") {
        data.attachments.forEach((attachment) => lines.push(attachmentTag(attachment, (indentLevel || 0) + 1)));
        return;
      }
      const field = fieldByKey[key];
      lines.push(tag(field.xmlTag, data.instrument[key] || "", (indentLevel || 0) + 1));
    });

    lines.push(`${indent}</instrument>`);
    return lines;
  }

  function generateXml(data) {
    const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<bulkstamping>'];
    lines.push(tag("applicationType", data.applicationType, 1));
    lines.push(...instrumentXml(data, 1));
    lines.push("</bulkstamping>");
    return lines.join("\n");
  }

  function generateBulkXml(items, applicationType) {
    const dataItems = items || [];
    const resolvedApplicationType = applicationType || (dataItems[0] && dataItems[0].applicationType) || "";
    const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<bulkstamping>'];
    lines.push(tag("applicationType", resolvedApplicationType, 1));
    dataItems.forEach((item) => lines.push(...instrumentXml(item, 1)));
    lines.push("</bulkstamping>");
    return lines.join("\n");
  }

  function buildDownloadName(date) {
    const d = date || new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `eduti_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.xml`;
  }

  return { escapeXml, generateXml, generateBulkXml, buildDownloadName };
})();
