Warning: truncated output (original token count: 47087)
Total output lines: 4354

"use strict";

const STORAGE_DATA = "glacksRosterData";
const STORAGE_SETUP = "glacksRosterSetup";
const STORAGE_PROFILES = "heguiRosterProfiles";
const STORAGE_ACTIVE_PROFILE = "heguiActiveProfile";
const STORAGE_ACT_PUBLIC_HOLIDAYS =
    "heguiShowActPublicHolidays";
const STORAGE_ACT_SCHOOL_HOLIDAYS =
    "heguiShowActSchoolHolidays";
const STORAGE_NSW_PUBLIC_HOLIDAYS = "heguiShowNswPublicHolidays";
const STORAGE_NSW_SCHOOL_HOLIDAYS = "heguiShowNswSchoolHolidays";
const STORAGE_CASUAL_SHIFTS = "heguiCasualShifts";
const STORAGE_PERMANENT_CHANGES = "heguiPermanentChanges";
const STORAGE_ADDED_SHIFTS = "heguiAddedShiftsV20";
const STORAGE_SHOW_STARTUP_SPLASH = "heguiShowStartupSplash";
const STORAGE_PERSONAL_CALENDAR = "heguiPersonalCalendar";
const STORAGE_PERSONAL_CALENDAR_CACHE = "heguiPersonalCalendarCacheV27";
const STORAGE_PLANNER_EVENTS = "heguiPlannerEventsV1";
const STORAGE_DISPLAY_THEME = "heguiDisplayTheme";
const STORAGE_UNLOCKED_FINAL_SHIFTS = "heguiUnlockedFinalShiftsAlphaV27";
const STORAGE_WEEK_PANEL_HIDDEN = "heguiWeekPanelHidden";
const STORAGE_APP_HEARTED = "heguiAppHeartedV29";
const STORAGE_NOTIFICATIONS_ENABLED = "heguiNotificationsEnabledV1";
// Set this to the deployed Cloudflare Worker URL for private ICS feeds.
// Keep the user's secret ICS address out of the URL/query string: the app sends it in a POST body.
const PERSONAL_CALENDAR_PROXY_URL = "https://hegui-calendar.45james-black.workers.dev";
const PAY_PERIOD_ANCHOR_START = "2026-07-16";
const PAY_PERIOD_LENGTH_DAYS = 14;

const DEFAULT_PROFILE_NAMES = [
    "He Gui",
    "Her Gui",
    "3rd Wheel"
];

let rosters = [];
let shiftCodes = [];
let profiles = [];
let activeProfileIndex = 0;
let setup = null;
let selectedDate = startOfDay(new Date());
let showActPublicHolidays = true;
let showActSchoolHolidays = false;
let showNswPublicHolidays = false;
let showNswSchoolHolidays = false;
let personalCalendarEvents = [];
let editingAddedShiftId = null;
const startupSplashStartedAt = Date.now();

const setupScreen = document.querySelector("#setup-screen");
const homeScreen = document.querySelector("#home-screen");
const rosterSelect = document.querySelector("#roster-select");
const rosterDayInput = document.querySelector("#roster-day");
const rosterDayHelpCheckbox = document.querySelector("#roster-day-help-checkbox");
const rosterDayHelper = document.querySelector("#roster-day-helper");
const rosterHelperRows = document.querySelector("#roster-helper-rows");
const rosterHelperWeeks = document.querySelector("#roster-helper-weeks");
const rosterHelperResult = document.querySelector("#roster-helper-result");
let helperRosterRow = null;
let helperRosterColumn = null;
const plannerType = document.querySelector("#planner-type");
const permanentSetupFields = document.querySelector("#permanent-setup-fields");
const profileTabs = document.querySelector("#profile-tabs");
const profileNameButton = document.querySelector("#profile-name-button");
const appHeartButton = document.querySelector("#app-heart-button");
const settingsButton = document.querySelector("#settings-button");
const extrasButton = document.querySelector("#extras-button");
const supportFormButton = document.querySelector("#support-form-button");
const shareAppButton = document.querySelector("#share-app-button");
const settingsPage = document.querySelector("#settings-page");
const extrasPage = document.querySelector("#extras-page");
const closeSettings = document.querySelector("#close-settings");
const startupSplash = document.querySelector("#startup-splash");
const showStartupSplashCheckbox = document.querySelector("#show-startup-splash");
const closeExtras = document.querySelector("#close-extras");
const actPublicHolidaysCheckbox =
    document.querySelector("#act-public-holidays-checkbox");
const actSchoolHolidaysCheckbox =
    document.querySelector("#act-school-holidays-checkbox");
const nswPublicHolidaysCheckbox = document.querySelector("#nsw-public-holidays-checkbox");
const nswSchoolHolidaysCheckbox = document.querySelector("#nsw-school-holidays-checkbox");
const todayLabel = document.querySelector("#today-label");
const todayDate = document.querySelector("#today-date");
const publicHoliday = document.querySelector("#public-holiday");
const shiftCode = document.querySelector("#shift-code");
const shiftTime = document.querySelector("#shift-time");
const rosterName = document.querySelector("#roster-name");
const rosterPosition = document.querySelector("#roster-position");
const weekList = document.querySelector("#week-list");
const weekSection = document.querySelector("#week-section");
const hideWeekButton = document.querySelector("#hide-week-button");
const showWeekButton = document.querySelector("#show-week-button");
const editedDot = document.querySelector("#edited-dot");
const addEditShiftButton = document.querySelector("#add-edit-shift");
const editShiftsListButton = document.querySelector("#edit-shifts-list");
const deleteShiftButton = document.querySelector("#delete-shift");
const currentMonthButton = document.querySelector("#current-month");
const deleteCasualEditorButton = document.querySelector("#delete-casual-editor");
const printRosterButton = document.querySelector("#print-roster");
const casualShiftPage = document.querySelector("#casual-shift-page");
const casualShiftTitle = document.querySelector("#casual-shift-title");
const casualShiftDate = document.querySelector("#casual-shift-date");
const casualShiftCode = document.querySelector("#casual-shift-code");
const casualStartTime = document.querySelector("#casual-start-time");
const casualFinishTime = document.querySelector("#casual-finish-time");
const casualBreak = document.querySelector("#casual-break");
const casualArea = document.querySelector("#casual-area");
const casualNotes = document.querySelector("#casual-notes");
const payPeriodSummary = document.querySelector("#pay-period-summary");
const shiftCard = document.querySelector(".shift-card");
const manageFinalisedShiftsButton = document.querySelector("#manage-finalised-shifts");
const personalCalendarName = document.querySelector("#personal-calendar-name");
const personalCalendarUrl = document.querySelector("#personal-calendar-url");
const personalCalendarEnabled = document.querySelector("#personal-calendar-enabled");
const savePersonalCalendarButton = document.querySelector("#save-personal-calendar");
const removePersonalCalendarButton = document.querySelector("#remove-personal-calendar");
const personalCalendarStatus = document.querySelector("#personal-calendar-status");
const displayTheme = document.querySelector("#display-theme");
const notificationsCheckbox = document.querySelector("#notifications-checkbox");
const notificationsStatus = document.querySelector("#notifications-status");
const payPeriodDates = document.querySelector("#pay-period-dates");
const paydayDate = document.querySelector("#payday-date");
const payPeriodHours = document.querySelector("#pay-period-hours");
const rosterActionButtons = document.querySelector("#roster-action-buttons");
const addChangeApplicationButton = document.querySelector("#add-change-application");
const changeActionPage = document.querySelector("#change-action-page");
const leaveTypePage = document.querySelector("#leave-type-page");
const chooseLeaveButton = document.querySelector("#choose-leave");
const chooseIndividualSwapButton = document.querySelector("#choose-individual-swap");
const chooseColleagueSwapButton = document.querySelector("#choose-colleague-swap");
const chooseExtraHoursButton = document.querySelector("#choose-extra-hours");
const chooseEditShiftsButton = document.querySelector("#choose-edit-shifts");
const chooseManagementChangeButton = document.querySelector("#choose-management-change");
const deleteSwapGlobalButton = document.querySelector("#delete-swap-global");
const deleteAddedShiftGlobalButton = document.querySelector("#delete-added-shift-global");
const savePermanentChangeAddAnotherButton = document.querySelector("#save-permanent-change-add-another");
const saveCasualShiftAddAnotherButton = document.querySelector("#save-casual-shift-add-another");
const deleteManagementGlobalButton = document.querySelector("#delete-management-global");
const deleteRecordPage = document.querySelector("#delete-record-page");
const deleteRecordTitle = document.querySelector("#delete-record-title");
const deleteRecordList = document.querySelector("#delete-record-list");
const rosterCalendarPage = document.querySelector("#roster-calendar-page");
const rosterCalendarTitle = document.querySelector("#roster-calendar-title");
const rosterCalendarInstructions = document.querySelector("#roster-calendar-instructions");
const rosterCalendarMonth = document.querySelector("#calendar-month");
const rosterCalendarGrid = document.querySelector("#roster-calendar-grid");
const calendarSelectionSummary = document.querySelector("#calendar-selection-summary");
const calendarOk = document.querySelector("#calendar-ok");
const changeDateSummary = document.querySelector("#change-date-summary");
const permanentChangePage = document.querySelector("#permanent-change-page");
const permanentChangeType = document.querySelector("#permanent-change-type");
const editChangeDatesButton = document.querySelector("#edit-change-dates");
const leaveTypeField = document.querySelector("#leave-type-field");
const leaveType = document.querySelector("#leave-type");
const swapTypeField = document.querySelector("#swap-type-field");
const swapType = document.querySelector("#swap-type");
const permanentShiftFields = document.querySelector("#permanent-shift-fields");
const permanentShiftCode = document.querySelector("#permanent-shift-code");
const permanentStartTime = document.querySelector("#permanent-start-time");
const permanentFinishTime = document.querySelector("#permanent-finish-time");
const permanentBreak = document.querySelector("#permanent-break");
const swapDateField = document.querySelector("#swap-date-field");
const swapDayOffDate = document.querySelector("#swap-day-off-date");
const calendarSameDayOption = document.querySelector("#calendar-same-day-option");
const calendarSameDaySwap = document.querySelector("#calendar-same-day-swap");
const permanentChangeNotes = document.querySelector("#permanent-change-notes");
const permanentAutoAdjustMarkers = document.querySelector("#permanent-auto-adjust-markers");
const casualAutoAdjustMarkers = document.querySelector("#casual-auto-adjust-markers");

const availabilityTestPage = document.querySelector("#availability-test-page");
const availabilityTestGrid = document.querySelector("#availability-test-grid");
const openAvailabilityTestButton = document.querySelector("#open-availability-test");
const closeAvailabilityTestButton = document.querySelector("#close-availability-test");
const printAvailabilityButton = document.querySelector("#print-availability");
const availabilityMarkAvailableButton = document.querySelector("#availability-mark-available");
const availabilityMarkUnavailableButton = document.querySelector("#availability-mark-unavailable");
const availabilityClearDayButton = document.querySelector("#availability-clear-day");


const resetRosterButton =
    document.querySelector("#reset-roster");

todayDate?.addEventListener("click", () => openPersonalCalendarDetail(selectedDate));
todayDate?.setAttribute("title", "Open day planner");
publicHoliday?.addEventListener("click", () => openPersonalCalendarDetail(selectedDate));
publicHoliday?.setAttribute("title", "Open day planner and public holiday details");


function updateAppHeartButton() {
    if (!appHeartButton) return;
    const hearted = localStorage.getItem(STORAGE_APP_HEARTED) === "true";
    appHeartButton.disabled = hearted;
    appHeartButton.classList.toggle("hearted", hearted);
    appHeartButton.innerHTML = hearted
        ? '<span aria-hidden="true">&#9829;</span> Thanks!'
        : '<span aria-hidden="true">&#9829;</span> I Heart this app';
    appHeartButton.setAttribute(
        "aria-label",
        hearted ? "Thanks for hearting He Gui" : "I Heart this app"
    );
}

function heartHeguiApp() {
    if (!appHeartButton) return;
    if (localStorage.getItem(STORAGE_APP_HEARTED) === "true") {
        updateAppHeartButton();
        return;
    }

    // Save first so repeat taps/reloads from this browser/device cannot create extra votes.
    localStorage.setItem(STORAGE_APP_HEARTED, "true");
    updateAppHeartButton();

    logHeguiEvent("app_like", {
        action: "heart_app",
        details: {
            source: "home_header",
            once_per_device: true
        }
    });
}

updateAppHeartButton();
appHeartButton?.addEventListener("click", heartHeguiApp);


function availabilityTestRosterInterval(date) {
    if (!setup || setup.type === "casual") return null;
    const shift = getShiftForDate(date).shift;
    const code = String(shift?.code || "").toUpperCase();
    if (["O", "A", "", "-"].includes(code)) return null;
    const parts = String(shift?.time || "").split("-");
    if (parts.length !== 2) return null;
    const start = shiftClockMinutes(parts[0]);
    const finish = shiftClockMinutes(parts[1]);
    if (start === null || finish === null) return null;
    return { start, finish, code };
}

let availabilityTestMode = "available";
const availabilityTestSelections = {};

function setAvailabilityTestMode(mode) {
    availabilityTestMode = mode;
}

function availabilityTestKey(date, slot) {
    return `${dateKey(date)}|${slot}`;
}

function renderAvailabilityTest() {
    if (!availabilityTestGrid) return;
    const period = getPayPeriodForDate(selectedDate || new Date());
    const dates = Array.from({ length: 14 }, (_, i) => addDays(period.start, i));
    const slots = [];
    for (let m = 5 * 60; m < 21 * 60; m += 30) slots.push(m);

    const timeLabel = (m) => {
        const h = Math.floor(m / 60);
        const min = m % 60;
        return `${String(h).padStart(2,"0")}:${String(min).padStart(2,"0")}`;
    };

    let html = `<div class="availability-legend-head">Legend</div><div class="availability-corner">Time</div>`;
    dates.forEach((date, dayIndex) => {
        const editableSlots = slots.filter((slot) => {
            const roster = availabilityTestRosterInterval(date);
            return !(roster && slot < roster.finish && (slot + 30) > roster.start);
        });
        const states = editableSlots.map((slot) => availabilityTestSelections[availabilityTestKey(date, slot)] || "neutral");
        const dayState = states.length && states.every((state) => state === "available") ? "available" :
            states.length && states.every((state) => state === "unavailable") ? "unavailable" : "neutral";
        const dayAction = dayState === "available" ? "Set whole day unavailable" : dayState === "unavailable" ? "Clear whole day" : "Set whole day available";
        html += `<button type="button" class="availability-day-head availability-all-day ${dayState}" data-day-index="${dayIndex}" data-date="${dateKey(date)}" title="${dayAction}" aria-label="${dayAction}">
            <strong>${date.toLocaleDateString("en-AU",{weekday:"short"})}</strong>
            <span>${date.toLocaleDateString("en-AU",{day:"2-digit",month:"2-digit"})}</span>
        </button>`;
    });

    slots.forEach((slot) => {
        const legendClass = slot >= 360 && slot < 420 ? " available" : slot >= 420 && slot < 480 ? " rostered" : slot >= 480 && slot < 540 ? " unavailable" : "";
        const legendText = slot === 360 ? "Available" : slot === 420 ? "Rostered / Working" : slot === 480 ? "Unavailable" : "";
        html += `<div class="availability-side-cell${legendClass}">${legendText}</div>`;
        html += `<div class="availability-time">${timeLabel(slot)}</div>`;
        dates.forEach((date) => {
            const roster = availabilityTestRosterInterval(date);
            const rostered = roster && slot < roster.finish && (slot + 30) > roster.start;
            const key = availabilityTestKey(date, slot);
            const selectedState = availabilityTestSelections[key];
            const state = rostered ? "rostered" : (selectedState || "neutral");
            const title = rostered ? `${roster.code} rostered - cannot change` :
                `${timeLabel(slot)}-${timeLabel(slot + 30)} - ${state === "neutral" ? "Not marked" : state}`;
            html += `<button type="button" class="availability-slot ${state}" data-date="${dateKey(date)}" data-slot="${slot}" ${rostered ? "disabled" : ""} title="${title}" aria-label="${title}"></button>`;
        });
    });
    availabilityTestGrid.innerHTML = html;

    availabilityTestGrid.querySelectorAll(".availability-slot:not(:disabled)").forEach((button) => {
        button.addEventListener("click", () => {
            const key = `${button.dataset.date}|${button.dataset.slot}`;
            const current = availabilityTestSelections[key] || "neutral";
            const next = current === "neutral" ? "available" : current === "available" ? "unavailable" : "neutral";
            if (next === "neutral") delete availabilityTestSelections[key];
            else availabilityTestSelections[key] = next;
            renderAvailabilityTest();
        });
    });

    availabilityTestGrid.querySelectorAll(".availability-all-day").forEach((button) => {
        button.addEventListener("click", () => {
            const targetDate = parseDateKey(button.dataset.date);
            const editableKeys = slots.filter((slot) => {
                const roster = availabilityTestRosterInterval(targetDate);
                return !(roster && slot < roster.finish && (slot + 30) > roster.start);
            }).map((slot) => availabilityTestKey(targetDate, slot));
            const allAvailable = editableKeys.length && editableKeys.every((key) => availabilityTestSelections[key] === "available");
            const allUnavailable = editableKeys.length && editableKeys.every((key) => availabilityTestSelections[key] === "unavailable");
            const next = allAvailable ? "unavailable" : allUnavailable ? "neutral" : "available";
            editableKeys.forEach((key) => {
                if (next === "neutral") delete availabilityTestSelections[key];
                else availabilityTestSelections[key] = next;
            });
            renderAvailabilityTest();
        });
    });
}

openAvailabilityTestButton?.addEventListener("click", () => {
    document.querySelector("#extras-page")?.classList.add("hidden");
    renderAvailabilityTest();
    availabilityTestPage?.classList.remove("hidden");
});

closeAvailabilityTestButton?.addEventListener("click", () => {
    availabilityTestPage?.classList.add("hidden");
    document.querySelector("#extras-page")?.classList.remove("hidden");
});

function buildAvailabilityPrintDocument() {
    const period = getPayPeriodForDate(selectedDate || new Date());
    const dates = Array.from({ length: 14 }, (_, i) => addDays(period.start, i));
    const slots = [];
    for (let m = 5 * 60; m < 21 * 60; m += 30) slots.push(m);
    const activeProfile = profiles?.[activeProfileIndex];
    const profileName = activeProfile?.name || "Roster profile";
    const timeLabel = (m) => `${String(Math.floor(m / 60)).padStart(2,"0")}:${String(m % 60).padStart(2,"0")}`;
    const legendFor = (slot) => slot === 360 ? "Available" : slot === 420 ? "Rostered / Working" : slot === 480 ? "Unavailable" : "";
    const legendClass = (slot) => slot >= 360 && slot < 420 ? " available" : slot >= 420 && slot < 480 ? " rostered" : slot >= 480 && slot < 540 ? " unavailable" : "";
    const headers = dates.map((date) => `<th>${date.toLocaleDateString("en-AU",{weekday:"short"})}<br>${date.toLocaleDateString("en-AU",{day:"2-digit",month:"2-digit"})}</th>`).join("");
    const rows = slots.map((slot) => {
        const cells = dates.map((date) => {
            const roster = availabilityTestRosterInterval(date);
            const rostered = roster && slot < roster.finish && (slot + 30) > roster.start;
            const state = rostered ? "rostered" : (availabilityTestSelections[availabilityTestKey(date, slot)] || "neutral");
            return `<td class="${state}"></td>`;
        }).join("");
        const legend = legendFor(slot) ? `<span class="sidelegend${legendClass(slot)}">${legendFor(slot)}</span>` : "";
        return `<tr><th class="legendcol">${legend}</th><th class="time">${timeLabel(slot)}</th>${cells}</tr>`;
    }).join("");

    return `<!doctype html><html><head><meta charset="utf-8"><title>Availability - ${escapeHtml(profileName)}</title>
<style>@page{size:A4 landscape;margin:8mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#111;margin:0}h1{margin:0;font-size:20px}.sub{font-size:11px;margin:3px 0 8px}.notice{border:2px solid #111;padding:6px 8px;margin:7px 0 10px;font-size:11px;font-weight:700}.actions{margin:0 0 10px}button{padding:8px 14px;font-weight:700}table{border-collapse:collapse;width:100%;table-layout:fixed;font-size:8px}th,td{border:1px solid #777;height:13px;text-align:center}thead th{height:29px;font-size:8px}.legendcol{width:92px;text-align:left;padding-left:3px}.time{width:45px;text-align:right;padding-right:4px;font-weight:700;background:#fff}.sidelegend{display:block;padding:2px 4px;border-radius:3px;font-size:7px}.available{background:#72bf78!important}.rostered{background:#9aa1a8!important;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.55) 0 2px,transparent 2px 6px)!important}.unavailable{background:#d7a13b!important}.neutral{background:#fff!important}.footer{font-size:9px;margin-top:7px}.signature{display:flex;gap:28px;margin-top:10px;font-size:10px}.signature span{flex:1;border-top:1px solid #555;padding-top:3px}@media print{.actions{display:none}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>
<div class="actions"><button onclick="window.print()">Print / Save PDF</button> <button onclick="window.close()">Close</button></div>
<h1>Availability</h1><div class="sub"><strong>${escapeHtml(profileName)}</strong> &middot; ${formatAustralianDate(period.start)} - ${formatAustralianDate(period.end)}</div>
<div class="notice">PERSONAL AVAILABILITY ONLY - not an official roster, approval, leave request or management instruction. Supervisor must refer to the employer's official roster and processes.</div>
<table><thead><tr><th class="legendcol">Legend</th><th class="time">Time</th>${headers}</tr></thead><tbody>${rows}</tbody></table>
<div class="footer">Green = Available &nbsp; | &nbsp; Grey = Rostered / Working &nbsp; | &nbsp; Gold = Unavailable. Blank = not marked.</div>
<div class="signature"><span>Employee / profile</span><span>Supervisor notes</span><span>Date received</span></div>
</body></html>`;
}

printAvailabilityButton?.addEventListener("click", () => {
    const printWindow = window.open("", "hegui-availability-print");
    if (!printWindow) {
        alert("Please allow pop-ups to open the Availability print preview.");
        return;
    }
    printWindow.document.open();
    printWindow.document.write(buildAvailabilityPrintDocument());
    printWindow.document.close();
});

function applyDisplayTheme(theme) {
    const allowed = new Set(["light", "medium", "dark"]);
    const chosen = allowed.has(theme) ? theme : "medium";
    document.documentElement.dataset.theme = chosen;
    if (displayTheme) displayTheme.value = chosen;
    localStorage.setItem(STORAGE_DISPLAY_THEME, chosen);
}

applyDisplayTheme(localStorage.getItem(STORAGE_DISPLAY_THEME) || "medium");
displayTheme?.addEventListener("change", () => applyDisplayTheme(displayTheme.value));

const savedStartupSplashPreference =
    localStorage.getItem(STORAGE_SHOW_STARTUP_SPLASH);
const showStartupSplash = savedStartupSplashPreference !== "false";
showStartupSplashCheckbox.checked = showStartupSplash;
if (!showStartupSplash) {
    startupSplash.classList.add("hidden");
}

showStartupSplashCheckbox.addEventListener("change", () => {
    localStorage.setItem(
        STORAGE_SHOW_STARTUP_SPLASH,
        String(showStartupSplashCheckbox.checked)
    );
});

settingsButton.addEventListener("click", () => {
    settingsPage.classList.remove("hidden");
});

closeSettings.addEventListener("click", () => {
    settingsPage.classList.add("hidden");
});
manageFinalisedShiftsButton?.addEventListener("click", () => {
    settingsPage.classList.add("hidden");
    openDeleteRecordPage("finalised_shift");
});

function loadPersonalCalendarSettings() {
    let saved = {};
    try {
        saved = JSON.parse(localStorage.getItem(STORAGE_PERSONAL_CALENDAR)) || {};
    } catch (error) {
        saved = {};
    }

    if (personalCalendarName) personalCalendarName.value = saved.name || "";
    if (personalCalendarUrl) personalCalendarUrl.value = saved.url || "";
    if (personalCalendarEnabled) personalCalendarEnabled.checked = Boolean(saved.enabled && saved.url);

    try {
        const cache = JSON.parse(localStorage.getItem(STORAGE_PERSONAL_CALENDAR_CACHE)) || {};
        personalCalendarEvents = Array.isArray(cache.events) ? cache.events : [];
    } catch (error) {
        personalCalendarEvents = [];
    }

    if (personalCalendarStatus) {
        personalCalendarStatus.textContent = saved.url
            ? (saved.enabled ? "Personal calendar saved and enabled." : "Personal calendar saved but disabled.")
            : "";
    }
}

function normaliseCalendarFetchUrl(url) {
    return String(url || "").replace(/^webcal:\/\//i, "https://");
}

function unfoldIcsLines(text) {
    return String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

function decodeIcsText(value) {
    return String(value || "")
        .replace(/\\n/gi, " ")
        .replace(/\\,/g, ",")
        .replace(/\\;/g, ";")
        .replace(/\\\\/g, "\\");
}

function parseIcsDateValue(value, params = "") {
    const raw = String(value || "").trim();
    if (!raw) return null;
    if (/VALUE=DATE/i.test(params) || /^\d{8}$/.test(raw)) {
        const y = Number(raw.slice(0, 4));
        const m = Number(raw.slice(4, 6)) - 1;
        const d = Number(raw.slice(6, 8));
        return { iso: new Date(y, m, d).toISOString(), allDay: true };
    }
    const match = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
    if (!match) return null;
    const [, y, mo, d, h, mi, sec = "00", z] = match;
    const date = z
        ? new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +sec))
        : new Date(+y, +mo - 1, +d, +h, +mi, +sec);
    return { iso: date.toISOString(), allDay: false };
}

function parseRRule(value) {
    const out = {};
    String(value || "").split(";").forEach((part) => {
        const [key, val] = part.split("=");
        if (key && val) out[key.toUpperCase()] = val;
    });
    return out;
}

function parseIcsEvents(text) {
    const lines = unfoldIcsLines(text);
    const events = [];
    let current = null;
    for (const line of lines) {
        if (line === "BEGIN:VEVENT") { current = {}; continue; }
        if (line === "END:VEVENT") {
            if (current?.start?.iso) events.push(current);
            current = null;
            continue;
        }
        if (!current) continue;
        const colon = line.indexOf(":");
        if (colon < 0) continue;
        const left = line.slice(0, colon);
        const value = line.slice(colon + 1);
        const [name, ...paramParts] = left.split(";");
        const params = paramParts.join(";");
        switch (name.toUpperCase()) {
            case "UID": current.uid = value; break;
            case "SUMMARY": current.summary = decodeIcsText(value) || "Calendar event"; break;
            case "LOCATION": current.location = decodeIcsText(value); break;
            case "DESCRIPTION": current.description = decodeIcsText(value); break;
            case "DTSTART": current.start = parseIcsDateValue(value, params); break;
            case "DTEND": current.end = parseIcsDateValue(value, params); break;
            case "RRULE": current.rrule = parseRRule(value); break;
            case "EXDATE": {
                current.exdates ||= [];
                value.split(",").forEach((v) => {
                    const parsed = parseIcsDateValue(v, params);
                    if (parsed) current.exdates.push(parsed.iso);
                });
                break;
            }
        }
    }
    return events;
}

function dayKeyFromIso(iso) {
    return dateKey(startOfDay(new Date(iso)));
}

function weekdayCode(date) {
    return ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][date.getDay()];
}

function personalEventOccursOnDate(event, date) {
    const target = startOfDay(date);
    const start = startOfDay(new Date(event.start.iso));
    const end = event.end?.iso ? startOfDay(new Date(event.end.iso)) : start;
    const endInclusive = event.start.allDay && event.end?.iso ? addDays(end, -1) : end;
    const targetKey = dateKey(target);
    if ((event.exdates || []).some((iso) => dayKeyFromIso(iso) === targetKey)) return false;

    if (!event.rrule?.FREQ) return target >= start && target <= endInclusive;
    if (target < start) return false;

    const rule = event.rrule;
    const interval = Math.max(1, Number(rule.INTERVAL || 1));
    if (rule.UNTIL) {
        const untilParsed = parseIcsDateValue(rule.UNTIL, "");
        if (untilParsed && target > startOfDay(new Date(untilParsed.iso))) return false;
    }
    const days = dayDifference(start, target);
    let matches = false;
    if (rule.FREQ === "DAILY") {
        matches = days % interval === 0;
    } else if (rule.FREQ === "WEEKLY") {
        const weeks = Math.floor(days / 7);
        const byday = (rule.BYDAY || weekdayCode(start)).split(",").map((v) => v.slice(-2));
        matches = weeks % interval === 0 && byday.includes(weekdayCode(target));
    } else if (rule.FREQ === "MONTHLY") {
        const months = (target.getFullYear() - start.getFullYear()) * 12 + target.getMonth() - start.getMonth();
        const wantedDays = (rule.BYMONTHDAY || String(start.getDate())).split(",").map(Number);
        matches = months >= 0 && months % interval === 0 && wantedDays.includes(target.getDate());
    } else if (rule.FREQ === "YEARLY") {
        const years = target.getFullYear() - start.getFullYear();
        const month = Number(rule.BYMONTH || start.getMonth() + 1);
        const monthDay = Number(rule.BYMONTHDAY || start.getDate());
        matches = years >= 0 && years % interval === 0 && target.getMonth() + 1 === month && target.getDate() === monthDay;
    }
    if (!matches) return false;

    if (rule.COUNT) {
        // Count occurrences from DTSTART up to the target. This bounded loop keeps browser work small.
        let count = 0;
        for (let d = startOfDay(start); d <= target && count <= Number(rule.COUNT); d = addDays(d, 1)) {
            const clone = { ...event, rrule: { ...rule } };
            delete clone.rrule.COUNT;
            if (personalEventOccursOnDate(clone, d)) count += 1;
        }
        if (count > Number(rule.COUNT)) return false;
    }
    return true;
}

function loadPlannerEvents() {
    try {
        const events = JSON.parse(localStorage.getItem(STORAGE_PLANNER_EVENTS)) || [];
        return Array.isArray(events) ? events : [];
    } catch (error) {
        return [];
    }
}

function savePlannerEvents(events) {
    localStorage.setItem(STORAGE_PLANNER_EVENTS, JSON.stringify(events));
    window.HeguiNotifications?.sync(events);
}

function getPlannerEvents(date) {
    const key = dateKey(date);
    return loadPlannerEvents()
        .filter((event) => event.date === key)
        .map((event) => ({
            ...event,
            summary: event.summary || "Planner event",
            start: event.allDay
                ? { date: event.date, allDay: true }
                : { iso: `${event.date}T${event.time || `${String(event.hour).padStart(2, "0")}:00`}:00`, allDay: false },
            end: event.allDay
                ? { date: event.date, allDay: true }
                : { iso: (() => { const start = new Date(`${event.date}T${event.time || `${String(event.hour).padStart(2, "0")}:00`}:00`); start.setMinutes(start.getMinutes() + 30); return start.toISOString(); })(), allDay: false },
            plannerEvent: true
        }));
}

function getPersonalCalendarEvents(date) {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORAGE_PERSONAL_CALENDAR)) || {}; } catch (error) {}
    const imported = saved.enabled
        ? personalCalendarEvents.filter((event) => personalEventOccursOnDate(event, date))
        : [];
    return [...getPlannerEvents(date), ...imported].sort((a, b) => {
        if (a.start?.allDay !== b.start?.allDay) return a.start?.allDay ? -1 : 1;
        return String(a.start?.iso || "").localeCompare(String(b.start?.iso || ""));
    });
}

function personalCalendarEventTime(event) {
    if (event.start?.allDay) return "All day";
    const start = event.start?.iso ? new Date(event.start.iso) : null;
    const end = event.end?.iso ? new Date(event.end.iso) : null;
    if (!start || Number.isNaN(start.getTime())) return "";
    const clock = (value) => value.toLocaleTimeString("en-AU", {
        hour: "numeric",
        minute: "2-digit"
    });
    return end && !Number.isNaN(end.getTime())
        ? `${clock(start)} - ${clock(end)}`
        : clock(start);
}

function closePersonalCalendarDetail() {
    document.querySelector(".personal-calendar-detail-overlay")?.remove();
}

function plannerHolidayLines(date) {
    const act = showActPublicHolidays ? getActPublicHoliday(date) : "";
    const nsw = showNswPublicHolidays ? getNswPublicHoliday(date) : "";
    return [
        act ? `ACT Public Holiday - ${act}` : "",
        nsw && nsw !== act ? `NSW Public Holiday - ${nsw}` : ""
    ].filter(Boolean);
}

function openPersonalCalendarDetail(date, events = getPersonalCalendarEvents(date)) {
    closePersonalCalendarDetail();
    const holidays = plannerHolidayLines(date);
    const overlay = document.createElement("div");
    overlay.className = "personal-calendar-detail-overlay";
    overlay.innerHTML = `
        <section class="personal-calendar-detail-panel" role="dialog" aria-modal="true" aria-labelledby="personal-calendar-detail-title">
            <div class="personal-calendar-detail-head">
                <div>
                    <span class="personal-calendar-detail-label">Day planner</span>
                    <h2 id="personal-calendar-detail-title">${escapeHtml(date.toLocaleDateString("en-AU", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric"
                    }))}</h2>
                </div>
                <div class="personal-calendar-detail-actions">
                    <button type="button" class="secondary-button planner-add-event">+ Add</button>
                    <button type="button" class="personal-calendar-detail-close" aria-label="Close calendar details">&times;</button>
                </div>
            </div>
            ${holidays.length ? `<div class="planner-holidays"><strong>Public holiday</strong>${holidays.map((name) => `<span>${escapeHtml(name)}</span>`).join("")}</div>` : ""}
            <form class="planner-event-form hidden">
                <label>Description<input class="planner-event-description" maxlength="120" required placeholder="e.g. Pay rego"></label>
                <div class="planner-form-row">
                    <label>Time<select class="planner-event-hour">
                        <option value="all-day">All day</option>
                        ${Array.from({ length: 48 }, (_, slot) => { const hour = Math.floor(slot / 2); const minute = slot % 2 ? 30 : 0; const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`; return `<option value="${value}"${value === "09:00" ? " selected" : ""}>${new Date(2000, 0, 1, hour, minute).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}</option>`; }).join("")}
                    </select></label>
                    <label>Reminder<select class="planner-event-reminder">
                        <option value="none">None</option>
                        <option value="both" selected>Day before + 2 hours</option>
                        <option value="day">Day before</option>
                        <option value="two_hours">2 hours before</option>
                    </select></label>
                </div>
                <div class="planner-form-buttons">
                    <button type="button" class="secondary-button planner-cancel-event">Cancel</button>
                    <button type="submit" class="primary-button">Save event</button>
                </div>
            </form>
            <div class="personal-calendar-detail-list">
                ${events.length ? events.map((event) => `
                    <article class="personal-calendar-detail-event${event.plannerEvent ? " planner-owned-event" : ""}">
                        <div class="planner-event-heading">
                            <h3>${escapeHtml(event.summary || "Calendar event")}</h3>
                            ${event.plannerEvent ? `<button type="button" class="planner-remove-event" data-event-id="${escapeHtml(event.id)}">Remove</button>` : ""}
                        </div>
                        ${personalCalendarEventTime(event) ? `<p class="personal-calendar-detail-time">${escapeHtml(personalCalendarEventTime(event))}</p>` : ""}
                        ${event.location ? `<p><strong>Location:</strong> ${escapeHtml(event.location)}</p>` : ""}
                        ${event.description ? `<p class="personal-calendar-detail-description">${escapeHtml(event.description)}</p>` : ""}
                    </article>
                `).join("") : '<p class="planner-empty-day">Nothing planned yet.</p>'}
            </div>
            <button type="button" class="primary-button personal-calendar-detail-done">Close</button>
        </section>
    `;

    const form = overlay.querySelector(".planner-event-form");
    overlay.querySelector(".planner-add-event")?.addEventListener("click", () => {
        form?.classList.remove("hidden");
        overlay.querySelector(".planner-event-description")?.focus();
    });
    overlay.querySelector(".planner-cancel-event")?.addEventListener("click", () => form?.classList.add("hidden"));
    form?.addEventListener("submit", (submitEvent) => {
        submitEvent.preventDefault();
        const summary = overlay.querySelector(".planner-event-description")?.value.trim();
        if (!summary) return;
        const hourValue = overlay.querySelector(".planner-event-hour")?.value || "all-day";
        const stored = loadPlannerEvents();
        stored.push({
            id: `planner-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            date: dateKey(date), summary,
            allDay: hourValue === "all-day",
            hour: hourValue === "all-day" ? null : Number(hourValue.slice(0, 2)),
            time: hourValue === "all-day" ? null : hourValue,
            reminder: overlay.querySelector(".planner-event-reminder")?.value || "both"
        });
        savePlannerEvents(stored);
        openPersonalCalendarDetail(date);
        if (setup && rosters.length) renderHome();
        if (!rosterCalendarPage?.classList.contains("hidden")) renderRosterCalendar();
    });
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay || event.target.closest(".personal-calendar-detail-close, .personal-calendar-detail-done")) {
            closePersonalCalendarDetail();
            return;
        }
        const removeButton = event.target.closest(".planner-remove-event");
        if (removeButton) {
            savePlannerEvents(loadPlannerEvents().filter((item) => item.id !== removeButton.dataset.eventId));
            openPersonalCalendarDetail(date);
            if (setup && rosters.length) renderHome();
            if (!rosterCalendarPage?.classList.contains("hidden")) renderRosterCalendar();
        }
    });
    document.body.appendChild(overlay);
    overlay.querySelector(".personal-calendar-detail-close")?.focus();
}

async function fetchPersonalCalendarIcs(calendarUrl) {
    const normalisedUrl = normaliseCalendarFetchUrl(calendarUrl);

    // Private Google/Outlook ICS feeds commonly block direct browser reads with CORS.
    // When the Worker is configured, send the secret URL in the POST body rather than
    // exposing it in a proxy query string or analytics/referrer logs.
    if (PERSONAL_CALENDAR_PROXY_URL) {
        const response = await fetch(PERSONAL_CALENDAR_PROXY_URL, {
            method: "POST",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: normalisedUrl })
        });
        if (!response.ok) throw new Error(`Calendar proxy HTTP ${response.status}`);
        return response.text();
    }

    // Direct fetch remains useful for calendar providers that already permit browser access.
    const response = await fetch(normalisedUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Calendar HTTP ${response.status}`);
    return response.text();
}

async function refreshPersonalCalendar(showStatus = false) {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORAGE_PERSONAL_CALENDAR)) || {}; } catch (error) {}
    if (!saved.enabled || !saved.url) return;
    if (showStatus && personalCalendarStatus) personalCalendarStatus.textContent = "Loading personal calendar...";
    try {
        const text = await fetchPersonalCalendarIcs(saved.url);
        const events = parseIcsEvents(text);
        personalCalendarEvents = events;
        localStorage.setItem(STORAGE_PERSONAL_CALENDAR_CACHE, JSON.stringify({ updatedAt: new Date().toISOString(), events }));
        if (personalCalendarStatus) personalCalendarStatus.textContent = `Calendar active - ${events.length} events loaded.`;
        if (setup && rosters.length > 0) renderHome();
        if (!rosterCalendarPage?.classList.contains("hidden")) renderRosterCalendar();
    } catch (error) {
        if (personalCalendarStatus) {
            personalCalendarStatus.textContent = personalCalendarEvents.length
                ? "Could not refresh the personal calendar. Showing the last saved calendar copy."
                : (PERSONAL_CALENDAR_PROXY_URL
                    ? "Could not load the personal calendar through the calendar service."
                    : "This calendar provider blocks direct browser access. H\u00e9 Gu\u01d0's calendar service still needs its one-time connection URL.");
        }
    }
}

async function savePersonalCalendarSettings() {
    const name = personalCalendarName?.value.trim() || "Personal Calendar";
    const url = personalCalendarUrl?.value.trim() || "";
    if (!url) { alert("Enter an ICS calendar URL first."); personalCalendarUrl?.focus(); return; }
    let parsedUrl;
    try { parsedUrl = new URL(normaliseCalendarFetchUrl(url)); } catch (error) { alert("That does not look like a valid calendar URL."); personalCalendarUrl?.focus(); return; }
    if (!/^https?:$/.test(parsedUrl.protocol)) { alert("Please use an http, https or webcal ICS calendar URL."); personalCalendarUrl?.focus(); return; }
    const saved = { name, url, enabled: Boolean(personalCalendarEnabled?.checked) };
    localStorage.setItem(STORAGE_PERSONAL_CALENDAR, JSON.stringify(saved));
    const calendarProvider = /(^|\.)google\.com$|(^|\.)googleusercontent\.com$/i.test(parsedUrl.hostname)
        ? "google"
        : "other";
    window.logHeguiEvent?.("calendar_added", {
        action: "personal_calendar_saved",
        details: {
            provider: calendarProvider,
            enabled: saved.enabled
        }
    });
    if (saved.enabled) await refreshPersonalCalendar(true);
    else if (personalCalendarStatus) personalCalendarStatus.textContent = "Personal calendar saved but disabled.";
}

function removePersonalCalendarSettings() {
    if (!localStorage.getItem(STORAGE_PERSONAL_CALENDAR) && !personalCalendarUrl?.value.trim()) return;
    if (!confirm("Remove the saved personal calendar?")) return;
    localStorage.removeItem(STORAGE_PERSONAL_CALENDAR);
    localStorage.removeItem(STORAGE_PERSONAL_CALENDAR_CACHE);
    personalCalendarEvents = [];
    if (personalCalendarName) personalCalendarName.value = "";
    if (personalCalendarUrl) personalCalendarUrl.value = "";
    if (personalCalendarEnabled) personalCalendarEnabled.checked = false;
    if (personalCalendarStatus) personalCalendarStatus.textContent = "Personal calendar removed.";
    if (setup && rosters.length > 0) renderHome();
}

loadPersonalCalendarSettings();
savePersonalCalendarButton?.addEventListener("click", savePersonalCalendarSettings);
removePersonalCalendarButton?.addEventListener("click", removePersonalCalendarSettings);
setTimeout(() => refreshPersonalCalendar(false), 250);

extrasButton.addEventListener("click", () => {
    extrasPage.classList.remove("hidden");
});

closeExtras.addEventListener("click", () => {
    extrasPage.classList.add("hidden");
});

supportFormButton?.addEventListener("click", () => {
    const supportFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSd0lVGtFQ4tfnIxQrkdTU-TNpZKaPKhmHY3gFer1eAl4dDgBA/viewform";
    window.logHeguiEvent?.("support_form_open", { source: "extras" });

    const supportWindow = window.open(supportFormUrl, "_blank", "noopener,noreferrer");
    if (!supportWindow) window.location.href = supportFormUrl;
});

shareAppButton?.addEventListener("click", async () => {
    const shareUrl = "https://heguiplanner.com/";
    const shareTitle = "Hé Guǐ Planner";
    const shareText = "Hé Guǐ Planner helps you organise your personal plans alongside your work roster.";

    // Record only that the external share feature was used. Never record
    // recipients, contacts, chosen apps, or message contents.
    window.logHeguiEvent?.("share_app", { action: "share_button" });

    if (navigator.share) {
        try {
            await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
            return;
        } catch (error) {
            if (error?.name === "AbortError") return;
        }
    }

    const copyText = `${shareText}\n\n${shareUrl}`;

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(copyText);
        } else {
            const copyArea = document.createElement("textarea");
            copyArea.value = copyText;
            copyArea.setAttribute("readonly", "");
            copyArea.style.position = "fixed";
            copyArea.style.opacity = "0";
            document.body.appendChild(copyArea);
            copyArea.select();
            const copied = document.execCommand("copy");
            copyArea.remove();
            if (!copied) throw new Error("Copy command failed");
        }

        alert("Link copied — paste it into a message or email.");
    } catch (error) {
        alert(`Copy this link to share Hé Guǐ Planner:\n\n${shareUrl}`);
    }
});

const savedActPublicHolidayPreference =
    localStorage.getItem(STORAGE_ACT_PUBLIC_HOLIDAYS);

showActPublicHolidays =
    savedActPublicHolidayPreference === null ||
    savedActPublicHolidayPreference === "true";

actPublicHolidaysCheckbox.checked =
    showActPublicHolidays;

actPublicHolidaysCheckbox.addEventListener("change", () => {
    showActPublicHolidays =
        actPublicHolidaysCheckbox.checked;

    localStorage.setItem(
        STORAGE_ACT_PUBLIC_HOLIDAYS,
        String(showActPublicHolidays)
    );

    if (setup && rosters.length > 0) {
        renderHome();
    }
});

const savedActSchoolHolidayPreference =
    localStorage.getItem(STORAGE_ACT_SCHOOL_HOLIDAYS);

showActSchoolHolidays = savedActSchoolHolidayPreference === "true";
showNswPublicHolidays = localStorage.getItem(STORAGE_NSW_PUBLIC_HOLIDAYS) === "true";
showNswSchoolHolidays = localStorage.getItem(STORAGE_NSW_SCHOOL_HOLIDAYS) === "true";

// Only one school-holiday region can be active at a time.
if (showActSchoolHolidays && showNswSchoolHolidays) {
    showNswSchoolHolidays = false;
    localStorage.setItem(STORAGE_NSW_SCHOOL_HOLIDAYS, "false");
}

if (actSchoolHolidaysCheckbox) actSchoolHolidaysCheckbox.checked = showActSchoolHolidays;
if (nswPublicHolidaysCheckbox) nswPublicHolidaysCheckbox.checked = showNswPublicHolidays;
if (nswSchoolHolidaysCheckbox) nswSchoolHolidaysCheckbox.checked = showNswSchoolHolidays;

actSchoolHolidaysCheckbox?.addEventListener("change", () => {
    showActSchoolHolidays = actSchoolHolidaysCheckbox.checked;
    if (showActSchoolHolidays) {
        showNswSchoolHolidays = false;
        if (nswSchoolHolidaysCheckbox) nswSchoolHolidaysCheckbox.checked = false;
        localStorage.setItem(STORAGE_NSW_SCHOOL_HOLIDAYS, "false");
    }
    localStorage.setItem(STORAGE_ACT_SCHOOL_HOLIDAYS, String(showActSchoolHolidays));
    if (setup && rosters.length > 0) renderHome();
});

nswPublicHolidaysCheckbox?.addEventListener("change", () => {
    showNswPublicHolidays = nswPublicHolidaysCheckbox.checked;
    localStorage.setItem(STORAGE_NSW_PUBLIC_HOLIDAYS, String(showNswPublicHolidays));
    if (setup && rosters.length > 0) renderHome();
});

nswSchoolHolidaysCheckbox?.addEventListener("change", () => {
    showNswSchoolHolidays = nswSchoolHolidaysCheckbox.checked;
    if (showNswSchoolHolidays) {
        showActSchoolHolidays = false;
        if (actSchoolHolidaysCheckbox) actSchoolHolidaysCheckbox.checked = false;
        localStorage.setItem(STORAGE_ACT_SCHOOL_HOLIDAYS, "false");
    }
    localStorage.setItem(STORAGE_NSW_SCHOOL_HOLIDAYS, String(showNswSchoolHolidays));
    if (setup && rosters.length > 0) renderHome();
});

function setNotificationStatus(message, state = "") {
    if (!notificationsStatus) return;
    notificationsStatus.textContent = message;
    notificationsStatus.className = `notifications-status${state ? ` ${state}` : ""}`;
}

async function initialiseNotifications() {
    if (!notificationsCheckbox || !window.HeguiNotifications) return;
    const wanted = localStorage.getItem(STORAGE_NOTIFICATIONS_ENABLED) === "true";
    if (!("Notification" in window)) {
        notificationsCheckbox.checked = false;
        notificationsCheckbox.disabled = true;
        setNotificationStatus("This browser does not support phone notifications.", "warning");
        return;
    }
    notificationsCheckbox.checked = wanted && Notification.permission === "granted";
    if (notificationsCheckbox.checked) {
        setNotificationStatus("Phone notifications are on.", "enabled");
        await window.HeguiNotifications.restore(loadPlannerEvents(), setNotificationStatus);
    } else if (wanted && Notification.permission === "denied") {
        setNotificationStatus("Notifications are blocked in this phone's settings.", "error");
    }
}

notificationsCheckbox?.addEventListener("change", async () => {
    notificationsCheckbox.disabled = true;
    try {
        if (notificationsCheckbox.checked) {
            setNotificationStatus("Connecting phone notifications…");
            await window.HeguiNotifications.enable(loadPlannerEvents());
            localStorage.setItem(STORAGE_NOTIFICATIONS_ENABLED, "true");
            setNotificationStatus("Phone notifications are on. A test notification has been sent.", "enabled");
        } else {
            await window.HeguiNotifications.disable();
            localStorage.setItem(STORAGE_NOTIFICATIONS_ENABLED, "false");
            setNotificationStatus("Notifications are off.");
        }
    } catch (error) {
        notificationsCheckbox.checked = false;
        localStorage.setItem(STORAGE_NOTIFICATIONS_ENABLED, "false");
        setNotificationStatus(error?.message || "Notifications could not be enabled.", "error");
    } finally {
        notificationsCheckbox.disabled = false;
    }
});

initialiseNotifications();

resetRosterButton.addEventListener("click", resetSetup);
plannerType.addEventListener("change", updateSetupFields);
rosterSelect.addEventListener("change", renderRosterDayHelper);
rosterDayHelpCheckbox.addEventListener("change", () => {
    rosterDayHelper.classList.toggle("hidden", !rosterDayHelpCheckbox.checked);
    if (rosterDayHelpCheckbox.checked) renderRosterDayHelper();
});
addChangeApplicationButton.addEventListener("click", openChangeApplicationMenu);
chooseLeaveButton.addEventListener("click", () => {
    changeActionPage.classList.add("hidden");
    leaveTypePage.classList.remove("hidden");
});
chooseIndividualSwapButton.addEventListener("click", () => {
    pendingSwapType = "individual";
    calendarSameDaySwap.checked = false;
    changeActionPage.classList.add("hidden");
    openRosterCalendar("swap");
});
chooseColleagueSwapButton.addEventListener("click", () => {
    pendingSwapType = "colleague";
    calendarSameDaySwap.checked = false;
    changeActionPage.classList.add("hidden");
    openRosterCalendar("swap");
});
chooseExtraHoursButton.addEventListener("click", () => {
    if (!setup) return;
    changeActionPage.classList.add("hidden");
    openRosterCalendar("add_shift");
});
chooseEditShiftsButton.addEventListener("click", () => {
    changeActionPage.classList.add("hidden");
    openDeleteRecordPage(setup?.type === "casual" ? "casual_shift" : "added_shift");
});
chooseManagementChangeButton.addEventListener("click", () => {
    changeActionPage.classList.add("hidden");
    openRosterCalendar("roster_change");
});
document.querySelector("#close-change-action").addEventListener("click", () => {
    changeActionPage.classList.add("hidden");
});
document.querySelector("#back-from-leave-type").addEventListener("click", () => {
    leaveTypePage.classList.add("hidden");
    changeActionPage.classList.remove("hidden");
});
document.querySelector("#remove-leave").addEventListener("click", () => {
    changeActionPage.classList.add("hidden");
    openRosterCalendar("remove_leave");
});
deleteSwapGlobalButton.addEventListener("click", () => openDeleteRecordPage("swap"));
deleteAddedShiftGlobalButton.addEventListener("click", () => openDeleteRecordPage("delete_added_shift"));
deleteManagementGlobalButton.addEventListener("click", () => openDeleteRecordPage("management"));
document.querySelector("#close-delete-record").addEventListener("click", () => {
    deleteRecordPage.classList.add("hidden");
    changeActionPage.classList.add("hidden");
    renderHome();
});
document.querySelectorAll(".leave-type-choice").forEach((button) => {
    button.addEventListener("click", () => {
        pendingLeaveType = button.dataset.leaveType;
        leaveTypePage.classList.add("hidden");
        openRosterCalendar("leave");
    });
});
currentMonthButton.addEventListener("click", () => {
  logHeguiEvent("calendar_open", {
    action: "month_view"
  });

  openRosterCalendar("month_view");
});
document.querySelector("#calendar-prev").addEventListener("click", () => moveRosterCalendarMonth(-1));
document.querySelector("#calendar-next").addEventListener("click", () => moveRosterCalendarMonth(1));
document.querySelector("#calendar-cancel").addEventListener("click", closeRosterCalendar);
calendarOk.addEventListener("click", confirmRosterCalendar);
calendarSameDaySwap.addEventListener("change", () => { pendingCalendarDates = []; renderRosterCalendar(); });
permanentChangeType.addEventListener("change", updatePermanentChangeFields);
swapType.addEventListener("change", updatePermanentChangeFields);
permanentShiftCode.addEventListener("change", fillPermanentShiftTimes);
document.querySelector("#save-permanent-change").addEventListener("click", () => savePermanentChange(false));
savePermanentChangeAddAnotherButton.addEventListener("click", () => savePermanentChange(true));
document.querySelector("#cancel-permanent-change").addEventListener("click", closePermanentChangeEditor);
editChangeDatesButton.addEventListener("click", editPermanentChangeDates);
addEditShiftButton.addEventListener("click", () => {
    openRosterCalendar("add_shift");
});
editShiftsListButton.addEventListener("click", () => openDeleteRecordPage("casual_shift"));
deleteShiftButton.addEventListener("click", deleteSelectedRecord);
casualShiftCode.addEventListener("change", fillCasualShiftTimes);
casualStartTime.addEventListener("input", updateCasualPaidHours);
casualFinishTime.addEventListener("input", updateCasualPaidHours);
casualBreak.addEventListener("change", updateCasualPaidHours);
document.querySelector("#save-casual-shift")
    .addEventListener("click", () => saveCasualShift(false));
saveCasualShiftAddAnotherButton.addEventListener("click", () => saveCasualShift(true));
deleteCasualEditorButton.addEventListener("click", deleteCasualShiftFromEditor);
document.querySelector("#cancel-casual-shift")
    .addEventListener("click", () => { closeCasualShiftEditor(); renderHome(); });
initialiseApp();

function dismissStartupSplash() {
    if (!startupSplash || startupSplash.classList.contains("hidden")) return;

    const minimumDisplayMs = 1800;
    const elapsed = Date.now() - startupSplashStartedAt;
    const remaining = Math.max(0, minimumDisplayMs - elapsed);

    setTimeout(() => {
        startupSplash.classList.add("fade-out");
        setTimeout(() => startupSplash.classList.add("hidden"), 280);
    }, remaining);
}

async function initialiseApp() {
    loadSavedInformation();
    renderProfileNavigation();

    // Load shift codes independently so roster setup is never blocked by them.
    loadShiftCodes();

    if (rosters.length > 0) {
        fillRosterList();
    } else {
        rosterSelect.innerHTML = '<option value="">Loading rosters...</option>';
        rosterSelect.disabled = true;
    }

    let rosterDataUpdated = false;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        let response;

        try {
            response = await fetch(
                `roster.csv?v=${Date.now()}`,
                { cache: "no-store", signal: controller.signal }
            );
        } finally {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            throw new Error("Roster file was not found.");
        }

        const csvText = await response.text();
        const rows = parseCsv(csvText);
        const downloadedRosters = convertRowsToRosters(rows);

        if (downloadedRosters.length === 0) {
            throw new Error("No valid rosters were found.");
        }

        rosterDataUpdated =
            rosters.length > 0 &&
            JSON.stringify(rosters) !== JSON.stringify(downloadedRosters);

        rosters = downloadedRosters;
        localStorage.setItem(STORAGE_DATA, JSON.stringify(rosters));
        fillRosterList();
    } catch (error) {
        console.error("Roster loading failed:", error);

        if (rosters.length > 0) {
            fillRosterList();
        } else {
            rosterSelect.innerHTML = '<option value="">Roster unavailable - load CSV below</option>';
            rosterSelect.disabled = true;
            if (!document.querySelector("#csv-loader")) {
                showCsvLoader();
            }
        }
    }

    showActiveProfile();
    const reminderDateKey = new URLSearchParams(window.location.search).get("plannerDate");
    if (reminderDateKey) {
        const reminderDate = parseDateKey(reminderDateKey);
        if (reminderDate) {
            selectedDate = reminderDate;
            if (setup && rosters.length) renderHome();
            setTimeout(() => openPersonalCalendarDetail(reminderDate), 250);
            history.replaceState({}, "", window.location.pathname);
        }
    }
    dismissStartupSplash();

    if (rosterDataUpdated) {
        setTimeout(() => {
            alert(
                "Roster update installed.\n\n" +
                "Your latest roster information is now ready. " +
                "Your select…17087 tokens truncated…t;
    let finish = original.finish;
    let startAdjusted = false;
    let finishAdjusted = false;
    const originalStart = startValue;
    const originalFinish = finishValue;
    const occupied = occupiedShiftIntervals(date, excludeId, casualMode);

    // Trim only the overlapping edge. This intentionally changes the duration:
    // it never moves the whole added shift and silently invents extra work.
    for (const existing of occupied) {
        if (start < existing.finish && finish > existing.start) {
            if (start >= existing.start && start < existing.finish && finish > existing.finish) {
                start = existing.finish;
                startAdjusted = true;
            } else if (finish > existing.start && finish <= existing.finish && start < existing.start) {
                finish = existing.start;
                finishAdjusted = true;
            } else {
                return {
                    ok: false,
                    message: `This shift overlaps ${existing.label} and cannot be safely auto-adjusted. Edit the start or finish time.`
                };
            }
        }
    }

    if (finish <= start) {
        return { ok: false, message: "The overlap would leave no workable time. Edit the shift times." };
    }

    // Recheck after trimming, including any second/third shift.
    for (const existing of occupied) {
        if (start < existing.finish && finish > existing.start) {
            return {
                ok: false,
                message: `This shift still overlaps ${existing.label}. Edit the start or finish time.`
            };
        }
    }

    const toClock = (minutes) => {
        const normal = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
        return `${String(Math.floor(normal / 60)).padStart(2, "0")}:${String(normal % 60).padStart(2, "0")}`;
    };

    return {
        ok: true,
        start: toClock(start),
        finish: toClock(finish),
        autoAdjustedStart: startAdjusted,
        autoAdjustedFinish: finishAdjusted,
        autoOriginalStart: startAdjusted ? originalStart : null,
        autoOriginalFinish: finishAdjusted ? originalFinish : null
    };
}

function renderAutoAdjustMarkers(container, entry) {
    if (!container) return;
    const left = Boolean(entry?.autoAdjustedStart);
    const right = Boolean(entry?.autoAdjustedFinish);
    container.classList.toggle("hidden", !left && !right);
    if (!left && !right) {
        container.innerHTML = "";
        return;
    }
    const leftText = left
        ? `<span class="auto-adjust-marker auto-adjust-left" title="Start automatically adjusted from ${escapeHtml(entry.autoOriginalStart || "")} to ${escapeHtml(entry.start || "")}"><span class="amber-dot"></span> Start auto-adjusted</span>`
        : `<span></span>`;
    const rightText = right
        ? `<span class="auto-adjust-marker auto-adjust-right" title="Finish automatically adjusted from ${escapeHtml(entry.autoOriginalFinish || "")} to ${escapeHtml(entry.finish || "")}">Finish auto-adjusted <span class="amber-dot"></span></span>`
        : `<span></span>`;
    container.innerHTML = leftText + rightText;
}

function originalShiftMinutes(date) {
    if (!isRosterWorkingDay(date)) return 0;
    const shift = getShiftForDate(date).shift;
    const parts = String(shift.time || "").split("-");
    if (parts.length !== 2) return 0;
    const gross = calculatePaidMinutes(parts[0], parts[1], 0) || 0;
    const unpaidBreak = gross > 5 * 60 ? 30 : 0;
    return Math.max(0, gross - unpaidBreak);
}

function savePermanentChange(addAnother = false) {
    const type = permanentChangeType.value;
    const chosen = selectedPermanentShift();
    const all = loadPermanentChanges();
    const profileId = profiles[activeProfileIndex].id;
    const records = all[profileId] || {};
    const id = `change-${Date.now()}`;

    // Keep historical editing rules consistent across Casual, Part-time and Full-time.
    // Once a pay fortnight is finalised, permanent roster changes in that period are locked.
    if (
        type !== "add_shift" &&
        pendingCalendarDates.some((date) => isShiftFinalised(dateKey(date)))
    ) {
        alert("That pay fortnight has been finalised and its roster changes are locked.");
        return;
    }

    if (type === "leave") {
        if (!pendingCalendarDates.length) return;
        const ordered = [...pendingCalendarDates].sort((a, b) => a - b);
        const start = ordered[0];
        const finish = ordered[1] || ordered[0];
        const leaveCodes = { personal_leave: "PL", annual_leave: "AL", long_service_leave: "LSL", other_leave: "LV" };
        let applied = 0;
        for (let date = startOfDay(start); date <= finish; date = addDays(date, 1)) {
            if (!isRosterWorkingDay(date)) continue;
            const key = dateKey(date);
            records[key] = {
                id: `${id}-${key}`, date: key, type: "leave", leaveType: leaveType.value,
                leaveCode: leaveCodes[leaveType.value], leaveMinutes: originalShiftMinutes(date),
                rangeId: id, rangeStart: dateKey(start), rangeFinish: dateKey(finish),
                notes: permanentChangeNotes.value.trim()
            };
            applied += 1;
        }
        if (!applied) {
            alert("There are no rostered working days in that leave range.");
            return;
        }
    } else if (type === "add_shift") {
        if (!chosen || !permanentStartTime.value || !permanentFinishTime.value) {
            alert("Choose the shift and enter start and finish times.");
            return;
        }
        const date = pendingCalendarDates[0] || selectedDate;
        const existingAdded = editingAddedShiftId
            ? Object.values(loadAddedShifts()[profileId] || {}).flat().find((item) => item?.id === editingAddedShiftId)
            : null;
        const unlocked = existingAdded && loadUnlockedFinalShifts().has(finalShiftUnlockKey("added", existingAdded));
        if (isShiftFinalised(dateKey(date)) && !unlocked) {
            alert("That pay fortnight has been finalised. Use Alpha Administration in Settings to unlock the shift for testing.");
            return;
        }
        const originalDayCode = String(getShiftForDate(date).shift.code || "").toUpperCase();
        const baseWorkingShiftCount = ["O", "A", "", "-"].includes(originalDayCode) ? 0 : 1;
        const otherAddedShiftCount = getAddedShifts(date).filter((item) => item.id !== editingAddedShiftId).length;
        if (baseWorkingShiftCount + otherAddedShiftCount >= 3) {
            alert("A maximum of three worked shifts can be recorded for one day.");
            return;
        }
        const overlapFix = autoFixAddedShiftOverlap(
            date,
            permanentStartTime.value,
            permanentFinishTime.value,
            editingAddedShiftId,
            false
        );
        if (!overlapFix.ok) {
            alert(overlapFix.message);
            return;
        }
        permanentStartTime.value = overlapFix.start;
        permanentFinishTime.value = overlapFix.finish;
        const grossMinutes = calculatePaidMinutes(overlapFix.start, overlapFix.finish, 0) || 0;
        const unpaidBreakMinutes = grossMinutes > 5 * 60 ? 30 : (permanentBreak.checked ? 30 : 0);
        const entry = {
            id: existingAdded?.id || id, date: dateKey(date), type: "added_shift", code: chosen.code,
            start: overlapFix.start, finish: overlapFix.finish,
            autoAdjustedStart: overlapFix.autoAdjustedStart,
            autoAdjustedFinish: overlapFix.autoAdjustedFinish,
            autoOriginalStart: overlapFix.autoOriginalStart,
            autoOriginalFinish: overlapFix.autoOriginalFinish,
            unpaidBreakMinutes,
            paidMinutes: calculatePaidMinutes(overlapFix.start, overlapFix.finish, unpaidBreakMinutes),
            payClass: existingAdded?.payClass || (setup.employmentType === "fulltime" ? "overtime" : "extra_hours"),
            notes: permanentChangeNotes.value.trim(),
            createdAt: existingAdded?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        if (existingAdded) {
            deleteAddedShiftById(existingAdded.id);
            addAddedShift(entry);
        } else {
            addAddedShift(entry);
        }
    } else if (type === "swap") {
        if (![1, 2].includes(pendingCalendarDates.length)) {
            alert("Choose one date for a same-day swap, or two dates for a linked swap.");
            return;
        }
        if (!chosen || !permanentStartTime.value || !permanentFinishTime.value) {
            alert("Choose the shift you will work and its start and finish times.");
            return;
        }

        const grossNew = calculatePaidMinutes(permanentStartTime.value, permanentFinishTime.value, 0) || 0;
        const breakMinutes = grossNew > 5 * 60 ? 30 : (permanentBreak.checked ? 30 : 0);
        const newMinutes = calculatePaidMinutes(permanentStartTime.value, permanentFinishTime.value, breakMinutes) || 0;
        const firstDate = pendingCalendarDates[0];
        const firstResult = getShiftForDate(firstDate);
        const firstCode = String(firstResult.shift.code || "").toUpperCase();
        const firstOff = ["O", "A"].includes(firstCode);
        const partTime = setup.employmentType === "parttime";

        if (pendingCalendarDates.length === 1) {
            if (firstOff) {
                alert("A same-day swap must start from an original working shift.");
                return;
            }
            const requiredMinutes = originalShiftMinutes(firstDate);
            if (newMinutes !== requiredMinutes) {
                alert(`The replacement shift must match the normal paid hours for that day (${formatPaidMinutes(requiredMinutes)}).`);
                return;
            }
            const key = dateKey(firstDate);
            records[key] = {
                id, date: key, type: "swap_worked", swapType: swapType.value,
                sameDay: true, code: chosen.code,
                start: permanentStartTime.value, finish: permanentFinishTime.value,
                unpaidBreakMinutes: breakMinutes, originalCode: firstResult.shift.code,
                notes: permanentChangeNotes.value.trim()
            };
        } else {
            const secondDate = pendingCalendarDates[1];
            const secondResult = getShiftForDate(secondDate);
            const secondCode = String(secondResult.shift.code || "").toUpperCase();
            const secondOff = ["O", "A"].includes(secondCode);
            let firstKey = dateKey(firstDate);
            let secondKey = dateKey(secondDate);

            // For two-date swaps, tap order never matters. Normalize to the roles
            // expected by the existing save logic.
            if (!partTime) {
                if (firstOff === secondOff) {
                    alert("Choose one original working day and one RDO/ADO for this swap.");
                    return;
                }
                if (swapType.value === "individual" && !firstOff) {
                    pendingCalendarDates = [secondDate, firstDate];
                    return savePermanentChange();
                }
                if (swapType.value === "colleague" && firstOff) {
                    pendingCalendarDates = [secondDate, firstDate];
                    return savePermanentChange();
                }
            }

            if (swapType.value === "individual") {
                if (!partTime && (!firstOff || secondOff)) {
                    alert("For a full-time Individual Swap, choose one RDO/ADO and one original working day. Tap order does not matter.");
                    return;
                }
                if (partTime && secondOff) {
                    alert("The day becoming your replacement RDO must contain an original working shift so its hours can be moved.");
                    return;
                }
                const requiredMinutes = originalShiftMinutes(secondDate);
                if (newMinutes !== requiredMinutes) {
                    alert(`Swap hours must match. The shift being moved is ${formatPaidMinutes(requiredMinutes)}.`);
                    return;
                }
                if (partTime && !firstOff && shiftsOverlap(
                    firstResult.shift.time,
                    `${permanentStartTime.value}-${permanentFinishTime.value}`
                )) {
                    alert("The added swap shift overlaps the shift already rostered on that day.");
                    return;
                }
                records[firstKey] = {
                    id, date: firstKey, type: "swap_worked", swapType: "individual",
                    code: chosen.code, start: permanentStartTime.value, finish: permanentFinishTime.value,
                    unpaidBreakMinutes: breakMinutes, originalCode: firstResult.shift.code,
                    preserveOriginal: partTime && !firstOff,
                    linkedDate: secondKey, notes: permanentChangeNotes.value.trim()
                };
                records[secondKey] = {
                    id, date: secondKey, type: "swap_off", swapType: "individual", code: "O",
                    originalCode: secondResult.shift.code, linkedDate: firstKey, notes: "Nominated replacement RDO"
                };
            } else {
                if (firstOff) {
                    alert("For a Colleague Swap, choose one original working day and the replacement day. Tap order does not matter.");
                    return;
                }
                if (!partTime && !secondOff) {
                    alert("For a full-time Colleague Swap, the second date must be an original RDO/ADO.");
                    return;
                }
                const requiredMinutes = originalShiftMinutes(firstDate);
                if (newMinutes !== requiredMinutes) {
                    alert(`Colleague swap hours must match. The original shift is ${formatPaidMinutes(requiredMinutes)}.`);
                    return;
                }
                if (partTime && !secondOff && shiftsOverlap(
                    secondResult.shift.time,
                    `${permanentStartTime.value}-${permanentFinishTime.value}`
                )) {
                    alert("The colleague shift overlaps the shift already rostered on the replacement working day.");
                    return;
                }
                records[firstKey] = {
                    id, date: firstKey, type: "swap_off", swapType: "colleague", code: "O",
                    originalCode: firstResult.shift.code, linkedDate: secondKey,
                    notes: permanentChangeNotes.value.trim()
                };
                records[secondKey] = {
                    id, date: secondKey, type: "swap_worked", swapType: "colleague",
                    code: chosen.code, start: permanentStartTime.value, finish: permanentFinishTime.value,
                    unpaidBreakMinutes: breakMinutes, originalCode: secondResult.shift.code,
                    preserveOriginal: partTime && !secondOff,
                    linkedDate: firstKey, notes: permanentChangeNotes.value.trim()
                };
            }
        }
    } else {
        if (pendingCalendarDates.length !== 2) {
            alert("Choose both linked dates before saving.");
            return;
        }
        if (!managementChangeAllowed()) {
            alert("Management Roster Change is only available to full-time staff on a No ADO roster.");
            return;
        }
        const workDate = pendingCalendarDates[0];
        const offDate = pendingCalendarDates[1];
        const workResult = getShiftForDate(workDate);
        const offResult = getShiftForDate(offDate);
        const workCode = String(workResult.shift.code || "").toUpperCase();
        const offCode = String(offResult.shift.code || "").toUpperCase();
        if (["O", "A"].includes(workCode) || offCode !== "O") {
            alert("Management Roster Change requires an original working day first and an original RDO second.");
            return;
        }
        const parts = String(workResult.shift.time || "").split("-");
        const start = parts[0] || "";
        const finish = parts[1] || "";
        const workKey = dateKey(workDate);
        const offKey = dateKey(offDate);
        records[workKey] = {
            id, date: workKey, type: "roster_change_off", code: "O",
            originalCode: workResult.shift.code, linkedDate: offKey,
            notes: "Management replacement RDO"
        };
        records[offKey] = {
            id, date: offKey, type: "roster_change_worked", code: workResult.shift.code,
            start, finish, unpaidBreakMinutes: originalShiftMinutes(workDate) > 5 * 60 ? 30 : 0,
            originalCode: offResult.shift.code, linkedDate: workKey,
            notes: permanentChangeNotes.value.trim()
        };
    }

    all[profileId] = records;
    localStorage.setItem(STORAGE_PERMANENT_CHANGES, JSON.stringify(all));
    const continueAddingShift = addAnother &&
        type === "add_shift" &&
        setup?.employmentType === "parttime" &&
        !editingAddedShiftId;

    permanentChangePage.classList.add("hidden");
    editingAddedShiftId = null;
    pendingChangeAction = null;
    pendingCalendarDates = [];
    pendingLeaveType = "annual_leave";
    pendingSwapType = "individual";
    editingPermanentDates = false;
    permanentEditorSnapshot = null;
    renderHome();

    if (continueAddingShift) {
        openRosterCalendar("add_shift");
    }
}

function deleteSelectedRecord() {
    if (setup?.type === "casual") { deleteCasualShift(); return; }
    const change = getPermanentChange(selectedDate);
    if (!change || !confirm("Delete this roster change?")) return;
    const all = loadPermanentChanges();
    const profileId = profiles[activeProfileIndex].id;
    const records = all[profileId] || {};
    const key = dateKey(selectedDate);
    delete records[key];
    if (change.linkedDate && records[change.linkedDate]?.id === change.id) delete records[change.linkedDate];
    all[profileId] = records;
    localStorage.setItem(STORAGE_PERMANENT_CHANGES, JSON.stringify(all));
    renderHome();
}

let editingCasualShiftId = null;
function fillCasualShiftTimes() {
    const selected = casualShiftCode.value === ""
        ? null
        : shiftCodes[Number(casualShiftCode.value)];

    if (!selected) {
        return;
    }

    casualStartTime.value = selected.start;
    casualFinishTime.value = selected.finish;
    const gross = calculatePaidMinutes(selected.start, selected.finish, 0) || 0;
    casualBreak.checked = gross > 5 * 60;
    updateCasualPaidHours();
}

function openCasualShiftEditor(entryToEdit = null) {
    const entry = entryToEdit;
    editingCasualShiftId = entry?.id || null;
    casualShiftTitle.textContent = entry ? "Edit Casual Shift" : "Add Casual Shift";
    casualShiftDate.textContent = selectedDate.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const standardIndex = entry ? shiftCodes.findIndex((shift) => shift.code === entry.code && shift.start === entry.standardStart && shift.finish === entry.standardFinish) : -1;
    casualShiftCode.value = standardIndex >= 0 ? String(standardIndex) : "";
    casualStartTime.value = entry?.start || "";
    casualFinishTime.value = entry?.finish || "";
    const currentGross = calculatePaidMinutes(entry?.start || "", entry?.finish || "", 0) || 0;
    casualBreak.checked = entry ? (entry?.unpaidBreakMinutes === 30 || String(entry?.break || "").includes("30")) : currentGross > 5 * 60;
    deleteCasualEditorButton.classList.toggle("hidden", !entry);
    saveCasualShiftAddAnotherButton.classList.toggle("hidden", !!entry);
    casualArea.value = entry?.area || "";
    casualNotes.value = entry?.notes || "";
    renderAutoAdjustMarkers(casualAutoAdjustMarkers, entry);
    updateCasualPaidHours();
    casualShiftPage.classList.remove("hidden");
}

function closeCasualShiftEditor() {
    editingCasualShiftId = null;
    clearCasualShiftForm();
    casualShiftPage.classList.add("hidden");
}

function clearCasualShiftForm() {
    casualShiftCode.value = "";
    casualStartTime.value = "";
    casualFinishTime.value = "";
    casualBreak.checked = false;
    casualArea.value = "";
    casualNotes.value = "";
    renderAutoAdjustMarkers(casualAutoAdjustMarkers, null);
    updateCasualPaidHours();
}

function saveCasualShift(addAnother = false) {
    const editingEntryForLock = editingCasualShiftId ? getCasualShifts(selectedDate).find((item) => item.id === editingCasualShiftId) : null;
    const unlockedForAlpha = editingEntryForLock && loadUnlockedFinalShifts().has(finalShiftUnlockKey("casual", editingEntryForLock));
    if (isShiftFinalised(dateKey(selectedDate)) && !unlockedForAlpha) {
        alert("That pay fortnight has been finalised. Use Alpha Administration in Settings to unlock the shift for testing.");
        return;
    }
    const standard = casualShiftCode.value === ""
        ? null
        : shiftCodes[Number(casualShiftCode.value)];

    if (!standard || !casualStartTime.value || !casualFinishTime.value) {
        alert("Choose a shift code and enter both start and finish times.");
        return;
    }

    const existing = editingCasualShiftId ? getCasualShifts(selectedDate).find((item) => item.id === editingCasualShiftId) : null;
    const overlapFix = autoFixAddedShiftOverlap(
        selectedDate,
        casualStartTime.value,
        casualFinishTime.value,
        editingCasualShiftId,
        true
    );
    if (!overlapFix.ok) {
        alert(overlapFix.message);
        return;
    }
    casualStartTime.value = overlapFix.start;
    casualFinishTime.value = overlapFix.finish;
    const entry = {
        id: existing?.id || `casual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: dateKey(selectedDate),
        code: standard.code,
        standardStart: standard.start,
        standardFinish: standard.finish,
        start: overlapFix.start,
        finish: overlapFix.finish,
        autoAdjustedStart: overlapFix.autoAdjustedStart,
        autoAdjustedFinish: overlapFix.autoAdjustedFinish,
        autoOriginalStart: overlapFix.autoOriginalStart,
        autoOriginalFinish: overlapFix.autoOriginalFinish,
        timesEdited:
            overlapFix.start !== standard.start ||
            overlapFix.finish !== standard.finish,
        unpaidBreakMinutes: (calculatePaidMinutes(overlapFix.start, overlapFix.finish, 0) || 0) > 5 * 60 ? 30 : (casualBreak.checked ? 30 : 0),
        paidMinutes: calculatePaidMinutes(
            overlapFix.start,
            overlapFix.finish,
            (calculatePaidMinutes(overlapFix.start, overlapFix.finish, 0) || 0) > 5 * 60 ? 30 : (casualBreak.checked ? 30 : 0)
        ),
        area: casualArea.value.trim(),
        notes: casualNotes.value.trim(),
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const allShifts = loadAllCasualShifts();
    const profileId = profiles[activeProfileIndex].id;
    const profileShifts = allShifts[profileId] || {};
    const dayEntries = normaliseCasualDay(profileShifts[entry.date]);
    const editIndex = dayEntries.findIndex((item) => item.id === editingCasualShiftId);
    if (editIndex >= 0) dayEntries[editIndex] = entry;
    else {
        if (dayEntries.length >= 3) { alert("A maximum of three casual shifts can be recorded for one day."); return; }
        dayEntries.push(entry);
    }
    profileShifts[entry.date] = dayEntries;
    allShifts[profileId] = profileShifts;
    localStorage.setItem(STORAGE_CASUAL_SHIFTS, JSON.stringify(allShifts));

    const continueAddingShift = addAnother && !editingCasualShiftId;
    closeCasualShiftEditor();
    renderHome();
    if (continueAddingShift) {
        openRosterCalendar("add_shift");
    }
}

function deleteCasualShiftFromEditor() {
    const entry = getCasualShifts(selectedDate).find((item) => item.id === editingCasualShiftId);
    if (!entry || !confirm(`Delete the ${entry.code} shift on ${formatAustralianDate(selectedDate)}?`)) return;
    const allShifts = loadAllCasualShifts();
    const profileId = profiles[activeProfileIndex].id;
    const key = dateKey(selectedDate);
    const remaining = normaliseCasualDay(allShifts[profileId]?.[key]).filter((item) => item.id !== entry.id);
    if (remaining.length) allShifts[profileId][key] = remaining; else delete allShifts[profileId]?.[key];
    localStorage.setItem(STORAGE_CASUAL_SHIFTS, JSON.stringify(allShifts));
    closeCasualShiftEditor();
    renderHome();
}

function deleteCasualShift() {
    const entry = getCasualShift(selectedDate);

    if (!entry || !confirm(`Delete the ${entry.code} shift on ${formatAustralianDate(selectedDate)}?`)) {
        return;
    }

    const allShifts = loadAllCasualShifts();
    const profileId = profiles[activeProfileIndex].id;
    delete allShifts[profileId]?.[dateKey(selectedDate)];
    localStorage.setItem(STORAGE_CASUAL_SHIFTS, JSON.stringify(allShifts));
    renderHome();
}

function loadUnlockedFinalShifts() {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_UNLOCKED_FINAL_SHIFTS)) || []); }
    catch (error) { return new Set(); }
}

function saveUnlockedFinalShifts(set) {
    localStorage.setItem(STORAGE_UNLOCKED_FINAL_SHIFTS, JSON.stringify([...set]));
}

function finalShiftUnlockKey(kind, entry) {
    return `${kind}:${entry?.id || entry?.date || "unknown"}`;
}

function isEntryFinalised(kind, entry) {
    if (!entry) return false;
    if (loadUnlockedFinalShifts().has(finalShiftUnlockKey(kind, entry))) return false;
    return isShiftFinalised(entry.date);
}

function unlockFinalisedEntry(kind, entry) {
    const set = loadUnlockedFinalShifts();
    set.add(finalShiftUnlockKey(kind, entry));
    saveUnlockedFinalShifts(set);
}

function finalisationDate(dateValue) {
    const period = getPayPeriodForDate(parseDateKey(dateValue));
    return startOfDay(addDays(period.end, 3));
}

function finalisationCountdown(dateValue) {
    const lockAt = finalisationDate(dateValue);
    const ms = lockAt - new Date();
    if (ms <= 0) return "Unlocked for Alpha testing";
    const hours = Math.floor(ms / 3600000);
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    if (days > 0) return `${days} day${days === 1 ? "" : "s"} ${remHours} hour${remHours === 1 ? "" : "s"} till locked`;
    const minutes = Math.max(1, Math.floor(ms / 60000));
    if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} till locked`;
    return `${minutes} minute${minutes === 1 ? "" : "s"} till locked`;
}

function isShiftFinalised(dateValue, today = startOfDay(new Date())) {
    if (!dateValue) return false;
    // Fortnight end + two full calendar days remain editable. Lock from day 3.
    return today >= finalisationDate(dateValue);
}

function deleteCasualShiftByDate(dateValue) {
    const allShifts = loadAllCasualShifts();
    const profileId = profiles[activeProfileIndex]?.id;
    if (profileId && allShifts[profileId]) {
        delete allShifts[profileId][dateValue];
        localStorage.setItem(STORAGE_CASUAL_SHIFTS, JSON.stringify(allShifts));
    }
}

function loadAllCasualShifts() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_CASUAL_SHIFTS)) || {};
    } catch (error) {
        return {};
    }
}

function normaliseCasualDay(value) {
    if (!value) return [];
    const list = Array.isArray(value) ? value : [value];
    return list.map((entry, index) => ({ ...entry, id: entry.id || `legacy-${entry.date || "shift"}-${index}` }));
}

function getCasualShifts(date) {
    const profileId = profiles[activeProfileIndex]?.id;
    return normaliseCasualDay(loadAllCasualShifts()[profileId]?.[dateKey(date)]);
}

function getCasualShift(date) {
    return getCasualShifts(date)[0] || null;
}

function shiftTimeRange(timeText) {
    const parts = String(timeText || "").split("-");
    if (parts.length !== 2) return null;
    const toMinutes = (value) => {
        const [h,m] = String(value).split(":").map(Number);
        return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
    };
    let start = toMinutes(parts[0]);
    let finish = toMinutes(parts[1]);
    if (start === null || finish === null) return null;
    if (finish <= start) finish += 24 * 60;
    return { start, finish };
}

function shiftsOverlap(firstTime, secondTime) {
    const a = shiftTimeRange(firstTime);
    const b = shiftTimeRange(secondTime);
    if (!a || !b) return false;
    // Check the ordinary range plus a shifted copy for overnight spans.
    return (a.start < b.finish && b.start < a.finish) ||
        (a.start < b.finish + 1440 && b.start + 1440 < a.finish) ||
        (a.start + 1440 < b.finish && b.start < a.finish + 1440);
}

function calculatePaidMinutes(start, finish, unpaidBreakMinutes = 0) {
    if (!start || !finish) {
        return null;
    }

    const [startHour, startMinute] = start.split(":").map(Number);
    const [finishHour, finishMinute] = finish.split(":").map(Number);
    let duration =
        (finishHour * 60 + finishMinute) -
        (startHour * 60 + startMinute);

    if (duration <= 0) {
        duration += 24 * 60;
    }

    return Math.max(0, duration - unpaidBreakMinutes);
}

function formatPaidMinutes(minutes) {
    if (!Number.isFinite(minutes)) {
        return "-";
    }

    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return `${hours}:${String(remainder).padStart(2, "0")} hours`;
}

function updateCasualPaidHours() {
    const gross = calculatePaidMinutes(casualStartTime.value, casualFinishTime.value, 0) || 0;
    const minutes = calculatePaidMinutes(
        casualStartTime.value,
        casualFinishTime.value,
        gross > 5 * 60 ? 30 : (casualBreak.checked ? 30 : 0)
    );

    document.querySelector("#casual-paid-hours").textContent =
        `Paid hours: ${formatPaidMinutes(minutes)}`;
}

function getPayPeriodForDate(date) {
    const anchor = parseDateKey(PAY_PERIOD_ANCHOR_START);
    const daysFromAnchor = dayDifference(anchor, startOfDay(date));
    const periodNumber = Math.floor(daysFromAnchor / PAY_PERIOD_LENGTH_DAYS);
    const start = addDays(anchor, periodNumber * PAY_PERIOD_LENGTH_DAYS);
    const end = addDays(start, PAY_PERIOD_LENGTH_DAYS - 1);
    const payday = addDays(end, 1);
    return { start, end, payday };
}


function calculateRosterCycleFortnightMinutes(setupToUse = setup) {
    if (!setupToUse || setupToUse.type === "casual") return 0;
    const roster = rosters[setupToUse.rosterIndex];
    if (!roster?.shifts?.length) return 0;

    let totalCycleMinutes = 0;
    roster.shifts.forEach((shift) => {
        const code = String(shift?.code || "").toUpperCase();
        if (["", "-", "O", "A"].includes(code)) return;
        const parts = String(shift?.time || "").split("-");
        if (parts.length !== 2) return;
        const gross = calculatePaidMinutes(parts[0], parts[1], 0) || 0;
        const unpaidBreak = gross > 5 * 60 ? 30 : 0;
        totalCycleMinutes += Math.max(0, gross - unpaidBreak);
    });

    // Convert the complete roster cycle to its average fortnight entitlement.
    // Example: 252 days = 36 weeks = 18 fortnights.
    const fortnightsInCycle = roster.shifts.length / 14;
    return fortnightsInCycle > 0
        ? Math.round(totalCycleMinutes / fortnightsInCycle)
        : 0;
}

function rosterHeaderWeeklyMinutes(setupToUse = setup) {
    if (!setupToUse || setupToUse.type === "casual") return null;
    const name = String(rosters[setupToUse.rosterIndex]?.name || "");
    const match = name.match(/(\d{1,2})(?::(\d{2}))?\s*Hr\b/i);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2] || 0);
}

function calculateRosterMinutesForPeriod(period, setupToUse = setup) {
    if (!setupToUse || setupToUse.type === "casual") return 0;
    let total = 0;
    for (let date = startOfDay(period.start); date <= period.end; date = addDays(date, 1)) {
        const shift = getShiftForDate(date, setupToUse).shift;
        const code = String(shift?.code || "").toUpperCase();
        if (["", "-", "O", "A"].includes(code)) continue;
        const parts = String(shift?.time || "").split("-");
        if (parts.length !== 2) continue;
        const gross = calculatePaidMinutes(parts[0], parts[1], 0) || 0;
        const unpaidBreak = gross > 5 * 60 ? 30 : 0;
        total += Math.max(0, gross - unpaidBreak);
    }
    return total;
}

function renderPayPeriodSummary() {
    const period = getPayPeriodForDate(selectedDate);
    const profileId = profiles[activeProfileIndex]?.id;
    const casual = setup?.type === "casual";
    const extraEntries = casual
        ? loadAllCasualShifts()[profileId] || {}
        : loadPermanentChanges()[profileId] || {};

    let extraMinutes = 0;
    const leaveByType = {};

    if (casual) {
        Object.values(extraEntries).flatMap(normaliseCasualDay).forEach((entry) => {
            if (!entry?.date || entry.date < dateKey(period.start) || entry.date > dateKey(period.end)) return;
            const minutes = Number.isFinite(entry.paidMinutes)
                ? entry.paidMinutes
                : calculatePaidMinutes(entry.start, entry.finish, entry.unpaidBreakMinutes || 0);
            extraMinutes += Number.isFinite(minutes) ? minutes : 0;
        });
    } else {
        const added = loadAddedShifts()[profileId] || {};
        Object.values(added).flat().forEach((entry) => {
            if (!entry?.date || entry.date < dateKey(period.start) || entry.date > dateKey(period.end)) return;
            extraMinutes += Number(entry.paidMinutes) || 0;
        });
    }

    Object.values(extraEntries).forEach((entry) => {
        if (!entry?.date || entry.date < dateKey(period.start) || entry.date > dateKey(period.end)) return;
        if (!casual && entry.type === "leave") {
            const label = ({
                personal_leave: "Personal Leave",
                annual_leave: "Annual Leave",
                long_service_leave: "Long Service Leave",
                other_leave: "Other Leave"
            })[entry.leaveType] || "Leave";
            leaveByType[label] = (leaveByType[label] || 0) + (Number(entry.leaveMinutes) || originalShiftMinutes(parseDateKey(entry.date)) || 0);
        }
    });

    payPeriodDates.textContent = `Fortnight: ${formatAustralianDate(period.start)} - ${formatAustralianDate(period.end)}`;
    paydayDate.textContent = `Payday: ${formatAustralianDate(period.payday)}`;

    if (casual) {
        const ordinary = Math.min(extraMinutes, 76 * 60);
        const overtime = Math.max(0, extraMinutes - 76 * 60);
        const workableMinutesLeft = Math.max(0, 76 * 60 - ordinary);
        const lines = [];
        lines.push(`<span><b>Casual hours:</b> ${formatPaidMinutes(ordinary)}</span>`);
        lines.push(`<span class="${workableMinutesLeft <= 8 * 60 ? "workable-hours-warning" : "workable-hours-safe"}" title="${workableMinutesLeft <= 8 * 60 ? "Approaching the 76-hour ordinary-hours limit" : "Ordinary hours still available before overtime"}"><b>Workable hours left:</b> ${formatPaidMinutes(workableMinutesLeft)}</span>`);
        if (overtime > 0) lines.push(`<span><b>Overtime:</b> ${formatPaidMinutes(overtime)}</span>`);
        payPeriodHours.innerHTML = lines.join("");
    } else {
        const fulltime = setup.employmentType !== "parttime";
        const headerWeekly = rosterHeaderWeeklyMinutes(setup);
        const standard = !fulltime && headerWeekly !== null
            ? headerWeekly * 2
            : (calculateRosterMinutesForPeriod(period, setup) || calculateRosterCycleFortnightMinutes(setup) || ((setup.contractedWeeklyHours || 38) * 2 * 60));
        const additionalOrdinary = fulltime ? 0 : Math.min(extraMinutes, Math.max(0, 76 * 60 - standard));
        const overtime = fulltime ? extraMinutes : Math.max(0, extraMinutes - additionalOrdinary);
        const workableMinutesLeft = fulltime ? 0 : Math.max(0, 76 * 60 - standard - additionalOrdinary);
        const lines = [];

        if (!fulltime) {
            lines.push(`<span><b>Extra hours:</b> ${formatPaidMinutes(additionalOrdinary)}</span>`);
            lines.push(`<span class="${workableMinutesLeft <= 8 * 60 ? "workable-hours-warning" : "workable-hours-safe"}" title="${workableMinutesLeft <= 8 * 60 ? "Approaching the 76-hour ordinary-hours limit" : "Ordinary hours still available before overtime"}"><b>Workable hours left:</b> ${formatPaidMinutes(workableMinutesLeft)}</span>`);
        }
        if (overtime > 0) lines.push(`<span><b>Overtime:</b> ${formatPaidMinutes(overtime)}</span>`);

        const leaveLines = [];
        Object.entries(leaveByType).forEach(([label, minutes]) => {
            if (minutes > 0) leaveLines.push(`<span><b>${escapeHtml(label)}:</b> ${formatPaidMinutes(minutes)}</span>`);
        });
        if (leaveLines.length) {
            lines.push(`<span class="pay-summary-divider" aria-hidden="true"></span>`);
            lines.push(...leaveLines);
        }

        payPeriodHours.innerHTML = lines.join("");
    }
    payPeriodSummary.classList.remove("hidden");
}
function clearActiveProfileRosterData() {
    const profileId = profiles[activeProfileIndex]?.id;
    if (!profileId) return;

    // Collect final-shift unlock keys belonging to this profile before the shifts are removed.
    const unlockKeysToRemove = new Set();
    const casualEntries = Object.values(loadAllCasualShifts()[profileId] || {}).flatMap(normaliseCasualDay);
    casualEntries.forEach((entry) => unlockKeysToRemove.add(finalShiftUnlockKey("casual", entry)));
    const addedEntries = Object.values(loadAddedShifts()[profileId] || {}).flat().filter(Boolean);
    addedEntries.forEach((entry) => unlockKeysToRemove.add(finalShiftUnlockKey("added", entry)));

    const stores = [
        [STORAGE_CASUAL_SHIFTS, loadAllCasualShifts()],
        [STORAGE_PERMANENT_CHANGES, loadPermanentChanges()],
        [STORAGE_ADDED_SHIFTS, loadAddedShifts()]
    ];

    stores.forEach(([storageKey, all]) => {
        if (Object.prototype.hasOwnProperty.call(all, profileId)) {
            delete all[profileId];
            localStorage.setItem(storageKey, JSON.stringify(all));
        }
    });

    if (unlockKeysToRemove.size) {
        const unlocked = loadUnlockedFinalShifts();
        unlockKeysToRemove.forEach((key) => unlocked.delete(key));
        saveUnlockedFinalShifts(unlocked);
    }

    editingAddedShiftId = null;
    editingCasualShiftId = null;
}

function resetSetup() {
    const casual = setup?.type === "casual";
    const reset = confirm(casual
        ? "Reset Casual Shift Log?\n\nThis will remove all saved casual shifts for this profile. Your profile and app settings will remain."
        : "Reset this roster?\n\nThis will remove leave, swaps, management changes, extra/overtime shifts and final-shift test unlocks for this profile. Your profile and app settings will remain."
    );

    if (!reset) {
        return;
    }

    clearActiveProfileRosterData();
    setup = null;
    profiles[activeProfileIndex].setup = null;
    saveProfiles();

    homeScreen.classList.add("hidden");
    setupScreen.classList.remove("hidden");

    rosterSelect.value = "";
    rosterDayInput.value = "";

    // A full roster reset returns the 7-day panel to its normal visible state.
    localStorage.removeItem(STORAGE_WEEK_PANEL_HIDDEN);
    setWeekPanelHidden(false, false);

    // Reset the optional roster-day helper as well, so a fresh setup
    // never reuses the previous row/position selection.
    helperRosterRow = null;
    helperRosterColumn = null;
    if (rosterDayHelpCheckbox) rosterDayHelpCheckbox.checked = false;
    if (rosterDayHelper) rosterDayHelper.classList.add("hidden");
    if (rosterHelperRows) rosterHelperRows.innerHTML = "";
    if (rosterHelperWeeks) rosterHelperWeeks.innerHTML = "";
    if (rosterHelperResult) rosterHelperResult.textContent = "Select a row and today's position.";

    plannerType.value = "fulltime";
    updateSetupFields();
}

function getShiftForDate(date, setupToUse = setup) {
    const roster = rosters[setupToUse.rosterIndex];

    const anchorDate =
        parseDateKey(setupToUse.anchorDate);

    const difference =
        dayDifference(anchorDate, startOfDay(date));

    const zeroBasedPosition = positiveModulo(
        setupToUse.anchorPosition - 1 + difference,
        roster.shifts.length
    );

    return {
        position: zeroBasedPosition + 1,
        shift: roster.shifts[zeroBasedPosition]
    };
}

function displayShift(shift) {
    const upperCode = shift.code.toUpperCase();

    if (upperCode === "O") {
        return "Rostered Day Off";
    }

    if (upperCode === "A") {
        return "Accrued Day Off";
    }

    const code = friendlyCode(shift.code);
    const time = friendlyTime(shift);

    if (!time || time === code) {
        return code;
    }

    return `${code} - ${time}`;
}

function friendlyCode(code) {
    const upperCode = code.toUpperCase();

    if (upperCode === "O") {
        return "RDO";
    }

    if (upperCode === "A") {
        return "ADO";
    }

    return code;
}

function friendlyTime(shift) {
    const value = shift.time.trim();
        const upperCode = shift.code.toUpperCase();

    if (upperCode === "O") {
        return "Rostered Day Off";
    }

    if (upperCode === "A") {
        return "Accrued Day Off";
    }
    if (!value) {
        return shift.code;
    }

    if (
        value.toUpperCase() === "RDO" ||
        value.toUpperCase() === "ADO" ||
        !value.includes("-")
    ) {
        return value;
    }

    const [start, finish] = value.split("-");

    return `${formatClockTime(start)} - ${formatClockTime(finish)}`;
}

function formatClockTime(value) {
    const [hourText, minuteText] = value.trim().split(":");
    const hour = Number(hourText);
    const minute = Number(minuteText);

    if (
        !Number.isInteger(hour) ||
        !Number.isInteger(minute)
    ) {
        return value.trim();
    }

    const suffix = hour >= 12 ? "pm" : "am";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function printRosterGrid() {
    const roster = rosters[setup.rosterIndex];
    const existing = document.querySelector(".print-options-overlay");
    if (existing) existing.remove();

    const today = startOfDay(new Date());
    const anchor = new Date(2026, 6, 30); // Thu 30 Jul 2026
    const diffDays = Math.floor((today - anchor) / 86400000);
    const currentBlockIndex = Math.floor(diffDays / 28);
    const currentBlockStart = addDays(anchor, currentBlockIndex * 28);

    const overlay = document.createElement("div");
    overlay.className = "print-options-overlay";
    overlay.style.cssText = "position:fixed;inset:0;z-index:10000;background:#ececec;display:grid;grid-template-columns:minmax(210px,260px) 1fr;font-family:Arial,sans-serif;color:#111";

    overlay.innerHTML = `
      <aside class="print-settings-panel" style="background:#fff;border-right:1px solid #c8c8c8;padding:18px;overflow:auto">
        <div style="font-size:22px;font-weight:900;margin-bottom:5px">H&eacute; Gu&#464; PLANNER</div>
        <div style="font-size:12px;line-height:1.35;margin-bottom:18px;color:#444">
          Personal planning tool. Compare this grid with your employer's official roster.
        </div>

        <div style="border-top:1px solid #aaa;padding-top:15px">
          <h2 style="font-size:16px;margin:0 0 14px">PRINT SETTINGS</h2>

          <label style="display:block;margin-bottom:14px">
            <strong>Print Type</strong><br>
            <select id="print-test-type" style="width:100%;margin-top:6px;padding:10px;font:inherit">
              <option value="dated" selected>Dated Roster</option>
              <option value="block">Roster</option>
            </select>
          </label>

          <label id="print-start-wrap" style="display:block;margin-bottom:14px">
            <strong>Start</strong><br>
            <select id="print-test-start" style="width:100%;margin-top:6px;padding:10px;font:inherit"></select>
          </label>

          <label id="print-count-wrap" style="display:block;margin-bottom:14px">
            <strong>Months</strong><br>
            <select id="print-test-count" style="width:100%;margin-top:6px;padding:10px;font:inherit"></select>
          </label>

          <label id="print-theme-wrap" style="display:block;margin-bottom:14px">
            <strong>Theme</strong><br>
            <select id="print-test-theme" style="width:100%;margin-top:6px;padding:10px;font:inherit">
              <option value="plain" selected>Plain</option>
              <option value="cars">Cars</option>
              <option value="cats">Cats</option>
            </select>
          </label>

          <label id="print-fade-wrap" style="display:flex;gap:9px;align-items:flex-start;margin:4px 0 15px">
            <input id="print-test-fade" type="checkbox" checked style="margin-top:2px">
            <span>Fade completed dates to 30%</span>
          </label>

          <div id="print-info" style="padding:11px;border-radius:9px;background:#f3f3f3;font-size:12px;line-height:1.4;margin-bottom:16px"></div>

          <button id="print-test-print" type="button" style="width:100%;padding:12px 14px;border:0;border-radius:10px;background:#ffb020;font-weight:900;font:inherit;margin-bottom:9px">
            Print or Save PDF
          </button>
          <button id="print-test-cancel" type="button" style="width:100%;padding:12px 14px;border:1px solid #555;border-radius:10px;background:#252a30;color:#fff;font-weight:900;font:inherit">
            Back to H&eacute; Gu&#464;
          </button>
        </div>
      </aside>

      <main style="min-width:0;overflow:auto;padding:16px">
        <iframe id="print-test-frame" style="width:100%;height:100%;min-height:720px;border:1px solid #bbb;background:#fff;box-shadow:0 3px 16px rgba(0,0,0,.12)"></iframe>
      </main>`;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    const type = overlay.querySelector("#print-test-type");
    const startSelect = overlay.querySelector("#print-test-start");
    const count = overlay.querySelector("#print-test-count");
    const fade = overlay.querySelector("#print-test-fade");
    const theme = overlay.querySelector("#print-test-theme");
    const frame = overlay.querySelector("#print-test-frame");
    const info = overlay.querySelector("#print-info");

    for (let i = -2; i <= 12; i++) {
        const d = addDays(currentBlockStart, i * 28);
        const label = `${i === 0 ? "Current - " : ""}${d.toLocaleDateString("en-AU", {
            day: "2-digit", month: "short", year: "2-digit"
        })}`;
        const opt = new Option(label, `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
        if (i === 0) opt.selected = true;
        startSelect.add(opt);
    }

    const maxMonthsOnPage = 8;
    for (let i = 1; i <= maxMonthsOnPage; i++) {
        count.add(new Option(`${i} Month Roster${i === 1 ? "" : "s"}`, String(i)));
    }
    count.value = "3";

    function buildPrintDocument() {
        if (type.value === "block") {
            return buildRosterPrintDocument(roster, { block: true, theme: theme.value });
        }

        const [y,m,d] = startSelect.value.split("-").map(Number);
        return buildRosterPrintDocument(roster, {
            block: false,
            firstThursday: new Date(y, m-1, d),
            lineCount: Number(count.value),
            fadePast: fade.checked,
            theme: theme.value
        });
    }

    function refreshPreview() {
        const dated = type.value === "dated";
        overlay.querySelector("#print-start-wrap").style.display = dated ? "block" : "none";
        overlay.querySelector("#print-count-wrap").style.display = dated ? "block" : "none";
        overlay.querySelector("#print-fade-wrap").style.display = dated ? "flex" : "none";

        if (dated) {
            const [y,m,d] = startSelect.value.split("-").map(Number);
            const start = new Date(y,m-1,d);
            const end = addDays(start, Number(count.value) * 28 - 1);
            info.innerHTML = `<strong>Dated Roster</strong><br>${start.toLocaleDateString("en-AU",{day:"2-digit",month:"short",year:"2-digit"})} &ndash; ${end.toLocaleDateString("en-AU",{day:"2-digit",month:"short",year:"2-digit"})}`;
        } else {
            info.innerHTML = `<strong>Roster</strong><br>Repeating roster pattern. No calendar dates.`;
        }

        frame.srcdoc = buildPrintDocument();
    }

    type.addEventListener("change", refreshPreview);
    startSelect.addEventListener("change", refreshPreview);
    count.addEventListener("change", refreshPreview);
    fade.addEventListener("change", refreshPreview);
    theme.addEventListener("change", refreshPreview);

    overlay.querySelector("#print-test-print").onclick = () => {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
    };

    overlay.querySelector("#print-test-cancel").onclick = () => {
        overlay.remove();
        document.body.style.overflow = "";
    };

    refreshPreview();
}

function buildRosterPrintDocument(roster, options) {
    const today = startOfDay(new Date());
    let content = "";

    // Theme artwork is confined to shallow header/footer zones.
    let headerArt = "";
    let footerArt = "";
    if (options.theme === "cars") {
        headerArt = `<div class="art-zone art-header cars"><span>&#128663;</span><span>MOTOR</span><span>&#128663;</span><span>DRIVE</span><span>&#128663;</span></div>`;
        footerArt = `<div class="art-zone art-footer cars"><span>&#128663; &#128663; &#128663;</span></div>`;
    } else if (options.theme === "cats") {
        headerArt = `<div class="art-zone art-header cats"><span>&#128049;</span><span>&#128049;</span><span>&#128049;</span><span>&#128049;</span></div>`;
        footerArt = `<div class="art-zone art-footer cats"><span>&#128049; &#128049; &#128049; &#128049; &#128049;</span></div>`;
    }
    if (options.block) {
        const rowCount = Math.ceil(roster.shifts.length / 28);
        const weekdayCycle = ["Thu","Fri","Sat","Sun","Mon","Tue","Wed"];
        let weekdayHeader = "";
        for (let i=0;i<28;i++) weekdayHeader += `<th>${weekdayCycle[i % 7]}</th>`;

        let rows = "";
        for (let row=0; row<rowCount; row++) {
            let numCells = "";
            let shiftCells = "";
            for (let col=0; col<28; col++) {
                const idx = row*28 + col;
                const shift = roster.shifts[idx];
                if (shift) {
                    numCells += `<td class="position">${escapeHtml(String(shift.number))}</td>`;
                    shiftCells += `<td class="shift"><strong>${escapeHtml(shift.code)}</strong></td>`;
                } else {
                    numCells += "<td></td>";
                    shiftCells += "<td></td>";
                }
            }
            rows += `<tr><th class="line-label" rowspan="2">${row+1}</th>${numCells}</tr><tr>${shiftCells}</tr>`;
        }

        content = `<section class="block-roster"><h2>Roster</h2><table><thead><tr><th class="line-label">Line</th>${weekdayHeader}</tr></thead><tbody>${rows}</tbody></table></section>`;
    } else {
        for (let line=0; line<options.lineCount; line++) {
            const lineStart = addDays(options.firstThursday, line*28);
            const lineEnd = addDays(lineStart, 27);

            let ddd="", dates="", shifts="";
            for (let i=0;i<28;i++) {
                const date = addDays(lineStart, i);
                const past = options.fadePast && date < today;
                const isToday = date.getTime() === today.getTime();
                const cls = `${past ? "past" : ""} ${isToday ? "today" : ""}`;

                const code = rosterCalendarCode(date);
                const added = rosterCalendarAddedCodes(date);
                const shown = [code, ...added].filter(Boolean).slice(0,3).join("/");

                ddd += `<td class="${cls}">${date.toLocaleDateString("en-AU",{weekday:"short"}).slice(0,3)}</td>`;
                dates += `<td class="${cls}">${date.getDate()}</td>`;
                shifts += `<td class="${cls}"><strong>${escapeHtml(shown)}</strong></td>`;
            }

            content += `<section class="dated-line"><h2>${lineStart.toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})} &ndash; ${lineEnd.toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}</h2><table><tr class="ddd-row">${ddd}</tr><tr class="date-row">${dates}</tr><tr class="shift-row">${shifts}</tr></table></section>`;
        }
    }

    return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>${escapeHtml(roster.name)} Print</title>
<style>
  @page{size:A4 landscape;margin:7mm}
  *{box-sizing:border-box}
  body{margin:0;font-family:Arial,sans-serif;color:#111;background:#fff}
  header{display:flex;justify-content:space-between;align-items:end;margin-bottom:2.2mm}
  h1{font-size:19pt;margin:0}.sub{font-size:9.5pt}
  h2{font-size:9pt;margin:0 0 .45mm;text-align:center}
  table{border-collapse:collapse;table-layout:fixed;width:78%;min-width:78%;max-width:78%;margin-left:auto;margin-right:auto}
  th,td{border:1px solid #777;text-align:center;padding:.4mm .05mm}
  .block-roster .line-label{width:8mm;background:#222;color:#fff;font-size:7.5pt}
  .block-roster thead th:not(.line-label){background:#e7e7e7;font-size:7pt;height:5.5mm}
  .block-roster .position{font-size:7.2pt;height:5.2mm}
  .block-roster .shift{font-size:9.5pt;height:6.8mm}

  .dated-line{break-inside:avoid;margin:0 0 .45mm}
  .dated-line .ddd-row td{font-size:8.4pt;height:5.1mm;background:#e7e7e7;font-weight:700}
  .dated-line .date-row td{font-size:8.4pt;height:5.1mm;font-weight:700}
  .dated-line .shift-row td{font-size:8.4pt;height:5.5mm;font-weight:700}

  .past{opacity:.30}
  .today{opacity:1!important;outline:1.5px solid #111;outline-offset:-1.5px}
  .art-zone{
    width:78%;margin-left:auto;margin-right:auto;display:flex;align-items:center;
    justify-content:space-around;overflow:hidden;font-weight:800;color:#555
  }
  .art-header{height:6mm;margin-bottom:1.2mm;border-top:1px solid #bbb;border-bottom:1px solid #bbb;font-size:7.5pt}
  .art-footer{height:4mm;margin-top:1mm;border-top:1px solid #ccc;font-size:6.5pt}
  .art-zone.cars{font-style:italic;letter-spacing:1mm}
  .art-zone.cats{letter-spacing:.5mm}
  footer{margin-top:2mm;font-size:7pt;color:#555}

  @media print{
    body{print-color-adjust:exact;-webkit-print-color-adjust:exact}
  }
</style>
</head>
<body>
<header>
  <div>
    <h1>${escapeHtml(roster.name)}</h1>
    <div class="sub">${roster.shifts.length} roster positions &middot; Printed ${new Date().toLocaleDateString("en-AU")}</div>
  </div>
  <div class="sub">H&eacute; Gu&#464; PLANNER</div>
</header>
${headerArt}
${content}\n<footer>Personal planning tool. Compare this grid with your employer's official roster. Workplace roster changes must be confirmed with management.</footer>
</body>
</html>`;
}

function shiftClass(code) {
    const upperCode = code.toUpperCase();

    if (upperCode === "O") {
        return "off";
    }

    if (upperCode === "A") {
        return "ado";
    }

    return "";
}

function startOfDay(date) {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}

function addDays(date, numberOfDays) {
    const result = startOfDay(date);
    result.setDate(result.getDate() + numberOfDays);
    return result;
}

function dayDifference(firstDate, secondDate) {
    const millisecondsPerDay = 86400000;

    const firstUtc = Date.UTC(
        firstDate.getFullYear(),
        firstDate.getMonth(),
        firstDate.getDate()
    );

    const secondUtc = Date.UTC(
        secondDate.getFullYear(),
        secondDate.getMonth(),
        secondDate.getDate()
    );

    return Math.round(
        (secondUtc - firstUtc) / millisecondsPerDay
    );
}

function positiveModulo(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
}

function dateKey(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

function getActPublicHoliday(date) {
    return window.ACT_PUBLIC_HOLIDAYS?.[dateKey(date)] || "";
}

function getActSchoolHoliday(date) {
    const key = dateKey(date);
    const holidayPeriod = window.ACT_SCHOOL_HOLIDAYS?.find(
        (period) => key >= period.start && key <= period.end
    );
    return holidayPeriod?.name || "";
}

function getNswPublicHoliday(date) {
    return window.NSW_PUBLIC_HOLIDAYS?.[dateKey(date)] || "";
}

function getNswSchoolHoliday(date) {
    const key = dateKey(date);
    const holidayPeriod = window.NSW_SCHOOL_HOLIDAYS?.find(
        (period) => key >= period.start && key <= period.end
    );
    return holidayPeriod?.name || "";
}

function parseDateKey(value) {
    const [year, month, day] =
        value.split("-").map(Number);

    return new Date(year, month - 1, day);
}

function formatAustralianDate(date) {
    return [
        String(date.getDate()).padStart(2, "0"),
        String(date.getMonth() + 1).padStart(2, "0"),
        date.getFullYear()
    ].join("/");
}

function parseAustralianDate(value) {
    const match = value
        .trim()
        .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (!match) {
        return null;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

function endOfCurrentWeek(date) {
    const result = startOfDay(date);
    const daysUntilSunday = (7 - result.getDay()) % 7;

    return addDays(result, daysUntilSunday);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
window.addEventListener("load", () => {
  logHeguiEvent("app_open", {
    action: "open"
  });
});

// Ghost Escape integration
const ghostLauncher = document.querySelector("#ghost-launcher");
const ghostGameOverlay = document.querySelector("#ghost-game-overlay");
const ghostGameFrame = document.querySelector("#ghost-game-frame");
const ghostGameClose = document.querySelector("#ghost-game-close");

function closeGhostEscape() {
    ghostGameOverlay?.classList.add("hidden");
    if (ghostGameFrame) ghostGameFrame.src = "about:blank";
}

function runGhostAcrossHome() {
    closeGhostEscape();
    const runner = document.querySelector("#ghost-home-escape");
    if (!runner) return;
    runner.classList.remove("run");
    void runner.offsetWidth;
    runner.classList.add("run");
    window.setTimeout(() => runner.classList.remove("run"), 2800);
}

ghostLauncher?.addEventListener("click", () => {
    window.logHeguiEvent?.("ghost_escape_open", {
        action: "play_game"
    });
    if (ghostGameFrame) ghostGameFrame.src = "ghost-escape/ghost-escape.html";
    ghostGameOverlay?.classList.remove("hidden");
});
ghostGameClose?.addEventListener("click", closeGhostEscape);
window.addEventListener("message", event => {
    if (event.data && event.data.type === "hegui-ghost-escaped") runGhostAcrossHome();
});
