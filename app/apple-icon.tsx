import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// 180×180 variant for iOS home-screen / Safari pinned tabs.
export default function AppleIcon() {
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
          fontSize: 110,
          color: "#0a0a0a",
          letterSpacing: "-0.06em",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        SF
        <span style={{ color: "#b23a00", marginLeft: "-0.04em" }}>.</span>
      </div>
    ),
    size
  );
}
