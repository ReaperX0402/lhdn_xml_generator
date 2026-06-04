/* Field configuration for the e-Duti Setem XML generator. */
window.EDutiConfig = (function () {
  const APPLICATION_TYPES = [
    { value: "43", label: "Penyeteman Sekuriti" },
    { value: "44", label: "Penyeteman Am" }
  ];

  const yesNoOptions = [
    { value: "", label: "Select" },
    { value: "1", label: "Yes" },
    { value: "2", label: "No" }
  ];

  const partyFields = [
    { key: "type", label: "Party Type", xmlTag: "type", section: "party", appliesTo: ["43", "44"], sanitize: "digitsOnly", dataType: "number", maxLength: 1, mandatory: true, inputType: "select", options: [
      { value: "", label: "Select" }, { value: "0", label: "Individual" }, { value: "1", label: "Company" }
    ], allowedValues: ["0", "1"] },
    { key: "name", label: "Name", xmlTag: "name", section: "party", appliesTo: ["43", "44"], sanitize: "textFlexible", dataType: "varchar", maxLength: 4000, mandatory: true },
    { key: "nationality", label: "Nationality", xmlTag: "nationality", section: "party", appliesTo: ["43", "44"], sanitize: "digitsOnly", dataType: "number", maxLength: 1, mandatory: false, requiredWhen: "individual", inputType: "select", options: [
      { value: "", label: "Select" }, { value: "1", label: "Citizen" }, { value: "2", label: "Non-Citizen" }, { value: "3", label: "Permanent Resident" }
    ], allowedValues: ["1", "2", "3"] },
    { key: "icNo", label: "IC Number", xmlTag: "icNo", section: "party", appliesTo: ["43", "44"], sanitize: "digitsOnly", dataType: "varchar", maxLengthByType: { "43": 12, "44": 12 }, mandatory: false, requiredWhen: "individualCitizen" },
    { key: "pasportNo", label: "Passport Number", xmlTag: "pasportNo", section: "party", appliesTo: ["43", "44"], sanitize: "alphanumeric", dataType: "varchar", maxLength: 100, mandatory: false, requiredWhen: "individualNonCitizen" },
    { key: "pasportCountry", label: "Passport Country", xmlTag: "pasportCountry", section: "party", appliesTo: ["43", "44"], sanitize: "digitsOnly", dataType: "number", maxLength: 38, mandatory: false, requiredWhen: "individualNonCitizen" },
    { key: "rocNo", label: "Company Registration Number", xmlTag: "rocNo", section: "party", appliesTo: ["43", "44"], sanitize: "alphanumeric", dataType: "varchar", maxLength: 100, mandatory: false, requiredWhen: "company" },
    { key: "busType", label: "Business Type", xmlTag: "busType", section: "party", appliesTo: ["43", "44"], sanitize: "digitsOnly", dataType: "number", maxLength: 1, mandatory: false, inputType: "select", options: [
      { value: "", label: "Select" }, { value: "1", label: "Local" }, { value: "2", label: "Foreign" }
    ], allowedValues: ["1", "2"] },
    { key: "incomeTaxNo", label: "Income Tax Number / TIN", xmlTag: "incomeTaxNo", section: "party", appliesTo: ["43", "44"], sanitize: "textFlexible", dataType: "varchar", maxLength: 100, mandatory: false },
    { key: "incomeTaxBranch", label: "Income Tax Branch", xmlTag: "incomeTaxBranch", section: "party", appliesTo: ["43", "44"], sanitize: "digitsOnly", dataType: "number", maxLength: 3, mandatory: false },
    { key: "street1", label: "Address Line 1", xmlTag: "street1", section: "party", appliesTo: ["43", "44"], sanitize: "textFlexible", dataType: "varchar", maxLength: 4000, minLength: 3, mandatory: true },
    { key: "street2", label: "Address Line 2", xmlTag: "street2", section: "party", appliesTo: ["43", "44"], sanitize: "textFlexible", dataType: "varchar", maxLength: 100, minLength: 3, mandatory: true },
    { key: "street3", label: "Address Line 3", xmlTag: "street3", section: "party", appliesTo: ["43", "44"], sanitize: "textFlexible", dataType: "varchar", maxLength: 100, mandatory: false },
    { key: "postcode", label: "Postcode", xmlTag: "postcode", section: "party", appliesTo: ["43", "44"], sanitize: "textFlexible", dataType: "varchar", maxLength: 10, mandatory: true },
    { key: "city", label: "City", xmlTag: "city", section: "party", appliesTo: ["43", "44"], sanitize: "textFlexible", dataType: "varchar", maxLength: 50, mandatory: false },
    { key: "state", label: "State", xmlTag: "state", section: "party", appliesTo: ["43", "44"], sanitize: "digitsOnly", dataType: "number", maxLength: 2, mandatory: false },
    { key: "country", label: "Country", xmlTag: "country", section: "party", appliesTo: ["43", "44"], sanitize: "digitsOnly", dataType: "number", maxLength: 38, mandatory: false },
    { key: "telNo", label: "Telephone Number", xmlTag: "telNo", section: "party", appliesTo: ["43", "44"], sanitize: "phone", dataType: "varchar", maxLength: 20, mandatory: true },
    { key: "email", label: "Email", xmlTag: "email", section: "party", appliesTo: ["43", "44"], sanitize: "email", dataType: "email", maxLength: 100, mandatory: false }
  ];

  const instrumentFields = [
    { key: "refNo", label: "Applicant Reference Number", xmlTag: "refNo", section: "general", appliesTo: ["43", "44"], sanitize: "textFlexible", dataType: "varchar", maxLength: 100, mandatory: true },
    { key: "instrumentDate", label: "Instrument Date", xmlTag: "instrumentDate", section: "general", appliesTo: ["43", "44"], sanitize: "date", dataType: "date", maxLength: 10, mandatory: true, placeholder: "DD/MM/YYYY" },
    { key: "instrumentDateReceive", label: "Date Instrument Received in Malaysia", xmlTag: "instrumentDateReceive", section: "general", appliesTo: ["43", "44"], sanitize: "date", dataType: "date", maxLength: 10, mandatory: false, placeholder: "DD/MM/YYYY" },
    { key: "principal", label: "Principal / Subsidiary", xmlTag: "principal", section: "general", appliesTo: ["43"], sanitize: "textFlexible", dataType: "varchar", maxLength: 38, mandatory: true, inputType: "select", options: [
      { value: "", label: "Select" }, { value: "-1", label: "Principal" }, { value: "0", label: "Subsidiary" }
    ], allowedValues: ["-1", "0"] },
    { key: "subsidiary", label: "Principal Reference Number", xmlTag: "subsidiary", section: "general", appliesTo: ["43"], sanitize: "textFlexible", dataType: "varchar", maxLength: 38, mandatory: false },
    { key: "typeOfInstrument", label: "Type of Instrument", xmlTag: "typeOfInstrument", section: "general", appliesTo: ["43", "44"], sanitize: "digitsOnly", dataType: "number", maxLength: 38, mandatory: false },
    { key: "typeOfInstrumentOthers", label: "Type of Instrument Others / Agreement Title", xmlTag: "typeOfInstrumentOthers", section: "general", appliesTo: ["43", "44"], sanitize: "textFlexible", dataType: "varchar", maxLength: 100, mandatory: true },
    { key: "consideration", label: "Consideration / Loan Amount", xmlTag: "consideration", section: "instrument", appliesTo: ["43"], sanitize: "decimalNumber", dataType: "decimal", maxLength: 17, mandatory: true },
    { key: "duration", label: "Duration Can Be Determined", xmlTag: "duration", section: "instrument", appliesTo: ["43"], sanitize: "digitsOnly", dataType: "number", maxLength: 38, mandatory: false, inputType: "select", options: yesNoOptions, allowedValues: ["1", "2"] },
    { key: "durationDesc", label: "Duration Description", xmlTag: "durationDesc", section: "instrument", appliesTo: ["43"], sanitize: "textFlexible", dataType: "varchar", maxLength: 255, mandatory: false },
    { key: "colLand", label: "Collateral - Land / Building", xmlTag: "colLand", section: "instrument", appliesTo: ["43"], sanitize: "digitsOnly", dataType: "number", maxLength: 1, mandatory: false, inputType: "select", options: yesNoOptions, allowedValues: ["1", "2"] },
    { key: "colLandDesc", label: "Land / Building Collateral Description", xmlTag: "colLandDesc", section: "instrument", appliesTo: ["43"], sanitize: "textFlexible", dataType: "varchar", maxLength: 4000, mandatory: false },
    { key: "colShare", label: "Collateral - Shares", xmlTag: "colShare", section: "instrument", appliesTo: ["43"], sanitize: "digitsOnly", dataType: "number", maxLength: 1, mandatory: false, inputType: "select", options: yesNoOptions, allowedValues: ["1", "2"] },
    { key: "colDeposit", label: "Collateral - Fixed Deposit", xmlTag: "colDeposit", section: "instrument", appliesTo: ["43"], sanitize: "digitsOnly", dataType: "number", maxLength: 1, mandatory: false, inputType: "select", options: yesNoOptions, allowedValues: ["1", "2"] },
    { key: "colOthers", label: "Collateral - Others", xmlTag: "colOthers", section: "instrument", appliesTo: ["43"], sanitize: "digitsOnly", dataType: "number", maxLength: 1, mandatory: false, inputType: "select", options: yesNoOptions, allowedValues: ["1", "2"] },
    { key: "colOthersDesc", label: "Other Collateral Description", xmlTag: "colOthersDesc", section: "instrument", appliesTo: ["43"], sanitize: "textFlexible", dataType: "varchar", maxLength: 4000, mandatory: false },
    { key: "noOfCopy", label: "Number of Copies", xmlTag: "noOfCopy", section: "instrument", appliesTo: ["43", "44"], sanitize: "digitsOnly", dataType: "number", maxLengthByType: { "43": 20, "44": 38 }, mandatory: false },
    { key: "exemption", label: "Exemption", xmlTag: "exemption", section: "exemption", appliesTo: ["43"], sanitize: "textFlexible", dataType: "varchar", maxLength: 30, mandatory: false },
    { key: "exemptionOthers", label: "Other Exemption", xmlTag: "exemptionOthers", section: "exemption", appliesTo: ["43"], sanitize: "textFlexible", dataType: "varchar", maxLength: 100, mandatory: false },
    { key: "remession", label: "Remission", xmlTag: "remession", section: "exemption", appliesTo: ["43"], sanitize: "textFlexible", dataType: "varchar", maxLength: 30, mandatory: false },
    { key: "remessionOthers", label: "Other Remission", xmlTag: "remessionOthers", section: "exemption", appliesTo: ["43"], sanitize: "textFlexible", dataType: "varchar", maxLength: 100, mandatory: false },
    { key: "remessionOrExemption", label: "Remission or Exemption", xmlTag: "remessionOrExemption", section: "exemption", appliesTo: ["44"], sanitize: "textFlexible", dataType: "varchar", maxLength: 100, mandatory: false },
    { key: "payment", label: "Payment / Consideration Amount", xmlTag: "payment", section: "instrument", appliesTo: ["44"], sanitize: "decimalNumber", dataType: "decimal", maxLength: 38, mandatory: false },
    { key: "aggrementInfo", label: "Agreement Information", xmlTag: "aggrementInfo", section: "instrument", appliesTo: ["44"], sanitize: "textFlexible", dataType: "varchar", maxLength: 500, mandatory: true, inputType: "textarea" }
  ];

  const xmlOrder = {
    "43": ["refNo", "instrumentDate", "instrumentDateReceive", "principal", "subsidiary", "typeOfInstrument", "typeOfInstrumentOthers", "transferor", "transferee", "consideration", "duration", "durationDesc", "colLand", "colLandDesc", "colShare", "colDeposit", "colOthers", "colOthersDesc", "noOfCopy", "exemption", "exemptionOthers", "remession", "remessionOthers", "attachment"],
    "44": ["refNo", "instrumentDate", "instrumentDateReceive", "typeOfInstrument", "typeOfInstrumentOthers", "transferor", "transferee", "noOfCopy", "remessionOrExemption", "payment", "aggrementInfo", "attachment"]
  };

  function getFieldsForApplication(applicationType, section) {
    return instrumentFields.filter((field) => field.appliesTo.includes(applicationType) && (!section || field.section === section));
  }

  function getFieldMaxLength(field, applicationType) {
    return field.maxLengthByType ? field.maxLengthByType[applicationType] : field.maxLength;
  }

  return {
    APPLICATION_TYPES,
    partyFields,
    instrumentFields,
    xmlOrder,
    getFieldsForApplication,
    getFieldMaxLength
  };
})();
