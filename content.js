// ================= GLOBAL =================
let count = 0;
let userLimit = 100;
let today = new Date().toDateString();

// ================= LOAD =================
chrome.storage.local.get(["reelData", "userLimit"], (data) => {

  let reelData = data.reelData || {
    count: 0,
    lastDate: today,
    history: []
  };

  userLimit = data.userLimit || 100;

  if (reelData.lastDate !== today) {
    reelData.history.push({
      date: reelData.lastDate,
      count: reelData.count
    });

    if (reelData.history.length > 7) {
      reelData.history.shift();
    }

    reelData.count = 0;
    reelData.lastDate = today;
  }

  count = reelData.count;
  saveData(reelData);
  updateUI();
});

// ================= SAVE =================
function saveData(data) {
  chrome.storage.local.set({ reelData: data });
}

// ================= MAIN UI =================
const box = document.createElement("div");

box.innerHTML = `
  <div id="topBar">
    <span>📊</span>
    <div>
      <span id="settings">⚙️</span>
      <span id="hide">❌</span>
    </div>
  </div>

  <div id="title">Today's Reels</div>
  <div id="count">0</div>
`;

document.body.appendChild(box);

// ================= STYLE =================
Object.assign(box.style, {
  position: "fixed",
  top: "60px",
  right: "20px",
  width: "140px",
  padding: "15px",
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(12px)",
  color: "white",
  borderRadius: "16px",
  zIndex: "9999",
  textAlign: "center",
  fontFamily: "Segoe UI"
});

// Elements
const topBar = box.querySelector("#topBar");
const countText = box.querySelector("#count");
const settingsBtn = box.querySelector("#settings");
const hideBtn = box.querySelector("#hide");
const title = box.querySelector("#title");

// Styles
topBar.style.display = "flex";
topBar.style.justifyContent = "space-between";
topBar.style.cursor = "grab";

settingsBtn.style.marginRight = "8px";
settingsBtn.style.cursor = "pointer";
hideBtn.style.cursor = "pointer";

title.style.fontSize = "13px";
title.style.opacity = "0.8";
title.style.marginTop = "5px";

countText.style.fontSize = "30px";
countText.style.marginTop = "8px";

// ================= SETTINGS PANEL =================
const panel = document.createElement("div");

panel.innerHTML = `
  <h4>Settings</h4>

  <input id="limitInput" placeholder="Limit (100)" />

  <br><br>

  <button id="reset">Reset</button>

  <div id="history" style="margin-top:10px;"></div>
`;

document.body.appendChild(panel);

Object.assign(panel.style, {
  position: "fixed",
  top: "120px",
  right: "20px",
  width: "220px",
  padding: "15px",
  background: "black",
  color: "white",
  borderRadius: "12px",
  zIndex: "9999",
  display: "none"
});

// Panel elements
const limitInput = panel.querySelector("#limitInput");
const resetBtn = panel.querySelector("#reset");
const historyDiv = panel.querySelector("#history");

// Input style
limitInput.style.width = "100%";
limitInput.style.padding = "6px";
limitInput.style.borderRadius = "8px";
limitInput.style.border = "none";

// Button style
resetBtn.style.padding = "6px 10px";
resetBtn.style.borderRadius = "8px";
resetBtn.style.border = "none";
resetBtn.style.background = "#ff4d4d";
resetBtn.style.color = "white";
resetBtn.style.cursor = "pointer";

// ================= UPDATE =================
function updateUI() {
  countText.innerText = count;
}

// ================= COUNT =================
let lastUrl = location.href;

setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;

    chrome.storage.local.get(["reelData"], (data) => {
      let reelData = data.reelData;

      reelData.count++;
      count = reelData.count;

      saveData(reelData);
      updateUI();

      if (count % userLimit === 0) {
        alert(`⚠️ You watched ${count} reels`);
      }
    });
  }
}, 1000);

// ================= SETTINGS =================
settingsBtn.onclick = (e) => {
  e.stopPropagation();
  panel.style.display = "block";

  chrome.storage.local.get(["reelData"], (data) => {
    let history = data.reelData.history || [];

    let max = Math.max(...history.map(h => h.count), 1);

    historyDiv.innerHTML = "<b>Last 7 Days:</b>";

    const graphContainer = document.createElement("div");

    Object.assign(graphContainer.style, {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      height: "100px",
      marginTop: "10px"
    });

    history.forEach(h => {
      let height = (h.count / max) * 100;

      const barWrapper = document.createElement("div");
      barWrapper.style.textAlign = "center";

      const bar = document.createElement("div");
      Object.assign(bar.style, {
        width: "14px",
        height: height + "px",
        background: "linear-gradient(to top, #4CAF50, #8BC34A)",
        borderRadius: "4px",
        margin: "0 auto"
      });

      const label = document.createElement("div");
      label.innerText = h.date.slice(0, 3);
      label.style.fontSize = "10px";
      label.style.marginTop = "5px";

      barWrapper.appendChild(bar);
      barWrapper.appendChild(label);

      graphContainer.appendChild(barWrapper);
    });

    historyDiv.appendChild(graphContainer);
  });
};

// CLICK OUTSIDE TO CLOSE
document.addEventListener("click", (e) => {
  if (!panel.contains(e.target) && e.target !== settingsBtn) {
    panel.style.display = "none";
  }
});

// ================= LIMIT =================
limitInput.addEventListener("change", () => {
  userLimit = parseInt(limitInput.value) || 100;
  chrome.storage.local.set({ userLimit });
});

// ================= RESET =================
resetBtn.onclick = () => {
  chrome.storage.local.get(["reelData"], (data) => {
    let reelData = data.reelData;
    reelData.count = 0;
    count = 0;
    saveData(reelData);
    updateUI();
  });
};

// ================= HIDE =================
hideBtn.onclick = () => {
  box.style.display = "none";

  const restore = document.createElement("div");
  restore.innerText = "📊";

  Object.assign(restore.style, {
    position: "fixed",
    top: "60px",
    right: "20px",
    width: "40px",
    height: "40px",
    background: "black",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: "9999"
  });

  document.body.appendChild(restore);

  restore.onclick = () => {
    box.style.display = "block";
    restore.remove();
  };
};

// ================= DRAG =================
let isDragging = false;
let offsetX, offsetY;

topBar.addEventListener("mousedown", (e) => {
  if (e.target === settingsBtn || e.target === hideBtn) return;

  isDragging = true;
  offsetX = e.clientX - box.offsetLeft;
  offsetY = e.clientY - box.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  box.style.left = (e.clientX - offsetX) + "px";
  box.style.top = (e.clientY - offsetY) + "px";
  box.style.right = "auto";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});