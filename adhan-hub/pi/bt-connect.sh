#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# Siraj Pi — Echo Dot Bluetooth Speaker Pairing
#
# Pairs the Echo Dot as a Bluetooth A2DP speaker and sets it as the
# default audio output so adhan MP3s play through it.
#
# Usage:
#   bash bt-connect.sh
#
# Requirements: setup.sh must have run first (mpg123 + bluez installed)
# ─────────────────────────────────────────────────────────────────────

set -e

echo ""
echo "Siraj — Echo Dot Bluetooth Setup"
echo "────────────────────────────────────"
echo ""
echo "STEP 1: Put your Echo Dot in pairing mode."
echo "  Say 'Alexa, pair' on your Echo Dot"
echo "  OR hold the action button until the light ring turns orange."
echo ""
read -p "Press ENTER when the Echo Dot is in pairing mode..."
echo ""

# Make sure PulseAudio and Bluetooth are running
pulseaudio --start 2>/dev/null || true
sudo systemctl start bluetooth
sleep 2

echo "Scanning for Bluetooth devices (15 seconds)..."
echo "  (Look for a device named 'Echo Dot' or 'Amazon Echo Dot')"
echo ""

# Start scan in background, wait 15s, then stop and list
bluetoothctl power on  2>/dev/null || true
bluetoothctl agent on  2>/dev/null || true
bluetoothctl scan on   2>/dev/null || true &
SCAN_PID=$!
sleep 15
bluetoothctl scan off  2>/dev/null || true
wait $SCAN_PID 2>/dev/null || true

echo ""
echo "Nearby devices:"
bluetoothctl devices 2>/dev/null || true
echo ""

read -p "Enter the MAC address of your Echo Dot (e.g. AA:BB:CC:DD:EE:FF): " ECHO_MAC
ECHO_MAC=$(echo "$ECHO_MAC" | tr '[:lower:]' '[:upper:]' | xargs)

if [ -z "$ECHO_MAC" ]; then
  echo "No MAC address entered. Exiting."
  exit 1
fi

echo ""
echo "Pairing with $ECHO_MAC..."
bluetoothctl pair "${ECHO_MAC}" || true
sleep 2

echo "Trusting device (so it reconnects automatically)..."
bluetoothctl trust "${ECHO_MAC}"

echo "Connecting..."
bluetoothctl connect "${ECHO_MAC}" || true
sleep 4

# Set as default PulseAudio sink
echo "Setting Echo Dot as default audio output..."
PA_SINK=$(pactl list short sinks 2>/dev/null | grep -i "bluez" | head -1 | awk '{print $2}')

if [ -n "$PA_SINK" ]; then
  pactl set-default-sink "$PA_SINK"
  echo "Default audio sink set to: $PA_SINK"
else
  echo ""
  echo "Could not auto-detect Bluetooth sink in PulseAudio."
  echo "PulseAudio may still be loading the BT module. Try in 10 seconds:"
  echo "  pactl list short sinks"
  echo "  pactl set-default-sink <bluez_sink_name>"
fi

# Save MAC to .env for auto-reconnect on boot
ENV_FILE="$(dirname "$0")/../.env"
if [ -f "$ENV_FILE" ]; then
  sed -i '/^BT_ECHO_MAC=/d' "$ENV_FILE"
  echo "BT_ECHO_MAC=${ECHO_MAC}" >> "$ENV_FILE"
  echo "Saved MAC to .env as BT_ECHO_MAC"
fi

# Create the auto-reconnect script called by the systemd service on startup
cat > "$(dirname "$0")/bt-reconnect.sh" << RECONN_EOF
#!/bin/bash
# Auto-reconnects Echo Dot on boot — called by the systemd service ExecStartPre
MAC="${ECHO_MAC}"
bluetoothctl power on  2>/dev/null || true
bluetoothctl connect "\$MAC" 2>/dev/null || true
sleep 4
SINK=\$(pactl list short sinks 2>/dev/null | grep -i bluez | head -1 | awk '{print \$2}')
[ -n "\$SINK" ] && pactl set-default-sink "\$SINK"
RECONN_EOF
chmod +x "$(dirname "$0")/bt-reconnect.sh"

echo ""
echo "────────────────────────────────────"
echo "Echo Dot paired and set as default output!"
echo ""
echo "Test playback now:"
echo "  node $(dirname "$0")/../local-player.js --test Asr"
echo ""
echo "If audio doesn't come through the Echo Dot:"
echo "  1. pactl list short sinks           (find the bluez_sink line)"
echo "  2. pactl set-default-sink <name>    (set it as default)"
echo "  3. node local-player.js --test Asr  (retry)"
echo ""
echo "The Pi reconnects to the Echo Dot automatically on every reboot."
