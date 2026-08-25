import React from "react";
import "./variants/brandflow.css";

/**
 * Decorative soundwave mark matching the edge-ml logo (bi-soundwave).
 * Rendered inline so it can be recoloured / used as a watermark.
 */
export const SoundWave = ({ className, style }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M8.5 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5zm-2 2a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zm4 0a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zm-6 1.5A.5.5 0 0 1 5 6v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm8 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm-10 1A.5.5 0 0 1 3 7v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5zm12 0A.5.5 0 0 1 15 7v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5z"
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/* "brandflow" — kinetic rows of edge-ml logo marks                    */
/* ------------------------------------------------------------------ */
const BRAND_FLOW_MARKS = Array.from({ length: 16 });
const BRAND_FLOW_ROWS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
];
const BRAND_FLOW_ROW_CENTER = 60;
const BRAND_FLOW_ROW_GAP = 12;

const BrandFlowRow = ({ className, style }) => (
  <div className={`brandflow-row ${className}`} style={style}>
    <div className="brandflow-track">
      {[0, 1].map((group) => (
        <div className="brandflow-set" key={group}>
          {BRAND_FLOW_MARKS.map((_, index) => (
            <div className="brandflow-logo" key={index}>
              <SoundWave className="brandflow-logo-mark" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const BrandFlowLayout = ({ children }) => (
  <div className="auth-layout v-brandflow">
    <div className="brandflow-scene" aria-hidden="true">
      <div className="brandflow-mesh" />
      <div className="brandflow-grid" />
      {BRAND_FLOW_ROWS.map((row, index) => {
        const centerOffset = index - (BRAND_FLOW_ROWS.length - 1) / 2;

        return (
          <BrandFlowRow
            key={row}
            className={`row-${row}`}
            style={{
              top: `${BRAND_FLOW_ROW_CENTER + centerOffset * BRAND_FLOW_ROW_GAP}%`,
            }}
          />
        );
      })}
      <div className="brandflow-halo" />
    </div>
    <main className="auth-form-side brandflow-form-side">{children}</main>
  </div>
);

/* ------------------------------------------------------------------ */

/** Full-page layout for login / register. */
export const AuthLayout = ({ children }) => <BrandFlowLayout>{children}</BrandFlowLayout>;

export default AuthLayout;
