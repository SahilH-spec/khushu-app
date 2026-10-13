import { useState, useEffect, useRef } from "react";

const MAKKAH_LAT = 21.4225;
const MAKKAH_LNG = 39.8262;

function calcQibla(lat: number, lng: number): number {
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (MAKKAH_LAT * Math.PI) / 180;
  const Δλ = ((MAKKAH_LNG - lng) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

function calcDistance(lat: number, lng: number): number {
  const R = 6371;
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (MAKKAH_LAT * Math.PI) / 180;
  const Δφ = ((MAKKAH_LAT - lat) * Math.PI) / 180;
  const Δλ = ((MAKKAH_LNG - lng) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingLabel(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

export function QiblaPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number; city: string } | null>(null);
  const [qibla, setQibla] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [compassSupported, setCompassSupported] = useState<boolean | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const orientationRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        const q = calcQibla(latitude, longitude);
        const d = calcDistance(latitude, longitude);
        setLocation({ lat: latitude, lng: longitude, city: "Your Location" });
        setQibla(q);
        setDistance(d);
      },
      () => {
        // No location permission: the Qibla direction depends on where you are, so don't guess.
        setLocationError("Location access denied. Allow location in your browser to see the Qibla direction.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const startCompass = async () => {
    setPermissionRequested(true);
    // iOS 13+ requires explicit permission
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DOE.requestPermission === "function") {
      try {
        const result = await DOE.requestPermission();
        if (result !== "granted") { setCompassSupported(false); return; }
      } catch {
        setCompassSupported(false);
        return;
      }
    }

    if (!window.DeviceOrientationEvent) {
      setCompassSupported(false);
      return;
    }

    setCompassSupported(true);
    const handler = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading is iOS; alpha (0=North on Android with absolute=true)
      const heading = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading
        ?? (e.absolute && e.alpha !== null ? (360 - e.alpha) % 360 : null);
      if (heading !== null) setCompassHeading(heading);
    };
    orientationRef.current = handler;
    window.addEventListener("deviceorientation", handler, true);
  };

  useEffect(() => {
    return () => {
      if (orientationRef.current) window.removeEventListener("deviceorientation", orientationRef.current, true);
    };
  }, []);

  // Arrow rotation: qibla bearing adjusted for current compass heading
  const arrowAngle = qibla !== null
    ? compassHeading !== null
      ? qibla - compassHeading
      : qibla
    : 0;

  return (
    <div className="flex flex-col items-center gap-4 px-4 pb-6 mt-3">
      {/* Location badge */}
      <div className="w-full rounded-2xl p-4 flex items-center justify-between gap-3" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: "22px" }}>📍</span>
          <div>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 600 }}>
              {location ? location.city : "Detecting location…"}
            </p>
            {location && (
              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>
                {location.lat.toFixed(4)}° N, {Math.abs(location.lng).toFixed(4)}° W
              </p>
            )}
          </div>
        </div>
        {compassHeading !== null && (
          <div className="text-right">
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-green)", fontSize: "11px", fontWeight: 700 }}>● LIVE</p>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>{Math.round(compassHeading)}° heading</p>
          </div>
        )}
      </div>

      {locationError && (
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px", textAlign: "center" }}>{locationError}</p>
      )}

      {/* Compass */}
      <div className="relative flex items-center justify-center" style={{ width: "280px", height: "280px" }}>
        <svg width="280" height="280" viewBox="0 0 280 280" className="absolute inset-0">
          <circle cx="140" cy="140" r="130" fill="none" stroke="var(--k-border)" strokeWidth="2" />
          <circle cx="140" cy="140" r="115" fill="var(--k-surface)" stroke="var(--k-border)" strokeWidth="1" />
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i * 10 * Math.PI) / 180;
            const isMajor = i % 9 === 0;
            const r1 = isMajor ? 108 : 112;
            const x1 = 140 + r1 * Math.sin(angle);
            const y1 = 140 - r1 * Math.cos(angle);
            const x2 = 140 + 120 * Math.sin(angle);
            const y2 = 140 - 120 * Math.cos(angle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isMajor ? "var(--k-gold)" : "var(--k-border)"} strokeWidth={isMajor ? 2 : 1} />;
          })}
          {[{ label: "N", angle: 0 }, { label: "E", angle: 90 }, { label: "S", angle: 180 }, { label: "W", angle: 270 }].map(({ label, angle }) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <text key={label} x={140 + 98 * Math.sin(rad)} y={140 - 98 * Math.cos(rad) + 4}
                textAnchor="middle" fill={label === "N" ? "var(--k-gold)" : "var(--k-text-muted)"}
                fontSize="12" fontFamily="Nunito, sans-serif" fontWeight="700">{label}</text>
            );
          })}
        </svg>

        {/* Qibla arrow */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `rotate(${arrowAngle}deg)`, transition: compassHeading !== null ? "transform 0.3s ease-out" : "none" }}
        >
          <div className="flex flex-col items-center" style={{ height: "200px" }}>
            <div className="flex flex-col items-center" style={{ height: "100px" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ background: "var(--k-green)", marginTop: "-4px" }}>
                <span style={{ fontSize: "16px" }}>🕋</span>
              </div>
              <div className="flex-1 w-0.5" style={{ background: "var(--k-green)" }} />
            </div>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: "var(--k-gold)" }} />
            <div className="flex-1 w-0.5" style={{ background: "var(--k-border)" }} />
          </div>
        </div>

        {/* Center readout */}
        {qibla !== null && (
          <div className="absolute flex flex-col items-center" style={{ marginTop: "70px" }}>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "22px", fontWeight: 700 }}>{Math.round(qibla)}°</p>
            <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>from North</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="w-full grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 text-center" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-1">Direction</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "16px", fontWeight: 700 }}>{qibla !== null ? bearingLabel(qibla) : "—"}</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>{qibla !== null ? `${Math.round(qibla)}° bearing` : "Calculating…"}</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-1">Distance</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "16px", fontWeight: 700 }}>{distance !== null ? Math.round(distance).toLocaleString() : "—"}</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>km to Makkah</p>
        </div>
      </div>

      {/* Compass enable button */}
      {!permissionRequested ? (
        <button onClick={startCompass} className="w-full rounded-xl py-3" style={{ background: "var(--k-gold-sub)", border: "1px solid var(--k-gold-border)" }}>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "14px", fontWeight: 700 }}>Enable Live Compass</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px", marginTop: "2px" }}>Uses device sensor for accurate direction</p>
        </button>
      ) : compassSupported === false ? (
        <div className="w-full rounded-xl p-3 text-center" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "13px" }}>Compass not available on this device.</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-disabled)", fontSize: "12px", marginTop: "4px" }}>The arrow shows calculated Qibla bearing from North.</p>
        </div>
      ) : compassHeading !== null ? (
        <div className="w-full rounded-xl p-3 text-center" style={{ background: "#1e6b5e15", border: "1px solid #1e6b5e40" }}>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-green)", fontSize: "13px", fontWeight: 600 }}>Live compass active — point device toward Qibla arrow</p>
        </div>
      ) : (
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px", textAlign: "center" }}>Waiting for compass sensor…</p>
      )}

      {/* Info note */}
      <div className="w-full rounded-2xl p-4" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-gold)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest mb-2">About Qibla</p>
        <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "12px", lineHeight: 1.6 }}>
          The Qibla is the direction of the Masjid al-Haram in Makkah, toward which Muslims face during Salah. The bearing shown is calculated using the Great Circle route — the shortest path on Earth's surface. For best accuracy, hold your device flat and level when using the live compass.
        </p>
      </div>
    </div>
  );
}
