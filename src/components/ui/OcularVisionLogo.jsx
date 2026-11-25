import React from 'react';

/**
 * OcularVisionLogo
 * Bespoke, proprietary Computer Vision & EAR (Eye Aspect Ratio) Telemetry Eye Emblem.
 * Incorporates MediaPipe 6-point biometric landmarks (p1..p6) and precision vertical calipers.
 * 100% Original & Copyright-Safe for Jason Istioso's Skripsi.
 */
export default function OcularVisionLogo({ size = 20, className = '', color = 'currentColor', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-label="Ocular EAR Vision Telemetry Emblem"
    >
      {/* Outer Eyelid Curvature (Biometric Eye Contour) */}
      <path
        d="M 3 16 C 7 7.5, 25 7.5, 29 16 C 25 24.5, 7 24.5, 3 16 Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Vertical EAR Measurement Calipers (Numerator: ||p2 - p6|| and ||p3 - p5||) */}
      <line
        x1="12"
        y1="9.8"
        x2="12"
        y2="22.2"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeDasharray="1.2 2.4"
        opacity="0.6"
      />
      <line
        x1="20"
        y1="9.8"
        x2="20"
        y2="22.2"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeDasharray="1.2 2.4"
        opacity="0.6"
      />

      {/* Iris Optical Aperture Ring */}
      <circle
        cx="16"
        cy="16"
        r="5.5"
        stroke={color}
        strokeWidth="1.9"
      />

      {/* Center Pupil Core */}
      <circle
        cx="16"
        cy="16"
        r="2.6"
        fill={color}
      />

      {/* Sensor Reflection Highlight */}
      <circle
        cx="14.5"
        cy="14.5"
        r="0.9"
        fill="#ffffff"
      />

      {/* 6 MediaPipe EAR Landmark Tracking Points: p1, p2, p3, p4, p5, p6 */}
      <circle cx="4.6" cy="16" r="1.3" fill={color} />
      <circle cx="27.4" cy="16" r="1.3" fill={color} />
      <circle cx="12" cy="9.8" r="1.2" fill={color} />
      <circle cx="20" cy="9.8" r="1.2" fill={color} />
      <circle cx="12" cy="22.2" r="1.2" fill={color} />
      <circle cx="20" cy="22.2" r="1.2" fill={color} />
    </svg>
  );
}

