const words = ["Concept", "Journey", "Interaction", "Conclusion"];

export default function ExperienceMarquee() {
  return (
    <section
      className="section experienceSection introMarqueeSection"
      aria-hidden="true"
    >
      <div className="experiencePanel">
        <div className="experienceMarquee">
          {[...words, ...words].map((word, index) => (
            <span key={`${word}-${index}`}>
              {word}
              <em>{word === "Conclusion" ? "☞" : "➬"}</em>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
