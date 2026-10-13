# Siraj Pi — Raspberry Pi Zero W Adhan Player

Plays your chosen adhan MP3 at every prayer time through the Echo Dot
(paired as a Bluetooth speaker). No Alexa account, no cookies, no cloud auth
required — the Pi handles everything locally.

---

## Hardware used

- Raspberry Pi Zero W (single-core 1 GHz ARMv6, 512 MB RAM, built-in WiFi + BT)
- Micro USB power cord
- Micro USB hub (optional — for keyboard/mouse during initial setup)
- Mini HDMI to HDMI adapter (optional — for a monitor during initial setup)
- Micro SD card
- SD card reader

> **Pi Zero W vs Pi Zero W 2:** The original Pi Zero W is armv6l (32-bit).
> NodeSource does NOT ship Node.js for armv6l — `setup.sh` handles this by
> downloading the unofficial armv6l build from unofficial-builds.nodejs.org.

---

## Setup — Step by Step

### 1. Flash the SD Card (Windows)

1. Download and install **Raspberry Pi Imager** from raspberrypi.com/software
2. Insert the SD card into your card reader and plug it into your PC
3. In Raspberry Pi Imager:
   - **Device:** Raspberry Pi Zero
   - **OS:** Raspberry Pi OS Lite (32-bit) — *not* the desktop version
   - **Storage:** your SD card
4. Click the **pencil icon** (OS Customisation) BEFORE clicking Write:
   - **General tab:**
     - Hostname: `siraj`
     - Username: `pi` / Password: something you'll remember
     - Configure wireless LAN: your home WiFi SSID + password
     - Wireless LAN country: US
   - **Services tab:**
     - Enable SSH ✓ → Use password authentication
5. Click **Save**, then **Write**. Wait for it to finish and verify.

### 2. First Boot

1. Eject the SD card from your PC safely
2. Insert it into the Pi Zero W (gold contacts face down toward the board)
3. Plug in the Micro USB power cord (use the PWR port, not USB)
4. Wait **90 seconds** for first boot (Pi Zero W is slower than Pi 4)
5. SSH in from your Windows PC — open PowerShell and run:
   ```
   ssh pi@siraj.local
   ```
   If `siraj.local` doesn't resolve, check your router's DHCP list for the Pi's IP address
   and use `ssh pi@<ip-address>` instead.

### 3. Run the Setup Script

Clone the repo onto the Pi and run the script (read it first; it installs packages and a systemd service):

```bash
sudo apt-get install -y git
git clone <your-repo-url> ~/siraj
cd ~/siraj/adhan-hub/pi
LATITUDE=40.71 LONGITUDE=-74.00 TIMEZONE=America/New_York bash setup.sh
```

Use your own coordinates and timezone. (The folder and service are still named `siraj` from the project's first name.)

This automatically:
- Detects armv6l (Pi Zero W) and installs the correct Node.js build
- Installs `mpg123` (lightweight MP3 player — much lighter than ffplay on 512 MB RAM)
- Installs PulseAudio + Bluetooth tools
- Clones the Siraj repo to `/home/pi/siraj`
- Creates a `.env` with your location/timezone
- Installs and enables the `siraj-adhan` systemd service

### 4. Add Your Adhan Audio Files

The audio files are NOT in the repo: they are large and you need the right to use the recordings you choose. Copy your own MP3s from your PC:

```powershell
# From PowerShell on your Windows PC — run from the folder containing your MP3s
scp adhan-omar-hisham.mp3      pi@siraj.local:/home/pi/siraj/adhan-hub/public/audio/
scp adhan-ahmed-el-kourdi.mp3  pi@siraj.local:/home/pi/siraj/adhan-hub/public/audio/
scp adhan-fajr.mp3             pi@siraj.local:/home/pi/siraj/adhan-hub/public/audio/
```

Supported filenames (must match exactly):

| Filename | When used |
|---|---|
| `adhan-fajr.mp3` | Fajr prayer (has "As-Salatu Khayrun Min An-Nawm") |
| `adhan-omar-hisham.mp3` | Default reciter |
| `adhan-afasy.mp3` | Mishary Rashid al-Afasy |
| `adhan-makkah.mp3` | Makkah live |
| `adhan-madinah.mp3` | Madinah live |
| `adhan-basit.mp3` | Abdul Basit |

You only need the two files you'll actually use. If `adhan-fajr.mp3` is missing, it
falls back to the regular reciter file for Fajr as well.

### 5. Pair the Echo Dot

Put your Echo Dot in Bluetooth pairing mode — say **"Alexa, pair"** or hold the
action button until the light ring turns orange. Then on the Pi:

```bash
bash ~/siraj/adhan-hub/pi/bt-connect.sh
```

Follow the prompts — it scans for nearby Bluetooth devices, asks you to enter the
Echo Dot's MAC address, then pairs, trusts, connects, and sets it as the default
PulseAudio output. The MAC is also saved to `.env` for automatic reconnection on reboot.

### 6. Test Playback

```bash
node ~/siraj/adhan-hub/local-player.js --test Asr
```

You should hear the adhan come through the Echo Dot. If audio plays from the wrong
device (or nowhere), see Troubleshooting below.

### 7. Start the Service

```bash
sudo systemctl start siraj-adhan
sudo systemctl status siraj-adhan
```

The Pi now plays adhan at every prayer time automatically. You can unplug the
keyboard/monitor and walk away — the service starts on every boot and reconnects
to the Echo Dot automatically.

---

## How It Works

```
Pi Zero W
  │
  ├─ WiFi → fetches prayer times from the Aladhan API
  │
  └─ Bluetooth A2DP → Echo Dot (used purely as a BT speaker)
       ↑
       local-player.js polls once per minute, fires at prayer time
       mpg123 → PulseAudio → Bluetooth sink → Echo Dot speaker
```

No Alexa account needed. The Echo Dot is just a Bluetooth speaker here.

---

## Daily Commands

```bash
# See today's prayer schedule
node ~/siraj/adhan-hub/local-player.js --next

# Test a specific prayer right now
node ~/siraj/adhan-hub/local-player.js --test Fajr
node ~/siraj/adhan-hub/local-player.js --test Maghrib

# Check service status / live logs
sudo systemctl status siraj-adhan
journalctl -u siraj-adhan -f

# Restart after a crash or config change
sudo systemctl restart siraj-adhan
```

---

## Troubleshooting

**Bluetooth disconnects after idle:**
```bash
sudo systemctl restart siraj-adhan
# bt-reconnect.sh runs automatically as ExecStartPre on every restart
```

**Audio plays from wrong device (or no audio):**
```bash
pactl list short sinks
# Look for a line like: bluez_sink.XX_XX_XX_XX_XX_XX.a2dp_sink
pactl set-default-sink <that-name>
# Then test:
node ~/siraj/adhan-hub/local-player.js --test Asr
```

**Echo Dot says "Bluetooth connected" but no audio:**
```bash
# PulseAudio may not have loaded the BT module yet — restart it:
systemctl --user restart pulseaudio
sleep 3
bluetoothctl connect <ECHO_MAC>
```

**`node` command not found after setup:**
```bash
# The unofficial armv6l build installs to /usr/local — verify:
ls /usr/local/bin/node
# If missing, re-run setup.sh
```

**Can't SSH in (`siraj.local` not resolving):**
- Log into your router and find the Pi's IP address in the DHCP client list
- Try `ssh pi@<ip-address>` directly
- Pi Zero W first boot takes ~90 seconds — wait a bit longer

---

## Updating

```bash
cd ~/siraj
git pull
# (app files are in ~/siraj/adhan-hub/)
sudo systemctl restart siraj-adhan
```
