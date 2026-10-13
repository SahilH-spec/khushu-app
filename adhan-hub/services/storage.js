const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/config.json');

const ADMIN_PROFILE_ID = process.env.ADMIN_PROFILE_ID || 'admin';

const PROFILE_DEFAULTS = {
  displayName: 'User',
  isAdmin: false,
  adhanEnabled: true,
  volume: 70,
  fajrSpecial: true,
  announceBeforeMinutes: 0,
  selectedReciter: 'omar-hisham',
};

// Own-property check so ids like "constructor" or "__proto__" never resolve to Object.prototype members
const has = (obj, key) => !!obj && Object.prototype.hasOwnProperty.call(obj, key);

function _readRaw() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Config read error:', e.message);
  }
  return null;
}

function _write(data) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('Config write error:', e.message);
    return false;
  }
}

// Returns the root { profiles: {...} } object, migrating from legacy flat format if needed.
function _getRoot() {
  const raw = _readRaw();
  if (!raw) {
    return { profiles: { [ADMIN_PROFILE_ID]: { ...PROFILE_DEFAULTS, displayName: 'Admin', isAdmin: true } } };
  }
  if (raw.profiles) return raw;
  // Migrate legacy flat config
  const adminProfile = {
    ...PROFILE_DEFAULTS,
    displayName: 'Admin',
    isAdmin: true,
    adhanEnabled: raw.adhanEnabled !== false,
    volume: raw.volume ?? 70,
    fajrSpecial: raw.fajrSpecial !== false,
    selectedReciter: raw.selectedReciter || 'omar-hisham',
    announceBeforeMinutes: raw.announceBeforeMinutes ?? 0,
  };
  const migrated = { profiles: { [ADMIN_PROFILE_ID]: adminProfile } };
  _write(migrated);
  console.log('📦 Config migrated to multi-profile format');
  return migrated;
}

// ── Profile API ───────────────────────────────────────────────────────

function loadProfile(profileId) {
  const root = _getRoot();
  const p = has(root.profiles, profileId) ? root.profiles[profileId] : null;
  if (!p) return null;
  return { ...PROFILE_DEFAULTS, ...p };
}

function upsertProfile(profileId, partial) {
  const root = _getRoot();
  if (!root.profiles) root.profiles = {};
  root.profiles[profileId] = { ...(has(root.profiles, profileId) ? root.profiles[profileId] : { ...PROFILE_DEFAULTS }), ...partial };
  _write(root);
  return { ...PROFILE_DEFAULTS, ...root.profiles[profileId] };
}

function deleteProfile(profileId) {
  if (profileId === ADMIN_PROFILE_ID) return false; // admin is permanent
  const root = _getRoot();
  if (!has(root.profiles, profileId)) return false;
  delete root.profiles[profileId];
  _write(root);
  return true;
}

function listProfiles() {
  const root = _getRoot();
  return Object.entries(root.profiles || {}).map(([id, p]) => ({
    id,
    displayName: p.displayName || id,
    isAdmin: !!p.isAdmin,
    adhanEnabled: p.adhanEnabled !== false,
  }));
}

function createProfile(profileId, displayName) {
  const root = _getRoot();
  if (!root.profiles) root.profiles = {};
  if (!has(root.profiles, profileId)) {
    root.profiles[profileId] = { ...PROFILE_DEFAULTS, displayName };
    _write(root);
  }
  return { ...PROFILE_DEFAULTS, ...root.profiles[profileId] };
}

// ── Legacy compat (existing code works via admin profile) ─────────────

function load()          { return loadProfile(ADMIN_PROFILE_ID) || { ...PROFILE_DEFAULTS, isAdmin: true }; }
function save(data)      { upsertProfile(ADMIN_PROFILE_ID, data); return true; }
function update(partial) { return upsertProfile(ADMIN_PROFILE_ID, partial); }

module.exports = {
  load, save, update,
  loadProfile, upsertProfile, deleteProfile, listProfiles, createProfile,
  ADMIN_PROFILE_ID, PROFILE_DEFAULTS,
};
