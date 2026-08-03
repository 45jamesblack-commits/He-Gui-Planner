"use strict";

const STORAGE_DATA = "glacksRosterData";
const STORAGE_SETUP = "glacksRosterSetup";
const STORAGE_PROFILES = "heguiRosterProfiles";
const STORAGE_ACTIVE_PROFILE = "heguiActiveProfile";

const DEFAULT_PROFILE_NAMES = [
    "He Gui",
    "Her Gui",
    "3rd Wheel"
];

let rosters = [];
let profiles = [];
let activeProfileIndex = 0;
let setup = null;
let selectedDate = startOfDay(new Date());

const setupScreen = document.querySelector("#setup-screen");
const homeScreen = document.querySelector("#home-screen");
const rosterSelect = document.querySelector("#roster-select");
const rosterDayInput = document.querySelector("#roster-day");
const profileTabs = document.querySelector("#profile-tabs");
const profileNameButton = document.querySelector("#profile-name-button");
const settingsButton = document.querySelector("#settings-button");
const extrasButton = document.querySelector("#extras-button");
const settingsPage = document.querySelector("#settings-page");
const extrasPage = document.querySelector("#extras-page");
const closeSettings = document.querySelector("#close-settings");
const closeExtras = document.querySelector("#close-extras");
const todayLabel = document.querySelector("#today-label");
const todayDate = document.querySelector("#today-date");
const shiftCode = document.querySelector("#shift-code");
const shiftTime = document.querySelector("#shift-time");
const rosterName = document.querySelector("#roster-name");
const rosterPosition = document.querySelector("#roster-position");
const weekList = document.querySelector("#week-list");

const resetRosterButton =
    document.querySelector("#reset-roster");

settingsButton.addEventListener("click", () => {
    settingsPage.classList.remove("hidden");
});

closeSettings.addEventListener("click", () => {
    settingsPage.classList.add("hidden");
});

extrasButton.addEventListener("click", () => {
    extrasPage.classList.remove("hidden");
});

closeExtras.addEventListener("click", () => {
    extrasPage.classList.add("hidden");
});
resetRosterButton.addEventListener("click", resetSetup);
initialiseApp();

async function initialiseApp() {
    loadSavedInformation();
    renderProfileNavigation();

    try {
        const response = await fetch(
            `roster.csv?v=${Date.now()}`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("Roster file was not found.");
        }

        const csvText = await response.text();
        const rows = parseCsv(csvText);

        rosters = convertRowsToRosters(rows);

        if (rosters.length === 0) {
            throw new Error("No valid rosters were found.");
        }

        localStorage.setItem(
            STORAGE_DATA,
            JSON.stringify(rosters)
        );
    } catch (error) {
        console.error("Roster loading failed:", error);

        if (rosters.length === 0) {
            showCsvLoader();
            return;
        }
    }

    fillRosterList();
    showActiveProfile();
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
    .querySelector("#lookup-date")
    .addEventListener("click", lookUpDate);

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

    rosterSelect.value = setup
        ? String(setup.rosterIndex)
        : "";
    rosterDayInput.value = setup
        ? String(setup.anchorPosition)
        : "";

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

    const proposedSetup = {
        rosterIndex,
        anchorPosition,
        anchorDate: dateKey(anchorDate)
    };

    const checks = [0, 7, 14];

    for (const daysAhead of checks) {
        const checkDate = addDays(anchorDate, daysAhead);

        const result = getShiftForDate(
            checkDate,
            proposedSetup
        );

        const dateText =
            checkDate.toLocaleDateString("en-AU", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });

        const correct = confirm(
            `${dateText}\n\n` +
            `Roster number ${result.position}\n` +
            `${displayShift(result.shift)}\n\n` +
            `Does this match your official roster?`
        );

        if (!correct) {
            alert(
                "Setup has stopped. Check your selected roster " +
                "and today’s roster number, then try again."
            );

            return;
        }
    }

    const responsibilityAccepted = confirm(
        "All three roster checks matched.\n\n" +
        "I have compared these results with my official roster. " +
        "I understand that HéGUI Roster is an unofficial " +
        "planning tool and that workplace roster changes must " +
        "be confirmed with my employer."
    );

    if (!responsibilityAccepted) {
        return;
    }

    setup = proposedSetup;
    profiles[activeProfileIndex].setup = setup;
    saveProfiles();

    selectedDate = anchorDate;

    showHomeScreen();
}

function showHomeScreen() {
    setupScreen.classList.add("hidden");
    homeScreen.classList.remove("hidden");

    renderHome();
}

function renderHome() {
    const result = getShiftForDate(selectedDate);
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

    shiftCode.textContent =
        friendlyCode(result.shift.code);

    shiftTime.textContent =
        friendlyTime(result.shift);

    rosterName.textContent = roster.name;

    rosterPosition.textContent =
        `Roster number ${result.position} of ${roster.shifts.length}`;

    renderWeek();
}

function renderWeek() {
    weekList.innerHTML = "";

    const today = startOfDay(new Date());

    for (let offset = 0; offset < 7; offset += 1) {
        const date = addDays(selectedDate, offset);
        const result = getShiftForDate(date);
        const row = document.createElement("button");

        row.type = "button";
        row.className = "week-day";

        const differenceFromToday = dayDifference(today, date);

        let label;

        if (differenceFromToday === 0) {
            label = "Today";
        } else if (differenceFromToday === 1) {
            label = "Tomorrow";
                } else if (date <= endOfCurrentWeek(today)) {
            label = date.toLocaleDateString("en-AU", {
                weekday: "long"
            });
        } else {
            label = date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short"
});
        }
        row.innerHTML = `
            <span class="week-day-date">
                ${escapeHtml(label)}
            </span>

            <span class="week-day-shift">
                ${escapeHtml(displayShift(result.shift))}
            </span>
        `;

        row.addEventListener("click", () => {
            selectedDate = date;
            renderHome();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        weekList.appendChild(row);
    }
}

function changeSelectedDate(numberOfDays) {
    selectedDate = addDays(selectedDate, numberOfDays);
    renderHome();
}

function lookUpDate() {
    const enteredDate = prompt(
        "Enter a date as DD/MM/YYYY",
        formatAustralianDate(selectedDate)
    );

    if (!enteredDate) {
        return;
    }

    const parsedDate = parseAustralianDate(enteredDate);

    if (!parsedDate) {
        alert("Enter a valid date using DD/MM/YYYY.");
        return;
    }

    selectedDate = parsedDate;
    renderHome();
}

function resetSetup() {
    const reset = confirm(
        "Reset the selected roster and starting number?\n\n" +
        "The imported roster CSV will remain on this device."
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

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("Allow pop-ups to print the roster grid.");
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en-AU">
        <head>
            <meta charset="UTF-8">
            <title>${escapeHtml(roster.name)} Roster</title>

            <style>
                @page {
                    size: A4 landscape;
                    margin: 9mm;
                }

                body {
                    margin: 0;
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
                Unofficial personal planning tool. Compare this grid with your
                employer’s official roster. Workplace roster changes
                must be confirmed with management.
            </p>

            <script>
                window.onload = () => window.print();
            <\/script>
        </body>
        </html>
    `);

    printWindow.document.close();
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
