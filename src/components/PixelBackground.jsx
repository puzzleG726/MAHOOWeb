import "./PixelBackground.css";

const COLORS = ["#935883", "#639c6e", "#42429e", "#a7be54"];
const FINAL_COLOR = "#aeaeae";
const ROW_COUNT = 10;
const BLOCK_WIDTH = 42;

function shuffleIndexes(length) {
  const indexes = Array.from({ length }, (_, index) => index);

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }

  return indexes;
}

export default function PixelBackground({ active, dimensions }) {
  if (!dimensions || dimensions.width === 0 || dimensions.height === 0) {
    return null;
  }

  const blockCount = Math.ceil(dimensions.width / BLOCK_WIDTH) + 1;

  return (
    <div className={`pixelBackground ${active ? "is-active" : ""}`}>
      {Array.from({ length: ROW_COUNT }, (_, rowIndex) => {
        const indexes = shuffleIndexes(blockCount);

        return (
          <div className="pixelBackgroundRow" key={rowIndex}>
            {indexes.map((randomIndex, index) => {
              const spawnColor = COLORS[(index + rowIndex) % COLORS.length];
              const enterDelay = 0.012 * ((ROW_COUNT - rowIndex) * 8 + randomIndex);
              const exitDelay = 0.012 * (rowIndex * 8 + randomIndex);

              return (
                <div
                  className="pixelBackgroundBlock"
                  key={`${rowIndex}-${index}`}
                  style={{
                    "--spawn-color": spawnColor,
                    "--final-color": FINAL_COLOR,
                    "--enter-delay": `${enterDelay}s`,
                    "--exit-delay": `${exitDelay}s`,
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
