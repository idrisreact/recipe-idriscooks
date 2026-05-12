/* Annotated recreation of the current idriscooks.com homepage */
const AnnotationPin = ({ n, x, y, side = "right", label, detail }) => {
  return (
    <div style={{
      position: "absolute", left: x, top: y, display: "flex",
      flexDirection: side === "right" ? "row" : "row-reverse",
      alignItems: "flex-start", gap: 12, zIndex: 5,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: "#C8472D", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13,
        flexShrink: 0, boxShadow: "0 0 0 4px rgba(200,71,45,0.18)",
      }}>{n}</div>
      <div style={{
        background: "#1C1A17", color: "#F5EFE6",
        padding: "10px 14px", borderRadius: 8, maxWidth: 240,
        fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.45,
      }}>
        <div style={{ fontWeight: 600, marginBottom: 2, color: "#F5B7A3" }}>{label}</div>
        <div style={{ opacity: 0.85 }}>{detail}</div>
      </div>
    </div>
  );
};

const CurrentSiteRecreation = () => {
  return (
    <div style={{
      width: 1280, height: 1700, position: "relative",
      background: "#0e0e0e", color: "#fff", overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Top nav */}
      <div style={{
        position: "absolute", inset: "0 0 auto 0", height: 72,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)", zIndex: 3,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: "#C8472D",
            display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14,
          }}>IC</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Idris Cooks</div>
            <div style={{ fontSize: 10, opacity: 0.6 }}>Culinary Excellence</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 13 }}>
          <span>Recipes</span>
          <span>About</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        position: "absolute", inset: "72px 0 auto 0", height: 720,
        background: "linear-gradient(135deg, #2a1810 0%, #1a0d08 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 48px",
      }}>
        <div style={{
          fontFamily: "'DM Sans'", fontSize: 11, letterSpacing: "0.3em",
          textTransform: "uppercase", color: "#C8472D", marginBottom: 32,
        }}>The Art of Culinary Excellence</div>
        <h1 style={{
          fontFamily: "Georgia, serif", fontSize: 88, lineHeight: 1.05,
          margin: 0, fontWeight: 400, maxWidth: 900,
        }}>Where Every Dish Tells A Story</h1>
        <p style={{ fontSize: 17, opacity: 0.7, marginTop: 28, maxWidth: 600 }}>
          Discover recipes that transform ordinary ingredients into extraordinary experiences.
        </p>
        <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
          <button style={{
            background: "#C8472D", color: "#fff", border: 0, padding: "14px 28px",
            borderRadius: 999, fontSize: 14, fontWeight: 600,
          }}>Explore Recipes →</button>
          <button style={{
            background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.3)",
            padding: "14px 28px", borderRadius: 999, fontSize: 14, fontWeight: 500,
          }}>Our Story</button>
        </div>
      </div>

      {/* Quote band */}
      <div style={{
        position: "absolute", inset: "792px 0 auto 0", height: 280,
        background: "#1a0d08", display: "grid", placeItems: "center",
        padding: "0 96px", textAlign: "center",
      }}>
        <div>
          <div style={{ fontSize: 64, color: "#C8472D", lineHeight: 0.3, marginBottom: 24 }}>"</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontStyle: "italic", lineHeight: 1.4, opacity: 0.9 }}>
            Every recipe tells a story. Every dish is an opportunity to innovate, to surprise, and to bring people together around what matters most.
          </div>
          <div style={{ marginTop: 20, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.5 }}>
            Idris Cooks Philosophy
          </div>
        </div>
      </div>

      {/* Curated for you */}
      <div style={{ position: "absolute", inset: "1072px 0 auto 0", padding: "60px 48px" }}>
        <div style={{ fontSize: 11, color: "#C8472D", letterSpacing: "0.3em", textTransform: "uppercase" }}>Featured</div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 48, margin: "8px 0 0", fontWeight: 400 }}>Curated for You</h2>
        <p style={{ opacity: 0.6, marginTop: 12, maxWidth: 540 }}>
          Handpicked recipes from our collection, designed to inspire your next culinary adventure.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16, marginTop: 36 }}>
          <div style={{
            height: 360, borderRadius: 16, padding: 28,
            background: "linear-gradient(135deg, #3a1a10, #1a0d08)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div style={{ fontSize: 11, color: "#C8472D", letterSpacing: "0.2em", textTransform: "uppercase" }}>Featured Recipe</div>
            <div>
              <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 6 }}>Latest Creation</div>
              <div style={{ fontFamily: "Georgia", fontSize: 32, fontWeight: 400 }}>Seasonal Specials</div>
              <div style={{ fontSize: 13, opacity: 0.5, marginTop: 8 }}>
                Discover recipes that celebrate the best ingredients of the season.
              </div>
            </div>
          </div>
          {[
            { tag: "Quick Recipes", title: "Quick & Easy", sub: "30-Minute Meals" },
            { tag: "Techniques", title: "Master Class", sub: "Essential Techniques" },
          ].map((c, i) => (
            <div key={i} style={{
              height: 360, borderRadius: 16, padding: 24,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}>
              <div style={{ fontSize: 11, color: "#C8472D", letterSpacing: "0.2em", textTransform: "uppercase" }}>{c.tag}</div>
              <div>
                <div style={{ fontFamily: "Georgia", fontSize: 22, fontWeight: 400 }}>{c.title}</div>
                <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Annotation pins ---- */}
      <AnnotationPin n={1} x={48} y={48}
        label="Tagline = filler"
        detail={"\"Culinary Excellence\" reads like a stock-template subtitle. Replace with a real positioning statement."} />
      <AnnotationPin n={2} x={870} y={300} side="left"
        label="Cliché headline"
        detail={"\"Where every dish tells a story\" is one of the most-used food taglines on the web. Trade for something specific to Idris."} />
      <AnnotationPin n={3} x={48} y={520}
        label="Two CTAs of equal weight"
        detail={"User can't tell what the primary action is. Pick one hero CTA and demote the other to a text link."} />
      <AnnotationPin n={4} x={48} y={690}
        label="No food in a food hero"
        detail={"This is a recipes site. Hero needs an actual photograph — a generic dark gradient communicates nothing."} />
      <AnnotationPin n={5} x={870} y={920} side="left"
        label="Self-quote = vibes only"
        detail={"Quoting yourself in your own header has no credibility. Replace with press/reader quotes, or remove."} />
      <AnnotationPin n={6} x={48} y={1180}
        label="Cards with no recipes"
        detail={"\"Curated for you\" should show actual recipes with images. These are link tiles to other category pages."} />
      <AnnotationPin n={7} x={870} y={1380} side="left"
        label="Same accent on every label"
        detail={"Every kicker/tag is the same red. Lose the rhythm — labels become wallpaper."} />
    </div>
  );
};
