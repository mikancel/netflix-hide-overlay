// v3.5.0

const HIDE_DELAY = 2500;
let hideTimer = null;
let isHidden = false;
let cursorLock = false;

function isPlayerPage() {
  return location.pathname.startsWith('/watch');
}

// 字幕を除外
function isSubtitleElement(el) {
  if (!el) return false;
  if (el.classList?.contains('player-timedtext')) return true;
  if (el.classList?.contains('player-timedtext-text-container')) return true;
  if (el.querySelector?.('.player-timedtext, .player-timedtext-text-container')) return true;
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

function suppressBorders() {
  const root = document.querySelector('.watch-video--player-view');
  if (!root) return;
  root.style.setProperty('outline', 'none', 'important');
  root.style.setProperty('border-color', 'transparent', 'important');
  root.style.setProperty('box-shadow', 'none', 'important');
  root.querySelectorAll('*').forEach(el => {
    el.style.setProperty('outline', 'none', 'important');
    el.style.setProperty('border-color', 'transparent', 'important');
    el.style.setProperty('box-shadow', 'none', 'important');
  });
}

function hideCursor() {
  document.body.classList.add("nfs-cursor-hidden");
}

function showCursor() {
  if (cursorLock) return;
  document.body.classList.remove("nfs-cursor-hidden");
}

function hideUI() {
  if (!isPlayerPage()) return;
  isHidden = true;
  cursorLock = true;
  hideCursor();
  suppressBorders();
  // エンドカード/次エピのプレビュー動画に釣られないよう、プレイヤー内の映像を優先
  const video =
    document.querySelector('.watch-video--player-view video, .watch-video--player-view-minimized video') ||
    document.querySelector('video');
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

// DOM変化を監視（エンドカードのDOM大量更新でも1フレームにまとめて処理）
let hideRaf = null;
function scheduleHideUI() {
  if (hideRaf !== null) return;
  hideRaf = requestAnimationFrame(() => {
    hideRaf = null;
    if (isHidden && isPlayerPage()) hideUI();
  });
}
new MutationObserver(() => {
  if (isHidden && isPlayerPage()) {
    scheduleHideUI();
  }
}).observe(document.body, { childList: true, subtree: true });

// -minimizedクラスの追加を監視して即座に白枠を消す
new MutationObserver((mutations) => {
  for (const m of mutations) {
    if (m.type === 'attributes' && m.attributeName === 'class') {
      if (m.target.classList.contains('watch-video--player-view-minimized')) {
        suppressBorders();
      }
    }
  }
}).observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });

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