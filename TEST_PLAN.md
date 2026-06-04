# e-Duti XML Generator Test Plan

## Scope

Test only these completed-app areas:

- Failed input handling
- Real-time input sanitization
- Sanitization hints through non-blocking toasts
- Field warnings below inputs
- Validation errors with field highlighting
- Real-time Compliance Status updates
- XML generation blocking when input is invalid
- XML preview/download invalidation after changes
- Attachment validation
- XML generation and XML parsing with `DOMParser`

No backend, npm, framework, database, storage, hosting, modal dialog, `alert()`, or `confirm()` testing is in scope.

## Where To Execute Tests

- Automated browser tests: open `app/test.html` directly in a browser.
- Browser-console rerun: after opening `app/test.html`, run `window.runEDutiTests()`.
- Manual workflow tests: open `app/index.html` directly in a browser.

`app/test.html` is a browser-native harness. It runs on page load, displays pass/fail results, loads the static app scripts, and uses a hidden DOM fixture for app feedback tests. It does not use external browser automation.

## Three-Level Feedback Expectations

| Level | Purpose | Expected Behavior |
| --- | --- | --- |
| Level 1 Sanitization Hint | Tell the user invalid characters were removed | Top-right toast, non-blocking, auto-dismiss after 3 seconds, manual close, no duplicate spam within 2 seconds |
| Level 2 Field Warning | Warn before validation fails | Warning text below field, does not block XML generation by itself |
| Level 3 Validation Error | Block invalid XML generation | Red field border, error text below field, Compliance Status failure, XML preview/download unavailable |

## Expected Toast Messages

| Field type | Trigger | Toast message |
| --- | --- | --- |
| Numeric / digits-only | Letters or symbols removed | Only numbers are allowed. Invalid characters were removed. |
| Decimal | Currency symbols, commas, letters, or extra decimal points removed | Only decimal numbers are allowed. Invalid characters were removed. |
| Date | Letters, dashes, or unsupported characters removed | Use date format DD/MM/YYYY. |
| Phone | Unsupported phone characters removed | Only phone number characters are allowed. |
| Alphanumeric | Symbols removed | Only letters and numbers are allowed. |
| Flexible text | Control characters or unsupported symbols removed | Unsupported characters were removed. |
| Changed form after preview | Any field/attachment/party changes after XML preview | Form changed. XML preview must be regenerated. |

Toast requirements:

- Position: top-right.
- Types: `info`, `warning`, `error`, `success`.
- Auto-dismiss: 3 seconds.
- Manual close button exists.
- Same message repeated within 2 seconds updates the existing toast instead of creating duplicates.
- Does not block typing and does not replace inline validation errors.


## Non-Repetitive Field Messaging Rules

Each field must display at most one guidance message below the input at a time:

1. Error message if validation fails.
2. Warning message if near/exceeding a limit and no validation error is present.
3. Helper text only if no error or warning is present.

Required field labels must stay clean and may use only a red `*` indicator. They must not append the word `required` to label text.

Max-length display rules:

- Do not show both `Max X characters` and `Maximum length: X characters.` together.
- Do not show max-length warning by default.
- Show helper text such as `Max 100 characters` only when no error/warning exists.
- Show near-limit warning such as `Approaching maximum length: 90/100 characters.` at 90% or more of max length.
- Show validation error such as `Applicant Reference Number must not exceed 100 characters.` when over max length.

## Reactive Compliance Status Rules

Compliance Status must be rebuilt from the current validation result only.

- Do not cache old errors.
- Do not append errors repeatedly.
- Do not show resolved issues.
- Render only active problems from `getComplianceIssues()`.
- Re-run validation on `input`, `change`, and `blur` without requiring Preview XML.
- When valid, show ready state with completed fields, attachments validated, and XML structure ready.
## Automated Test Cases

Run these in `app/test.html`.

| ID | Area | Test | Expected Result | Status |
| --- | --- | --- | --- | --- |
| AUTO-COMP-001 | Reactive compliance | Fill Applicant Reference Number | Applicant Reference Number missing disappears immediately | Added, pending browser run |
| AUTO-COMP-002 | Reactive compliance | Fill Instrument Date | Instrument Date missing disappears immediately | Added, pending browser run |
| AUTO-COMP-003 | Reactive compliance | Clear Instrument Date again | Instrument Date missing reappears immediately | Added, pending browser run |
| AUTO-COMP-004 | Reactive compliance | Complete all required fields | Missing warnings disappear and ready state appears | Added, pending browser run |
| AUTO-COMP-005 | Reactive compliance | Invalidate one completed field | Current warning returns immediately | Added, pending browser run |
| AUTO-MSG-001 | Non-repetitive messaging | Required label rendering | Label shows clean text plus *, not the word required | Added, pending browser run |
| AUTO-MSG-002 | Non-repetitive messaging | Field message structure | Field renders one `.field-message` and no duplicate `.hint`, `.field-warning`, `.field-error` elements | Added, pending browser run |
| AUTO-MSG-003 | Non-repetitive messaging | Empty required field | Required error appears alone and suppresses max helper/warning | Added, pending browser run |
| AUTO-MSG-004 | Non-repetitive messaging | Valid short value | Helper text `Max 100 characters` appears without warning/error | Added, pending browser run |
| AUTO-MSG-005 | Non-repetitive messaging | Value at 90% max length | Near-limit warning replaces helper | Added, pending browser run |
| AUTO-MSG-006 | Non-repetitive messaging | Value over max length | Over-limit validation error appears alone | Added, pending browser run |
| AUTO-FB-001 | Toast messages | Sanitization message mapping for numeric, decimal, date, phone, alphanumeric, text | Exact English messages returned | Added, pending browser run |
| AUTO-FB-002 | Toast deduplication | Create same toast twice within dedupe window | One toast remains; type class is applied | Added, pending browser run |
| AUTO-RT-001 | Real-time numeric input | Enter `ABC123@#` in numeric fixture field | Value becomes `123`, toast appears, Compliance Status shows XML unavailable | Added, pending browser run |
| AUTO-RT-002 | Real-time date input | Enter `01-03-2026abc` in Instrument Date | Value becomes `01032026`, toast appears, inline date error appears, download disabled | Added, pending browser run |
| AUTO-RT-003 | Preview invalidation | Set preview/download as ready, then change numeric field | Preview clears, Download XML disables, regeneration toast appears | Added, pending browser run |
| AUTO-SAN-001 | Sanitization | `digitsOnly` receives `ABC123@#` | Returns `123` | Added, pending browser run |
| AUTO-SAN-002 | Sanitization | `decimalNumber` receives `RM 1,200.50abc` and `12.3.4` | Returns `1200.50` and `12.34` | Added, pending browser run |
| AUTO-SAN-003 | Sanitization | `date` receives `01-03-2026abc` | Returns `01032026`; validation still rejects non-`DD/MM/YYYY` date | Added, pending browser run |
| AUTO-SAN-004 | Sanitization | `phone` receives `+60 (12) abc-999` | Returns `+60 12 -999` | Added, pending browser run |
| AUTO-SAN-005 | Sanitization | `alphanumeric` receives `AB-123@#` | Returns `AB123` | Added, pending browser run |
| AUTO-SAN-006 | Sanitization | `textFlexible` receives unsafe/control characters and valid legal punctuation | Removes unsafe characters and preserves valid punctuation | Added, pending browser run |
| AUTO-VAL-001 | Validation | Valid application type `43` data | Validation passes | Added, pending browser run |
| AUTO-VAL-002 | Validation | Valid application type `44` data | Validation passes | Added, pending browser run |
| AUTO-VAL-003 | Validation | Missing required `refNo` | Validation fails | Added, pending browser run |
| AUTO-VAL-004 | Validation | Invalid date format and invalid calendar date | Validation fails | Added, pending browser run |
| AUTO-VAL-005 | Validation | Decimal with more than two decimal places | Validation fails | Added, pending browser run |
| AUTO-COND-001 | Conditional mandatory | Individual Citizen, Non-Citizen, and Company missing conditional fields | Validation fails with required-field errors | Added, pending browser run |
| AUTO-ATT-001 | Attachment handling | Allowed PDF attachment | Accepted and Base64 encoded | Added, pending browser run |
| AUTO-ATT-002 | Attachment handling | Unsupported `.exe` attachment | Rejected | Added, pending browser run |
| AUTO-ATT-003 | Attachment handling | Uppercase/lowercase allowed extensions | Accepted | Added, pending browser run |
| AUTO-XML-001 | XML generation | Type `43` structure/order/blanks/repeated parties | Expected XML generated | Added, pending browser run |
| AUTO-XML-002 | XML generation | Type `44` structure/order/blanks/repeated parties | Expected XML generated | Added, pending browser run |
| AUTO-XML-003 | XML escaping | Text and attachment filename special characters | Values and attributes escaped | Added, pending browser run |
| AUTO-XML-004 | DOMParser | Generated type `43` XML parses | Well formed with `bulkstamping` root | Added, pending browser run |
| AUTO-XML-005 | DOMParser | Generated type `44` XML parses | Well formed with `bulkstamping` root | Added, pending browser run |
| AUTO-DL-001 | Download output | Fixed timestamp filename | Returns `eduti_20260604_103005.xml` | Added, pending browser run |

## Manual Real-Time Feedback Tests

Run these in `app/index.html`.

| ID | Area | Steps | Expected Result | Status |
| --- | --- | --- | --- | --- |
| MAN-COMP-001 | Reactive compliance | Complete a required field | Its compliance warning disappears instantly | Remaining manual check |
| MAN-COMP-002 | Reactive compliance | Clear a previously valid required field | Its compliance warning returns instantly | Remaining manual check |
| MAN-COMP-003 | Reactive compliance | Complete all required fields and add attachment | Compliance panel shows ready state | Remaining manual check |
| MAN-MSG-001 | Clean labels | Inspect required fields such as Applicant Reference Number and Instrument Date | Label uses clean text plus *, not the word required | Remaining manual check |
| MAN-MSG-002 | Single guidance message | Inspect any field while empty, valid, near limit, and over limit | Only one helper/warning/error message appears below the input | Remaining manual check |
| MAN-MSG-003 | Max helper | Enter a valid short reference number | Shows `Max 100 characters` and no warning/error | Remaining manual check |
| MAN-MSG-004 | Near-limit warning | Enter 90 characters in Applicant Reference Number | Shows `Approaching maximum length: 90/100 characters.` only | Remaining manual check |
| MAN-MSG-005 | Over-limit error | Enter more than 100 characters in Applicant Reference Number | Shows "Applicant Reference Number must not exceed 100 characters." only and red border | Remaining manual check |
| MAN-RT-001 | Numeric field | Type "ABC123@#" into Type of Instrument, State, Country, or Income Tax Branch | Invalid chars removed, value keeps digits, numeric toast appears, Compliance Status updates | Remaining manual check |
| MAN-RT-002 | Decimal field | Type `RM 1,200.50abc` into Consideration or Payment | Value becomes decimal candidate, decimal toast appears | Remaining manual check |
| MAN-RT-003 | Date field | Type `01-03-2026abc`, then `31/02/2026` | Unsupported chars removed; date toast appears; invalid final date shows inline error and blocks XML | Remaining manual check |
| MAN-RT-004 | Phone field | Type `+60 (12) abc-999` into Telephone Number | Unsupported chars removed, phone toast appears | Remaining manual check |
| MAN-RT-005 | Alphanumeric field | Type `AB-123@#` into Passport Number or Company Registration Number | Symbols removed, alphanumeric toast appears | Remaining manual check |
| MAN-RT-006 | Text field | Paste control/unsafe symbols into name, address, or agreement fields | Unsafe chars removed, valid legal punctuation preserved, text toast appears | Remaining manual check |
| MAN-RT-007 | Field warnings | Enter short IC, over-length telephone number, or inspect fields with max length | Warning text appears below field without blocking by itself | Remaining manual check |
| MAN-RT-008 | Validation errors | Leave required fields blank or select Non-Citizen without Passport Country | Red border and inline error appear in real time; Compliance Status shows unavailable | Remaining manual check |
| MAN-RT-009 | Preview invalidation | Generate XML preview, then change any field | Preview clears, Download XML disables, regeneration toast appears | Remaining manual check |
| MAN-RT-010 | Toast behavior | Trigger same sanitization repeatedly within 2 seconds | Existing toast refreshes instead of duplicate spam | Remaining manual check |
| MAN-RT-011 | Toast close/dismiss | Trigger info/warning/error/success toasts | Toasts stack top-right, auto-dismiss after 3 seconds, close button works | Remaining manual check |
| MAN-ATT-001 | Attachment warning | Open page with no attachment, then upload unsupported file | Attachment warning/error appears; Compliance Status shows attachment missing | Remaining manual check |

## Execution Results

- `app/test.html` has been updated as a complete in-browser test harness.
- Browser tests were not run from this terminal because the user requested no browser automation and no browser runtime is available through the shell.
- Failed tests observed in this environment: none, because tests require opening `app/test.html` in a browser.
- Expected pass/fail status before browser run: pending browser execution.

## Files Changed

- `app/app.js`: implemented real-time sanitization feedback, single-slot field guidance, validation errors, current-state Compliance Status via `getComplianceIssues()`, toast deduplication, and preview/download invalidation.
- `app/styles.css`: added field warning styling, red validation borders, top-right toast positioning, and toast type variants.
- `app/test.html`: added browser-native feedback, toast, compliance, sanitizer, validation, attachment, XML, and DOMParser tests.
- `TEST_PLAN.md`: updated test cases, expected messages, pass/fail status, and manual checks.

## Success Criteria

- Users receive immediate feedback while typing.
- Each field shows at most one helper, warning, or error message at a time.
- Required labels stay clean and use "*" instead of appending "required".
- Sanitization toasts appear only when input is changed by sanitization.
- Field warnings and validation errors appear below fields.
- Validation errors prevent XML preview and download.
- Compliance Status reflects current validity in real time and never keeps historical errors.
- XML preview/download are invalidated after any later form change.
- No blocking modal, alert(), or confirm() is used.


