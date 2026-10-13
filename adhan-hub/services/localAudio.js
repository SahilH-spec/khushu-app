// Local audio playback — plays MP3s through the machine's default output device.
// Used by local-player.js on both Windows (dev) and Raspberry Pi (production).
//
// On Linux/Pi: prefers mpg123 (lightweight, respects PulseAudio default sink,
// ideal for Pi Zero W's 512 MB RAM). Falls back to ffplay if mpg123 is absent.
// On Windows: uses ffplay (ships with ffmpeg via winget).

const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ── Pick the best player for this platform ────────────────────────────
// Returns 'mpg123' or 'ffplay'
function pickPlayer() {
  if (process.platform !== 'linux') return 'ffplay';
  try { execFileSync('which', ['mpg123'], { stdio: 'ignore' }); return 'mpg123'; } catch (_) {}
  return 'ffplay';
}

// ── Locate ffplay (Windows path search) ──────────────────────────────
let _ffplay = null;
function findFfplay() {
  if (_ffplay) return _ffplay;
  const candidates = [];
  if (process.env.FFPLAY_PATH) candidates.push(process.env.FFPLAY_PATH);
  candidates.push('ffplay');
  if (process.platform === 'win32') {
    const la = process.env.LOCALAPPDATA || '';
    if (la) {
      candidates.push(path.join(la, 'Microsoft', 'WinGet', 'Links', 'ffplay.exe'));
      try {
        const pkgRoot = path.join(la, 'Microsoft', 'WinGet', 'Packages');
        for (const d of fs.readdirSync(pkgRoot)) {
          if (!/Gyan\.FFmpeg/i.test(d)) continue;
          for (const sub of fs.readdirSync(path.join(pkgRoot, d))) {
            const p = path.join(pkgRoot, d, sub, 'bin', 'ffplay.exe');
            if (fs.existsSync(p)) candidates.push(p);
          }
        }
      } catch (_) {}
    }
  }
  let bare = null;
  for (const c of candidates) {
    if (c === 'ffplay' || c === 'ffplay.exe') { bare = bare || c; continue; }
    if (fs.existsSync(c)) { _ffplay = c; return _ffplay; }
  }
  _ffplay = bare || 'ffplay';
  return _ffplay;
}

// ── Play an MP3, resolve when it finishes ─────────────────────────────
// volume: 0–100. Resolves true on clean exit.
function playFile(file, volume = 70) {
  return new Promise((resolve) => {
    if (!fs.existsSync(file)) {
      console.error('Audio file not found:', file);
      return resolve(false);
    }

    const vol = Math.max(0, Math.min(100, Number(volume) || 70));
    const player = pickPlayer();

    let cmd, args;
    if (player === 'mpg123') {
      // mpg123 --scale maps 0-32768 to silence-full; map our 0-100 linearly
      const scale = Math.round((vol / 100) * 32768);
      // -q = quiet, -a pulse = use PulseAudio (routes to BT sink automatically)
      cmd  = 'mpg123';
      args = ['-q', '-a', 'pulse', '--scale', String(scale), file];
    } else {
      cmd  = findFfplay();
      args = ['-nodisp', '-autoexit', '-loglevel', 'quiet', '-volume', String(vol), file];
    }

    let p;
    try {
      p = spawn(cmd, args, { stdio: 'ignore' });
    } catch (e) {
      console.error(`Could not start ${cmd}:`, e.message);
      return resolve(false);
    }
    p.on('error', (e) => {
      console.error(`Player error (${cmd}):`, e.message);
      resolve(false);
    });
    p.on('exit', (code) => resolve(code === 0));
  });
}

// ── Speak text via the OS TTS (best-effort) ────────────────────────────
// Text is piped via stdin to avoid any shell-quoting issues.
function speak(text) {
  return new Promise((resolve) => {
    try {
      if (process.platform === 'win32') {
        const ps = 'Add-Type -AssemblyName System.Speech; ' +
                   '$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; ' +
                   '$s.Rate = -1; $s.Speak([Console]::In.ReadToEnd())';
        const p = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps],
                        { stdio: ['pipe', 'ignore', 'ignore'] });
        p.on('error', () => resolve(false));
        p.on('exit', () => resolve(true));
        p.stdin.write(text);
        p.stdin.end();
      } else {
        // Linux / Raspberry Pi: try espeak-ng, then espeak
        const tryCmd = (cmd, next) => {
          const c = spawn(cmd, [text], { stdio: 'ignore' });
          c.on('error', next);
          c.on('exit', () => resolve(true));
        };
        tryCmd('espeak-ng', () => tryCmd('espeak', () => resolve(false)));
      }
    } catch (_) {
      resolve(false);
    }
  });
}

module.exports = { playFile, speak, findFfplay };
