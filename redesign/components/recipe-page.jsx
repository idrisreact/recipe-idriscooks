/* The page that actually matters: an individual recipe page */
const RecipePageBoard = () => {
  return (
    <div style={{
      width: 1280, height: 1480, background: "#F5EFE6", color: "#1C1A17",
      fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden",
    }}>
      <NavBar />
      <div style={{ padding: "48px 64px 0" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6B7548" }}>
          Recipes / Slow / Italian
        </div>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif", fontSize: 88, lineHeight: 1, fontWeight: 400,
          margin: "16px 0 0", maxWidth: 900, letterSpacing: "-0.01em",
        }}>
          Short rib ragù, <span style={{ fontStyle: "italic" }}>no shortcuts</span>
        </h1>
        <div style={{ display: "flex", gap: 32, marginTop: 28, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "rgba(28,26,23,0.7)", letterSpacing: "0.04em" }}>
          <span>3h 20m total · 30m active</span>
          <span>Serves 6</span>
          <span>Last cooked May 1</span>
          <span style={{ color: "#C8472D" }}>★ 4.8 (212 cooks)</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, marginTop: 40 }}>
          <FoodPlaceholderBlock label="hero photo — finished bowl, fresh herbs, warm tone" h={520} />
          <div style={{
            background: "#1C1A17", color: "#F5EFE6", padding: 32,
            display: "flex", flexDirection: "column", gap: 20,
          }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#F5B7A3" }}>The promise</div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, lineHeight: 1.2 }}>
              "Sunday-dinner ragù with a 30-minute hands-on time. The oven does the rest."
            </div>
            <div style={{ height: 1, background: "rgba(245,239,230,0.15)" }} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#F5B7A3" }}>Skip to</div>
            {[
              "Why this works",
              "Ingredients",
              "Method",
              "Make-ahead notes",
              "Comments (84)",
            ].map((s, i) => (
              <div key={i} style={{ fontSize: 14, display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(245,239,230,0.2)", paddingBottom: 6 }}>
                <span>{s}</span>
                <span style={{ opacity: 0.5 }}>↓</span>
              </div>
            ))}
            <button style={{
              marginTop: 8, background: "#C8472D", color: "#F5EFE6", border: 0,
              padding: "16px 0", fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 600,
            }}>Start cook mode →</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64, marginTop: 56 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6B7548" }}>Ingredients</div>
            <div style={{ borderTop: "1px solid #1C1A17", marginTop: 12 }}>
              {[
                ["3 lb", "bone-in short ribs"],
                ["1", "yellow onion, diced"],
                ["2", "carrots, small dice"],
                ["6 cloves", "garlic, smashed"],
                ["1 cup", "dry red wine"],
                ["28 oz", "whole peeled tomatoes"],
                ["2 sprigs", "rosemary"],
                ["—", "salt, pepper, olive oil"],
              ].map(([q, i], idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "100px 1fr", padding: "12px 0", borderBottom: "1px solid rgba(28,26,23,0.1)", fontSize: 14 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#C8472D" }}>{q}</span>
                  <span>{i}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6B7548" }}>Method · 6 steps</div>
            <div style={{ borderTop: "1px solid #1C1A17", marginTop: 12 }}>
              {[
                ["01", "Sear, in batches", "Pat ribs dry. Salt aggressively. Sear in a heavy pot until deeply browned on all sides — about 3 minutes per face. Crowding the pan steams instead of browns. Set aside."],
                ["02", "Build the soffritto", "Drop heat. Onion, carrot, a pinch of salt. Cook until softened and just starting to take colour, about 8 minutes. Add garlic, 30 seconds more."],
                ["03", "Deglaze", "Wine. Scrape every brown bit off the bottom — that's the dish. Reduce by half."],
              ].map(([n, h, b]) => (
                <div key={n} style={{ display: "grid", gridTemplateColumns: "60px 1fr", padding: "20px 0", borderBottom: "1px solid rgba(28,26,23,0.1)" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#C8472D" }}>{n}</div>
                  <div>
                    <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, lineHeight: 1.2 }}>{h}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, marginTop: 8, color: "rgba(28,26,23,0.85)" }}>{b}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: "20px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "rgba(28,26,23,0.5)" }}>
                + 3 more steps
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
