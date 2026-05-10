// menu.js — main menu + pause menu wiring
"use strict";

const GAME_VERSION = "v0.5.0";

function initMenus() {
  const $ = id => document.getElementById(id);

  // Main menu buttons
  const continueBtn = $("mm-continue");
  if (typeof hasSave === "function" && !hasSave()) {
    continueBtn.disabled = true;
    continueBtn.title = "No saved investigation.";
    continueBtn.style.opacity = "0.4";
    continueBtn.style.cursor = "not-allowed";
  }
  continueBtn.addEventListener("click", () => {
    if (typeof loadGame === "function") {
      closeOverlay("overlay-mainmenu");
      loadGame();
    }
  });
  $("mm-new").addEventListener("click", () => {
    closeOverlay("overlay-mainmenu");
    // Returning players who ticked the skip checkbox go straight to Begin
    if (typeof settings !== "undefined" && settings.skipWarning) {
      // Synthesize a Begin-click: programmatically click the hidden title button
      const btn = document.getElementById("btn-start");
      if (btn) { btn.click(); return; }
    }
    document.getElementById("overlay-title").classList.remove("hidden");
  });
  $("mm-options").addEventListener("click", () => {
    // Hide the main menu while settings is open, and restore it when closed.
    // Without this, the main-menu overlay (later in the DOM) paints over settings.
    closeOverlay("overlay-mainmenu");
    if (typeof reflectSettingsToUI === "function") reflectSettingsToUI();
    openOverlay("overlay-settings");
    // When settings closes, bring the main menu back — only if we came from it.
    const settingsEl = document.getElementById("overlay-settings");
    const restore = () => {
      if (settingsEl.classList.contains("hidden")) {
        openOverlay("overlay-mainmenu");
        observer.disconnect();
      }
    };
    const observer = new MutationObserver(restore);
    observer.observe(settingsEl, { attributes: true, attributeFilter: ["class"] });
  });
  $("mm-credits").addEventListener("click", () => {
    closeOverlay("overlay-mainmenu");
    openOverlay("overlay-credits");
    const creditsEl = document.getElementById("overlay-credits");
    const restore = () => {
      if (creditsEl.classList.contains("hidden")) {
        openOverlay("overlay-mainmenu");
        observer.disconnect();
      }
    };
    const observer = new MutationObserver(restore);
    observer.observe(creditsEl, { attributes: true, attributeFilter: ["class"] });
  });
  const mmAch = $("mm-achievements");
  if (mmAch) {
    mmAch.addEventListener("click", () => {
      closeOverlay("overlay-mainmenu");
      if (typeof renderAchievements === "function") renderAchievements();
      openOverlay("overlay-achievements");
      const el = document.getElementById("overlay-achievements");
      const restore = () => {
        if (el.classList.contains("hidden")) {
          openOverlay("overlay-mainmenu");
          observer.disconnect();
        }
      };
      const observer = new MutationObserver(restore);
      observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    });
  }

  $("mm-guestlog").addEventListener("click", () => {
    closeOverlay("overlay-mainmenu");
    openOverlay("overlay-guestlog");
    const inner = document.querySelector("#overlay-guestlog .guestlog-entries");
    if (inner) inner.scrollTop = 0;
    const el = document.getElementById("overlay-guestlog");
    const restore = () => {
      if (el.classList.contains("hidden")) {
        openOverlay("overlay-mainmenu");
        observer.disconnect();
      }
    };
    const observer = new MutationObserver(restore);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
  });
  $("mm-howtoplay").addEventListener("click", () => {
    closeOverlay("overlay-mainmenu");
    openOverlay("overlay-howtoplay");
    // Scroll to top in case a previous open left it scrolled
    const inner = document.querySelector("#overlay-howtoplay .overlay-inner");
    if (inner) inner.scrollTop = 0;
    const el = document.getElementById("overlay-howtoplay");
    const restore = () => {
      if (el.classList.contains("hidden")) {
        openOverlay("overlay-mainmenu");
        observer.disconnect();
      }
    };
    const observer = new MutationObserver(restore);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
  });
  $("mm-quit").addEventListener("click", () => {
    window.close();
    // Browsers may block close() for non-script-opened windows; fall back:
    setTimeout(() => {
      document.body.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0608;color:#a08068;font-family:Georgia,serif;font-style:italic">You may close this tab.</div>';
    }, 200);
  });
  $("mm-version").textContent = GAME_VERSION;
  const statsSlot = $("mm-stats-slot");
  if (statsSlot && typeof renderStatsBlock === "function") {
    statsSlot.innerHTML = renderStatsBlock();
  }

  // Delete saved investigation link
  const mmDel = $("mm-delete-save");
  function refreshDeleteState() {
    if (typeof hasSave === "function" && hasSave()) {
      mmDel.disabled = false;
      mmDel.textContent = "Delete saved investigation";
    } else {
      mmDel.disabled = true;
      mmDel.textContent = "No saved investigation";
    }
  }
  refreshDeleteState();
  mmDel.addEventListener("click", () => {
    if (!hasSave()) return;
    if (!confirm("Delete the saved investigation? This cannot be undone.")) return;
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    // Also disable Continue
    continueBtn.disabled = true;
    continueBtn.style.opacity = "0.4";
    continueBtn.style.cursor = "not-allowed";
    continueBtn.title = "No saved investigation.";
    refreshDeleteState();
  });

  // Pause menu wiring
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      // Don't interfere with the Settings overlay or text inputs
      if (document.activeElement && ["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)) return;
      // If main menu / title / prologue / death is showing, let Escape fall through
      const nonPausable = ["overlay-mainmenu","overlay-title","overlay-death","overlay-credits","overlay-settings","overlay-dialogue","overlay-scare","overlay-verdict"];
      for (const id of nonPausable) {
        const el = document.getElementById(id);
        if (el && !el.classList.contains("hidden")) return;
      }
      // If game not started yet, do nothing
      if (!state || !state.calderLeft) return;
      // Toggle pause
      const pause = $("overlay-pause");
      if (pause.classList.contains("hidden")) openOverlay("overlay-pause");
      else closeOverlay("overlay-pause");
    }
  });
  $("pause-resume").addEventListener("click", () => closeOverlay("overlay-pause"));
  $("pause-save").addEventListener("click", () => {
    if (typeof saveGame === "function") saveGame();
  });
  $("pause-settings").addEventListener("click", () => {
    closeOverlay("overlay-pause");
    if (typeof reflectSettingsToUI === "function") reflectSettingsToUI();
    openOverlay("overlay-settings");
  });
  $("pause-mainmenu").addEventListener("click", () => {
    if (!confirm("Return to the main menu? Unsaved progress will be lost.")) return;
    location.reload();
  });
}
