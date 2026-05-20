import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// SF. brand mark — matches the top-left mark in the Timeline overlay.
// "SF" in fog white, period in electric-soft blue, on ink-black square.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#06070a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 19,
          color: "#e6e8ec",
          letterSpacing: "-0.06em",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        SF
        <span style={{ color: "#7faaff", marginLeft: "-0.04em" }}>.</span>
      </div>
    ),
    size
  );
}
