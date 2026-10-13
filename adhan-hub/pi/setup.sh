#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# Siraj Pi Setup — Raspberry Pi Zero W adhan player
#
# Run this ONCE after first SSH into a fresh Raspberry Pi OS Lite install.
# Installs Node.js, mpg123, Bluetooth audio, and the adhan player service.
#
# Works on both Pi Zero W (armv6l, 32-bit) and Pi Zero W 2 (armv7l/aarch64).
#
# Usage (after cloning the repo onto the Pi, or copying this file over):
#   KHUSHU_REPO_URL=https://github.com/<you>/khushu-app.git \
#   LATITUDE=40.71 LONGITUDE=-74.00 TIMEZONE=America/New_York bash setup.sh
#
# Read a script before you run it. Do not pipe unknown scripts from the internet into bash.
# ─────────────────────────────────────────────────────────────────────

set -e

REPO_URL="${KHUSHU_REPO_URL:-}"
if [ -z "$REPO_URL" ] && [ ! -d "/home/pi/siraj/.git" ]; then
  echo "Set KHUSHU_REPO_URL to the git URL of your copy of this repo, e.g."
  echo "  KHUSHU_REPO_URL=https://github.com/<you>/khushu-app.git bash setup.sh"
  exit 1
fi
CLONE_DIR="/home/pi/siraj"
APP_DIR="$CLONE_DIR/adhan-hub"
SERVICE_NAME="siraj-adhan"
ARCH=$(uname -m)

echo ""
echo "Siraj Pi Setup"
echo "  arch: $ARCH"
echo "────────────────────────────────────"

# ── System packages ───────────────────────────────────────────────────
echo "Installing system packages..."
sudo apt-get update -q
sudo apt-get install -y -q \
  git curl \
  mpg123 \
  espeak-ng \
  pulseaudio pulseaudio-module-bluetooth \
  bluetooth bluez bluez-tools \
  alsa-utils

# ── Node.js ──────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  if [ "$ARCH" = "armv6l" ]; then
    # Pi Zero W (original) — armv6l is NOT supported by NodeSource.
    # Use the unofficial Node.js builds maintained by the community.
    NODE_VERSION="18.20.8"
    NODE_TAR="node-v${NODE_VERSION}-linux-armv6l.tar.gz"
    echo "Installing Node.js ${NODE_VERSION} (unofficial armv6l build for Pi Zero W)..."
    curl -fsSL \
      "https://unofficial-builds.nodejs.org/download/release/v${NODE_VERSION}/${NODE_TAR}" \
      -o "/tmp/${NODE_TAR}"
    sudo tar -xzf "/tmp/${NODE_TAR}" -C /usr/local --strip-components=1
    rm "/tmp/${NODE_TAR}"
  else
    # Pi Zero W 2, Pi 3, Pi 4 — NodeSource works fine
    echo "Installing Node.js 20 LTS (NodeSource)..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
fi
echo "Node $(node -v) | npm $(npm -v)"

# ── PulseAudio Bluetooth setup ────────────────────────────────────────
echo "Configuring PulseAudio for Bluetooth..."
sudo usermod -aG bluetooth,pulse,pulse-access pi

# Enable PulseAudio at user login (not system-wide — works better for BT audio)
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/pulseaudio.service << 'PULSE_EOF'
[Unit]
Description=PulseAudio Sound Server
[Service]
ExecStart=/usr/bin/pulseaudio --daemonize=no --log-target=journal
Restart=on-failure
[Install]
WantedBy=default.target
PULSE_EOF
systemctl --user enable pulseaudio || true

# ── Clone or update the repo ──────────────────────────────────────────
if [ -d "$CLONE_DIR/.git" ]; then
  echo "Updating existing repo..."
  git -C "$CLONE_DIR" pull
else
  echo "Cloning Siraj repo..."
  git clone "$REPO_URL" "$CLONE_DIR"
fi

# ── npm install (skip client build — Pi doesn't need the web UI) ──────
cd "$APP_DIR"
echo "Installing server dependencies..."
npm install --omit=dev

# ── .env file ─────────────────────────────────────────────────────────
if [ ! -f "$APP_DIR/.env" ]; then
  cat > "$APP_DIR/.env" << 'ENV_EOF'
# Khushu Pi environment: set your location and timezone (https://www.latlong.net)
LATITUDE=__LATITUDE__
LONGITUDE=__LONGITUDE__
TIMEZONE=__TIMEZONE__
TZ=__TIMEZONE__
# Aladhan calculation method (2 = ISNA) and Asr school (0 = Shafi/standard, 1 = Hanafi)
ALADHAN_METHOD=2
ALADHAN_SCHOOL=0
# The Pi plays audio directly through the default (Bluetooth) output; no cloud account needed
ENV_EOF
  sed -i "s|__LATITUDE__|${LATITUDE:-}|; s|__LONGITUDE__|${LONGITUDE:-}|; s|__TIMEZONE__|${TIMEZONE:-UTC}|g" "$APP_DIR/.env"
  if [ -z "${LATITUDE:-}" ] || [ -z "${LONGITUDE:-}" ]; then
    echo "!! LATITUDE/LONGITUDE not provided. Edit $APP_DIR/.env before starting the service."
  fi
  echo "Created .env"
fi

# ── Systemd service ───────────────────────────────────────────────────
echo "Installing systemd service..."
sudo cp "$APP_DIR/pi/adhan-player.service" "/etc/systemd/system/${SERVICE_NAME}.service"
sudo sed -i "s|__APP_DIR__|${APP_DIR}|g" "/etc/systemd/system/${SERVICE_NAME}.service"
sudo sed -i "s|__USER__|pi|g" "/etc/systemd/system/${SERVICE_NAME}.service"
sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}.service"

echo ""
echo "────────────────────────────────────"
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Add your adhan MP3 files to: $APP_DIR/public/audio/"
echo "       adhan-omar-hisham.mp3   (regular prayers)"
echo "       adhan-fajr.mp3          (Fajr, with 'As-Salatu Khayrun Min An-Nawm')"
echo "       (see README.md for other supported reciter filenames)"
echo ""
echo "  2. Pair your Echo Dot as a Bluetooth speaker:"
echo "       bash $APP_DIR/pi/bt-connect.sh"
echo ""
echo "  3. Test audio playback through the Echo Dot:"
echo "       node $APP_DIR/local-player.js --test Asr"
echo ""
echo "  4. Start the service:"
echo "       sudo systemctl start ${SERVICE_NAME}"
echo "       journalctl -u ${SERVICE_NAME} -f"
echo ""
