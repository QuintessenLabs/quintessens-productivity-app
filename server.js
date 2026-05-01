const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const DB_FILE = path.join(__dirname, 'state.json');

// Default initial state
const defaultState = {
  coins: 0,
  history: [],
  habits: [
    { id: 1, icon: '🏋️', name: 'exercise', attr: 'health', price: 20, checked: { mon:false, tue:false, wed:false, thu:false, fri:false, sat:false, sun:false } },
    { id: 2, icon: '📚', name: 'studying (1 hour)', attr: 'academic', price: 5, checked: { mon:false, tue:false, wed:false, thu:false, fri:false, sat:false, sun:false } }
  ],
  shop: [
    { id: 1, price: 20, icon: '📺', name: '[1 full] Anime Episode', desc: 'Watch 1 episode of any anime', amount: 1 }
  ]
};

// Database Handlers
function readState() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2));
    return defaultState;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeState(state) {
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
}

// API Endpoints
app.get('/api/state', (req, res) => {
  res.json(readState());
});

app.post('/api/state', (req, res) => {
  writeState(req.body);
  res.json({ success: true });
});

// AI Evaluator (Phase 2)
app.post('/api/evaluate', async (req, res) => {
  const { itemName, itemType } = req.body;
  console.log(`[Quintessen AI] Evaluating proposal: ${itemName}`);
  let suggestedPrice = itemType === 'skill' ? Math.floor(Math.random() * 40) + 10 : Math.floor(Math.random() * 15) + 5;
  let reasoning = `Based on the perceived difficulty of "${itemName}", I believe $${suggestedPrice} is a fair reward.`;
  setTimeout(() => res.json({ price: suggestedPrice, reasoning }), 1000);
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Quintessen Bank Server API running at http://localhost:${PORT}`);
});

// ---------------------------------------------------------
// PHASE 3: OPENCLAW-STYLE BACKGROUND DESKTOP MONITORING
// ---------------------------------------------------------

console.log("[Quintessen Hub] Booting up background desktop monitor thread...");

let focusTimeSeconds = 0;

setInterval(() => {
  // Use PowerShell to get the title of the currently active window
  const psCommand = 'Get-Process | Where-Object {$_.MainWindowTitle} | Select-Object -First 1 MainWindowTitle | Format-Table -HideTableHeaders';
  
  exec(`powershell -command "${psCommand}"`, (error, stdout) => {
    if (error) return;
    const windowTitle = stdout.trim();
    if (!windowTitle) return;

    let currentState = readState();
    
    // Example NLP detection for productive apps
    const isProductive = /Code|VS Code|Sublime|Notion|Quintessen|Obsidian/i.test(windowTitle);
    const isDistracting = /YouTube|Netflix|Steam|Discord/i.test(windowTitle);

    if (isProductive) {
      focusTimeSeconds += 10;
      // Assign automatic rewards for every 60 seconds (1 minute) of continuous focus
      if (focusTimeSeconds >= 60) {
        currentState.coins += 2;
        currentState.history.push({
          amount: 2,
          note: "🤖 Quintessen Auto-Reward: Deep Focus",
          date: new Date().toISOString()
        });
        writeState(currentState);
        
        console.log("-> Rewarded $2 for 1 minute of deep focus!");
        
        // Notify the user via PowerShell desktop bubble!
        exec(`powershell -command "Add-Type -AssemblyName System.Windows.Forms; $balloon = New-Object System.Windows.Forms.NotifyIcon; $balloon.Icon = [System.Drawing.SystemIcons]::Information; $balloon.BalloonTipIcon = 'Info'; $balloon.BalloonTipText = 'You earned $2 for being focused on your work!'; $balloon.BalloonTipTitle = 'Quintessen AI'; $balloon.Visible = $true; $balloon.ShowBalloonTip(5000);" `);
        
        focusTimeSeconds = 0; // reset
      }
    } else if (isDistracting) {
      focusTimeSeconds = 0; // reset streak
    }
  });
}, 10000); // Check every 10 seconds
