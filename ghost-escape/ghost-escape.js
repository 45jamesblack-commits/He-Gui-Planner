(() => {
  const levels = {
    easy: { label: "Easy", length: 5, misses: 8 },
    medium: { label: "Medium", length: 7, misses: 7 },
    hard: { label: "Hard", length: 9, misses: 6 }
  };

  const state = { level: "easy", theme: "animals", word: "", guessed: new Set(), wrong: 0, over: false };
  const $ = id => document.getElementById(id);
  const arena = document.querySelector(".arena");
  const wordEl = $("word");
  const keyboard = $("keyboard");
  const result = $("result-card");
  const resultTitle = $("result-title");
  const resultMessage = $("result-message");
  const dangerFill = $("danger-fill");
  const bossEl = $("boss");
  const bossFire = $("boss-fire");
  const bosses = ["\uD83D\uDC79", "\uD83D\uDC7A", "\uD83D\uDC80", "\uD83D\uDC7F"];

  function loadStats() {
    try {
      const saved = JSON.parse(localStorage.getItem("heguiGhostEscapeStats")) || {};
      return {
        wins: Number(saved.wins || 0),
        losses: Number(saved.losses || 0),
        streak: Number(saved.streak || 0),
        best: Number(saved.best || 0),
        perfect: Number(saved.perfect || 0)
      };
    }
    catch { return { wins:0, losses:0, streak:0, best:0, perfect:0 }; }
  }
  function saveStats(stats) { localStorage.setItem("heguiGhostEscapeStats", JSON.stringify(stats)); }
  function renderStats() {
    const s = loadStats();
    $("streak").textContent = String(s.streak);
    $("best-streak").textContent = String(s.best);
    $("perfect-count").textContent = String(s.perfect);
  }
  function pickWord() {
    const list = window.GHOST_WORDS[state.theme][state.level];
    let next = list[Math.floor(Math.random() * list.length)].toUpperCase();
    if (list.length > 1 && next === state.word) next = list[(list.indexOf(next.toLowerCase()) + 1) % list.length].toUpperCase();
    return next;
  }
  function renderWord() {
    wordEl.innerHTML = "";
    [...state.word].forEach(letter => {
      const slot = document.createElement("span");
      slot.className = "letter-slot";
      slot.textContent = state.guessed.has(letter) || state.over ? letter : "";
      wordEl.appendChild(slot);
    });
  }
  function renderKeyboard() {
    keyboard.innerHTML = "";
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(letter => {
      const button = document.createElement("button");
      button.className = "key";
      button.type = "button";
      button.textContent = letter;
      button.disabled = state.guessed.has(letter) || state.over;
      if (state.guessed.has(letter)) button.classList.add(state.word.includes(letter) ? "correct" : "wrong");
      button.addEventListener("click", () => guess(letter));
      keyboard.appendChild(button);
    });
  }
  function renderDanger() {
    const max = levels[state.level].misses;
    const percent = Math.min(100, (state.wrong / max) * 100);
    dangerFill.style.width = `${percent}%`;
    arena.dataset.danger = String(state.wrong);
    $("wrong-count").textContent = String(state.wrong);
    $("max-wrong").textContent = String(max);
    $("status-line").textContent = state.over ? "Game over" : `${max - state.wrong} chances before the Boss Monster wins.`;
  }
  function won() { return [...state.word].every(letter => state.guessed.has(letter)); }
  function finish(win) {
    state.over = true;
    const s = loadStats();

    result.classList.add("hidden");
    arena.classList.remove("win", "lose", "ghost-chase", "boss-burn");

    if (win) {
      const perfect = state.wrong === 0;
      s.wins += 1; s.streak += 1; s.best = Math.max(s.best, s.streak);

      if (perfect) {
        s.perfect += 1;
        resultTitle.textContent = "\uD83D\uDC7B PERFECT ESCAPE!";
        resultMessage.innerHTML = `No wrong letters. H\u00e9 Gu\u01d0 scared the Boss Monster senseless.<br><span class="revealed-word">${state.word}</span>`;
        arena.classList.add("perfect-win");
      } else {
        resultTitle.textContent = "\uD83D\uDC7B H\u00e9 Gu\u01d0 IS FREE!";
        resultMessage.innerHTML = `The Boss Monster has been chased away.<br><span class="revealed-word">${state.word}</span>`;
      }

      arena.classList.add("ghost-chase");
    } else {
      s.losses += 1; s.streak = 0;
      resultTitle.textContent = `${bossEl.textContent} THE BOSS MONSTER WINS!`;
      resultMessage.innerHTML = `H\u00e9 Gu\u01d0 was burned by the Boss Monster's torch. The word was <span class="revealed-word">${state.word}</span>.`;
      arena.classList.add("boss-burn");
      bossFire.classList.add("active");
    }

    saveStats(s);
    renderWord(); renderKeyboard(); renderDanger(); renderStats();

    const animationTime = win ? 4200 : 3000;
    window.setTimeout(() => {
      arena.classList.remove("ghost-chase", "boss-burn");
      bossFire.classList.remove("active");
      result.classList.remove("hidden");
      if (win && window.parent && window.parent !== window) {
        window.setTimeout(() => {
          window.parent.postMessage({ type: "hegui-ghost-escaped" }, "*");
        }, 650);
      }
    }, animationTime);
  }
  function guess(letter) {
    if (state.over || state.guessed.has(letter)) return;
    state.guessed.add(letter);
    document.body.classList.add("playing");
    if (!state.word.includes(letter)) state.wrong += 1;
    renderWord(); renderKeyboard(); renderDanger();
    if (won()) finish(true);
    else if (state.wrong >= levels[state.level].misses) finish(false);
  }
  function newGame() {
    state.word = pickWord(); state.guessed = new Set(); state.wrong = 0; state.over = false;
    document.body.classList.remove("playing");
    arena.classList.remove("win", "lose", "ghost-chase", "boss-burn", "perfect-win");
    bossFire.classList.remove("active");
    bossEl.textContent = bosses[Math.floor(Math.random() * bosses.length)];
    arena.dataset.danger = "0"; result.classList.add("hidden");
    renderWord(); renderKeyboard(); renderDanger(); renderStats();
  }

  document.querySelectorAll("[data-level]").forEach(button => button.addEventListener("click", () => {
    state.level = button.dataset.level;
    document.querySelectorAll("[data-level]").forEach(b => b.classList.toggle("active", b === button));
    newGame();
  }));
  $("theme-select").addEventListener("change", event => {
    state.theme = event.target.value;
    newGame();
  });
  $("new-game").addEventListener("click", newGame);
  $("play-again").addEventListener("click", newGame);
  window.addEventListener("keydown", event => {
    const letter = event.key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) guess(letter);
  });
  newGame();
})();
