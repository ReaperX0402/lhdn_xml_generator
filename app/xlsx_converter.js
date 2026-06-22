/**
 * XLSX Batch Converter
 * Handles parsing XLSX files and converting rows to application objects
 */

window.EDutiXlsxConverter = (function () {
  /**
   * Column mapping configuration
   * Maps internal field keys to potential XLSX column names
   * Supports both flat headers and grouped headers
   */
  const XLSX_COLUMN_MAP = {
    // General Information
    applicationType: ["Application Type"],
    refNo: ["Applicant Reference Number", "Reference Number"],
    instrumentDate: ["Instrument Date"],
    instrumentDateReceive: ["Date Instrument Received in Malaysia"],
    principal: ["Principal / Subsidiary"],
    subsidiary: ["Principal Reference Number"],
    typeOfInstrument: ["Type of Instrument"],
    typeOfInstrumentOthers: ["Type of Instrument Others/Agreement Title", "Type of Instrument Others", "Agreement Title"],

    // Instrument Information (Application Type 43)
    consideration: ["Payment/Consideration Amount", "Consideration"],
    duration: ["Duration Can Be Determined", "Duration"],
    durationDesc: ["Duration Description"],
    colLand: ["Collateral - Land / Building", "Collateral Land"],
    colLandDesc: ["Land / Building Collateral Description", "Collateral Land Description"],
    colShare: ["Collateral - Shares", "Collateral Share"],
    colDeposit: ["Collateral - Fixed Deposit", "Collateral Deposit"],
    colOthers: ["Collateral - Others", "Collateral Others"],
    colOthersDesc: ["Other Collateral Description", "Collateral Others Description"],
    noOfCopy: ["No Of Copy", "Number of Copies"],

    // Exemption / Remission (Application Type 43)
    exemption: ["Exemption"],
    exemptionOthers: ["Exemption Others", "Other Exemption"],
    remession: ["Remission"],
    remessionOthers: ["Remission Others", "Other Remission"],
    remessionOrExemption: ["Remission Or Exemption", "Remission or Exemption"],

    // Agreement Info (Application Type 44)
    aggrementInfo: ["Agreement Information"],
    payment: ["Payment/Consideration Amount", "Payment Amount"],

    // Party information (Transferor/Transferee)
    // These are mapped via section + fieldname
    partyType: ["Party Type"],
    name: ["Name"],
    nationality: ["Nationality"],
    icNo: ["IC Number"],
    pasportNo: ["Passport Number"],
    pasportCountry: ["Passport Country"],
    rocNo: ["Company Registration Number", "ROC Number"],
    busType: ["Business Type"],
    incomeTaxNo: ["Income Tax Number", "TIN"],
    incomeTaxBranch: ["Income Tax Branch"],
    street1: ["Address Line 1"],
    street2: ["Address Line 2"],
    street3: ["Address Line 3"],
    postcode: ["Postcode"],
    city: ["City"],
    state: ["State"],
    country: ["Country"],
    telNo: ["Telephone Number", "Tel Number"],
    email: ["Email"],

    // Attachments
    attachmentName: ["Attachment Name"],
    attachmentBase64: ["Attachment Base64"]
  };

  function normalizeHeaderLabel(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function isHeaderMatch(header, possibleName) {
    return normalizeHeaderLabel(header) === normalizeHeaderLabel(possibleName);
  }

  function normalizeGroupedSections(sections, headers) {
    const normalized = [];
    let currentSection = "";
    const knownSections = ["general", "transferor", "transferee", "instrument", "attachment"];

    for (let i = 0; i < headers.length; i++) {
      const rawSection = String(sections[i] || "").trim();
      const sectionLower = rawSection.toLowerCase();

      if (rawSection && knownSections.some((name) => sectionLower.includes(name))) {
        currentSection = rawSection;
      }

      normalized[i] = currentSection;
    }

    return normalized;
  }

  /**
   * Parse Excel serial date number to DD/MM/YYYY format
   */
  function parseExcelDate(value) {
    if (!value) return "";
    
    // If it's already a string date, return as is
    if (typeof value === "string") {
      return value;
    }

    // Excel date serial number
    // Serial 1 = January 1, 1900
    const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
    const serialNumber = parseInt(value, 10);
    
    if (isNaN(serialNumber)) {
      return String(value);
    }

    try {
      const date = new Date(excelEpoch.getTime() + serialNumber * 24 * 60 * 60 * 1000);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return String(value);
    }
  }

  /**
   * Resolve amount value: strip currency symbols and commas
   */
  function parseAmount(value) {
    if (!value) return "";
    const str = String(value).trim();
    // Remove RM, commas, spaces
    return str.replace(/[RM\s,]/g, "");
  }

  /**
   * Parse yes/no/boolean values to 1 or 2
   */
  function parseYesNo(value) {
    if (!value) return "";
    const str = String(value).toLowerCase().trim();
    if (["1", "yes", "ya", "true", "on"].includes(str)) return "1";
    if (["2", "no", "tidak", "false", "off"].includes(str)) return "2";
    return String(value);
  }

  /**
   * Parse application type text to code (43 or 44)
   */
  function parseApplicationType(value) {
    if (!value) return "";
    const str = String(value).toLowerCase().trim();
    if (["43", "penyeteman sekuriti", "sekuriti", "security"].includes(str)) return "43";
    if (["44", "penyeteman am", "am", "general"].includes(str)) return "44";
    return String(value);
  }

  /**
   * Parse party type text to code (0 or 1)
   */
  function parsePartyType(value) {
    if (!value) return "";
    const str = String(value).toLowerCase().trim();
    if (["0", "individual", "individu", "person"].includes(str)) return "0";
    if (["1", "company", "syarikat"].includes(str)) return "1";
    return String(value);
  }

  /**
   * Parse nationality text to code (1, 2, or 3)
   */
  function parseNationality(value) {
    if (!value) return "";
    const str = String(value).toLowerCase().trim();
    if (["1", "citizen", "warganegara"].includes(str)) return "1";
    if (["2", "non-citizen", "bukan warganegara"].includes(str)) return "2";
    if (["3", "permanent resident", "penduduk tetap", "pr"].includes(str)) return "3";
    return String(value);
  }

  /**
   * Parse business type text to code (1 or 2)
   */
  function parseBusinessType(value) {
    if (!value) return "";
    const str = String(value).toLowerCase().trim();
    if (["1", "local", "tempatan"].includes(str)) return "1";
    if (["2", "foreign", "asing"].includes(str)) return "2";
    return String(value);
  }

  /**
   * Parse principal/subsidiary text to code (-1 or 0)
   */
  function parsePrincipalSubsidiary(value) {
    if (!value) return "";
    const str = String(value).toLowerCase().trim();
    if (["-1", "principal", "prinsipal"].includes(str)) return "-1";
    if (["0", "subsidiary", "subsidiari"].includes(str)) return "0";
    return String(value);
  }

  /**
   * Find matching XLSX column header
   * Returns: { columnIndex: number, headerName: string } or null
   */
  function findColumnMatch(headers, fieldKey) {
    const possibleNames = XLSX_COLUMN_MAP[fieldKey] || [];
    for (let i = 0; i < headers.length; i++) {
      const header = String(headers[i] || "").trim();
      for (const possibleName of possibleNames) {
        if (isHeaderMatch(header, possibleName)) {
          return { columnIndex: i, headerName: header };
        }
      }
    }
    return null;
  }

  /**
   * Parse XLSX workbook and extract rows
   * Returns: { sheets: [...], errors: [...] }
   */
  function parseXlsx(arrayBuffer) {
    const errors = [];
    try {
      // XLSX library must be loaded
      if (!window.XLSX) {
        errors.push("XLSX library not loaded.");
        return { sheets: [], errors };
      }

      const workbook = window.XLSX.read(arrayBuffer, { type: "array" });
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        errors.push("No sheets found in XLSX file.");
        return { sheets: [], errors };
      }

      // Use first sheet by default
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      
      // Convert sheet to array with empty cells preserved
      const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

      return { sheets: [{ name: firstSheetName, rows }], errors };
    } catch (e) {
      errors.push(`Failed to parse XLSX: ${e.message}`);
      return { sheets: [], errors };
    }
  }

  /**
   * Convert XLSX rows to batch submissions
   * Each row becomes one submission object
   */
  function convertXlsxRows(rows, applicationType) {
    const submissions = [];
    const errors = [];

    if (!rows || rows.length < 3) {
      errors.push("XLSX must contain at least 3 rows (headers + data).");
      return { submissions, errors };
    }

    // Detect header structure
    const row1 = rows[0] || [];
    const row2 = rows[1] || [];
    
    // Try to detect if row 1 contains section headers
    const hasGroupedHeaders = detectGroupedHeaders(row1, row2);

    let headers = [];
    let headerSections = [];
    let dataStartRow = 2;

    if (hasGroupedHeaders) {
      // Grouped header structure: row 1 = sections, row 2 = field names
      headers = row2;
      headerSections = normalizeGroupedSections(row1, row2);
    } else {
      // Flat header structure: row 1 = field names
      headers = row1;
      dataStartRow = 1;
    }

    // Process data rows
    for (let rowIndex = dataStartRow; rowIndex < rows.length; rowIndex++) {
      const rowData = rows[rowIndex] || [];
      
      // Skip empty rows
      if (!rowData.some((cell) => cell && String(cell).trim())) {
        continue;
      }

      const submission = convertRow(rowData, headers, headerSections, applicationType, rowIndex + 1);
      submissions.push(submission);
    }

    return { submissions, errors };
  }

  /**
   * Detect if headers are grouped (section + field name)
   */
  function detectGroupedHeaders(row1, row2) {
    // Check if row 1 contains section names and row 2 contains field names
    const sectionKeywords = ["Transferor", "Transferee", "General", "Instrument", "Attachment", "Party"];
    const hasSectionInRow1 = row1.some((cell) =>
      sectionKeywords.some((kw) => String(cell || "").toLowerCase().includes(kw.toLowerCase()))
    );
    
    const hasFieldsInRow2 = row2 && row2.some((cell) =>
      Object.values(XLSX_COLUMN_MAP).some((names) =>
        names.some((name) => isHeaderMatch(cell, name))
      )
    );

    return hasSectionInRow1 && hasFieldsInRow2;
  }

  /**
   * Convert a single XLSX row to submission object
   */
  function convertRow(rowData, headers, headerSections, applicationType, xlsxRowNumber) {
    const submissionNumber = submissionCount++; // Track globally
    const result = {
      rowNumber: xlsxRowNumber,
      submissionNumber: submissionNumber,
      refNo: "",
      applicationType: applicationType || "43",
      data: {
        instrument: {},
        transferors: [],
        transferees: []
      },
      attachments: [],
      status: "pending", // Will be set after validation
      errors: [],
      mappingErrors: [],
      warnings: [],
      xml: null
    };

    // Extract cell values by column
    const cellByHeader = {};
    for (let i = 0; i < headers.length; i++) {
      const header = String(headers[i] || "").trim();
      const section = headerSections && headerSections[i] ? String(headerSections[i] || "").trim() : "";
      const value = rowData[i] !== undefined ? rowData[i] : "";
      
      cellByHeader[header] = { value, section };
    }

    // Map general fields
    const appTypeMatch = findColumnMatch(headers, "applicationType");
    if (appTypeMatch) {
      const rawValue = rowData[appTypeMatch.columnIndex];
      result.applicationType = parseApplicationType(rawValue) || applicationType || "43";
    }

    const refNoMatch = findColumnMatch(headers, "refNo");
    if (refNoMatch) {
      result.refNo = String(rowData[refNoMatch.columnIndex] || "").trim();
      result.data.instrument.refNo = result.refNo;
    }

    // Map instrument fields
    mapInstrumentFields(result, rowData, headers);

    // Map party fields (Transferor and Transferee)
    mapPartyFields(result, rowData, headers, headerSections);

    // Map attachment fields from XLSX columns if present
    mapAttachmentFields(result, rowData, headers);

    return result;
  }

  /**
   * Map instrument fields from row data
   */
  function mapInstrumentFields(result, rowData, headers) {
    const fields = [
      "instrumentDate",
      "instrumentDateReceive",
      "principal",
      "subsidiary",
      "typeOfInstrument",
      "typeOfInstrumentOthers",
      "consideration",
      "duration",
      "durationDesc",
      "colLand",
      "colLandDesc",
      "colShare",
      "colDeposit",
      "colOthers",
      "colOthersDesc",
      "noOfCopy",
      "exemption",
      "exemptionOthers",
      "remession",
      "remessionOthers",
      "remessionOrExemption",
      "aggrementInfo",
      "payment"
    ];

    fields.forEach((fieldKey) => {
      const match = findColumnMatch(headers, fieldKey);
      if (match) {
        const rawValue = rowData[match.columnIndex];
        let value = rawValue === undefined || rawValue === null ? "" : rawValue;

        // Apply field-specific parsing
        if (fieldKey === "instrumentDate" || fieldKey === "instrumentDateReceive") {
          value = parseExcelDate(value);
        } else {
          value = String(value).trim();
        }

        if (fieldKey === "consideration" || fieldKey === "payment") {
          value = parseAmount(value);
        } else if (["duration", "colLand", "colShare", "colDeposit", "colOthers"].includes(fieldKey)) {
          value = parseYesNo(value);
        } else if (fieldKey === "principal") {
          value = parsePrincipalSubsidiary(value);
        }

        value = applyInstrumentLampiranLookup(result, fieldKey, value);
        result.data.instrument[fieldKey] = value;
      }
    });
  }

  function applyInstrumentLampiranLookup(result, fieldKey, value) {
    if (!window.EDutiLampiran || !value) return value;

    if (fieldKey === "exemption") {
      return resolveLampiranValue(result, value, "Exemption", "Lampiran F Jadual 1", window.EDutiLampiran.resolveExemption);
    }

    if (fieldKey === "remession") {
      return resolveLampiranValue(result, value, "Remission", "Lampiran F Jadual 2", window.EDutiLampiran.resolveRemission);
    }

    if (fieldKey === "remessionOrExemption") {
      const exemption = window.EDutiLampiran.resolveExemption(value);
      if (exemption.isValid) return exemption.code;

      const remission = window.EDutiLampiran.resolveRemission(value);
      if (remission.isValid) return remission.code;

      addMappingError(result, `Row ${result.rowNumber}: Remission or Exemption "${value}" does not match Lampiran F.`);
      return value;
    }

    return value;
  }

  /**
   * Map party fields (Transferor and Transferee) from row data
   * Handles grouped headers like "Transferor Name", "Transferor Nationality", etc.
   */
  function mapPartyFields(result, rowData, headers, headerSections) {
    const transferorData = {};
    const transfereeData = {};

    const partyFieldKeys = [
      "partyType",
      "name",
      "nationality",
      "icNo",
      "pasportNo",
      "pasportCountry",
      "rocNo",
      "busType",
      "incomeTaxNo",
      "incomeTaxBranch",
      "street1",
      "street2",
      "street3",
      "postcode",
      "city",
      "state",
      "country",
      "telNo",
      "email"
    ];

    // Map by looking for headers that match patterns
    for (let i = 0; i < headers.length; i++) {
      const header = String(headers[i] || "").trim();
      const section = headerSections && headerSections[i] ? String(headerSections[i] || "").trim() : "";
      const value = rowData[i] !== undefined ? rowData[i] : "";

      // Determine party type based on section or header pattern
      let isTransferor = section.toLowerCase().includes("transferor") || header.toLowerCase().includes("transferor");
      let isTransferee = section.toLowerCase().includes("transferee") || header.toLowerCase().includes("transferee");

      // Find matching field key
      for (const fieldKey of partyFieldKeys) {
        const possibleNames = XLSX_COLUMN_MAP[fieldKey] || [];
        let isMatch = false;

        for (const possibleName of possibleNames) {
          if (isHeaderMatch(header, possibleName)) {
            isMatch = true;
            break;
          }
        }

        if (isMatch) {
          let parsedValue = String(value || "").trim();

          // Apply field-specific parsing
          if (fieldKey === "partyType") {
            parsedValue = parsePartyType(parsedValue);
          } else if (fieldKey === "nationality") {
            parsedValue = parseNationality(parsedValue);
          } else if (fieldKey === "busType") {
            parsedValue = parseBusinessType(parsedValue);
          }

          if (isTransferor) {
            transferorData[fieldKey] = parsedValue;
          }
          if (isTransferee) {
            transfereeData[fieldKey] = parsedValue;
          }
        }
      }
    }

    // Map partyType to type (internal field name)
    if (transferorData.partyType) {
      transferorData.type = transferorData.partyType;
      delete transferorData.partyType;
    }
    if (transfereeData.partyType) {
      transfereeData.type = transfereeData.partyType;
      delete transfereeData.partyType;
    }

    // Apply Lampiran lookup conversions
    applyLampiranLookups(result, transferorData, "Transferor");
    applyLampiranLookups(result, transfereeData, "Transferee");

    // Add to result if not empty
    if (Object.keys(transferorData).length > 0) {
      result.data.transferors = [transferorData];
    }
    if (Object.keys(transfereeData).length > 0) {
      result.data.transferees = [transfereeData];
    }
  }

  /**
   * Apply Lampiran lookups to party data
   */
  function applyLampiranLookups(result, partyData, partyLabel) {
    if (!window.EDutiLampiran) return;

    // Resolve country name to code
    if (partyData.country) {
      partyData.country = resolveLampiranValue(result, partyData.country, `${partyLabel} Country`, "Lampiran C", window.EDutiLampiran.resolveCountry);
    }

    // Resolve passport country name to code
    if (partyData.pasportCountry) {
      partyData.pasportCountry = resolveLampiranValue(result, partyData.pasportCountry, `${partyLabel} Passport Country`, "Lampiran C", window.EDutiLampiran.resolveCountry);
    }

    // Resolve state name to code
    if (partyData.state) {
      partyData.state = resolveLampiranValue(result, partyData.state, `${partyLabel} State`, "Lampiran E", window.EDutiLampiran.resolveState);
    }

    // Resolve tax branch name to code
    if (partyData.incomeTaxBranch) {
      partyData.incomeTaxBranch = resolveLampiranValue(result, partyData.incomeTaxBranch, `${partyLabel} Income Tax Branch`, "Lampiran D", window.EDutiLampiran.resolveTaxBranch);
    }
  }

  function resolveLampiranValue(submission, value, fieldLabel, lampiranName, resolver) {
    const lookup = resolver(value);
    if (lookup.isValid) return lookup.code;
    addMappingError(submission, `Row ${submission.rowNumber}: ${fieldLabel} "${value}" does not match ${lampiranName}.`);
    return value;
  }

  function addMappingError(submission, message) {
    if (!submission.mappingErrors.includes(message)) {
      submission.mappingErrors.push(message);
    }
  }

  /**
   * Map attachment fields from XLSX columns if present
   */
  function mapAttachmentFields(result, rowData, headers) {
    // Look for Attachment N Name and Attachment N Base64 columns
    const attachmentRegex = /^Attachment\s+(\d+)\s+(Name|Base64)$/i;
    const attachmentMap = {};

    headers.forEach((header, columnIndex) => {
      const match = String(header || "").match(attachmentRegex);
      if (match) {
        const attachmentNum = match[1];
        const field = match[2].toLowerCase();
        const value = rowData[columnIndex];

        if (!attachmentMap[attachmentNum]) {
          attachmentMap[attachmentNum] = {};
        }
        attachmentMap[attachmentNum][field] = value;
      }
    });

    // Create attachment objects
    Object.values(attachmentMap).forEach((att) => {
      if (att.name && att.base64) {
        // Remove data URL prefix if present
        let base64 = String(att.base64).trim();
        const dataUrlMatch = base64.match(/^data:[^;]+;base64,(.+)$/);
        if (dataUrlMatch) {
          base64 = dataUrlMatch[1];
        }

        result.attachments.push({
          name: String(att.name).trim(),
          base64: base64,
          size: Math.ceil((base64.length * 3) / 4), // Rough estimate from base64
          type: "application/octet-stream"
        });
      }
    });
  }

  let submissionCount = 0;

  /**
   * Main public function: load XLSX and convert to submissions
   */
  function loadAndConvertXlsx(file, applicationType) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const arrayBuffer = event.target.result;
          const { sheets, errors: parseErrors } = parseXlsx(arrayBuffer);

          if (parseErrors.length > 0) {
            return reject(new Error(parseErrors.join(" ")));
          }

          if (sheets.length === 0) {
            return reject(new Error("No valid sheets found in XLSX file."));
          }

          const sheet = sheets[0];
          submissionCount = 0; // Reset counter
          const { submissions, errors: conversionErrors } = convertXlsxRows(sheet.rows, applicationType);

          if (conversionErrors.length > 0) {
            console.warn("XLSX conversion warnings:", conversionErrors);
          }

          resolve({ submissions, errors: conversionErrors });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read XLSX file."));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Validate a batch submission using existing validation logic
   */
  function validateSubmission(submission) {
    if (!window.EDutiValidation) {
      submission.errors.push("Validation system not available.");
      submission.status = "invalid";
      return;
    }

    // Build validation data
    const dataValidationAttachments = submission.attachments.length
      ? submission.attachments
      : [{ name: "__batch_attachment_placeholder__.pdf", base64: "WA==" }];

    const validationData = {
      applicationType: submission.applicationType,
      instrument: submission.data.instrument || {},
      transferors: submission.data.transferors || [],
      transferees: submission.data.transferees || [],
      attachments: dataValidationAttachments
    };

    // Run validation
    const validation = window.EDutiValidation.validateData(validationData);
    submission.errors = [...(submission.mappingErrors || []), ...validation.errors];
    submission.warnings = [];

    if (submission.mappingErrors && submission.mappingErrors.length) {
      submission.status = "invalid";
    } else if (!validation.valid) {
      submission.status = "invalid";
    } else if (submission.attachments.length === 0) {
      submission.status = "needsAttachment";
    } else {
      submission.status = "valid";
    }
  }

  /**
   * Generate XML for a single submission
   */
  function generateSubmissionXml(submission) {
    if (!window.EDutiXmlGenerator) {
      submission.errors.push("XML generator not available.");
      return null;
    }

    if (submission.status !== "valid") {
      submission.errors.push("Submission is not valid. Cannot generate XML.");
      return null;
    }

    try {
      const xml = window.EDutiXmlGenerator.generateXml({
        applicationType: submission.applicationType,
        instrument: submission.data.instrument || {},
        transferors: submission.data.transferors || [],
        transferees: submission.data.transferees || [],
        attachments: submission.attachments || []
      });

      // Validate XML is well-formed
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      if (doc.getElementsByTagName("parsererror").length > 0) {
        submission.errors.push("Generated XML is not well-formed.");
        return null;
      }

      submission.xml = xml;
      return xml;
    } catch (error) {
      submission.errors.push(`XML generation failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate filename for batch XML
   * Format: eduti_ROWNUMBER_REFNO.xml
   */
  function generateXmlFilename(submission) {
    const refNo = (submission.refNo || "UNKNOWN").replace(/[^A-Za-z0-9\-_]/g, "_");
    return `eduti_${submission.rowNumber}_${refNo}.xml`;
  }

  /**
   * Generate batch ZIP download name
   * Format: eduti_batch_YYYYMMDD_HHMMSS.zip
   */
  function generateZipFilename() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return `eduti_batch_${date}_${time}.zip`;
  }

  return {
    loadAndConvertXlsx,
    validateSubmission,
    generateSubmissionXml,
    generateXmlFilename,
    generateZipFilename,
    _test: {
      convertXlsxRows,
      normalizeGroupedSections,
      findColumnMatch
    }
  };
})();
