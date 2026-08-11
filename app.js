"use strict";

const STORAGE_DATA = "glacksRosterData";
const STORAGE_SETUP = "glacksRosterSetup";
const STORAGE_PROFILES = "heguiRosterProfiles";
const STORAGE_ACTIVE_PROFILE = "heguiActiveProfile";
const STORAGE_ACT_PUBLIC_HOLIDAYS =
    "heguiShowActPublicHolidays";
const STORAGE_ACT_SCHOOL_HOLIDAYS =
    "heguiShowActSchoolHolidays";
const STORAGE_CASUAL_SHIFTS = "heguiCasualShifts";
const STORAGE_PERMANENT_CHANGES = "heguiPermanentChanges";
const STORAGE_ADDED_SHIFTS = "heguiAddedShiftsV20";
const STORAGE_SHOW_STARTUP_SPLASH = "heguiShowStartupSplash";
const STORAGE_PERSONAL_CALENDAR = "heguiPersonalCalendar";
const STORAGE_PERSONAL_CALENDAR_CACHE = "heguiPersonalCalendarCacheV27";
const STORAGE_DISPLAY_THEME = "heguiDisplayTheme";
const STORAGE_UNLOCKED_FINAL_SHIFTS = "heguiUnlockedFinalShiftsAlphaV27";
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
let personalCalendarEvents = [];
let editingAddedShiftId = null;
const startupSplashStartedAt = Date.now();

const setupScreen = document.querySelector("#setup-screen");
const homeScreen = document.querySelector("#home-screen");
const rosterSelect = document.querySelector("#roster-select");
const rosterDayInput = document.querySelector("#roster-day");
const plannerType = document.querySelector("#planner-type");
const permanentSetupFields = document.querySelector("#permanent-setup-fields");
const profileTabs = document.querySelector("#profile-tabs");
const profileNameButton = document.querySelector("#profile-name-button");
const settingsButton = document.querySelector("#settings-button");
const extrasButton = document.querySelector("#extras-button");
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
const todayLabel = document.querySelector("#today-label");
const todayDate = document.querySelector("#today-date");
const publicHoliday = document.querySelector("#public-holiday");
const shiftCode = document.querySelector("#shift-code");
const shiftTime = document.querySelector("#shift-time");
const rosterName = document.querySelector("#roster-name");
const rosterPosition = document.querySelector("#roster-position");
const weekList = document.querySelector("#week-list");
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

const resetRosterButton =
    document.querySelector("#reset-roster");

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

function getPersonalCalendarEvents(date) {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORAGE_PERSONAL_CALENDAR)) || {}; } catch (error) {}
    if (!saved.enabled) return [];
    return personalCalendarEvents.filter((event) => personalEventOccursOnDate(event, date));
}

async function refreshPersonalCalendar(showStatus = false) {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORAGE_PERSONAL_CALENDAR)) || {}; } catch (error) {}
    if (!saved.enabled || !saved.url) return;
    if (showStatus && personalCalendarStatus) personalCalendarStatus.textContent = "Loading personal calendar…";
    try {
        const response = await fetch(normaliseCalendarFetchUrl(saved.url), { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        const events = parseIcsEvents(text);
        personalCalendarEvents = events;
        localStorage.setItem(STORAGE_PERSONAL_CALENDAR_CACHE, JSON.stringify({ updatedAt: new Date().toISOString(), events }));
        if (personalCalendarStatus) personalCalendarStatus.textContent = `Calendar active — ${events.length} events loaded.`;
        if (setup && rosters.length > 0) renderHome();
        if (!rosterCalendarPage?.classList.contains("hidden")) renderRosterCalendar();
    } catch (error) {
        if (personalCalendarStatus) {
            personalCalendarStatus.textContent = personalCalendarEvents.length
                ? "Could not refresh this ICS link in the browser. Showing the last saved calendar copy."
                : "Could not load this ICS link. The calendar provider may block direct browser access.";
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

showActSchoolHolidays =
    savedActSchoolHolidayPreference === "true";

actSchoolHolidaysCheckbox.checked =
    showActSchoolHolidays;

actSchoolHolidaysCheckbox.addEventListener("change", () => {
    showActSchoolHolidays =
        actSchoolHolidaysCheckbox.checked;

    localStorage.setItem(
        STORAGE_ACT_SCHOOL_HOLIDAYS,
        String(showActSchoolHolidays)
    );

    if (setup && rosters.length > 0) {
        renderHome();
    }
});

resetRosterButton.addEventListener("click", resetSetup);
plannerType.addEventListener("change", updateSetupFields);
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
document.querySelector("#save-permanent-change").addEventListener("click", savePermanentChange);
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
    .addEventListener("click", saveCasualShift);
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
        rosterSelect.innerHTML = '<option value="">Loading rosters…</option>';
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
            rosterSelect.innerHTML = '<option value="">Roster unavailable — load CSV below</option>';
            rosterSelect.disabled = true;
            if (!document.querySelector("#csv-loader")) {
                showCsvLoader();
            }
        }
    }

    showActiveProfile();
    dismissStartupSplash();

    if (rosterDataUpdated) {
        setTimeout(() => {
            alert(
                "Roster update installed.\n\n" +
                "Your latest roster information is now ready. " +
                "Your selected roster and starting number " +
                "have not changed."
            );
        }, 100);
    }
}

async function loadShiftCodes() {
    try {
        const response = await fetch(
            `shift_codes.csv?v=${Date.now()}`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("Shift-code file was not found.");
        }

        const rows = parseCsv(await response.text());
        shiftCodes = rows.slice(1).map((row) => ({
            code: row[0]?.trim() || "",
            start: row[1]?.trim() || "",
            finish: row[2]?.trim() || ""
        })).filter((shift) => shift.code && shift.start && shift.finish);
    } catch (error) {
        console.error("Shift-code loading failed:", error);
        shiftCodes = [];
    }

    fillCasualShiftList();
}

profileNameButton.addEventListener("click", renameActiveProfile);

document
    .querySelector("#check-setup")
    .addEventListener("click", beginSetupCheck);

document
    .querySelector("#previous-day")
    .addEventListener("click", () => changeSelectedDate(-1));

document
    .querySelector("#next-day")
    .addEventListener("click", () => changeSelectedDate(1));

document
    .querySelector("#print-roster")
    .addEventListener("click", printRosterGrid);


function loadSavedInformation() {
    try {
        rosters =
            JSON.parse(localStorage.getItem(STORAGE_DATA)) || [];

        const savedProfiles = JSON.parse(
            localStorage.getItem(STORAGE_PROFILES)
        );

        const legacySetup = JSON.parse(
            localStorage.getItem(STORAGE_SETUP)
        );

        profiles = normaliseProfiles(savedProfiles, legacySetup);

        const savedActiveProfile = Number(
            localStorage.getItem(STORAGE_ACTIVE_PROFILE)
        );

        activeProfileIndex = Number.isInteger(savedActiveProfile)
            && savedActiveProfile >= 0
            && savedActiveProfile < profiles.length
            ? savedActiveProfile
            : 0;

        setup = profiles[activeProfileIndex].setup;
        saveProfiles();
    } catch (error) {
        rosters = [];
        profiles = createDefaultProfiles();
        activeProfileIndex = 0;
        setup = profiles[0].setup;
    }
}

function createDefaultProfiles() {
    return DEFAULT_PROFILE_NAMES.map((name, index) => ({
        id: `profile-${index + 1}`,
        name,
        setup: null
    }));
}

function normaliseProfiles(savedProfiles, legacySetup) {
    const defaults = createDefaultProfiles();

    if (!Array.isArray(savedProfiles)) {
        defaults[0].setup = legacySetup || null;
        return defaults;
    }

    return defaults.map((profile, index) => {
        const saved = savedProfiles[index];

        if (!saved || typeof saved !== "object") {
            return profile;
        }

        return {
            id: profile.id,
            name: cleanProfileName(saved.name) || profile.name,
            setup: saved.setup || null
        };
    });
}

function cleanProfileName(value) {
    return typeof value === "string"
        ? value.trim().slice(0, 30)
        : "";
}

function saveProfiles() {
    localStorage.setItem(
        STORAGE_PROFILES,
        JSON.stringify(profiles)
    );

    localStorage.setItem(
        STORAGE_ACTIVE_PROFILE,
        String(activeProfileIndex)
    );
}

function renderProfileNavigation() {
    profileTabs.innerHTML = "";

    profiles.forEach((profile, index) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "profile-tab";
        button.textContent = profile.name;
        button.title = profile.name;
        button.setAttribute("role", "tab");
        button.setAttribute(
            "aria-selected",
            index === activeProfileIndex ? "true" : "false"
        );

        if (index === activeProfileIndex) {
            button.classList.add("active");
        }

        button.addEventListener("click", () => switchProfile(index));
        profileTabs.appendChild(button);
    });

    const activeProfile = profiles[activeProfileIndex];
    profileNameButton.textContent = activeProfile.name;
    profileNameButton.title = `Rename ${activeProfile.name}`;
}

function switchProfile(index) {
    if (index === activeProfileIndex) {
        return;
    }

    activeProfileIndex = index;
    setup = profiles[activeProfileIndex].setup;
    selectedDate = startOfDay(new Date());

    plannerType.value = setup?.type === "casual"
        ? "casual"
        : setup?.employmentType === "parttime"
            ? "parttime"
            : "fulltime";
    rosterSelect.value = setup && setup.type !== "casual"
        ? String(setup.rosterIndex)
        : "";
    rosterDayInput.value = setup && setup.type !== "casual"
        ? String(setup.anchorPosition)
        : "";
    updateSetupFields();

    saveProfiles();
    renderProfileNavigation();
    showActiveProfile();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function renameActiveProfile() {
    const currentProfile = profiles[activeProfileIndex];
    const enteredName = prompt(
        "Enter this profile’s name",
        currentProfile.name
    );

    if (enteredName === null) {
        return;
    }

    const cleanedName = cleanProfileName(enteredName);

    if (!cleanedName) {
        alert("Enter a profile name.");
        return;
    }

    currentProfile.name = cleanedName;
    saveProfiles();
    renderProfileNavigation();
}

function showActiveProfile() {
    if (setup) {
        showHomeScreen();
        return;
    }

    homeScreen.classList.add("hidden");
    setupScreen.classList.remove("hidden");
    plannerType.value = "fulltime";
    updateSetupFields();
}

function updateSetupFields() {
    const casualSelected = plannerType.value === "casual";
    permanentSetupFields.classList.toggle("hidden", casualSelected);
}

function showCsvLoader() {
    const card = setupScreen.querySelector(".card");

    const loader = document.createElement("div");
    loader.id = "csv-loader";

    loader.innerHTML = `
        <label for="csv-file">Load roster CSV</label>

        <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
        >

        <p class="instructions">
            Select the verified test-rosters.csv file.
            The roster information will be saved on this device.
        </p>
    `;

    card.insertBefore(
        loader,
        document.querySelector("#roster-select").previousElementSibling
    );

    document
        .querySelector("#csv-file")
        .addEventListener("change", importCsv);
}

function importCsv(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const rows = parseCsv(reader.result);

            rosters = convertRowsToRosters(rows);

            if (rosters.length === 0) {
                throw new Error("No rosters were found.");
            }

            localStorage.setItem(
                STORAGE_DATA,
                JSON.stringify(rosters)
            );

            document.querySelector("#csv-loader")?.remove();

            fillRosterList();

            alert(
                `${rosters.length} rosters loaded successfully.`
            );
        } catch (error) {
            alert(
                `The CSV could not be loaded.\n\n${error.message}`
            );
        }
    };

    reader.readAsText(file);
}

function parseCsv(text) {
    const cleanText = text.replace(/^\uFEFF/, "");
    const rows = [];

    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let index = 0; index < cleanText.length; index += 1) {
        const character = cleanText[index];
        const nextCharacter = cleanText[index + 1];

        if (character === '"') {
            if (insideQuotes && nextCharacter === '"') {
                value += '"';
                index += 1;
            } else {
                insideQuotes = !insideQuotes;
            }

            continue;
        }

        if (character === "," && !insideQuotes) {
            row.push(value.trim());
            value = "";
            continue;
        }

        if (
            (character === "\n" || character === "\r") &&
            !insideQuotes
        ) {
            if (character === "\r" && nextCharacter === "\n") {
                index += 1;
            }

            row.push(value.trim());

            if (row.some(cell => cell !== "")) {
                rows.push(row);
            }

            row = [];
            value = "";
            continue;
        }

        value += character;
    }

    row.push(value.trim());

    if (row.some(cell => cell !== "")) {
        rows.push(row);
    }

    return rows;
}

function convertRowsToRosters(rows) {
    if (rows.length < 2) {
        throw new Error("The CSV does not contain roster rows.");
    }

    const headings = rows[0];
    const foundRosters = [];

    for (
        let startColumn = 0;
        startColumn + 2 < headings.length;
        startColumn += 3
    ) {
        const name = headings[startColumn + 1]?.trim();

        if (!name) {
            continue;
        }

        const shifts = [];

        for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
            const rosterNumber =
                rows[rowIndex][startColumn]?.trim() || "";

            const code =
                rows[rowIndex][startColumn + 1]?.trim() || "";

            const time =
                rows[rowIndex][startColumn + 2]?.trim() || "";

            if (!rosterNumber && !code && !time) {
                continue;
            }

            if (!code) {
                continue;
            }

            shifts.push({
                number: Number(rosterNumber) || shifts.length + 1,
                code,
                time
            });
        }

        if (shifts.length > 0) {
            foundRosters.push({
                name,
                shifts
            });
        }
    }

    return foundRosters;
}

function fillRosterList() {
    rosterSelect.disabled = false;
    rosterSelect.innerHTML =
        '<option value="">Choose your roster</option>';

    rosters.forEach((roster, index) => {
        const option = document.createElement("option");

        option.value = String(index);
        option.textContent =
            `${roster.name} — ${roster.shifts.length} positions`;

        rosterSelect.appendChild(option);
    });
}

function beginSetupCheck() {
    if (plannerType.value === "casual") {
        setup = { type: "casual" };
        profiles[activeProfileIndex].setup = setup;
        saveProfiles();
        selectedDate = startOfDay(new Date());
        showHomeScreen();
        return;
    }

    const rosterIndex = Number(rosterSelect.value);
    const roster = rosters[rosterIndex];
    const anchorPosition = Number(rosterDayInput.value);

    if (!roster) {
        alert("Please select your roster.");
        return;
    }

    if (
        !Number.isInteger(anchorPosition) ||
        anchorPosition < 1 ||
        anchorPosition > roster.shifts.length
    ) {
        alert(
            `Enter a roster number between 1 and ${roster.shifts.length}.`
        );
        return;
    }

    const anchorDate = startOfDay(new Date());

    // Part-time hours are derived from the selected roster cycle;
    // the user does not need to type or validate them during setup.
    const derivedFortnightMinutes = plannerType.value === "parttime"
        ? calculateRosterCycleFortnightMinutes({ type: "roster", rosterIndex })
        : 76 * 60;
    const weeklyHours = derivedFortnightMinutes > 0
        ? derivedFortnightMinutes / 120
        : 38;

    const proposedSetup = {
        type: "roster",
        employmentType: plannerType.value,
        contractedWeeklyHours: weeklyHours,
        rosterIndex,
        anchorPosition,
        anchorDate: dateKey(anchorDate)
    };

    setup = proposedSetup;
    profiles[activeProfileIndex].setup = setup;
    saveProfiles();
logHeguiEvent("roster_selected", {
  roster: roster.name,
  action: "setup_saved",
  details: {
    roster_index: rosterIndex,
    anchor_position: anchorPosition,
    employment_type: plannerType.value
  }
});
    selectedDate = anchorDate;

    showHomeScreen();
}

function showHomeScreen() {
    setupScreen.classList.add("hidden");
    homeScreen.classList.remove("hidden");

    renderHome();
}

function renderHome() {
    if (setup?.type === "casual") {
        renderCasualHome();
        return;
    }

    editedDot.classList.add("hidden");
    addEditShiftButton.classList.add("hidden");
    editShiftsListButton.classList.add("hidden");
    deleteShiftButton.classList.add("hidden");
    printRosterButton.classList.remove("hidden");
    rosterActionButtons.classList.remove("hidden");

    const result = getShiftForDate(selectedDate);
    const change = getPermanentChange(selectedDate);
    const roster = rosters[setup.rosterIndex];
    const today = startOfDay(new Date());
    const differenceFromToday = dayDifference(today, selectedDate);

    if (differenceFromToday === 0) {
        todayLabel.textContent = "Today";
    } else if (differenceFromToday === 1) {
        todayLabel.textContent = "Tomorrow";
    } else if (differenceFromToday === -1) {
        todayLabel.textContent = "Yesterday";
    } else {
        todayLabel.textContent = "Selected date";
    }

    todayDate.textContent =
    selectedDate.toLocaleDateString("en-AU", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    const holidayName = showActPublicHolidays
        ? getActPublicHoliday(selectedDate)
        : "";

    if (holidayName) {
        publicHoliday.textContent =
            `ACT Public Holiday — ${holidayName}`;
        publicHoliday.classList.remove("hidden");
    } else {
        publicHoliday.textContent = "";
        publicHoliday.classList.add("hidden");
    }

    // The large card is the immutable base roster reference. Changes are shown
    // in the week/calendar and fortnight summary, never substituted into this card.
    shiftCard?.classList.remove("hidden");
    shiftCode.textContent = friendlyCode(result.shift.code);
    shiftTime.textContent = friendlyTime(result.shift);
    rosterName.textContent = roster.name;
    rosterPosition.textContent = `Roster number ${result.position} of ${roster.shifts.length}`;
    rosterPosition.classList.add("roster-position-corner");
    const dayModified = Boolean(change) || getAddedShifts(selectedDate).length > 0;
    editedDot.classList.toggle("hidden", !dayModified);
    editedDot.title = dayModified ? "This roster day has a change or added shift" : "";
    renderPayPeriodSummary();

    renderWeek();
}

function renderCasualHome() {
    rosterActionButtons.classList.remove("hidden");
    shiftCard?.classList.add("hidden");
    setSelectedDateHeading();
    renderHoliday(selectedDate);
    editedDot.classList.add("hidden");
    addEditShiftButton.classList.add("hidden");
    editShiftsListButton.classList.add("hidden");
    deleteShiftButton.classList.add("hidden");
    printRosterButton.classList.add("hidden");
    renderPayPeriodSummary();
    renderWeek();
}

function setSelectedDateHeading() {
    const today = startOfDay(new Date());
    const difference = dayDifference(today, selectedDate);

    todayLabel.textContent = difference === 0
        ? "Today"
        : difference === 1
            ? "Tomorrow"
            : difference === -1
                ? "Yesterday"
                : "Selected date";

    todayDate.textContent = selectedDate.toLocaleDateString("en-AU", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function renderHoliday(date) {
    const holidayName = showActPublicHolidays
        ? getActPublicHoliday(date)
        : "";

    publicHoliday.textContent = holidayName
        ? `ACT Public Holiday — ${holidayName}`
        : "";
    publicHoliday.classList.toggle("hidden", !holidayName);
}

function renderWeek() {
    weekList.innerHTML = "";
    const today = startOfDay(new Date());

    for (let offset = 0; offset < 7; offset += 1) {
        const date = addDays(selectedDate, offset);
        const result = setup?.type === "casual" ? null : getShiftForDate(date);
        const permanentChange = setup?.type === "casual" ? null : getPermanentChange(date);
        const row = document.createElement("button");
        row.type = "button";
        row.className = "week-day";

        const differenceFromToday = dayDifference(today, date);
        let label;
        if (differenceFromToday === 0) label = "Today";
        else if (differenceFromToday === 1) label = "Tomorrow";
        else if (date <= endOfCurrentWeek(today)) label = date.toLocaleDateString("en-AU", { weekday: "long" });
        else label = date.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });

        const holidayName = showActPublicHolidays ? getActPublicHoliday(date) : "";
        const holidayMarkup = holidayName ? `<span class="week-day-holiday">${escapeHtml(holidayName)}</span>` : "";
        const schoolHolidayName = showActSchoolHolidays ? getActSchoolHoliday(date) : "";
        const schoolHolidayIconMarkup = schoolHolidayName
            ? `<img class="school-holiday-icon" src="school-holidays-icon.png" alt="" aria-hidden="true">`
            : "";
        const schoolHolidayMarkup = schoolHolidayName ? `<span class="week-day-school-holiday">${escapeHtml(schoolHolidayName)}</span>` : "";

        const shiftItems = [];
        if (setup?.type === "casual") {
            getCasualShifts(date).forEach((entry) => {
                shiftItems.push({
                    text: `${entry.code} ${formatClockTime(entry.start)}–${formatClockTime(entry.finish)}`,
                    added: true,
                    edited: Boolean(entry.timesEdited)
                });
            });
        } else {
            if (permanentChange?.type === "swap_worked" && (permanentChange.sameDay || permanentChange.preserveOriginal)) {
                shiftItems.push({ text: displayShift(result.shift), original: true, strike: Boolean(permanentChange.sameDay) });
                shiftItems.push({ text: displayShift(permanentDisplayShift(permanentChange, result.shift)), added: true });
            } else if (permanentChange?.type === "swap_off") {
                shiftItems.push({ text: displayShift(result.shift), original: true, strike: true });
                shiftItems.push({ text: displayShift(permanentDisplayShift(permanentChange, result.shift)), added: true });
            } else {
                shiftItems.push({
                    text: permanentChange ? displayShift(permanentDisplayShift(permanentChange, result.shift)) : displayShift(result.shift),
                    added: Boolean(permanentChange)
                });
            }
            getAddedShifts(date).forEach((entry) => {
                shiftItems.push({ text: `${entry.code} ${formatClockTime(entry.start)}–${formatClockTime(entry.finish)}`, added: true });
            });
        }

        const hasOverflow = shiftItems.length > 3;
        const visibleShiftItems = shiftItems.slice(0, 3);
        const shiftMarkup = visibleShiftItems.length
            ? visibleShiftItems.map((item) => {
                const classes = [item.added ? "week-shift-added" : "week-shift-original"];
                if (item.strike) classes.push("swap-original");
                return `<span class="${classes.join(" ")}">${escapeHtml(item.text)}</span>`;
            }).join("")
            : "No shift";

        if (permanentChange || visibleShiftItems.some((item) => item.edited)) row.classList.add("edited-shift");
        if (hasOverflow) row.classList.add("week-shift-overflow");

        const personalEvents = getPersonalCalendarEvents(date);
        const personalEventMarkup = personalEvents.length
            ? `<span class="week-personal-events">${personalEvents.slice(0, 2).map((event) => `<span>${escapeHtml(event.summary || "Calendar event")}</span>`).join("")}${personalEvents.length > 2 ? `<span>+${personalEvents.length - 2} more</span>` : ""}</span>`
            : "";

        row.innerHTML = `
            ${hasOverflow ? '<span class="week-overflow-dot" title="More shifts — check Monthly View" aria-label="More shifts — check Monthly View"></span>' : ""}
            <span class="week-day-date">
                <span class="school-holiday-icon-slot">${schoolHolidayIconMarkup}</span>
                <span class="week-day-date-copy">
                    <span>${escapeHtml(label)}</span>
                    ${holidayMarkup}
                    ${schoolHolidayMarkup}
                </span>
            </span>
            <span class="week-day-shift">${shiftMarkup}${personalEventMarkup}</span>
        `;

        row.addEventListener("click", () => {
            selectedDate = date;
            renderHome();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        weekList.appendChild(row);
    }
}

function changeSelectedDate(numberOfDays) {
    selectedDate = addDays(selectedDate, numberOfDays);
    renderHome();
}

function lookUpDate() {
    openRosterCalendar("lookup");
}

function fillCasualShiftList() {
    casualShiftCode.innerHTML = '<option value="">Choose a shift</option>';
    permanentShiftCode.innerHTML = '<option value="">Choose a shift</option><option value="spare">Spare / No specific vacancy</option>';

    shiftCodes.forEach((shift, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = `${shift.code} — ${shift.start}–${shift.finish}`;
        casualShiftCode.appendChild(option);
        permanentShiftCode.appendChild(option.cloneNode(true));
    });
}

function loadPermanentChanges() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_PERMANENT_CHANGES)) || {};
    } catch (error) {
        return {};
    }
}

function getPermanentChange(date) {
    const profileId = profiles[activeProfileIndex]?.id;
    return loadPermanentChanges()[profileId]?.[dateKey(date)] || null;
}

function loadAddedShifts() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_ADDED_SHIFTS)) || {};
    } catch (error) {
        return {};
    }
}

function getAddedShifts(date) {
    const profileId = profiles[activeProfileIndex]?.id;
    const value = loadAddedShifts()[profileId]?.[dateKey(date)];
    return Array.isArray(value) ? value : value ? [value] : [];
}

function addAddedShift(entry) {
    const all = loadAddedShifts();
    const profileId = profiles[activeProfileIndex].id;
    const profile = all[profileId] || {};
    const list = Array.isArray(profile[entry.date]) ? profile[entry.date] : profile[entry.date] ? [profile[entry.date]] : [];
    list.push(entry);
    profile[entry.date] = list;
    all[profileId] = profile;
    localStorage.setItem(STORAGE_ADDED_SHIFTS, JSON.stringify(all));
}

function deleteAddedShiftById(id) {
    const all = loadAddedShifts();
    const profileId = profiles[activeProfileIndex].id;
    const profile = all[profileId] || {};
    Object.keys(profile).forEach((key) => {
        const list = (Array.isArray(profile[key]) ? profile[key] : [profile[key]]).filter((entry) => entry?.id !== id);
        if (list.length) profile[key] = list;
        else delete profile[key];
    });
    all[profileId] = profile;
    localStorage.setItem(STORAGE_ADDED_SHIFTS, JSON.stringify(all));
}

function openDeleteRecordPage(kind) {
    if (!setup) return;
    if (setup.type === "casual" && !["casual_shift", "finalised_shift"].includes(kind)) return;
    const profileId = profiles[activeProfileIndex]?.id;
    deleteRecordList.innerHTML = "";
    let items = [];

    if (kind === "casual_shift") {
        const profile = loadAllCasualShifts()[profileId] || {};
        items = Object.values(profile).flatMap(normaliseCasualDay).filter((entry) => !isEntryFinalised("casual", entry)).map((entry) => ({
            id: entry.id,
            sortDate: entry.date,
            label: `${formatAustralianDate(parseDateKey(entry.date))} — ${entry.code} ${entry.start}–${entry.finish}`,
            countdown: finalisationCountdown(entry.date),
            edit: () => {
                selectedDate = parseDateKey(entry.date);
                deleteRecordPage.classList.add("hidden");
                openCasualShiftEditor(entry);
            }
        }));
        deleteRecordTitle.textContent = "Edit Shifts";
    } else if (kind === "added_shift") {
        const profile = loadAddedShifts()[profileId] || {};
        items = Object.values(profile).flat().filter((entry) => !isEntryFinalised("added", entry)).map((entry) => ({
            id: entry.id,
            sortDate: entry.date,
            label: `${formatAustralianDate(parseDateKey(entry.date))} — ${entry.code} ${entry.start}–${entry.finish}${entry.payClass === "overtime" ? " · Overtime" : " · Extra hours"}`,
            countdown: finalisationCountdown(entry.date),
            edit: () => {
                deleteRecordPage.classList.add("hidden");
                openAddedShiftEditor(entry);
            }
        }));
        deleteRecordTitle.textContent = "Edit Added Shifts";
    } else if (kind === "delete_added_shift") {
        const profile = loadAddedShifts()[profileId] || {};
        items = Object.values(profile).flat().map((entry) => ({
            id: entry.id,
            sortDate: entry.date,
            label: `${formatAustralianDate(parseDateKey(entry.date))} — ${entry.code} ${entry.start}–${entry.finish}${entry.payClass === "overtime" ? " · Overtime" : " · Extra hours"}`,
            remove: () => deleteAddedShiftById(entry.id)
        }));
        deleteRecordTitle.textContent = "Delete Added Shift";
    } else if (kind === "finalised_shift") {
        const casualProfile = loadAllCasualShifts()[profileId] || {};
        const addedProfile = loadAddedShifts()[profileId] || {};
        const casualItems = Object.values(casualProfile).flatMap(normaliseCasualDay)
            .filter((entry) => isEntryFinalised("casual", entry))
            .map((entry) => ({
                id: `casual-${entry.id}`,
                sortDate: entry.date,
                label: `FINAL · ${formatAustralianDate(parseDateKey(entry.date))} — ${entry.code} ${entry.start}–${entry.finish}`,
                unlock: () => unlockFinalisedEntry("casual", entry)
            }));
        const addedItems = Object.values(addedProfile).flat()
            .filter((entry) => isEntryFinalised("added", entry))
            .map((entry) => ({
                id: `added-${entry.id}`,
                sortDate: entry.date,
                label: `FINAL · ${formatAustralianDate(parseDateKey(entry.date))} — ${entry.code} ${entry.start}–${entry.finish}${entry.payClass === "overtime" ? " · Overtime" : " · Extra hours"}`,
                unlock: () => unlockFinalisedEntry("added", entry)
            }));
        items = [...casualItems, ...addedItems];
        deleteRecordTitle.textContent = "Alpha — Unlock Finalised Shift";
    } else {
        const records = loadPermanentChanges()[profileId] || {};
        const wanted = kind === "swap"
            ? new Set(["swap_worked", "swap_off"])
            : new Set(["roster_change_worked", "roster_change_off"]);
        const groups = {};
        Object.values(records).filter((entry) => wanted.has(entry?.type)).forEach((entry) => {
            groups[entry.id] ||= [];
            groups[entry.id].push(entry);
        });
        items = Object.entries(groups).map(([id, entries]) => {
            const ordered = [...entries].sort((a,b) => a.date.localeCompare(b.date));
            const codes = ordered.map((e) => `${formatAustralianDate(parseDateKey(e.date))} ${e.originalCode && e.sameDay ? `${e.originalCode}→` : ""}${e.code || ""}`).join(" ↔ ");
            return {
                id,
                label: `${kind === "swap" ? (entries[0]?.swapType === "colleague" ? "Colleague Swap" : "Individual Swap") : "Management Change"} — ${codes}`,
                remove: () => deletePermanentLinkedRecord(id)
            };
        });
        deleteRecordTitle.textContent = kind === "swap" ? "Delete Swap" : "Delete Management Change";
    }

    items.sort((a,b) => String(a.sortDate || a.label).localeCompare(String(b.sortDate || b.label)));
    if (!items.length) {
        deleteRecordPage.classList.add("hidden");
        changeActionPage.classList.add("hidden");
        renderHome();
        return;
    }

    items.forEach((item, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "secondary-button full-width delete-record-item";
        if (index === 0 && ["added_shift", "casual_shift"].includes(kind)) button.classList.add("oldest-shift-item");
        const showCountdown = index === 0 && ["added_shift", "casual_shift"].includes(kind) && item.countdown;
        button.innerHTML = `<span class="record-item-label">${escapeHtml(item.label)}</span>${showCountdown ? `<span class="shift-lock-countdown">${escapeHtml(item.countdown)}</span>` : ""}`;
        button.addEventListener("click", () => {
            if (item.edit) {
                item.edit();
                return;
            }
            if (item.unlock) {
                if (!confirm(`Unlock ${item.label}?`)) return;
                item.unlock();
                renderHome();
                openDeleteRecordPage(kind);
                return;
            }
            if (!confirm(`Delete ${item.label}?`)) return;
            item.remove();
            renderHome();
            // Stay in the list only while there are more records to remove.
            openDeleteRecordPage(kind);
        });
        deleteRecordList.appendChild(button);
    });

    changeActionPage.classList.add("hidden");
    deleteRecordPage.classList.remove("hidden");
}

function deletePermanentLinkedRecord(id) {
    const all = loadPermanentChanges();
    const profileId = profiles[activeProfileIndex].id;
    const records = all[profileId] || {};
    Object.keys(records).forEach((key) => {
        if (records[key]?.id === id) delete records[key];
    });
    all[profileId] = records;
    localStorage.setItem(STORAGE_PERMANENT_CHANGES, JSON.stringify(all));
}

function permanentDisplayShift(change, original) {
    if (change.type === "leave") return { code: change.leaveCode, time: original.time };
    if (["swap_off", "roster_change_off"].includes(change.type)) return { code: change.code || "O", time: "Replacement day off" };
    return { code: change.code || original.code, time: `${change.start}-${change.finish}` };
}

function changeLabel(type) {
    return ({
        add_shift: "Casual / Extra Hours",
        leave: "Leave",
        swap_worked: "Worked swap day",
        swap_off: "Replacement day off",
        roster_change_worked: "Management roster change",
        roster_change_off: "Management moved day off"
    })[type] || "Roster change";
}

let pendingChangeAction = null;
let pendingLeaveType = "annual_leave";
let pendingSwapType = "individual";
let pendingCalendarDates = [];
let editingPermanentDates = false;
let permanentEditorSnapshot = null;

function rosterHasAdo() {
    if (!setup || setup.type === "casual") return false;
    return Boolean(rosters[setup.rosterIndex]?.shifts?.some((shift) => String(shift.code).toUpperCase() === "A"));
}

function managementChangeAllowed() {
    return setup?.type === "roster" && setup?.employmentType === "fulltime" && !rosterHasAdo();
}

function openChangeApplicationMenu() {
    if (!setup) return;
    const casual = setup.type === "casual";
    chooseLeaveButton.classList.toggle("hidden", casual);
    chooseIndividualSwapButton.classList.toggle("hidden", casual);
    chooseColleagueSwapButton.classList.toggle("hidden", casual);
    chooseManagementChangeButton.classList.toggle("hidden", casual);
    document.querySelector("#remove-leave")?.classList.toggle("hidden", casual);
    deleteSwapGlobalButton?.classList.toggle("hidden", casual);
    deleteAddedShiftGlobalButton?.classList.toggle("hidden", casual);
    deleteManagementGlobalButton?.classList.toggle("hidden", casual);
    chooseEditShiftsButton.classList.remove("hidden");
    chooseExtraHoursButton.textContent = casual ? "Add Casual Shift" : (setup.employmentType === "fulltime" ? "Add Overtime Shift" : "Add Extra Hours");
    chooseManagementChangeButton.disabled = !managementChangeAllowed();
    chooseManagementChangeButton.classList.toggle("action-locked", !managementChangeAllowed());
    chooseManagementChangeButton.title = managementChangeAllowed() ? "" : "Management Change is only available to full-time staff on a No ADO roster.";
    changeActionPage.classList.remove("hidden");
}
let rosterCalendarViewDate = startOfDay(new Date());

function openRosterCalendar(action) {
    if (!setup) return;
    if (action === "roster_change" && !managementChangeAllowed()) {
        alert("Management Roster Change is only available to full-time staff on a No ADO roster.");
        return;
    }
    pendingChangeAction = action;
    pendingCalendarDates = [];
    rosterCalendarViewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const config = {
        remove_leave: [
            "Deselect Leave",
            "Tap the start and finish dates of the leave you want to remove. Any leave type inside that range will be deselected."
        ],
        leave: [
            ({
                annual_leave: "Annual Leave",
                personal_leave: "Personal Leave",
                long_service_leave: "Long Service Leave",
                other_leave: "Other Leave"
            })[pendingLeaveType] || "Leave",
            "Tap any start date and finish date. The earlier date becomes Start and the later date becomes Finish. Hé Guǐ will apply leave only to rostered working days."
        ],
        swap: [
            pendingSwapType === "colleague" ? "Colleague Swap" : "Individual Swap",
            calendarSameDaySwap.checked
                ? "Choose one working day. You will then choose a replacement shift with exactly the same paid hours."
                : "Choose the two swap dates in either order. Hé Guǐ will identify the working and off days automatically. Swap hours must match and worked shifts must not overlap."
        ],
        add_shift: [setup.type === "casual" ? "Add Casual Shift" : (setup.employmentType === "fulltime" ? "Add Overtime Shift" : "Add Extra Hours"), "Choose one date."],
        roster_change: ["Management Roster Change", "First tap the original working day. Then tap the original RDO. Management changes are only available on No ADO rosters."],
        lookup: ["Choose Date", "Choose one date to view."],
        month_view: ["Monthly View", "Select a date and press OK to move the 7-day roster to that date. Your current pay fortnight is highlighted in light blue."]
    }[action];
    rosterCalendarTitle.textContent = config[0];
    rosterCalendarInstructions.textContent = config[1];
    calendarSameDayOption.classList.toggle("hidden", action !== "swap");
    if (action !== "swap") calendarSameDaySwap.checked = false;
    rosterCalendarPage.classList.remove("hidden");
    renderRosterCalendar();
}

function closeRosterCalendar() {
    const action = pendingChangeAction;
    rosterCalendarPage.classList.add("hidden");
    if (editingPermanentDates) {
        editingPermanentDates = false;
        permanentEditorSnapshot = null;
        permanentChangePage.classList.remove("hidden");
        renderPermanentChangeDateSummary();
        return;
    }
    pendingCalendarDates = [];
    pendingChangeAction = null;
    if (action === "leave") {
        leaveTypePage.classList.remove("hidden");
    } else if (action === "add_shift" && setup?.type === "casual") {
        renderHome();
    } else if (action === "month_view") {
        renderHome();
    } else if (["remove_leave", "swap", "add_shift", "roster_change"].includes(action)) {
        changeActionPage.classList.remove("hidden");
    }
}

function moveRosterCalendarMonth(offset) {
    rosterCalendarViewDate = new Date(rosterCalendarViewDate.getFullYear(), rosterCalendarViewDate.getMonth() + offset, 1);
    renderRosterCalendar();
}

function rosterCalendarCode(date) {
    if (setup?.type === "casual") {
        return getCasualShift(date)?.code || "";
    }
    const original = getShiftForDate(date).shift;
    const change = getPermanentChange(date);
    return change ? permanentDisplayShift(change, original).code : original.code;
}

function rosterCalendarAddedCodes(date) {
    if (setup?.type !== "roster") return [];
    return getAddedShifts(date).map((entry) => entry.code).filter(Boolean);
}

function calendarChangeIsAltered(date) {
    const change = getPermanentChange(date);
    return Boolean(change && ["swap_worked", "swap_off", "roster_change_worked", "roster_change_off"].includes(change.type));
}

function rosterCalendarColour(code) {
    const upper = String(code || "").toUpperCase();
    if (upper === "AL") return "calendar-yellow";
    if (["PL", "PERSONAL"].includes(upper)) return "calendar-pink";
    if (upper === "LSL") return "calendar-blue";
    if (["LV", "OTHER"].includes(upper)) return "calendar-green";
    if (["SDL", "SHUTDOWN"].includes(upper)) return "calendar-blue";
    if (["WE", "ELSEWHERE"].includes(upper)) return "calendar-green";
    return "";
}

function rosterCalendarFortnightShade(date) {
    const anchor = parseDateKey(PAY_PERIOD_ANCHOR_START);
    const daysFromAnchor = dayDifference(anchor, startOfDay(date));
    const periodNumber = Math.floor(daysFromAnchor / PAY_PERIOD_LENGTH_DAYS);
    const parity = ((periodNumber % 2) + 2) % 2;
    return parity === 0 ? "pay-fortnight-light" : "pay-fortnight-dark";
}

function renderRosterCalendar() {
    rosterCalendarGrid.innerHTML = "";
    const year = rosterCalendarViewDate.getFullYear();
    const month = rosterCalendarViewDate.getMonth();
    rosterCalendarMonth.textContent = new Date(year, month, 1).toLocaleDateString("en-AU", { month: "long", year: "numeric" });
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    for (let blank = 0; blank < firstDay; blank += 1) {
        const spacer = document.createElement("span");
        spacer.className = "roster-calendar-day blank";
        rosterCalendarGrid.appendChild(spacer);
    }
    const ordered = [...pendingCalendarDates].sort((a, b) => a - b);
    for (let day = 1; day <= days; day += 1) {
        const date = new Date(year, month, day);
        const key = dateKey(date);
        const code = rosterCalendarCode(date);
        const button = document.createElement("button");
        button.type = "button";
        const leaveColour = rosterCalendarColour(code);
        const fortnightShade = rosterCalendarFortnightShade(date);
        const addedCodes = rosterCalendarAddedCodes(date);
        const casualCodes = setup?.type === "casual"
            ? getCasualShifts(date).map((entry) => entry.code).filter(Boolean)
            : [];
        const altered = calendarChangeIsAltered(date);
        button.className = `roster-calendar-day ${fortnightShade} ${leaveColour}`.trim();
        const currentPeriod = getPayPeriodForDate(new Date());
        if (date >= startOfDay(currentPeriod.start) && date <= startOfDay(currentPeriod.end) && !leaveColour) button.classList.add("pay-fortnight-active");
        if (altered) button.classList.add("calendar-altered");
        if (pendingCalendarDates.some((picked) => dateKey(picked) === key)) button.classList.add("selected");
        if (["leave", "remove_leave"].includes(pendingChangeAction) && ordered.length === 2 && date >= ordered[0] && date <= ordered[1]) button.classList.add("in-range");
        const change = setup?.type === "roster" ? getPermanentChange(date) : null;
        const originalCode = setup?.type === "roster" ? String(getShiftForDate(date).shift.code || "") : "";
        const baseIsVisibleWithExtras = code && !["O", "A"].includes(String(code).toUpperCase());
        const codeItems = setup?.type === "casual"
            ? casualCodes.map((value) => ({ value, extra: true })).slice(0, 3)
            : addedCodes.length
                ? [
                    ...(baseIsVisibleWithExtras ? [{ value: code, extra: false }] : []),
                    ...addedCodes.map((value) => ({ value, extra: true }))
                  ].slice(0, 3)
                : [];
        if (change?.type === "swap_worked" && (change.sameDay || change.preserveOriginal)) {
            const originalMarkup = change.sameDay
                ? `<span class="calendar-roster-code swap-original">${escapeHtml(change.originalCode || originalCode || "—")}</span>`
                : `<span class="calendar-roster-code">${escapeHtml(change.originalCode || originalCode || "—")}</span>`;
            button.innerHTML = `${originalMarkup}<span class="calendar-roster-code swap-new">${escapeHtml(change.code || "—")}</span>`;
        } else if (change?.type === "swap_off") {
            button.innerHTML = `<span class="calendar-roster-code swap-original">${escapeHtml(change.originalCode || originalCode || "—")}</span><span class="calendar-roster-code swap-new">${escapeHtml(change.code || "O")}</span>`;
        } else if (codeItems.length) {
            const hideDateNumber = codeItems.length >= 3;
            button.innerHTML = `${hideDateNumber ? "" : `<span class="calendar-date-number">${day}</span>`}${codeItems.map((item) => `<span class="calendar-roster-code${item.extra ? " altered-code" : ""}">${escapeHtml(item.value)}</span>`).join("")}`;
        } else {
            button.innerHTML = `<span class="calendar-date-number">${day}</span><span class="calendar-roster-code">${escapeHtml(code || "—")}</span>`;
        }
        const calendarSchoolHoliday = showActSchoolHolidays ? getActSchoolHoliday(date) : "";
        const calendarPublicHoliday = showActPublicHolidays ? getActPublicHoliday(date) : "";
        if (calendarSchoolHoliday) {
            const icon = document.createElement("img");
            icon.className = "calendar-school-holiday-icon";
            icon.src = "school-holidays-icon.png";
            icon.alt = "";
            icon.title = calendarSchoolHoliday;
            button.appendChild(icon);
        }
        if (calendarPublicHoliday) {
            const marker = document.createElement("span");
            marker.className = "calendar-public-holiday-marker";
            marker.textContent = "PH";
            marker.title = calendarPublicHoliday;
            button.appendChild(marker);
        }
        const personalEvents = getPersonalCalendarEvents(date);
        if (personalEvents.length) {
            const event = document.createElement("span");
            event.className = "calendar-personal-event";
            event.textContent = personalEvents[0].summary || "Calendar";
            event.title = personalEvents.map((item) => item.summary || "Calendar event").join(" · ");
            button.appendChild(event);
        }
        button.addEventListener("click", () => chooseRosterCalendarDate(date));
        rosterCalendarGrid.appendChild(button);
    }
    updateRosterCalendarSummary();
}

function chooseRosterCalendarDate(date) {
    const action = pendingChangeAction;
    const originalCode = setup?.type === "casual" ? "" : String(getShiftForDate(date).shift.code || "").toUpperCase();
    const isOff = ["O", "A"].includes(originalCode);
    const partTime = setup?.employmentType === "parttime";

    if (["lookup", "month_view", "add_shift"].includes(action)) {
        pendingCalendarDates = [startOfDay(date)];
    } else if (["leave", "remove_leave"].includes(action)) {
        const key = dateKey(date);
        const existingIndex = pendingCalendarDates.findIndex((picked) => dateKey(picked) === key);
        if (existingIndex >= 0) {
            pendingCalendarDates.splice(existingIndex, 1);
        } else if (pendingCalendarDates.length >= 2) {
            pendingCalendarDates = [startOfDay(date)];
        } else {
            pendingCalendarDates.push(startOfDay(date));
        }
    } else if (action === "swap") {
        if (calendarSameDaySwap.checked) {
            if (isOff) {
                alert("A same-day swap must use an original working day.");
                return;
            }
            pendingCalendarDates = [startOfDay(date)];
        } else {
            const key = dateKey(date);
            const existingIndex = pendingCalendarDates.findIndex((picked) => dateKey(picked) === key);
            if (existingIndex >= 0) {
                pendingCalendarDates.splice(existingIndex, 1);
            } else if (pendingCalendarDates.length >= 2) {
                pendingCalendarDates = [startOfDay(date)];
            } else {
                pendingCalendarDates.push(startOfDay(date));
            }
        }
    } else if (action === "roster_change") {
        if (pendingCalendarDates.length === 0) {
            if (isOff) { alert("Choose the original working day first."); return; }
            pendingCalendarDates = [startOfDay(date)];
        } else if (pendingCalendarDates.length === 1) {
            if (originalCode !== "O") {
                alert("Management Roster Change requires an original RDO as the second date.");
                return;
            }
            pendingCalendarDates.push(startOfDay(date));
        } else {
            pendingCalendarDates = [];
            chooseRosterCalendarDate(date);
            return;
        }
    }
    renderRosterCalendar();
}

function updateRosterCalendarSummary() {
    const dates = pendingCalendarDates;
    calendarOk.disabled = dates.length === 0 || (pendingChangeAction === "roster_change" && dates.length !== 2) || (pendingChangeAction === "swap" && (calendarSameDaySwap.checked ? dates.length !== 1 : dates.length !== 2));
    if (!dates.length) {
        calendarSelectionSummary.textContent = "No date selected.";
        return;
    }
    if (["leave", "remove_leave"].includes(pendingChangeAction) && dates.length === 2) {
        const ordered = [...dates].sort((a, b) => a - b);
        calendarSelectionSummary.innerHTML = `<strong>Start:</strong> ${formatAustralianDate(ordered[0])}<br><strong>Finish:</strong> ${formatAustralianDate(ordered[1])}`;
        return;
    }
    if (["swap", "roster_change"].includes(pendingChangeAction)) {
        if (pendingChangeAction === "swap" && calendarSameDaySwap.checked && dates.length === 1) {
            calendarSelectionSummary.innerHTML = `<strong>Same-day swap:</strong> ${formatAustralianDate(dates[0])}`;
        } else if (pendingChangeAction === "swap" && pendingSwapType === "individual") {
            calendarSelectionSummary.innerHTML = `<strong>Working day:</strong> ${formatAustralianDate(dates[0])}${dates[1] ? `<br><strong>Day becoming RDO:</strong> ${formatAustralianDate(dates[1])}` : ""}`;
        } else {
            calendarSelectionSummary.innerHTML = `<strong>Original working day:</strong> ${formatAustralianDate(dates[0])}${dates[1] ? `<br><strong>Replacement working day:</strong> ${formatAustralianDate(dates[1])}` : ""}`;
        }
        return;
    }
    calendarSelectionSummary.textContent = formatAustralianDate(dates[0]);
}

function confirmRosterCalendar() {
    const action = pendingChangeAction;
    const dates = [...pendingCalendarDates];
    if (!dates.length) return;
    rosterCalendarPage.classList.add("hidden");
    if (["lookup", "month_view"].includes(action)) {
        selectedDate = dates[0];

    if (action === "month_view") {
        logHeguiEvent("calendar_date_selected", {
        action: "month_view",
        details: {
        selected_date: dateKey(dates[0])
        }
  });
}    
        pendingChangeAction = null;
        pendingCalendarDates = [];
        renderHome();
        return;
    }
    if (action === "add_shift" && setup?.type === "casual") {
        selectedDate = dates[0];
        pendingChangeAction = null;
        pendingCalendarDates = [];
        openCasualShiftEditor();
        return;
    }
    if (action === "remove_leave") {
        const ordered = [...dates].sort((a, b) => a - b);
        const start = ordered[0];
        const finish = ordered[1] || ordered[0];
        const all = loadPermanentChanges();
        const profileId = profiles[activeProfileIndex]?.id;
        const records = all[profileId] || {};
        let removed = 0;
        for (let date = startOfDay(start); date <= finish; date = addDays(date, 1)) {
            const key = dateKey(date);
            const entry = records[key];
            if (entry?.type === "leave") {
                delete records[key];
                removed += 1;
            }
        }
        all[profileId] = records;
        localStorage.setItem(STORAGE_PERMANENT_CHANGES, JSON.stringify(all));
        pendingChangeAction = null;
        pendingCalendarDates = [];
        if (!removed) alert("No leave was found in that date range.");
        renderHome();
        return;
    }
    if (editingPermanentDates) {
        pendingCalendarDates = dates.map(startOfDay);
        editingPermanentDates = false;
        permanentChangePage.classList.remove("hidden");
        restorePermanentEditorSnapshot();
        renderPermanentChangeDateSummary();
        return;
    }
    openPermanentChangeEditor(action, dates);
}

function renderPermanentChangeDateSummary() {
    const action = permanentChangeType.value;
    const ordered = [...pendingCalendarDates].sort((a, b) => a - b);
    document.querySelector("#permanent-change-date").textContent = action === "leave" && ordered.length > 1
        ? `${formatAustralianDate(ordered[0])}–${formatAustralianDate(ordered[ordered.length - 1])}`
        : pendingCalendarDates.map(formatAustralianDate).join(" · ");
    if (["swap", "roster_change"].includes(action) && pendingCalendarDates.length === 2) {
        swapDayOffDate.value = dateKey(pendingCalendarDates[1]);
        changeDateSummary.innerHTML = action === "swap" && swapType.value === "individual"
            ? `<strong>Working extra day:</strong> ${formatAustralianDate(pendingCalendarDates[0])}<br><strong>Nominated RDO:</strong> ${formatAustralianDate(pendingCalendarDates[1])}`
            : `<strong>Working day:</strong> ${formatAustralianDate(pendingCalendarDates[0])}<br><strong>RDO/ADO:</strong> ${formatAustralianDate(pendingCalendarDates[1])}`;
    } else {
        swapDayOffDate.value = "";
        changeDateSummary.textContent = "";
    }
}

function openAddedShiftEditor(entry) {
    if (!entry) return;
    editingAddedShiftId = entry.id;
    selectedDate = parseDateKey(entry.date);
    openPermanentChangeEditor("add_shift", [selectedDate]);
    const standardIndex = shiftCodes.findIndex((shift) => shift.code === entry.code);
    permanentShiftCode.value = standardIndex >= 0 ? String(standardIndex) : "spare";
    permanentStartTime.value = entry.start || "";
    permanentFinishTime.value = entry.finish || "";
    permanentBreak.checked = Number(entry.unpaidBreakMinutes || 0) >= 30;
    permanentChangeNotes.value = entry.notes || "";
    renderPermanentChangeDateSummary();
}

function openPermanentChangeEditor(action = "add_shift", dates = [selectedDate]) {
    if (action !== "add_shift" || !editingAddedShiftId) editingAddedShiftId = null;
    pendingChangeAction = action;
    pendingCalendarDates = dates.map(startOfDay);
    permanentChangeType.value = action;
    leaveType.value = pendingLeaveType || "annual_leave";
    swapType.value = pendingSwapType || "individual";
    permanentStartTime.value = "";
    permanentFinishTime.value = "";
    permanentBreak.checked = false;
    permanentChangeNotes.value = "";
    permanentShiftCode.value = "";
    renderPermanentChangeDateSummary();
    updatePermanentChangeFields();
    permanentChangePage.classList.remove("hidden");
}

function updatePermanentChangeFields() {
    const type = permanentChangeType.value;
    leaveTypeField.classList.add("hidden");
    swapTypeField.classList.toggle("hidden", type !== "swap");
    permanentShiftFields.classList.toggle("hidden", type === "leave" || type === "roster_change");
    swapDateField.classList.toggle("hidden", !["swap", "roster_change"].includes(type));
}

function selectedPermanentShift() {
    if (permanentShiftCode.value === "") return null;
    if (permanentShiftCode.value === "spare") {
        return { code: "SPARE", start: permanentStartTime.value, finish: permanentFinishTime.value };
    }
    return shiftCodes[Number(permanentShiftCode.value)] || null;
}

function fillPermanentShiftTimes() {
    if (permanentShiftCode.value === "" || permanentShiftCode.value === "spare") return;
    const shift = shiftCodes[Number(permanentShiftCode.value)];
    if (!shift) return;
    permanentStartTime.value = shift.start;
    permanentFinishTime.value = shift.finish;
    const gross = calculatePaidMinutes(shift.start, shift.finish, 0) || 0;
    permanentBreak.checked = gross > 5 * 60;
}

function capturePermanentEditorSnapshot() {
    return {
        leaveType: leaveType.value,
        swapType: swapType.value,
        shiftCode: permanentShiftCode.value,
        start: permanentStartTime.value,
        finish: permanentFinishTime.value,
        unpaidBreak: permanentBreak.checked,
        notes: permanentChangeNotes.value
    };
}

function restorePermanentEditorSnapshot() {
    if (!permanentEditorSnapshot) return;
    leaveType.value = permanentEditorSnapshot.leaveType;
    swapType.value = permanentEditorSnapshot.swapType;
    permanentShiftCode.value = permanentEditorSnapshot.shiftCode;
    permanentStartTime.value = permanentEditorSnapshot.start;
    permanentFinishTime.value = permanentEditorSnapshot.finish;
    permanentBreak.checked = permanentEditorSnapshot.unpaidBreak;
    permanentChangeNotes.value = permanentEditorSnapshot.notes;
    updatePermanentChangeFields();
    permanentEditorSnapshot = null;
}

function editPermanentChangeDates() {
    const action = permanentChangeType.value;
    permanentEditorSnapshot = capturePermanentEditorSnapshot();
    editingPermanentDates = true;
    permanentChangePage.classList.add("hidden");
    pendingChangeAction = action;
    rosterCalendarViewDate = new Date(
        (pendingCalendarDates[0] || selectedDate).getFullYear(),
        (pendingCalendarDates[0] || selectedDate).getMonth(),
        1
    );

    const config = {
        leave: [
            ({
                annual_leave: "Annual Leave",
                personal_leave: "Personal Leave",
                long_service_leave: "Long Service Leave",
                other_leave: "Other Leave"
            })[leaveType.value] || "Leave",
            "Choose any start and finish dates. The earlier date becomes Start and the later date becomes Finish."
        ],
        swap: [
            swapType.value === "colleague" ? "Colleague Swap" : "Individual Swap",
            "Choose the two swap dates in either order. Hé Guǐ will determine their roles automatically."
        ],
        add_shift: [setup?.employmentType === "fulltime" ? "Overtime" : "Extra Hours", "Choose one date."],
        roster_change: [
            "Management Roster Change",
            "Choose the original working day, then choose the original RDO. The currently displayed roster day does not set either date."
        ]
    }[action];

    rosterCalendarTitle.textContent = config[0];
    rosterCalendarInstructions.textContent = config[1];
    rosterCalendarPage.classList.remove("hidden");

    logHeguiEvent("calendar_open", {
     action: action,
    details: {
    calendar_mode: action
  }
});
    renderRosterCalendar();
}

function closePermanentChangeEditor() {
    permanentChangePage.classList.add("hidden");
    editingAddedShiftId = null;
    pendingChangeAction = null;
    pendingCalendarDates = [];
    pendingLeaveType = "annual_leave";
    pendingSwapType = "individual";
    editingPermanentDates = false;
    permanentEditorSnapshot = null;
}

function isRosterWorkingDay(date) {
    if (setup?.type === "casual") return false;
    const code = String(getShiftForDate(date).shift.code || "").toUpperCase();
    return !["O", "A", "", "-"].includes(code);
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

function savePermanentChange() {
    const type = permanentChangeType.value;
    const chosen = selectedPermanentShift();
    const all = loadPermanentChanges();
    const profileId = profiles[activeProfileIndex].id;
    const records = all[profileId] || {};
    const id = `change-${Date.now()}`;

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
        const grossMinutes = calculatePaidMinutes(permanentStartTime.value, permanentFinishTime.value, 0) || 0;
        const unpaidBreakMinutes = grossMinutes > 5 * 60 ? 30 : (permanentBreak.checked ? 30 : 0);
        const entry = {
            id: existingAdded?.id || id, date: dateKey(date), type: "added_shift", code: chosen.code,
            start: permanentStartTime.value, finish: permanentFinishTime.value,
            unpaidBreakMinutes,
            paidMinutes: calculatePaidMinutes(permanentStartTime.value, permanentFinishTime.value, unpaidBreakMinutes),
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
    permanentChangePage.classList.add("hidden");
    editingAddedShiftId = null;
    pendingChangeAction = null;
    pendingCalendarDates = [];
    pendingLeaveType = "annual_leave";
    pendingSwapType = "individual";
    editingPermanentDates = false;
    permanentEditorSnapshot = null;
    renderHome();
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
    casualArea.value = entry?.area || "";
    casualNotes.value = entry?.notes || "";
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
    updateCasualPaidHours();
}

function saveCasualShift() {
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
    const entry = {
        id: existing?.id || `casual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: dateKey(selectedDate),
        code: standard.code,
        standardStart: standard.start,
        standardFinish: standard.finish,
        start: casualStartTime.value,
        finish: casualFinishTime.value,
        timesEdited:
            casualStartTime.value !== standard.start ||
            casualFinishTime.value !== standard.finish,
        unpaidBreakMinutes: (calculatePaidMinutes(casualStartTime.value, casualFinishTime.value, 0) || 0) > 5 * 60 ? 30 : (casualBreak.checked ? 30 : 0),
        paidMinutes: calculatePaidMinutes(
            casualStartTime.value,
            casualFinishTime.value,
            (calculatePaidMinutes(casualStartTime.value, casualFinishTime.value, 0) || 0) > 5 * 60 ? 30 : (casualBreak.checked ? 30 : 0)
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

    closeCasualShiftEditor();
    renderHome();
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
        return "—";
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

    payPeriodDates.textContent = `Fortnight: ${formatAustralianDate(period.start)}–${formatAustralianDate(period.end)}`;
    paydayDate.textContent = `Payday: ${formatAustralianDate(period.payday)}`;

    if (casual) {
        const ordinary = Math.min(extraMinutes, 76 * 60);
        const overtime = Math.max(0, extraMinutes - 76 * 60);
        const lines = [];
        if (ordinary > 0) lines.push(`<span><b>Casual hours:</b> ${formatPaidMinutes(ordinary)}</span>`);
        if (overtime > 0) lines.push(`<span><b>Overtime:</b> ${formatPaidMinutes(overtime)}</span>`);
        payPeriodHours.innerHTML = lines.join("");
    } else {
        const standard = calculateRosterCycleFortnightMinutes(setup) || ((setup.contractedWeeklyHours || 38) * 2 * 60);
        const fulltime = setup.employmentType !== "parttime";
        const additionalOrdinary = fulltime ? 0 : Math.min(extraMinutes, Math.max(0, 76 * 60 - standard));
        const overtime = fulltime ? extraMinutes : Math.max(0, extraMinutes - additionalOrdinary);
        const lines = [];
        const headerWeekly = rosterHeaderWeeklyMinutes(setup);
        const calculatedWeekly = standard / 2;
        if (headerWeekly !== null && Math.abs(headerWeekly - calculatedWeekly) > 1) {
            lines.push(`<span class="pay-hours-warning"><b>Roster hours check:</b> header ${formatPaidMinutes(headerWeekly)} / calculated ${formatPaidMinutes(calculatedWeekly)}</span>`);
        }

        if (additionalOrdinary > 0) lines.push(`<span><b>Extra hours:</b> ${formatPaidMinutes(additionalOrdinary)}</span>`);
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
function resetSetup() {
    const casual = setup?.type === "casual";
    const reset = confirm(casual
        ? "Reset Casual Shift Log setup?\n\nSaved casual shifts will remain on this device."
        : "Reset the selected roster and starting number?\n\nThe imported roster CSV will remain on this device."
    );

    if (!reset) {
        return;
    }

    setup = null;
    profiles[activeProfileIndex].setup = null;
    saveProfiles();

    homeScreen.classList.add("hidden");
    setupScreen.classList.remove("hidden");

    rosterSelect.value = "";
    rosterDayInput.value = "";
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

    return `${code} · ${time}`;
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

    return `${formatClockTime(start)}–${formatClockTime(finish)}`;
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
    const positionsPerLine = 28;
    const numberOfLines = Math.ceil(
        roster.shifts.length / positionsPerLine
    );

    const anchorDate = parseDateKey(setup.anchorDate);
    const rosterOneDate = addDays(
        anchorDate,
        -(setup.anchorPosition - 1)
    );

    const weekdayHeadings = [];

    for (let column = 0; column < positionsPerLine; column += 1) {
        weekdayHeadings.push(
            addDays(rosterOneDate, column)
                .toLocaleDateString("en-AU", {
                    weekday: "short"
                })
                .slice(0, 2)
        );
    }

    let rowsHtml = "";

    for (let line = 0; line < numberOfLines; line += 1) {
        let cells = "";

        for (let column = 0; column < positionsPerLine; column += 1) {
            const index = line * positionsPerLine + column;
            const shift = roster.shifts[index];

                        cells += `
                <td class="${shift ? shiftClass(shift.code) : "unused"}">
                    <span class="position-number">
                        ${shift ? index + 1 : ""}
                    </span>

                    <span class="position-shift">
                        ${shift ? escapeHtml(shift.code) : ""}
                    </span>
                </td>
            `;
        }

        rowsHtml += `
            <tr>
                <th class="line-number">${line + 1}</th>
                ${cells}
            </tr>
        `;
    }
   

    const weekdayCells = weekdayHeadings
        .map(day => `<th>${escapeHtml(day)}</th>`)
        .join("");

    const existingPreview =
        document.querySelector(".print-preview-overlay");

    if (existingPreview) {
        existingPreview.remove();
    }

    const previewOverlay = document.createElement("div");
    const previewToolbar = document.createElement("div");
    const printButton = document.createElement("button");
    const backButton = document.createElement("button");
    const previewFrame = document.createElement("iframe");

    previewOverlay.className = "print-preview-overlay";
    previewOverlay.style.cssText = [
        "position:fixed",
        "inset:0",
        "z-index:10000",
        "display:flex",
        "flex-direction:column",
        "background:#f2f2f2"
    ].join(";");

    previewToolbar.style.cssText = [
        "display:flex",
        "flex-wrap:wrap",
        "gap:10px",
        "padding:12px",
        "background:#101214",
        "box-shadow:0 2px 8px rgba(0,0,0,.35)"
    ].join(";");

    printButton.type = "button";
    printButton.textContent = "Print or Save PDF";
    printButton.style.cssText = [
        "min-height:46px",
        "padding:0 18px",
        "border:0",
        "border-radius:10px",
        "background:#ffb020",
        "color:#101214",
        "font:inherit",
        "font-weight:800"
    ].join(";");

    backButton.type = "button";
    backButton.textContent = "Back to Hé Guǐ";
    backButton.style.cssText = [
        "min-height:46px",
        "padding:0 18px",
        "border:1px solid #4b525a",
        "border-radius:10px",
        "background:#23282e",
        "color:#fff",
        "font:inherit",
        "font-weight:800"
    ].join(";");

    previewFrame.title = "Roster print preview";
    previewFrame.style.cssText = [
        "width:100%",
        "flex:1",
        "border:0",
        "background:#fff"
    ].join(";");

    printButton.addEventListener("click", () => {
        logHeguiEvent("print_roster", {
        roster: roster.name,
        action: "print_or_save_pdf"
    });
        previewFrame.contentWindow?.focus();
        previewFrame.contentWindow?.print();
    });

    backButton.addEventListener("click", () => {
        previewOverlay.remove();
        document.body.style.overflow = "";
    });

    previewToolbar.append(printButton, backButton);
    previewOverlay.append(previewToolbar, previewFrame);
    document.body.appendChild(previewOverlay);
    document.body.style.overflow = "hidden";

    previewFrame.srcdoc = `
        <!DOCTYPE html>
        <html lang="en-AU">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${escapeHtml(roster.name)} Roster</title>

            <style>
                @page {
                    size: A4 landscape;
                    margin: 9mm;
                }

                body {
                    margin: 0 auto;
                    max-width: 1200px;
                    padding: 16px;
                    color: #111;
                    font-family: Arial, sans-serif;
                }

                h1 {
                    margin: 0 0 4px;
                    font-size: 20px;
                }

                .details {
                    margin-bottom: 10px;
                    font-size: 11px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                }

                th,
                td {
                    height: 27px;
                    padding: 2px;
                    border: 1px solid #555;
                    font-size: 10px;
                    font-weight: 700;
                    text-align: center;
                }

                thead th {
                    background: #e7e7e7;
                }

                .position-number {
                    display: block;
                    margin-bottom: 3px;
                    color: #555;
                    font-size: 8px;
                    font-weight: 600;
                }

                .position-shift {
                    display: block;
                    font-size: 11px;
                    font-weight: 800;
                }

                .line-number {
                    width: 25px;
                    background: #222;
                    color: white;
                }

                th:nth-child(7n + 2),
                td:nth-child(7n + 2) {
                    border-left-width: 2px;
                }

                .off {
                    background: #d9d9d9;
                }

                .ado {
                    background: #c9ddff;
                    color: #073b83;
                }

                .unused {
                    background: #eeeeee;
                }

                .notice {
                    margin-top: 9px;
                    font-size: 9px;
                }

                @media print {
                    body {
                        max-width: none;
                        padding: 0;
                    }

                }
            </style>
        </head>

        <body>
            <h1>${escapeHtml(roster.name)}</h1>

            <div class="details">
                ${roster.shifts.length} roster positions ·
                Printed ${escapeHtml(formatAustralianDate(new Date()))}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Line</th>
                        ${weekdayCells}
                    </tr>
                    
                </thead>

                <tbody>
                    ${rowsHtml}
                </tbody>
                
            </table>

            <p class="notice">
                Personal planning tool. Compare this grid with your
                employer’s official roster. Workplace roster changes
                must be confirmed with management.
            </p>
        </body>
        </html>
    `;
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