/* Shared by the download page and the invite page: where each app downloads from (always the newest release),
   which device this is, the newest version, and copying. */
'use strict';
const REPO = 'ShnerpLabs/afterglow-releases';
const LATEST = `https://github.com/${REPO}/releases/latest/download/`;
const FILES = {
  server: 'Afterglow-Setup.exe',            // the Afterglow computer: the library, for every screen
  android: 'Afterglow.apk',                 // phones and tablets
  client: 'Afterglow-Client-Setup.exe',     // other Windows computers
  linux: 'install-linux.sh',                // other Linux computers, one command
  mac: 'Afterglow-Mac.zip',                 // Macs: Afterglow.app, in the menu bar
  'mac-server': 'Afterglow-Server-Mac.zip',   // Macs with the collection: Afterglow Server.app, in the menu bar
};
const download = what => LATEST + FILES[what];
const LINUX = `curl -fsSL ${download('linux')} | sh`;

function platform() {
  const u = navigator.userAgent || '';
  if (/Android/i.test(u)) return 'android';
  if (/iPhone|iPad|iPod/i.test(u) || (/Macintosh/.test(u) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Windows/i.test(u)) return 'windows';
  if (/Mac OS X|Macintosh/i.test(u)) return 'mac';
  if (/CrOS/i.test(u)) return 'chromeos';
  if (/Linux|X11/i.test(u)) return 'linux';
  return 'other';
}

function toast(text) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = text; t.classList.add('on');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('on'), 2600);
}

async function copy(text, said) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const a = document.createElement('textarea'); a.value = text; a.style.position = 'fixed'; a.style.opacity = '0';
    document.body.appendChild(a); a.select();
    try { document.execCommand('copy'); } catch {}
    a.remove();
  }
  toast(said || 'Copied');
}

// The newest version, for the little "Version ..." line (it's fine if GitHub doesn't answer).
async function showVersion(el) {
  if (!el) return;
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
    if (!r.ok) return;
    const rel = await r.json(), v = String(rel.tag_name || '').replace(/^v/, '');
    if (!v) return;
    const when = rel.published_at ? new Date(rel.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '';
    el.textContent = `Version ${v}${when ? ' · ' + when : ''} · every app keeps itself up to date`;
    el.hidden = false;
  } catch {}
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-copy]');
  if (b) copy(b.dataset.copy === 'linux' ? LINUX : b.dataset.copy, b.dataset.said);
});
