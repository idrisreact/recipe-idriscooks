/* Two redesigned hero variants */

const FoodPlaceholder = ({ w, h, label = "hero food shot", style }) => (
  <div style={{
    width: w, height: h,
    background: `repeating-linear-gradient(135deg, #d6c9b3 0px, #d6c9b3 8px, #cfc0a6 8px, #cfc0a6 16px)`,
    display: "grid", placeItems: "center", color: "#5a4d36",
    fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.05em",
    ...style,
  }}>
    {label}
  </div>
);

const NavBar = ({ dark }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 48px", borderBottom: `1px solid ${dark ? "rgba(245,239,230,0.1)" : "rgba(28,26,23,0.08)"}`,
  }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, lineHeight: 1, color: dark ? "#F5EFE6" : "#1C1A17" }}>Idris</div>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 28, lineHeight: 1, color: "#C8472D" }}>cooks</div>
    </div>
    <div style={{ display: "flex", gap: 28, fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 500, color: dark ? "#F5EFE6" : "#1C1A17" }}>
      <span>Recipes</span>
      <span>Methods</span>
      <span>Pantry</span>
      <span>About</span>
    </div>
    <div style={{
      fontFamily: "'DM Sans'", fontSize: 12, padding: "8px 14px",
      border: `1px solid ${dark ? "rgba(245,239,230,0.3)" : "#1C1A17"}`,
      color: dark ? "#F5EFE6" : "#1C1A17", borderRadius: 999,
    }}>Search ⌘K</div>
  </div>
);

const HeroEditorial = () => {
  return (
    <div style={{
      width: 1280, height: 820, background: "#F5EFE6", color: "#1C1A17",
      fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column",
    }}>
      <NavBar />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 0 }}>
        <div style={{ padding: "72px 48px 48px 64px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6B7548", display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ width: 24, height: 1, background: "#6B7548" }}></span>
              Issue 14 · Spring
            </div>
            <h1 style={{
              fontFamily: "'Instrument Serif', serif", fontSize: 124, lineHeight: 0.95,
              margin: "32px 0 0", fontWeight: 400, letterSpacing: "-0.01em",
            }}>
              Cook<br/>
              <span style={{ fontStyle: "italic", color: "#C8472D" }}>like</span> you<br/>
              mean it.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.5, maxWidth: 420, marginTop: 32, color: "rgba(28,26,23,0.75)" }}>
              Recipes I actually cook on weeknights — tested until they're not fussy, written so you don't need to re-read a step three times.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 36 }}>
            <button style={{
              background: "#1C1A17", color: "#F5EFE6", border: 0, padding: "16px 28px",
              borderRadius: 0, fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 600, letterSpacing: "0.02em",
            }}>Browse 142 recipes →</button>
            <a style={{ fontSize: 14, textDecoration: "underline", textUnderlineOffset: 4 }}>What I'm cooking this week</a>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <FoodPlaceholder w="100%" h="100%" label="overhead — braised short ribs, herbs, citrus zest" />
          <div style={{
            position: "absolute", left: -48, bottom: 56, background: "#F5EFE6",
            padding: "20px 24px", maxWidth: 280, borderTop: "2px solid #C8472D",
          }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6B7548" }}>This week's pick</div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, lineHeight: 1.05, marginTop: 8 }}>Short rib ragù, no shortcuts</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(28,26,23,0.6)", marginTop: 10 }}>3h 20m · serves 6</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroFullBleed = () => {
  return (
    <div style={{
      width: 1280, height: 820, background: "#1C1A17", color: "#F5EFE6",
      fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden",
    }}>
      <FoodPlaceholder w="100%" h="100%" label="full-bleed: chef's hands plating, warm window light"
        style={{ position: "absolute", inset: 0, filter: "brightness(0.55)" }} />
      <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column" }}>
        <NavBar dark />
        <div style={{ flex: 1, padding: "0 64px", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 72 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 64, alignItems: "end" }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#F5B7A3" }}>Hi, I'm Idris.</div>
              <h1 style={{
                fontFamily: "'Instrument Serif', serif", fontSize: 104, lineHeight: 1, margin: "20px 0 0",
                fontWeight: 400, letterSpacing: "-0.01em",
              }}>
                A small archive of <span style={{ fontStyle: "italic", color: "#F5B7A3" }}>good</span> things to cook.
              </h1>
            </div>
            <div style={{ paddingBottom: 12 }}>
              <p style={{ fontSize: 16, lineHeight: 1.55, color: "rgba(245,239,230,0.85)", margin: 0 }}>
                No life stories before the recipe. No 47-ingredient lists. Just dishes that have earned a spot in my own rotation.
              </p>
              <div style={{ marginTop: 28, display: "flex", gap: 24, alignItems: "center" }}>
                <button style={{
                  background: "#F5EFE6", color: "#1C1A17", border: 0, padding: "16px 28px",
                  borderRadius: 0, fontSize: 14, fontWeight: 600,
                }}>Start with the basics →</button>
                <span style={{ fontSize: 13, color: "rgba(245,239,230,0.7)" }}>or follow on Substack</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
