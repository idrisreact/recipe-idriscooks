/* Replace "Why us" platitudes with real values + content strategy notes */

const SwapRow = ({ before, after, why }) => (
  <div style={{
    display: "grid", gridTemplateColumns: "1fr 24px 1fr 1.1fr", gap: 24,
    padding: "20px 0", borderBottom: "1px solid rgba(28,26,23,0.12)",
    alignItems: "flex-start",
  }}>
    <div style={{
      fontFamily: "'Instrument Serif', serif", fontSize: 22, lineHeight: 1.25,
      color: "rgba(28,26,23,0.45)", textDecoration: "line-through", textDecorationColor: "rgba(200,71,45,0.5)",
    }}>{before}</div>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#C8472D", textAlign: "center", paddingTop: 6 }}>→</div>
    <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, lineHeight: 1.25, color: "#1C1A17" }}>{after}</div>
    <div style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(28,26,23,0.65)", paddingTop: 4 }}>{why}</div>
  </div>
);

const VoiceBoard = () => {
  return (
    <div style={{
      width: 1280, height: 1000, background: "#E8DFD0", color: "#1C1A17",
      padding: "72px 64px", fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6B7548" }}>05 — Voice & content</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 64, margin: "10px 0 0", fontWeight: 400, lineHeight: 1 }}>
            The biggest fix isn't visual.
          </h2>
        </div>
        <div style={{ maxWidth: 380, fontSize: 14, color: "rgba(28,26,23,0.7)", lineHeight: 1.5 }}>
          The current copy reads like every food-startup landing page. A real voice — opinionated, specific, slightly self-deprecating — does more for trust than any redesign.
        </div>
      </div>

      <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 24px 1fr 1.1fr", gap: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(28,26,23,0.5)", paddingBottom: 12, borderBottom: "2px solid #1C1A17" }}>
        <div>Before</div>
        <div></div>
        <div>After</div>
        <div>Why</div>
      </div>

      <SwapRow
        before="Where Every Dish Tells A Story"
        after="A small archive of good things to cook."
        why="Specific scope (small archive), warm but humble. Reads like a person, not a brand deck."
      />
      <SwapRow
        before="The Art of Culinary Excellence"
        after="Tested until they aren't fussy."
        why="A promise about the work, not a vibe. Tells the reader what they get."
      />
      <SwapRow
        before="Expert Chefs · Fresh Ingredients · Quick Recipes · Global Community"
        after="Three pillars: weeknight, weekend, project."
        why="Site-specific structure beats generic feature list. Doubles as the navigation."
      />
      <SwapRow
        before="Discover recipes that transform ordinary ingredients into extraordinary experiences."
        after="No life stories before the recipe. No 47-ingredient lists."
        why="States what's distinctive by what's absent. Earns reader trust in one line."
      />
      <SwapRow
        before='"Every recipe tells a story…" — Idris Cooks Philosophy'
        after="Drop the self-quote. Use a reader email or a press line — or nothing."
        why="Quoting your own brand reduces credibility. Better to have less than to have filler."
      />
    </div>
  );
};
