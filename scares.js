// scares.js — authored signature scares (scripted cinematic moments).
// Each scare is a declarative data object; the ticker checks conditions
// and fires at most one at a time. Future stories add to SIGNATURE_SCARES.
"use strict";

const SIGNATURE_SCARES = [
  {
    // Mandatory plot beat. Fires at midnight regardless of truth state.
    id: "midnight_letter",
    when: ({ s }) =>
      s.calderLeft &&
      s.timeMinutes >= 24 * 60 &&
      !_shownIntertitles.has("scare:midnight_letter"),
    truths: ["haunted", "partial", "debunked"],
    fire: () => {
      narrate("<em>Something slides under the front door of the entry hall. You hear the paper skate across the floorboards.</em>");
      audio.sfx("distant_bang");
      setTimeout(() => {
        narrate("<em>You had locked every entrance yourself. There is no one at the door. There is, however, a letter — addressed to you.</em>");
      }, 2000);
      setTimeout(() => {
        showIntertitle("MIDNIGHT",
          "<span class='big'>A LETTER</span><em>A letter arrives by no post you can name.</em>",
          { once: "scare_midnight_card" });
      }, 3400);
      setTimeout(() => {
        if (typeof openDocument === "function") openDocument("midnight_letter");
        if (typeof state !== "undefined") state.docsRead.add("midnight_letter");
        if (typeof logEvidence === "function") {
          logEvidence("Document", "Letter from the executor found at midnight. It names Eliza, the 1851 fire, and the pact.");
        }
      }, 8200);
    }
  },
  {
    id: "thimble_stairs",
    when: ({ s }) =>
      s.calderLeft &&
      s._enteredNursery &&
      s.currentRoom === "entry_hall" &&
      s.timeMinutes >= 24 * 60 + 30,
    truths: ["haunted", "partial"],
    fire: () => {
      narrate("<em>You hear a small, deliberate sound on the stairs behind you: <strong>tink</strong>… <strong>tink</strong>… <strong>tink</strong>.</em>");
      audio.sfx("chime");
      setTimeout(() => {
        narrate("<em>A silver thimble comes to rest against your shoe. You last saw it on the nursery floor.</em>");
        logEvidence("Signature Scare", "The silver thimble from the nursery followed you down the stairs.");
        if (typeof state !== "undefined") state.entitiesSeen.add("cold_mother");
      }, 1800);
      showIntertitle("THE THIMBLE", "<em>What has been lost is not, one notices, ever quite misplaced.</em>", { once: "scare_thimble" });
    }
  },
  {
    id: "breathing_door",
    when: ({ s }) =>
      s.calderLeft &&
      s.currentRoom === "master" &&
      s.timeMinutes >= 24 * 60,
    truths: ["haunted"],
    fire: () => {
      narrate("<em>The east wall begins to breathe. Slow. Deep. The quilt on the bed lifts once, with the draw, and falls.</em>");
      audio.sfx("breath");
      setTimeout(() => audio.sfx("breath"), 1400);
      setTimeout(() => {
        narrate("<em>It stops. The bedroom is only a bedroom again. You are not sure it ever wasn't.</em>");
        logEvidence("Signature Scare", "The east wall of the master bedroom inhaled and exhaled — visibly, for eight seconds.");
        state.entitiesSeen.add("breath");
      }, 3000);
      showIntertitle("THE BREATHING WALL", "<em>The house, for a small passage of time, was a living thing.</em>", { once: "scare_breath" });
    }
  },
  {
    id: "empty_chair",
    when: ({ s }) =>
      s.calderLeft &&
      s.currentRoom === "upstairs_hall" &&
      s._enteredNursery &&
      s.timeMinutes >= 24 * 60 + 60,
    truths: ["haunted", "partial"],
    fire: () => {
      narrate("<em>Through the cracked-open nursery door you see it: the rocking chair, moving on its own. A quiet, even motion. No draft stirs.</em>");
      audio.sfx("whisper");
      setTimeout(() => {
        narrate("<em>You step closer. The chair is still. It has — you are almost certain — always been still.</em>");
        logEvidence("Signature Scare", "The nursery rocking chair was moving, observed through the doorway. When approached: still.");
        state.entitiesSeen.add("rocking_chair_scare");
      }, 2400);
      showIntertitle("THE EMPTY CHAIR", "<em>One rocks, at times, without a sitter.</em>", { once: "scare_chair" });
    }
  },
  {
    id: "figure_at_distance",
    when: ({ s }) =>
      s.calderLeft &&
      s.currentRoom === "upstairs_hall" &&
      s.timeMinutes >= 24 * 60 + 180 &&
      s.timeMinutes < 24 * 60 + 240,
    truths: ["haunted"],
    fire: () => {
      narrate("<em>At the far end of the hall, a small figure stands. Perfectly still. You blink.</em>");
      audio.sfx("heartbeat");
      setTimeout(() => {
        narrate("<em>When your eyes find it again, the corridor is empty. It was, you are almost certain, a child.</em>");
        logEvidence("Signature Scare", "A small, still figure was seen at the far end of the upstairs hall at 3 AM.");
        state.entitiesSeen.add("listening_twin");
        if (state.aggression < 5) bumpAggression(1, "you saw the figure");
      }, 2600);
      showIntertitle("3:00 AM", "<em>The hour at which, by tradition, the dead are said to return their visits.</em>", { once: "scare_figure_3am" });
    }
  },
  {
    id: "watcher_on_hill",
    when: ({ s }) =>
      s.calderLeft &&
      s.currentRoom === "conservatory" &&
      s.timeMinutes >= 24 * 60 + 60,
    truths: ["haunted"],
    fire: () => {
      narrate("<em>Through the cracked pane, at the far edge of the woods: a man. Not moving. Not quite visible. Watching.</em>");
      audio.sfx("whisper");
      setTimeout(() => {
        narrate("<em>You look again. The trees are only trees. The woods are only woods. And yet you know where he was standing.</em>");
        logEvidence("Signature Scare", "A watching figure at the treeline, visible through the cracked conservatory pane.");
        state.entitiesSeen.add("watcher");
      }, 2400);
    }
  },
  {
    id: "knocker_library",
    when: ({ s }) =>
      s.calderLeft &&
      s.currentRoom === "library" &&
      s.timeMinutes >= 24 * 60 + 120,
    truths: ["haunted"],
    fire: () => {
      narrate("<em>Three knocks, from inside the east bookshelf.</em>");
      audio.sfx("knock");
      setTimeout(() => {
        narrate("<em>A long pause. Then three more, slower, from the chimney flue.</em>");
        audio.sfx("answer_knock");
      }, 1600);
      setTimeout(() => {
        narrate("<em>The third set comes from directly behind your ear. There is no wall there.</em>");
        audio.sfx("whisper");
        logEvidence("Signature Scare", "Three rounds of unprompted knocks in the library, the last from no plausible source.");
        state.entitiesSeen.add("knocker");
        if (state.aggression < 7) bumpAggression(2, "the library answered you without being asked");
      }, 3400);
    }
  },
  {
    id: "portrait_change",
    when: ({ s }) =>
      s.calderLeft &&
      s.currentRoom === "parlor" &&
      s.portraitFirstShot === "noted" &&
      s.timeMinutes >= 24 * 60 + 90,
    truths: ["haunted"],
    fire: () => {
      narrate("<em>The portrait. You have, you realise, been looking at it for some time. The face — which you noted earlier as indistinct — has arranged itself into something distinct.</em>");
      setTimeout(() => {
        narrate("<em>It is looking at you. The eyes, previously impossible to locate, are now precisely placed. You look away. When you look back, it is once again indistinct. Or very nearly.</em>");
        logEvidence("Signature Scare", "The parlor portrait's face resolved and then unresolved. Likely matches an earlier SLS capture if one was taken.");
        state.entitiesSeen.add("portrait");
      }, 2400);
      showIntertitle("THE PORTRAIT", "<em>Some faces, under sufficient attention, consent to be seen.</em>", { once: "scare_portrait" });
    }
  },
  {
    // Late-game confrontation. Only fires on Haunted at 4 AM with solid evidence,
    // in a room the player has been inside. Locks interaction until resolved.
    id: "eliza_confrontation",
    when: ({ s }) =>
      s.truth === "haunted" &&
      s.calderLeft &&
      s.timeMinutes >= 24 * 60 + 240 &&    // 4 AM
      s.docsRead.has("midnight_letter") &&
      s.evidence.length >= 6 &&
      ["nursery","library","study","wine_cellar","parlor","master","upstairs_hall"].includes(s.currentRoom) &&
      !_shownIntertitles.has("scare:eliza_confrontation"),
    truths: ["haunted"],
    fire: () => {
      const roomName = ROOMS[state.currentRoom]?.name || "the room";
      // Lock controls by opening a scare overlay they can only exit via choice
      narrate("<em>The lights in the house fail, one by one, in an order that is not the order of their switches.</em>");
      audio.sfx("distant_bang");
      state.aggression = Math.max(state.aggression, 7);
      if (typeof renderDanger === "function") renderDanger();
      document.body.classList.add("screen-shake");
      setTimeout(() => document.body.classList.remove("screen-shake"), 700);
      setTimeout(() => {
        showIntertitle("4:00 AM",
          "<span class='big'>ELIZA</span><em>The schoolmistress of 1851, and all who were in her charge, have a thing they would like to say to you.</em>",
          { once: "scare_eliza_card" });
      }, 1500);
      setTimeout(() => {
        const body = document.getElementById("scare-body");
        body.innerHTML = `
          <h2 style="color:#e8a848">She is here.</h2>
          <p class="scare-prompt-text"><em>A woman's voice — thin, patient, very old — speaks from somewhere in the ${roomName} that is not a direction.</em></p>
          <p class="scare-prompt-text" style="color:#e8c8a0;font-style:italic;font-size:20px;line-height:1.6">
            "We have waited ninety-nine years. Elias, and his son, and the son's wife, and the twins, and the old woman last — they came to us. You will tell the executor we keep the house. Will you say yes, or will you say no?"
          </p>
          <div class="scare-choices">
            <button class="scare-choice" data-eliza="yes">"Yes. The pact continues. The house stays closed."</button>
            <button class="scare-choice" data-eliza="no">"No. I will not be party to this. The house opens in the morning."</button>
            <button class="scare-choice" data-eliza="refuse">"I refuse to answer a voice I cannot see."</button>
            <button class="scare-choice" data-eliza="name">"Say your name to me first."</button>
          </div>
        `;
        openOverlay("overlay-scare");
        if (typeof tts !== "undefined" && tts.speakDevice) {
          tts.speakDevice("We have waited ninety-nine years. Will you say yes, or will you say no?", { mode: "ovilus", preempt: true });
        }
        body.querySelectorAll("[data-eliza]").forEach(btn => {
          btn.addEventListener("click", () => resolveEliza(btn.dataset.eliza));
        });
      }, 5000);
    }
  },
  {
    // Fright Break. William Castle theater gimmick. Fires once per run at
    // most, at 2:30 AM+ with aggression CLOSE or IN THE ROOM on a run that's
    // scary enough to warrant offering the pause.
    id: "fright_break",
    when: ({ s }) =>
      (s.truth === "haunted" || s.truth === "partial") &&
      s.calderLeft &&
      s.timeMinutes >= 24 * 60 + 150 &&   // 2:30 AM
      (s.aggression || 0) >= 6 &&
      !_shownIntertitles.has("scare:fright_break"),
    truths: ["haunted", "partial"],
    fire: () => {
      // Stop TTS and pause the ambient static so the card isn't competing
      if (typeof tts !== "undefined") tts.stop();
      openOverlay("overlay-frightbreak");
      const countdownEl = document.getElementById("fb-countdown");
      let remaining = 60;
      countdownEl.textContent = remaining;
      const interval = setInterval(() => {
        remaining--;
        countdownEl.textContent = remaining;
        if (remaining <= 0) {
          clearInterval(interval);
          closeOverlay("overlay-frightbreak");
        }
      }, 1000);
      // Buttons clear the interval and close
      const cont = document.getElementById("fb-continue-now");
      const wait = document.getElementById("fb-wait");
      const dismiss = () => { clearInterval(interval); closeOverlay("overlay-frightbreak"); };
      if (cont) cont.onclick = dismiss;
      if (wait) wait.onclick = () => {
        // "Wait" just disables both buttons until the timer runs out
        cont.disabled = true;
        wait.disabled = true;
        wait.textContent = "Waiting…";
      };
      if (typeof audio !== "undefined") audio.sfx("chime");
    }
  },
  {
    // Fourth-wall moment. Fires at most once per run, rare conditions.
    // The narrator — or something using the narrator's voice — addresses
    // the player directly. William Castle / Vincent Price cinema trick.
    id: "fourth_wall",
    when: ({ s }) =>
      s.truth === "haunted" &&
      s.calderLeft &&
      s.timeMinutes >= 24 * 60 + 90 &&   // after 1:30 AM
      Object.keys(s._m || {}).length >= 4 && // player is active, making milestones
      !_shownIntertitles.has("scare:fourth_wall"),
    truths: ["haunted"],
    fire: () => {
      setTimeout(() => {
        narrate("<em>You have been, I notice, very methodical. We admire that in a visitor.</em>");
      }, 600);
      setTimeout(() => {
        narrate("<em>You will not, I suspect, remember reading this line. It will feel, by morning, as though the narration simply described your investigation. That is — I assure you — customary.</em>");
        audio.sfx("whisper");
      }, 4200);
      setTimeout(() => {
        narrate("<em>Continue. We are watching with considerable interest.</em>");
      }, 9000);
      state._fourthWallFired = true;
    }
  },
  {
    id: "cold_mother_whisper",
    when: ({ s }) =>
      s.calderLeft &&
      s.currentRoom === "nursery" &&
      s.timeMinutes >= 24 * 60 + 45,
    truths: ["haunted"],
    fire: () => {
      narrate("<em>A voice, directly beside your ear: 'let me… out.'</em>");
      audio.sfx("whisper");
      setTimeout(() => {
        narrate("<em>The nursery is empty. The east wall, with its long parallel gouges, is very cold to the touch.</em>");
        logEvidence("Signature Scare", "A woman's whisper in the nursery: 'let me out.' The east wall was ice-cold.");
        state.entitiesSeen.add("cold_mother");
      }, 2200);
    }
  }
];

let _lastScareAt = 0;
const SCARE_COOLDOWN_MINUTES = 20; // in-game minutes between authored scares

function scareTick() {
  if (!state.calderLeft || state.endDialog) return;
  if (state.timeMinutes - _lastScareAt < SCARE_COOLDOWN_MINUTES) return;
  // Find an eligible scare we haven't fired
  for (const scare of SIGNATURE_SCARES) {
    if (_shownIntertitles.has("scare:" + scare.id)) continue;
    if (!scare.truths.includes(state.truth)) continue;
    try {
      if (scare.when({ s: state })) {
        _shownIntertitles.add("scare:" + scare.id);
        _lastScareAt = state.timeMinutes;
        scare.fire();
        return;
      }
    } catch (e) {
      console.warn("scare check failed:", scare.id, e);
    }
  }
}
