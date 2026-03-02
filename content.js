/**
 * Netflix Silent v3+ — content.js（字幕保持・カーソル安定化・最終版）
 * - マウス静止中は映像(<video>)以外のUI要素を非表示（字幕は除外）
 * - DOM変化を監視し、新要素が追加されても即座に隠す
 * - UIが隠れている間はカーソルを強制的に非表示に固定
 */

const HIDE_DELAY = 2000;
let hideTimer = null;
let isHidden = false;
let cursorLock = false;

function isPlayerPage() {
  return location.pathname.startsWith('/watch');
}

// Netflix字幕DOMを確実に除外（クラス＋保険ロジック）
function isSubtitleElement(el) {
  if (!el) return false;

  // クラスベース（最優先・安定）
  if (el.classList?.contains('player-timedtext')) return true;
  if (el.classList?.contains('player-timedtext-text-container')) return true;
  if (el.querySelector?.('.player-timedtext, .player-timedtext-text-container')) return true;

  // 意味属性ベース（将来変更への保険）
  if (el.matches?.('[aria-live]')) return true;
  if (el.querySelector?.('[aria-live]')) return true;

  return false;
}

function hideNonVideoElements(video) {
  let current = video;
  let parent = current.parentElement;
  while (parent && parent !== document.documentElement) {
    Array.from(parent.children).forEach(child => {
      if (child !== current && !isSubtitleElement(child)) {
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
  if (cursorLock) return; // UIが隠れている間は復活させない
  document.body.classList.remove("nfs-cursor-hidden");
}

function hideUI() {
  if (!isPlayerPage()) return;
  isHidden = true;
  cursorLock = true;
  hideCursor();
  const video = document.querySelector('video');
  if (!video) return;
  hideNonVideoElements(video);
}

function showUI() {
  if (!isHidden) return;
  isHidden = false;
  cursorLock = false;
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