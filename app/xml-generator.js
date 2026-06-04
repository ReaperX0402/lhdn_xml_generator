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

  function generateXml(data) {
    const applicationType = data.applicationType;
    const fieldByKey = {};
    window.EDutiConfig.instrumentFields.forEach((field) => {
      fieldByKey[field.key] = field;
    });

    const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<bulkstamping>'];
    lines.push(tag("applicationType", applicationType, 1));
    lines.push("  <instrument>");

    window.EDutiConfig.xmlOrder[applicationType].forEach((key) => {
      if (key === "transferor") {
        data.transferors.forEach((party) => lines.push(...partyXml("transferor", party, 2)));
        return;
      }
      if (key === "transferee") {
        data.transferees.forEach((party) => lines.push(...partyXml("transferee", party, 2)));
        return;
      }
      if (key === "attachment") {
        data.attachments.forEach((attachment) => lines.push(attachmentTag(attachment, 2)));
        return;
      }
      const field = fieldByKey[key];
      lines.push(tag(field.xmlTag, data.instrument[key] || "", 2));
    });

    lines.push("  </instrument>");
    lines.push("</bulkstamping>");
    return lines.join("\n");
  }

  function buildDownloadName(date) {
    const d = date || new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `eduti_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.xml`;
  }

  return { escapeXml, generateXml, buildDownloadName };
})();
