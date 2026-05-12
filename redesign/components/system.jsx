/* Proposed brand system */
const Swatch = ({ hex, name, role, dark }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{
      width: 168, height: 168, background: hex, borderRadius: 12,
      border: "1px solid rgba(0,0,0,0.06)",
    }} />
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: dark ? "#F5EFE6" : "#1C1A17" }}>{hex.toUpperCase()}</div>
    <div style={{ fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 600, color: dark ? "#F5EFE6" : "#1C1A17" }}>{name}</div>
    <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: dark ? "rgba(245,239,230,0.6)" : "rgba(28,26,23,0.55)" }}>{role}</div>
  </div>
);

const SystemBoard = () => {
  return (
    <div style={{
      width: 1280, height: 920, background: "#F5EFE6", color: "#1C1A17",
      padding: 56, fontFamily: "'DM Sans', sans-serif", position: "relative",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6B7548" }}>02 — Proposed system</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 64, margin: "12px 0 0", fontWeight: 400, lineHeight: 1 }}>A warmer, quieter brand</h2>
        </div>
        <div style={{ maxWidth: 380, fontSize: 14, color: "rgba(28,26,23,0.7)", lineHeight: 1.5 }}>
          Lean into the editorial cookbook genre — cream paper, ink type, one savoury accent — instead of moody-restaurant-website tropes.
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, marginTop: 56 }}>
        <Swatch hex="#F5EFE6" name="Cream" role="Page surface" />
        <Swatch hex="#1C1A17" name="Ink" role="Type, lines" />
        <Swatch hex="#C8472D" name="Tomato" role="One accent — used sparingly" />
        <Swatch hex="#6B7548" name="Olive" role="Secondary, tags" />
        <Swatch hex="#E8DFD0" name="Parchment" role="Card surface" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, marginTop: 64 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(28,26,23,0.5)", marginBottom: 16 }}>Display — Instrument Serif</div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 96, lineHeight: 0.95, fontWeight: 400 }}>
            Tagine,<br/>
            <span style={{ fontStyle: "italic" }}>slow-cooked</span>
          </div>
          <div style={{ marginTop: 24, fontSize: 13, color: "rgba(28,26,23,0.6)" }}>
            Editorial, slightly retro, food-magazine confidence. Italics carry charm without becoming twee.
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(28,26,23,0.5)", marginBottom: 16 }}>Body — DM Sans</div>
          <div style={{ fontSize: 22, lineHeight: 1.45, fontWeight: 500 }}>Sear the lamb in batches — crowding the pan steams instead of browns.</div>
          <div style={{ marginTop: 18, fontSize: 14, lineHeight: 1.6, color: "rgba(28,26,23,0.75)" }}>
            DM Sans handles long instructions cleanly at small sizes; pairs well with Instrument Serif without competing.
          </div>
          <div style={{ marginTop: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#6B7548", letterSpacing: "0.04em" }}>
            45 min · serves 4 · medium heat
          </div>
        </div>
      </div>
    </div>
  );
};
