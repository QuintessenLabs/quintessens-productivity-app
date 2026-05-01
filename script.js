/* ============================================================
   QUINTESSEN – script.js  (full rewrite)
   ============================================================ */

// ── State ──────────────────────────────────────────────────
let state = { coins: 0, history: [], habits: [], shop: [], skills: [], tasks: [] };
const DAYS = ['M','T','W','T','F','S','S'];
const DAY_KEYS = ['mon','tue','wed','thu','fri','sat','sun'];

// ── Emoji: CDN-backed search (emojilib) ────────────────────
let emojiLib = null;

async function loadEmojiLib() {
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/emojilib@3.0.10/dist/emoji-en-US.json');
    emojiLib = await res.json();
  } catch(e) {
    console.warn('[Quintessen] emojilib CDN failed – using category fallback');
  }
}

function searchEmojis(q) {
  q = q.toLowerCase().trim();
  if (!q) return null;
  const results = [];
  const seen = new Set();
  const add = e => { if (!seen.has(e)) { seen.add(e); results.push(e); } };

  if (emojiLib) {
    Object.entries(emojiLib).forEach(([emoji, kws]) => { if (kws.some(k => k === q)) add(emoji); });
    Object.entries(emojiLib).forEach(([emoji, kws]) => { if (kws.some(k => k.startsWith(q))) add(emoji); });
    Object.entries(emojiLib).forEach(([emoji, kws]) => { if (kws.some(k => k.includes(q))) add(emoji); });
  } else {
    Object.values(EMOJI_CATEGORIES).flat().forEach(add);
  }
  return results;
}

// ── Emoji Categories (for browsing) ─────────────────────────
const EMOJI_CATEGORIES = {
  '😀 Smileys': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','💫','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿'],
  '🐶 Animals': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🐢','🐍','🦎','🐙','🦑','🦐','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐑','🦙','🐐','🦌','🐕','🐩','🐈','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿️','🦔'],
  '🍎 Food': ['🍎','🍊','🍋','🍇','🍓','🍒','🍑','🥭','🍍','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌽','🌶️','🧄','🧅','🥔','🍠','🥜','🌰','🍞','🥐','🥖','🧀','🥚','🍳','🥓','🥩','🍗','🍖','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🥗','🍜','🍝','🍛','🍣','🍱','🥟','🍤','🍙','🍚','🍘','🍥','🥮','🍢','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🍯','🧃','🥤','🧋','☕','🍵','🫖','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧊','🍦','🍧','🍨','🍡'],
  '⚽ Activities': ['⚽','🏀','🏈','⚾','🥎','🏐','🏉','🎾','🥏','🎱','🪀','🏓','🏸','🏒','🥊','🥋','⛳','🎣','🏹','🎿','🛷','🥌','🎯','🎮','🎲','🧩','🃏','🎴','🎭','🖼️','🎨','🧶','🪡','🧵','🎻','🎸','🎹','🥁','🪘','🎷','🎺','🎙️','🎤','🎧','📻','🎼','🎵','🎶','🎬','📽️','🎞️','📚','📖','📝','✏️','🖊️','🖋️','📌','📍','📎','🗂️','📁','📂','📊','📈','📉','🗒️','🗓️','📆','📅','📇'],
  '🏠 Places': ['🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏧','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🏗️','🧱','🗺️','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏞️','🏟️','🎠','🎡','🎢','🎪','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🛻','🚚','🚛','🚜','🏎️','🏍️','🛵','🚲','🛴','🛹','🛼','🚏','🛣️','🛤️'],
  '💡 Objects': ['💡','🔦','🕯️','💰','💵','💴','💶','💷','💸','💳','🪙','💹','📱','💻','⌨️','🖥️','🖨️','🖱️','📺','📷','📸','📹','📼','🔭','🔬','🩺','🩻','💊','💉','🩹','🔑','🗝️','🔒','🔓','🔏','🔐','🛡️','⚔️','🗡️','🏹','🛠️','🔧','🔨','⚙️','🗜️','⚖️','🔗','⛓️','🧲','🪤','🧰','🔩','🪛','🔬','🔭','📡','💈','⚗️','🔱','♾️','⭕','✅','☑️','✔️','❌','❎','➕','➖','➗','✖️','🔀','🔁','🔂','▶️','⏩','⏭️','⏯️','◀️','⏪','⏮️'],
  '❤️ Symbols': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️'],
};

// ── Emoji Modal State ───────────────────────────────────────
let emojiCallback = null;
let currentCat = Object.keys(EMOJI_CATEGORIES)[0];
let habitEmoji = '✏️';
let shopEmoji = '🎁';
let skillEmoji = '🧠';
let taskEmoji = '📝';


// ── API (Serverless Local Storage) ───────────────────────────
async function fetchState() {
  const localData = localStorage.getItem('quintessenState');
  if (localData) {
    try {
      state = JSON.parse(localData);
      renderAll();
      return;
    } catch(e) { console.warn('Local data parse error', e); }
  }
  
  // First-time fallback: load state.json template
  try {
    const res = await fetch('state.json');
    if (res.ok) {
      state = await res.json();
      saveState();
      return;
    }
  } catch(e) { console.warn('No initial state template found.'); }
  renderAll();
}

async function saveState() {
  try {
    localStorage.setItem('quintessenState', JSON.stringify(state));
    // Optionally fire to a backend if configured, but now it's serverless by default
    fetch('/api/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) }).catch(() => {});
  } catch(e) { console.warn('Save failed', e); }
  renderAll();
}

// ── Rendering ───────────────────────────────────────────────
function renderAll() {
  renderHabits();
  renderTasks();
  renderSkills();
  renderShop();
  renderBank();
}

function getAttrClass(attr) {
  return { health:'chip-health', academic:'chip-academic', passion:'chip-passion', social:'chip-social', bad:'chip-bad' }[attr] || 'chip-health';
}

function renderHabits() {
  const list = document.getElementById('habits-list');
  const empty = document.getElementById('habits-empty');
  const countEl = document.getElementById('habit-count');

  list.querySelectorAll('.task-row').forEach(el => el.remove());

  const habits = state.habits || [];
  countEl.textContent = `${habits.length} task${habits.length !== 1 ? 's' : ''}`;
  empty.style.display = habits.length === 0 ? 'flex' : 'none';

  habits.forEach(habit => {
    const row = document.createElement('div');
    row.className = 'task-row';
    row.dataset.id = habit.id;

    const isBad = habit.attr === 'bad';
    const priceClass = isBad ? 'task-price negative' : 'task-price';
    const priceLabel = isBad ? `-$${Math.abs(habit.price).toFixed(0)}` : `+$${habit.price.toFixed(0)}`;

    // Days HTML
    const daysHtml = DAY_KEYS.map((d, i) => {
      const checked = habit.checked?.[d] ? 'checked' + (isBad ? ' bad' : '') : '';
      return `
        <div class="day-pill" data-day="${d}" data-id="${habit.id}">
          <span class="day-label">${DAYS[i]}</span>
          <div class="day-check ${checked}">✓</div>
        </div>`;
    }).join('');

    row.innerHTML = `
      <div class="task-emoji">${habit.icon || '\u270f\ufe0f'}</div>
      <div class="task-info">
        <div class="task-name">${escHtml(habit.name)}</div>
        <div class="task-meta"><span class="chip ${getAttrClass(habit.attr)}">${habit.attr}</span></div>
      </div>
      <div class="${priceClass}">${priceLabel}</div>
      <div class="task-days">${daysHtml}</div>
      <div class="task-actions">
        <button class="action-btn delete-habit" data-id="${habit.id}" title="Delete">\ud83d\uddd1</button>
      </div>
    `;

    // Day checkbox click
    row.querySelectorAll('.day-pill').forEach(pill => {
      pill.addEventListener('click', async () => {
        const day = pill.dataset.day;
        const h = state.habits.find(x => x.id == pill.dataset.id);
        if (!h) return;
        const was = h.checked?.[day];
        h.checked = h.checked || {};
        h.checked[day] = !was;
        const diff = isBad ? (was ? h.price : -h.price) : (was ? -h.price : h.price);
        addCoins(diff, `${was ? '↩ Undo' : '✅ Done'}: ${h.name} (${day.toUpperCase()})`);
        await saveState();
      });
    });

    // Delete habit
    row.querySelector('.delete-habit').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(`Delete habit "${habit.name}"?`)) {
        state.habits = state.habits.filter(x => x.id != habit.id);
        await saveState();
      }
    });

    list.appendChild(row);
  });
}

function renderTasks() {
  const list = document.getElementById('tasks-list');
  if (!list) return;
  const empty = document.getElementById('tasks-empty');
  const countEl = document.getElementById('task-count');

  list.querySelectorAll('.task-item-row').forEach(el => el.remove());

  const tasks = state.tasks || [];
  countEl.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
  empty.style.display = tasks.length === 0 ? 'flex' : 'none';

  tasks.forEach(task => {
    const row = document.createElement('div');
    row.className = 'task-item-row';
    const doneCount = task.completions || 0;

    row.innerHTML = `
      <div class="task-emoji">${task.icon || '\ud83d\udcdd'}</div>
      <div class="task-name">${escHtml(task.name)}</div>
      <div class="task-price positive">+$${task.price.toFixed(0)}</div>
      <div class="done-count">${doneCount}x</div>
      <button class="complete-btn" data-id="${task.id}">&#10003; Complete</button>
      <div class="task-actions">
        <button class="action-btn delete-task" data-id="${task.id}" title="Delete">&#128465;</button>
      </div>
    `;

    row.querySelector('.complete-btn').addEventListener('click', async () => {
      const t = state.tasks.find(x => x.id == task.id);
      if (!t) return;
      t.completions = (t.completions || 0) + 1;
      addCoins(t.price, `\u2705 Task: ${t.name} (#${t.completions})`);
      await saveState();
    });

    row.querySelector('.delete-task').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(`Delete task "${task.name}"?`)) {
        state.tasks = state.tasks.filter(x => x.id != task.id);
        await saveState();
      }
    });

    list.appendChild(row);
  });
}

function renderSkills() {
  const list = document.getElementById('skills-list');
  if (!list) return;
  const empty = document.getElementById('skills-empty');
  const countEl = document.getElementById('skill-count');

  list.querySelectorAll('.skill-row').forEach(el => el.remove());

  const skills = state.skills || [];
  countEl.textContent = `${skills.length} skill${skills.length !== 1 ? 's' : ''}`;
  empty.style.display = skills.length === 0 ? 'flex' : 'none';

  skills.forEach(skill => {
    const row = document.createElement('div');
    row.className = 'skill-row';

    row.innerHTML = `
      <div class="task-emoji">${skill.icon || '\ud83e\udde0'}</div>
      <div class="task-name">${escHtml(skill.name)}</div>
      <div><span class="chip ${getAttrClass(skill.attr)}">${skill.attr}</span></div>
      <div class="task-price positive">+$${skill.price.toFixed(0)}</div>
      <div><button class="log-skill-btn" data-id="${skill.id}">▶ Log Session</button></div>
      <div class="task-actions">
        <button class="action-btn delete-skill" data-id="${skill.id}" title="Delete">\ud83d\uddd1</button>
      </div>
    `;

    row.querySelector('.log-skill-btn').addEventListener('click', async () => {
      addCoins(skill.price, `🧠 Skill: ${skill.name}`);
      await saveState();
    });

    row.querySelector('.delete-skill').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(`Delete skill "${skill.name}"?`)) {
        state.skills = state.skills.filter(x => x.id != skill.id);
        await saveState();
      }
    });

    list.appendChild(row);
  });
}

function renderShop() {
  const list = document.getElementById('shop-list');
  const empty = document.getElementById('shop-empty');
  const countEl = document.getElementById('shop-count');

  list.querySelectorAll('.shop-row').forEach(el => el.remove());

  const items = state.shop || [];
  countEl.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;
  empty.style.display = items.length === 0 ? 'flex' : 'none';

  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'shop-row';

    const canAfford = state.coins >= item.price;

    row.innerHTML = `
      <div class="shop-emoji">${item.icon || '🎁'}</div>
      <div class="shop-info">
        <div class="shop-name">${escHtml(item.name)}</div>
        <div class="shop-desc">${escHtml(item.desc || '')}</div>
      </div>
      <div class="shop-amount-tag">×${item.amount}</div>
      <div class="shop-price-tag">$${item.price.toFixed(0)}</div>
      <button class="buy-btn" data-id="${item.id}" ${!canAfford ? 'disabled title="Not enough credits"' : ''}>
        ${canAfford ? '🛒 Buy' : '🔒 $' + item.price}
      </button>
      <button class="shop-delete-btn" data-id="${item.id}" title="Delete">🗑</button>
    `;

    row.querySelector('.buy-btn').addEventListener('click', async () => {
      if (state.coins < item.price) { alert('Not enough credits!'); return; }
      if (confirm(`Buy "${item.name}" for $${item.price} credits?`)) {
        addCoins(-item.price, `🛍 Bought: ${item.name}`);
        await saveState();
      }
    });

    row.querySelector('.shop-delete-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(`Delete shop item "${item.name}"?`)) {
        state.shop = state.shop.filter(x => x.id != item.id);
        await saveState();
      }
    });

    list.appendChild(row);
  });
}

function renderBank() {
  const total = state.coins || 0;
  document.getElementById('bank-total').textContent = total.toFixed(0);
  document.getElementById('topbar-coin-amount').textContent = total.toFixed(0);

  // Animate coin badge
  const badge = document.getElementById('topbar-coins');
  badge.classList.remove('coin-pop');
  void badge.offsetWidth;
  badge.classList.add('coin-pop');

  const logEl = document.getElementById('bank-history');
  const history = (state.history || []).slice().reverse().slice(0, 20);
  if (history.length === 0) {
    logEl.innerHTML = '<div class="log-empty">No transactions yet.</div>';
    return;
  }
  logEl.innerHTML = history.map(e => {
    const isPos = e.amount >= 0;
    return `<div class="log-entry">
      <span class="log-note">${escHtml(e.note)}</span>
      <span class="log-amount ${isPos ? 'positive' : 'negative'}">${isPos ? '+' : ''}${e.amount.toFixed(0)}</span>
    </div>`;
  }).join('');
}

function addCoins(amount, note) {
  state.coins = (state.coins || 0) + amount;
  if (!state.history) state.history = [];
  state.history.push({ amount, note, date: new Date().toISOString() });
}

// ── Modal Helpers ───────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  el.classList.remove('open');
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Emoji Picker ─────────────────────────────────────────────
function buildEmojiPicker() {
  const catEl = document.getElementById('emoji-categories');
  const gridEl = document.getElementById('emoji-grid');
  const search = document.getElementById('emoji-search');

  // Build category buttons
  catEl.innerHTML = Object.keys(EMOJI_CATEGORIES).map(cat => `
    <button class="cat-btn${cat === currentCat ? ' active' : ''}" data-cat="${escHtml(cat)}">${cat.split(' ')[0]}</button>
  `).join('');

  catEl.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCat = btn.dataset.cat;
      catEl.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      search.value = '';
      renderEmojiGrid(EMOJI_CATEGORIES[currentCat]);
    });
  });

  search.addEventListener('input', () => {
    const q = search.value;
    if (!q) { renderEmojiGrid(EMOJI_CATEGORIES[currentCat]); return; }
    const results = searchEmojis(q);
    if (results && results.length > 0) {
      renderEmojiGrid(results);
    } else {
      gridEl.innerHTML = '<div style="padding:20px;color:#9b9a97;font-size:11px;">No emojis found for "' + escHtml(q) + '"</div>';
    }
  });

  renderEmojiGrid(EMOJI_CATEGORIES[currentCat]);
}

function renderEmojiGrid(emojis) {
  const gridEl = document.getElementById('emoji-grid');
  gridEl.innerHTML = emojis.map(e => `<div class="emoji-item" data-emoji="${e}">${e}</div>`).join('');
  gridEl.querySelectorAll('.emoji-item').forEach(el => {
    el.addEventListener('click', () => {
      if (emojiCallback) emojiCallback(el.dataset.emoji);
      closeModal('emoji-modal');
    });
  });
}

function openEmojiPicker(callback) {
  emojiCallback = callback;
  buildEmojiPicker();
  openModal('emoji-modal');
}

// Safe getElementById + addEventListener — never crashes on missing elements
function on(id, event, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, fn);
  else console.warn(`[Quintessen] Element not found: #${id}`);
}

// ── Init ────────────────────────────────────────────────────
function init() {
  fetchState();
  loadEmojiLib(); // load emoji keyword db from CDN
  
  // Cross-tab synchronization
  window.addEventListener('storage', (e) => {
    if (e.key === 'quintessenState' && e.newValue) {
      try {
        state = JSON.parse(e.newValue);
        renderAll();
      } catch(err) {}
    }
  });

  // Close modals via overlay click or × button
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  // ── Task Modal ─────────────────────────────────────────
  let taskEmojiVal = '\ud83d\udcdd';
  document.getElementById('add-task-btn').addEventListener('click', () => {
    taskEmojiVal = '\ud83d\udcdd';
    document.getElementById('task-emoji-trigger').textContent = taskEmojiVal;
    document.getElementById('task-name-input').value = '';
    document.getElementById('task-price-input').value = '';
    openModal('task-modal');
  });

  document.getElementById('task-emoji-trigger').addEventListener('click', () => {
    openEmojiPicker(e => {
      taskEmojiVal = e;
      document.getElementById('task-emoji-trigger').textContent = e;
    });
  });

  document.getElementById('save-task-btn').addEventListener('click', async () => {
    const name = document.getElementById('task-name-input').value.trim();
    const price = parseFloat(document.getElementById('task-price-input').value) || 10;
    if (!name) { document.getElementById('task-name-input').focus(); return; }
    state.tasks = state.tasks || [];
    state.tasks.push({ id: Date.now(), icon: taskEmojiVal, name, price, completions: 0 });
    await saveState();
    closeModal('task-modal');
  });

  // ── 4-Quadrant Resizable Dividers ─────────────────────
  (function() {
    const vDivs = [document.getElementById('quad-vdivider'), document.getElementById('quad-vdivider-bot')];
    const hDiv = document.getElementById('quad-hdivider');
    const tetra = document.getElementById('quad-tetra-handle');
    const topRow = document.getElementById('quad-top');
    const botRow = document.getElementById('quad-bottom');
    const leftPanels = [document.getElementById('q-habits'), document.getElementById('q-skills')];
    const rightPanels = [document.getElementById('q-tasks'), document.getElementById('q-shop')];
    
    if (!vDivs[0] || !hDiv) return;

    let vDrag = false, hDrag = false;
    let startX = 0, startY = 0;
    let startW = 0, startH = 0;

    function updateLayout(newW, newH) {
      if (newW !== null) {
        leftPanels.forEach(p => { if (p) p.style.flex = `0 0 ${newW}px`; });
        rightPanels.forEach(p => { if (p) p.style.flex = '1'; });
        if (tetra) tetra.style.left = `${newW + 5}px`; // Center over the 10px v-divider
      }
      if (newH !== null) {
        topRow.style.flex = `0 0 ${newH}px`;
        botRow.style.flex = '1';
      }
    }

    // Initialize tetra handle position
    setTimeout(() => updateLayout(leftPanels[0].getBoundingClientRect().width, null), 100);

    vDivs.forEach(div => {
      if (!div) return;
      div.addEventListener('mousedown', e => {
        if (e.target === tetra) return;
        vDrag = true; startX = e.clientX;
        startW = leftPanels[0].getBoundingClientRect().width;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
      });
    });

    hDiv.addEventListener('mousedown', e => {
      if (e.target === tetra) return;
      hDrag = true; startY = e.clientY;
      startH = topRow.getBoundingClientRect().height;
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    if (tetra) {
      tetra.addEventListener('mousedown', e => {
        vDrag = true; hDrag = true;
        startX = e.clientX; startY = e.clientY;
        startW = leftPanels[0].getBoundingClientRect().width;
        startH = topRow.getBoundingClientRect().height;
        document.body.style.cursor = 'move';
        document.body.style.userSelect = 'none';
        e.preventDefault();
        e.stopPropagation();
      });
    }

    document.addEventListener('mousemove', e => {
      if (!vDrag && !hDrag) return;
      let newW = null, newH = null;
      if (vDrag) {
        const rowW = topRow.getBoundingClientRect().width;
        newW = Math.max(180, Math.min(startW + (e.clientX - startX), rowW - 180 - 20));
      }
      if (hDrag) {
        const contH = topRow.parentElement.getBoundingClientRect().height;
        newH = Math.max(150, Math.min(startH + (e.clientY - startY), contH - 150 - 20));
      }
      updateLayout(newW, newH);
    });

    document.addEventListener('mouseup', () => {
      if (!vDrag && !hDrag) return;
      vDrag = hDrag = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });
  })();

  // ── Reset Week ─────────────────────────────────────────
  document.getElementById('reset-week-btn').addEventListener('click', async () => {
    if (!confirm('Reset all habit checkboxes for the new week? Credits are kept.')) return;
    (state.habits || []).forEach(h => {
      h.checked = { mon:false, tue:false, wed:false, thu:false, fri:false, sat:false, sun:false };
    });
    await saveState();
  });

  // ── Habit Modal ────────────────────────────────────────
  document.getElementById('add-habit-btn').addEventListener('click', () => {
    habitEmoji = '✏️';
    document.getElementById('habit-emoji-trigger').textContent = habitEmoji;
    document.getElementById('habit-name-input').value = '';
    document.getElementById('habit-price-input').value = '';
    document.getElementById('habit-attr-input').value = 'health';
    openModal('habit-modal');
  });

  document.getElementById('habit-emoji-trigger').addEventListener('click', () => {
    openEmojiPicker(e => {
      habitEmoji = e;
      document.getElementById('habit-emoji-trigger').textContent = e;
    });
  });

  document.getElementById('save-habit-btn').addEventListener('click', async () => {
    const name = document.getElementById('habit-name-input').value.trim();
    const attr = document.getElementById('habit-attr-input').value;
    const price = parseFloat(document.getElementById('habit-price-input').value) || 10;
    if (!name) { document.getElementById('habit-name-input').focus(); return; }

    state.habits = state.habits || [];
    state.habits.push({
      id: Date.now(),
      icon: habitEmoji,
      name,
      attr,
      price,
      checked: { mon:false, tue:false, wed:false, thu:false, fri:false, sat:false, sun:false }
    });
    await saveState();
    closeModal('habit-modal');
  });

  // ── Shop Modal ─────────────────────────────────────────
  document.getElementById('add-shop-item-btn').addEventListener('click', () => {
    shopEmoji = '🎁';
    document.getElementById('shop-emoji-trigger').textContent = shopEmoji;
    document.getElementById('shop-name-input').value = '';
    document.getElementById('shop-desc-input').value = '';
    document.getElementById('shop-price-input').value = '';
    document.getElementById('shop-amount-input').value = '1';
    openModal('shop-modal');
  });

  document.getElementById('shop-emoji-trigger').addEventListener('click', () => {
    openEmojiPicker(e => {
      shopEmoji = e;
      document.getElementById('shop-emoji-trigger').textContent = e;
    });
  });

  document.getElementById('save-shop-btn').addEventListener('click', async () => {
    const name = document.getElementById('shop-name-input').value.trim();
    const desc = document.getElementById('shop-desc-input').value.trim();
    const price = parseFloat(document.getElementById('shop-price-input').value) || 10;
    const amount = parseInt(document.getElementById('shop-amount-input').value) || 1;
    if (!name) { document.getElementById('shop-name-input').focus(); return; }

    state.shop = state.shop || [];
    state.shop.push({
      id: Date.now(),
      icon: shopEmoji,
      name,
      desc: desc || 'Custom reward',
      price,
      amount
    });
    await saveState();
    closeModal('shop-modal');
  });

  // ── Skill Modal ────────────────────────────────────────
  document.getElementById('add-skill-section-btn').addEventListener('click', () => {
    skillEmoji = '🧠';
    document.getElementById('skill-emoji-trigger').textContent = skillEmoji;
    document.getElementById('skill-name-input').value = '';
    document.getElementById('skill-price-input').value = '';
    document.getElementById('skill-attr-input').value = 'academic';
    openModal('skill-modal');
  });

  document.getElementById('skill-emoji-trigger').addEventListener('click', () => {
    openEmojiPicker(e => {
      skillEmoji = e;
      document.getElementById('skill-emoji-trigger').textContent = e;
    });
  });

  document.getElementById('save-skill-btn').addEventListener('click', async () => {
    const name = document.getElementById('skill-name-input').value.trim();
    const attr = document.getElementById('skill-attr-input').value;
    const price = parseFloat(document.getElementById('skill-price-input').value) || 10;
    if (!name) { document.getElementById('skill-name-input').focus(); return; }

    state.skills = state.skills || [];
    state.skills.push({ id: Date.now(), icon: skillEmoji, name, attr, price });
    await saveState();
    closeModal('skill-modal');
  });

  // ── Import State ─────────────────────────────────────────
  const importInput = document.getElementById('import-state-input');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && typeof parsed === 'object') {
            state = parsed;
            saveState();
            alert('Data imported successfully!');
          }
        } catch (err) {
          alert('Invalid JSON file.');
        }
        importInput.value = ''; // reset input
      };
      reader.readAsText(file);
    });
  }

  // ── Fake Data Generator ──────────────────────────────────
  // ── Download State ───────────────────────────────────────
  on('download-state-btn', 'click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quintessen-state-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // ── Fake Data Generator (Cycling) ─────────────────────────
  let fakeDataIdx = 0;
  on('generate-fake-data', 'click', async () => {
    const sets = [
      {
        coins: 120,
        habits: [
          { id: 1, icon: '🏋️', name: 'Exercise', attr: 'health', price: 20, checked: { mon: true, tue: false, wed: true, thu: false, fri: true, sat: false, sun: false } },
          { id: 2, icon: '📚', name: 'Read 30 mins', attr: 'academic', price: 15, checked: { mon: true, tue: true, wed: true, thu: true, fri: false, sat: false, sun: false } },
          { id: 3, icon: '💧', name: 'Drink 2L Water', attr: 'health', price: 10, checked: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true } }
        ],
        tasks: [
          { id: 4, icon: '🧹', name: 'Clean Room', price: 30, completions: 0 },
          { id: 5, icon: '💻', name: 'Code for 1 hour', price: 50, completions: 2 },
          { id: 6, icon: '🛒', name: 'Grocery Shopping', price: 20, completions: 1 }
        ],
        skills: [
          { id: 7, icon: '🎸', name: 'Guitar', attr: 'passion', price: 100 },
          { id: 8, icon: '🧪', name: 'Chemistry', attr: 'academic', price: 200 }
        ],
        shop: [
          { id: 10, icon: '🎮', name: 'Gaming Session', desc: '1 hour of gaming', price: 40, amount: 1 },
          { id: 11, icon: '🍕', name: 'Pizza Night', desc: 'Order a pizza', price: 100, amount: 1 }
        ],
        history: [
          { amount: 20, note: '✅ Done: Exercise (MON)', date: new Date().toISOString() },
          { amount: 50, note: '✅ Task: Code for 1 hour (#1)', date: new Date().toISOString() }
        ]
      },
      {
        coins: 450,
        habits: [
          { id: 20, icon: '🧘', name: 'Meditation', attr: 'health', price: 25, checked: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true } },
          { id: 21, icon: '📵', name: 'No Social Media', attr: 'bad', price: 30, checked: { mon: false, tue: false, wed: true, thu: false, fri: false, sat: false, sun: false } },
          { id: 22, icon: '🥗', name: 'Eat Healthy', attr: 'health', price: 15, checked: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false } }
        ],
        tasks: [
          { id: 23, icon: '📝', name: 'Write Blog Post', price: 100, completions: 0 },
          { id: 24, icon: '📧', name: 'Clear Inbox', price: 40, completions: 3 },
          { id: 25, icon: '📅', name: 'Plan Week', price: 30, completions: 1 }
        ],
        skills: [
          { id: 26, icon: '🐍', name: 'Python Coding', attr: 'academic', price: 500 },
          { id: 27, icon: '🎨', name: 'Digital Art', attr: 'passion', price: 300 }
        ],
        shop: [
          { id: 28, icon: '🍿', name: 'Movie Ticket', desc: 'Cinema trip', price: 80, amount: 1 },
          { id: 29, icon: '🍩', name: 'Treat Yourself', desc: 'Buy a snack', price: 20, amount: 5 }
        ],
        history: [
          { amount: 100, note: '✅ Task: Write Blog Post (#1)', date: new Date().toISOString() },
          { amount: -30, note: '⚠️ Habit: No Social Media (WED)', date: new Date().toISOString() }
        ]
      },
      {
        coins: 50,
        habits: [
          { id: 30, icon: '🍳', name: 'Cook Breakfast', attr: 'health', price: 10, checked: { mon: true, tue: true, wed: false, thu: false, fri: false, sat: false, sun: false } },
          { id: 31, icon: '🚶', name: '10k Steps', attr: 'health', price: 20, checked: { mon: true, tue: true, wed: true, thu: true, fri: false, sat: false, sun: false } }
        ],
        tasks: [
          { id: 32, icon: '🎨', name: 'Sketching', price: 40, completions: 5 },
          { id: 33, icon: '🧺', name: 'Laundry', price: 25, completions: 1 },
          { id: 34, icon: '🪴', name: 'Water Plants', price: 15, completions: 2 }
        ],
        skills: [
          { id: 35, icon: '🎹', name: 'Piano Practice', attr: 'passion', price: 300 },
          { id: 36, icon: '🇫🇷', name: 'French Language', attr: 'academic', price: 400 }
        ],
        shop: [
          { id: 37, icon: '☕', name: 'Fancy Coffee', desc: 'Starbucks trip', price: 15, amount: 2 },
          { id: 38, icon: '🍦', name: 'Ice Cream', desc: 'One scoop', price: 10, amount: 1 }
        ],
        history: [
          { amount: 15, note: '🛍 Bought: Fancy Coffee', date: new Date().toISOString() },
          { amount: 40, note: '✅ Task: Sketching (#5)', date: new Date().toISOString() }
        ]
      },
      {
        coins: 1200,
        habits: [
          { id: 40, icon: '🏃', name: 'Morning Run', attr: 'health', price: 50, checked: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true } },
          { id: 41, icon: '💸', name: 'No Spending', attr: 'social', price: 100, checked: { mon: true, tue: true, wed: true, thu: false, fri: false, sat: false, sun: false } }
        ],
        tasks: [
          { id: 42, icon: '🧪', name: 'Lab Report', price: 150, completions: 1 },
          { id: 43, icon: '📑', name: 'Study Notes', price: 80, completions: 10 },
          { id: 44, icon: '📂', name: 'Project Milestone', price: 300, completions: 0 }
        ],
        skills: [
          { id: 45, icon: '💹', name: 'Stock Trading', attr: 'academic', price: 1000 },
          { id: 46, icon: '🗣️', name: 'Public Speaking', attr: 'social', price: 600 }
        ],
        shop: [
          { id: 47, icon: '⌚', name: 'New Watch', desc: 'Luxury item', price: 800, amount: 1 },
          { id: 48, icon: '🖥️', name: 'GPU Upgrade', desc: 'High performance', price: 2000, amount: 1 }
        ],
        history: [
          { amount: 150, note: '✅ Task: Lab Report (#1)', date: new Date().toISOString() },
          { amount: -800, note: '🛍 Bought: New Watch', date: new Date().toISOString() }
        ]
      },
      {
        coins: 250,
        habits: [
          { id: 50, icon: '🌳', name: 'Walk in Park', attr: 'health', price: 10, checked: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: true, sun: true } },
          { id: 51, icon: '🧘', name: 'Deep Breathing', attr: 'health', price: 5, checked: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true } },
          { id: 52, icon: '📵', name: 'Phone-free Hour', attr: 'health', price: 20, checked: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false } }
        ],
        tasks: [
          { id: 53, icon: '🧼', name: 'Wash Car', price: 50, completions: 0 },
          { id: 54, icon: '🛠️', name: 'Fix Leak', price: 40, completions: 1 },
          { id: 55, icon: '📦', name: 'Unpack Box', price: 20, completions: 4 }
        ],
        skills: [
          { id: 56, icon: '🍳', name: 'Gourmet Cooking', attr: 'passion', price: 400 },
          { id: 57, icon: '🪴', name: 'Gardening', attr: 'health', price: 250 }
        ],
        shop: [
          { id: 58, icon: '🎬', name: 'Movie Night', desc: 'Watch a movie', price: 50, amount: 1 },
          { id: 59, icon: '🕯️', name: 'Scented Candle', desc: 'Relaxation', price: 25, amount: 2 }
        ],
        history: [
          { amount: 40, note: '✅ Task: Fix Leak (#1)', date: new Date().toISOString() },
          { amount: 20, note: '✅ Task: Unpack Box (#4)', date: new Date().toISOString() }
        ]
      },
      {
        coins: 300,
        habits: [
          { id: 60, icon: '📱', name: 'Digital Detox', attr: 'bad', price: 30, checked: { mon: true, tue: true, wed: true, thu: true, fri: false, sat: false, sun: false } },
          { id: 61, icon: '✍️', name: 'Journaling', attr: 'academic', price: 15, checked: { mon: true, tue: false, wed: true, thu: false, fri: true, sat: false, sun: false } }
        ],
        tasks: [
          { id: 62, icon: '🧽', name: 'Dishes', price: 10, completions: 14 },
          { id: 63, icon: '🧹', name: 'Sweep Floor', price: 15, completions: 3 },
          { id: 64, icon: '♻️', name: 'Recycling', price: 5, completions: 1 }
        ],
        skills: [
          { id: 65, icon: '🥋', name: 'Karate', attr: 'health', price: 600 },
          { id: 66, icon: '🧩', name: 'Puzzle Solving', attr: 'passion', price: 200 }
        ],
        shop: [
          { id: 67, icon: '🍜', name: 'Fancy Ramen', desc: 'Authentic shop', price: 30, amount: 1 },
          { id: 68, icon: '🧋', name: 'Boba Tea', desc: 'Sweet drink', price: 12, amount: 3 }
        ],
        history: [
          { amount: 15, note: '✅ Done: Journaling (FRI)', date: new Date().toISOString() },
          { amount: -30, note: '⚠️ Habit: Digital Detox (FRI)', date: new Date().toISOString() }
        ]
      },
      {
        coins: 600,
        habits: [
          { id: 70, icon: '🏊', name: 'Swimming', attr: 'health', price: 40, checked: { mon: false, tue: true, wed: false, thu: true, fri: false, sat: true, sun: false } },
          { id: 71, icon: '🤝', name: 'Networking', attr: 'social', price: 50, checked: { mon: true, tue: false, wed: true, thu: false, fri: true, sat: false, sun: false } },
          { id: 72, icon: '📖', name: 'Read News', attr: 'academic', price: 10, checked: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true } }
        ],
        tasks: [
          { id: 73, icon: '🏠', name: 'Deep Clean Kitchen', price: 150, completions: 1 },
          { id: 74, icon: '👔', name: 'Dry Cleaning', price: 20, completions: 0 },
          { id: 75, icon: '💼', name: 'Work Project', price: 500, completions: 0 }
        ],
        skills: [
          { id: 76, icon: '📸', name: 'Photography', attr: 'passion', price: 350 },
          { id: 77, icon: '👔', name: 'Leadership', attr: 'social', price: 800 }
        ],
        shop: [
          { id: 78, icon: '🎫', name: 'Concert Ticket', desc: 'Rock on', price: 150, amount: 1 },
          { id: 79, icon: '🍷', name: 'Fine Wine', desc: 'Gourmet night', price: 100, amount: 1 }
        ],
        history: [
          { amount: 150, note: '✅ Task: Deep Clean Kitchen (#1)', date: new Date().toISOString() },
          { amount: 40, note: '✅ Done: Swimming (TUE)', date: new Date().toISOString() }
        ]
      }
    ];

    state = sets[fakeDataIdx % sets.length];
    fakeDataIdx++;
    await saveState();
  });

  // ── Reset All Data ───────────────────────────────────────
  on('reset-state-btn', 'click', async () => {
    if (!confirm('Are you sure you want to reset ALL data? This cannot be undone!')) return;
    
    state = {
      coins: 0,
      habits: [],
      tasks: [],
      skills: [],
      shop: [],
      history: []
    };
    
    await saveState();
    alert('Data has been reset to defaults.');
  });

}

window.addEventListener('DOMContentLoaded', init);
