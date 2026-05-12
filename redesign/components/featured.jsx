/* Redesigned "Curated" section — actual recipes, not category links */

const RecipeCard = ({ tag, title, time, note, big, accent }) => (
  <div style={{
    background: "#F5EFE6", display: "flex", flexDirection: "column",
    borderTop: "1px solid #1C1A17", paddingTop: 14,
  }}>
    <div style={{
      display: "flex", justifyContent: "space-between",
      fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.18em",
      textTransform: "uppercase", color: accent || "#6B7548",
    }}>
      <span>{tag}</span>
      <span style={{ color: "rgba(28,26,23,0.5)" }}>{time}</span>
    </div>
    <FoodPlaceholderBlock label={`photo — ${title.toLowerCase()}`} h={big ? 380 : 240} />
    <div style={{
      fontFamily: "'Instrument Serif', serif", fontSize: big ? 40 : 26,
      lineHeight: 1.1, marginTop: 16, color: "#1C1A17",
    }}>{title}</div>
    {note && <div style={{ fontSize: 13, color: "rgba(28,26,23,0.65)", marginTop: 8, lineHeight: 1.5 }}>{note}</div>}
  </div>
);

const FoodPlaceholderBlock = ({ label, h }) => (
  <div style={{
    width: "100%", height: h, marginTop: 14,
    background: `repeating-linear-gradient(135deg, #d6c9b3 0px, #d6c9b3 8px, #cfc0a6 8px, #cfc0a6 16px)`,
    display: "grid", placeItems: "center", color: "#5a4d36",
    fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
  }}>
    {label}
  </div>
);

const FeaturedBoard = () => {
  return (
    <div style={{
      width: 1280, height: 1000, background: "#F5EFE6", color: "#1C1A17",
      padding: "72px 64px", fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid #1C1A17", paddingBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6B7548" }}>What I'm cooking · May</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 72, margin: "10px 0 0", fontWeight: 400, lineHeight: 1 }}>
            This month's <span style={{ fontStyle: "italic" }}>rotation</span>
          </h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["All", "30 min", "Slow", "One pan", "Vegetarian"].map((c, i) => (
            <span key={i} style={{
              fontSize: 12, padding: "6px 12px",
              border: "1px solid #1C1A17", borderRadius: 999,
              background: i === 0 ? "#1C1A17" : "transparent",
              color: i === 0 ? "#F5EFE6" : "#1C1A17",
            }}>{c}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 36, marginTop: 40 }}>
        <RecipeCard
          big tag="Featured" time="3h 20m"
          title="Short rib ragù, no shortcuts"
          note="Wine, soffritto, time. The version I make when people are coming over and I want it to feel easy."
          accent="#C8472D"
        />
        <RecipeCard
          tag="30 minutes" time="28m"
          title="Crispy gnocchi, brown butter, peas"
          note="Skillet, not a pot. The crunch is the whole point."
        />
        <RecipeCard
          tag="One pan" time="45m"
          title="Harissa chicken thighs"
          note="A weeknight reset button."
        />
      </div>
    </div>
  );
};
