"use strict";

// Official ACT public holidays published by the ACT Government.
// Bank holidays are intentionally excluded because they do not apply
// to everyone.
window.ACT_PUBLIC_HOLIDAYS = Object.freeze({
    // 2026
    "2026-01-01": "New Year’s Day",
    "2026-01-26": "Australia Day",
    "2026-03-09": "Canberra Day",
    "2026-04-03": "Good Friday",
    "2026-04-04": "Easter Saturday",
    "2026-04-05": "Easter Sunday",
    "2026-04-06": "Easter Monday",
    "2026-04-25": "ANZAC Day",
    "2026-04-27": "ANZAC Day public holiday",
    "2026-06-01": "Reconciliation Day",
    "2026-06-08": "King’s Birthday",
    "2026-10-05": "Labour Day",
    "2026-12-25": "Christmas Day",
    "2026-12-26": "Boxing Day",
    "2026-12-28": "Boxing Day public holiday",

    // 2027
    "2027-01-01": "New Year’s Day",
    "2027-01-26": "Australia Day",
    "2027-03-08": "Canberra Day",
    "2027-03-26": "Good Friday",
    "2027-03-27": "Easter Saturday",
    "2027-03-28": "Easter Sunday",
    "2027-03-29": "Easter Monday",
    "2027-04-26": "ANZAC Day public holiday",
    "2027-05-31": "Reconciliation Day",
    "2027-06-14": "King’s Birthday",
    "2027-10-04": "Labour Day",
    "2027-12-25": "Christmas Day",
    "2027-12-26": "Boxing Day",
    "2027-12-27": "Christmas Day public holiday",
    "2027-12-28": "Boxing Day public holiday",

    // 2028
    "2028-01-01": "New Year’s Day",
    "2028-01-03": "New Year’s Day public holiday",
    "2028-01-26": "Australia Day",
    "2028-03-13": "Canberra Day",
    "2028-04-14": "Good Friday",
    "2028-04-15": "Easter Saturday",
    "2028-04-16": "Easter Sunday",
    "2028-04-17": "Easter Monday",
    "2028-04-25": "ANZAC Day",
    "2028-05-29": "Reconciliation Day",
    "2028-06-12": "King’s Birthday",
    "2028-10-02": "Labour Day",
    "2028-12-25": "Christmas Day",
    "2028-12-26": "Boxing Day"
});

// ACT public school holiday periods derived from the official ACT Government
// public school term dates. Start and end dates are inclusive.
window.ACT_SCHOOL_HOLIDAYS = Object.freeze([
    // 2026
    Object.freeze({
        start: "2026-01-01",
        end: "2026-02-01",
        name: "Summer school holidays"
    }),
    Object.freeze({
        start: "2026-04-03",
        end: "2026-04-20",
        name: "Autumn school holidays"
    }),
    Object.freeze({
        start: "2026-07-04",
        end: "2026-07-20",
        name: "Winter school holidays"
    }),
    Object.freeze({
        start: "2026-09-26",
        end: "2026-10-12",
        name: "Spring school holidays"
    }),
    Object.freeze({
        start: "2026-12-19",
        end: "2027-01-31",
        name: "Summer school holidays"
    }),

    // 2027
    Object.freeze({
        start: "2027-04-10",
        end: "2027-04-27",
        name: "Autumn school holidays"
    }),
    Object.freeze({
        start: "2027-07-03",
        end: "2027-07-19",
        name: "Winter school holidays"
    }),
    Object.freeze({
        start: "2027-09-25",
        end: "2027-10-11",
        name: "Spring school holidays"
    }),
    Object.freeze({
        start: "2027-12-18",
        end: "2028-02-07",
        name: "Summer school holidays"
    }),

    // 2028
    Object.freeze({
        start: "2028-04-08",
        end: "2028-04-24",
        name: "Autumn school holidays"
    }),
    Object.freeze({
        start: "2028-07-08",
        end: "2028-07-24",
        name: "Winter school holidays"
    }),
    Object.freeze({
        start: "2028-09-30",
        end: "2028-10-16",
        name: "Spring school holidays"
    }),
    Object.freeze({
        start: "2028-12-23",
        end: "2029-02-05",
        name: "Summer school holidays"
    })
]);
