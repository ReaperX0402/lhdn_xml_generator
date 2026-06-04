# e-Duti XML Generator Test Plan

## Scope

Test only these completed-app areas:

- Input sanitization
- Validation rules
- Conditional mandatory rules
- Attachment validation
- XML generation correctness
- XML escaping
- XML download output

Do not test hosting, backend behavior, persistence, authentication, database, APIs, frameworks, or redesign concerns. This app is static and should be tested by opening local HTML files directly in a browser.

## Where To Execute Tests

- Automated browser tests: open `app/test.html` directly in a browser. These tests execute `field-config.js`, `sanitizer.js`, `validation.js`, `file-handler.js`, `xml-generator.js`, and one iframe-based `app/index.html` UI regression check.
- Browser-console runnable tests: after opening `app/test.html`, run `window.runEDutiTests()` in the browser console to rerun the same automated suite.
- Manual workflow tests: open `app/index.html` directly in a browser. Use this for visual field messages, attachment picker behavior, XML preview, and actual download confirmation.
- Source areas under test:
  - Sanitization: `app/sanitizer.js`
  - Field rules and XML order: `app/field-config.js`
  - Validation and conditional mandatory rules: `app/validation.js`
  - Attachment extension/Base64 handling: `app/file-handler.js`, triggered through `app/app.js` `handleAttachments()`
  - XML structure and escaping: `app/xml-generator.js`
  - Preview and download invalidation/output: `app/app.js` `previewXml()`, `downloadXml()`, field input handlers, and party removal handlers

## Automated Test Cases

Run these in `app/test.html`.

| ID | Area | Test | Expected Result | Status |
| --- | --- | --- | --- | --- |
| AUTO-SAN-001 | Sanitization | `digitsOnly` receives `IC-9012 A` | Returns `9012` | Added |
| AUTO-SAN-002 | Sanitization | `decimalNumber` receives `RM 12.3.4x` | Returns `12.34` | Added |
| AUTO-SAN-003 | Sanitization | `alphanumeric` receives `AB-12 @z` | Returns `AB12z` | Added |
| AUTO-SAN-004 | Sanitization | `phone` receives `+60 (12) abc-999` | Returns `+60 12 -999` after unsupported characters are removed | Added |
| AUTO-SAN-005 | Sanitization | `date` receives `01-02/2026abc` | Returns `0102/2026` with only digits and slash | Added |
| AUTO-SAN-006 | Sanitization | `email` receives whitespace and control characters | Trims whitespace and removes control characters | Added |
| AUTO-SAN-007 | Sanitization | `textFlexible` receives control characters and unsupported symbols | Removes control characters and unsupported symbols | Added |
| AUTO-SAN-008 | Sanitization | `textFlexible` receives valid legal/address punctuation | Preserves `. , ' " ( ) - _ / & : @ # % +` characters | Added |
| AUTO-VAL-001 | Validation | Valid application type `43` with one valid transferor, transferee, and attachment | Validation passes | Added |
| AUTO-VAL-002 | Validation | Missing required `refNo` | Validation fails with Applicant Reference Number required | Added |
| AUTO-VAL-003 | Validation | Invalid date `31/02/2026` | Validation fails with DD/MM/YYYY date error | Added |
| AUTO-VAL-004 | Validation | Decimal with three decimal places | Validation fails with decimal precision error | Added |
| AUTO-VAL-005 | Validation | Over-length telephone number after sanitization | Validation fails with Telephone Number exceeds 20 characters | Added |
| AUTO-COND-001 | Conditional mandatory | Individual Citizen without `icNo` | Validation fails with IC Number required | Added |
| AUTO-COND-002 | Conditional mandatory | Individual Non-Citizen without passport fields | Validation fails with Passport Number and Passport Country required | Added |
| AUTO-COND-003 | Conditional mandatory | Company without `rocNo` | Validation fails with Company Registration Number required | Added |
| AUTO-ATT-001 | Attachment validation | File name `sample.pdf` | Accepted and converted to Base64 | Added |
| AUTO-ATT-002 | Attachment validation | File name `sample.exe` | Rejected with allowed file type error | Added |
| AUTO-ATT-003 | Attachment validation | File names `upper.PDF`, `mixed.JpEg`, and `lower.png` | Uppercase/lowercase allowed extensions are accepted | Added |
| AUTO-XML-001 | XML structure | Generate application type `43` XML | Contains XML declaration, root, application type, party nodes, attachment, and parses with `DOMParser` | Added |
| AUTO-XML-002 | XML structure | Generate application type `44` XML | Contains `remessionOrExemption`, `payment`, `aggrementInfo`, and parses with `DOMParser` | Added |
| AUTO-XML-003 | XML tag order | Application type `43` XML tags are generated in specification order | Tags appear in the expected PDF/reference order | Added |
| AUTO-XML-004 | XML tag order | Application type `44` XML tags are generated in specification order | Tags appear in the expected PDF/reference order | Added |
| AUTO-XML-005 | Repeated nodes | Application type `43` with two transferors and two transferees | Generates two `<transferor>` and two `<transferee>` nodes | Added |
| AUTO-XML-006 | Repeated nodes | Application type `44` with two transferors and two transferees | Generates two `<transferor>` and two `<transferee>` nodes | Added |
| AUTO-XML-007 | Blank optional nodes | Application type `43` optional blanks | Generates blank tags for optional Sekuriti fields | Added |
| AUTO-XML-008 | Blank optional nodes | Application type `44` optional blanks | Generates blank tags for optional Am fields | Added |
| AUTO-XML-009 | XML escaping | Text values and attachment filenames contain XML special characters | XML escapes text and attribute values and remains well formed | Added |
| AUTO-DL-001 | Download naming | Build name for `2026-06-04 10:30:05` | Returns `eduti_20260604_103005.xml` | Added |
| AUTO-DL-002 | Download invalidation | Generate valid preview in an iframe, then change a form field | Download button is disabled and preview is cleared | Added |

## Manual Test Cases

Run these in `app/index.html`.

| ID | Area | Steps | Expected Result | Status |
| --- | --- | --- | --- | --- |
| MAN-SAN-001 | Input sanitization | Type letters into IC Number, State, Country, Income Tax Branch, and Type of Instrument | Non-digit characters are removed from digit-only fields | Remaining manual check |
| MAN-SAN-002 | Input sanitization | Type currency symbols and letters into Consideration or Payment | Only digits and one decimal point remain | Remaining manual check |
| MAN-SAN-003 | Input sanitization | Type unsupported symbols/control-like pasted content into names/address/agreement fields | Unsupported characters are removed before validation/preview | Remaining manual check |
| MAN-VAL-001 | Validation messages | Leave required fields blank and click Preview XML | Field-level messages appear beside fields; no alert boxes appear | Remaining manual check |
| MAN-VAL-002 | Validation messages | Enter `31/02/2026` as Instrument Date and click Preview XML | Date validation message appears and XML preview stays blank | Remaining manual check |
| MAN-VAL-003 | Validation messages | Enter invalid email and click Preview XML | Email validation message appears only when email is provided | Remaining manual check |
| MAN-COND-001 | Conditional mandatory | Set a party as Individual + Citizen, leave IC blank, click Preview XML | IC Number required message appears | Remaining manual check |
| MAN-COND-002 | Conditional mandatory | Set a party as Individual + Non-Citizen, leave Passport Number/Country blank, click Preview XML | Passport Number and Passport Country required messages appear | Remaining manual check |
| MAN-COND-003 | Conditional mandatory | Set a party as Company, leave Company Registration Number blank, click Preview XML | Company Registration Number required message appears | Remaining manual check |
| MAN-ATT-001 | Attachment validation | Click Upload Attachment and select a `.exe` file | File is rejected with allowed file type message | Remaining manual check |
| MAN-ATT-002 | Attachment validation | Click Preview XML without attachments | At least one attachment is required and XML generation unavailable | Remaining manual check |
| MAN-ATT-003 | Attachment validation | Upload a file larger than 5 MB with an allowed extension | Warning appears, but validation can still pass | Remaining manual check |
| MAN-XML-001 | XML generation | Complete valid Penyeteman Sekuriti form, add attachment, click Preview XML | Preview contains application type `43` XML in the configured PDF order | Remaining manual check |
| MAN-XML-002 | XML generation | Switch to Penyeteman Am, complete valid form, add attachment, click Preview XML | Preview contains application type `44` XML with `aggrementInfo` spelling | Remaining manual check |
| MAN-XML-003 | XML escaping | Enter allowed special characters such as `&`, `"`, and `'` in text fields and preview XML | Preview XML escapes those characters and remains well formed; angle brackets are removed by sanitizer before XML generation | Remaining manual check |
| MAN-DL-001 | XML download | After valid preview, click Download XML | Browser downloads an `.xml` file named `eduti_YYYYMMDD_HHMMSS.xml` | Remaining manual check |
| MAN-DL-002 | XML download output | Open the downloaded XML file in a text editor | File content matches the preview text exactly | Remaining manual check |
| MAN-DL-003 | Download guard | Make the form invalid after a valid preview, then try to download | Download button is disabled until validation passes again | Covered by AUTO-DL-002 plus remaining manual check |

## Execution Results

- `app/test.html` was inspected and extended with the requested missing tests.
- Automated execution from this terminal was not possible because `node`, `msedge`, and `chrome` are not available on PATH in this environment.
- Browser-console runnable entry point has been added: open `app/test.html` and run `window.runEDutiTests()`.
- Failed tests observed in this environment: none, because the browser suite could not be executed from the terminal.

## Fixed Bugs

- `app/sanitizer.js`: fixed previous max-length validation bypass by no longer truncating sanitized values before validation. Validation now reports over-length sanitized values.
- `app/app.js`: fixed download invalidation when removing a Transferor or Transferee. Removing a party now clears preview state and disables the Download XML button.

## Acceptance Criteria

- `app/test.html` shows all automated tests passing when opened in a browser.
- Manual tests produce only English UI messages.
- XML preview is generated only after validation passes.
- Downloaded XML matches preview output and uses the required filename format.
- Lampiran lookup validation is not enforced; Lampiran-related fields are validated only by required condition, data type, and length.
