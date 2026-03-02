/**
 * Netflix Silent v3 — content.js
 * - マウス静止中は映像(<video>)以外の全UI要素を非表示
 * - DOM変化を監視し、新要素が追加されても即座に隠す
 */

const HIDE_DELAY = 2000;
let hideTimer = null;
let isHidden = false;

function isPlayerPage() {
  return location.pathname.startsWith('/watch');
}

function hideNonVideoElements(video) {
  let current = video;
  let parent = current.parentElement;
  while (parent && parent !== document.documentElement) {
    Array.from(parent.children).forEach(child => {
      if (child !== current) {
        child.style.setProperty('opacity', '0', 'important');
        child.style.setProperty('pointer-events', 'none', 'important');
        child.dataset.nfsHidden = '1';
      }
    });
    current = parent;
    parent = parent.parentElement;
  }
}

function hideCursor() {
  document.body.classList.add("nfs-cursor-hidden");
}

function showCursor() {
  document.body.classList.remove("nfs-cursor-hidden");
}

function hideUI() {
  if (!isPlayerPage()) return;
  isHidden = true;
  hideCursor();
  const video = document.querySelector('video');
  if (!video) return;
  hideNonVideoElements(video);
}

function showUI() {
  if (!isHidden) return;
  isHidden = false;
  showCursor();
  document.querySelectorAll('[data-nfs-hidden]').forEach(el => {
    el.style.removeProperty('opacity');
    el.style.removeProperty('pointer-events');
    delete el.dataset.nfsHidden;
  });
  Array.from(document.body.children).forEach(child => {
    child.style.removeProperty('opacity');
    child.style.removeProperty('pointer-events');
  });
}

function scheduleHide() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hideUI, HIDE_DELAY);
}

// マウス操作
document.addEventListener('mousemove', () => {
  if (!isPlayerPage()) return;
  showUI();
  scheduleHide();
}, { passive: true });

// DOM変化を監視: 隠れている状態のとき新要素が追加されたら即座に隠す
new MutationObserver(() => {
  if (isHidden && isPlayerPage()) {
    hideUI();
  }
}).observe(document.body, { childList: true, subtree: true });

// SPA遷移の監視
let lastPath = location.pathname;
new MutationObserver(() => {
  if (location.pathname === lastPath) return;
  lastPath = location.pathname;
  if (isPlayerPage()) {
    hideUI();
  } else {
    clearTimeout(hideTimer);
    showUI();
  }
}).observe(document.body, { childList: true, subtree: true });

// 初期化
if (isPlayerPage()) {
  hideUI();
}
