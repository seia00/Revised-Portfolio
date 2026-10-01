import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// SF. brand mark — black on white, no accent colour.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 19,
          color: "#0a0a0a",
          letterSpacing: "-0.06em",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        SF
        <span style={{ color: "#717171", marginLeft: "-0.04em" }}>.</span>
      </div>
    ),
    size
  );
}
