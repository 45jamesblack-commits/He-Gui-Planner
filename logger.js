// Hé Guǐ Planner - Usage Logger
const HEGUI_APP_VERSION = "24";
const HEGUI_LOGGER_URL =
  "https://uxkwtmbdxtsynvblyazq.supabase.co";

const HEGUI_LOGGER_KEY =
  "sb_publishable_3o9mJICYTRAxzCxmrKPAKQ_tqoCzccU";

function getHeguiDeviceId() {
  let id = localStorage.getItem("hegui_device_id");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("hegui_device_id", id);
  }

  return id;
}

function getHeguiDeviceType() {
  const ua = navigator.userAgent;

  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";

  return "desktop";
}

function isHeguiInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

async function logHeguiEvent(eventType, options = {}) {
  try {
    const event = {
      event_type: eventType,
      device_id: getHeguiDeviceId(),
      roster: options.roster || null,
      app_version: options.appVersion || HEGUI_APP_VERSION,
      page: options.page || window.location.pathname,
      action: options.action || null,
      details: options.details || {},
      device_type: getHeguiDeviceType(),
      platform: navigator.platform || null,
      installed_app: isHeguiInstalled()
    };

    const response = await fetch(
      `${HEGUI_LOGGER_URL}/rest/v1/usage_events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": HEGUI_LOGGER_KEY,
          "Authorization": `Bearer ${HEGUI_LOGGER_KEY}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(event),
        keepalive: true
      }
    );

    if (!response.ok) {
      console.warn(
        "Hé Guǐ logger:",
        response.status,
        await response.text()
      );
    }
  } catch (error) {
    // Logging must never interfere with the planner.
    console.warn("Hé Guǐ logger unavailable:", error);
  }
}

window.logHeguiEvent = logHeguiEvent;