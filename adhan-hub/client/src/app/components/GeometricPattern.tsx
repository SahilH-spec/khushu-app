import type { CSSProperties } from "react";

export function GeometricPattern({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="geo" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          <line x1="20" y1="2" x2="20" y2="38" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
          <line x1="2" y1="11" x2="38" y2="29" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
          <line x1="38" y1="11" x2="2" y2="29" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#geo)" />
    </svg>
  );
}

export function StarPattern({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="star" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
          <polygon points="12.5,1 15.5,9.5 24.5,9.5 17.5,15 20,23.5 12.5,18.5 5,23.5 7.5,15 0.5,9.5 9.5,9.5" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#star)" />
    </svg>
  );
}
