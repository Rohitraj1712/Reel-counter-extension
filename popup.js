const countEl = document.getElementById("count");
const resetBtn = document.getElementById("reset");

chrome.storage.local.get(["reelCount"], (data) => {
  countEl.innerText = data.reelCount || 0;
});

resetBtn.addEventListener("click", () => {
  chrome.storage.local.set({ reelCount: 0 });
  countEl.innerText = 0;
});