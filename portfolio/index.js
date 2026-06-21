// Grab the canvas and set up the drawing tool.
const canvas = document.querySelector(".code-rain");
const ctx = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Small code-looking characters for the rain.
const codeCharacters = ["0", "1", "{", "}", "<", ">", "/", "=", ";", "(", ")", "const", "let"];
const fontSize = 18;
const frameDelay = 55;
const mouseRadius = 120;

// These values change while the animation runs.
let columns = 0;
let drops = [];
let burstSymbols = [];
let animationId;
let lastDrawTime = 0;

// The mouse starts as null until the user moves it.
let mouse = {
  x: null,
  y: null,
};

// Keep the canvas sharp and full screen.
function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio, 2);

  canvas.width = window.innerWidth * pixelRatio;
  canvas.height = window.innerHeight * pixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  columns = Math.floor(window.innerWidth / fontSize);
  drops = Array.from({ length: columns }, () => Math.random() * window.innerHeight);
}

// Pick one random symbol from the list.
function getRandomCharacter() {
  const randomIndex = Math.floor(Math.random() * codeCharacters.length);

  return codeCharacters[randomIndex];
}

// Measure how far two points are from each other.
function getDistance(x1, y1, x2, y2) {
  const distanceX = x1 - x2;
  const distanceY = y1 - y2;

  return Math.sqrt(distanceX * distanceX + distanceY * distanceY);
}

// Make a small burst of symbols when the user clicks.
function createClickBurst(x, y) {
  const newSymbols = Array.from({ length: 18 }, () => ({
    x,
    y,
    text: getRandomCharacter(),
    opacity: 1,
    size: Math.random() * 8 + 14,
    velocityX: (Math.random() - 0.5) * 5,
    velocityY: (Math.random() - 0.5) * 5,
  }));

  burstSymbols = [...burstSymbols, ...newSymbols];
}

// Draw click symbols, move them, and fade them out.
function drawBurstSymbols() {
  burstSymbols = burstSymbols.filter((symbol) => symbol.opacity > 0);

  burstSymbols.forEach((symbol) => {
    ctx.fillStyle = `rgba(248, 250, 252, ${symbol.opacity})`;
    ctx.font = `${symbol.size}px monospace`;
    ctx.fillText(symbol.text, symbol.x, symbol.y);

    symbol.x += symbol.velocityX;
    symbol.y += symbol.velocityY;
    symbol.opacity -= 0.03;
  });
}

// Main animation loop for the code rain.
function drawCodeRain(timestamp = 0) {
  if (timestamp - lastDrawTime < frameDelay) {
    animationId = requestAnimationFrame(drawCodeRain);
    return;
  }

  lastDrawTime = timestamp;

  ctx.fillStyle = "rgba(67, 31, 80, 0.16)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  drops.forEach((dropY, index) => {
    const text = getRandomCharacter();
    const x = index * fontSize;
    const mouseIsNearby =
      mouse.x !== null && getDistance(mouse.x, mouse.y, x, dropY) < mouseRadius;

    ctx.fillStyle = mouseIsNearby
      ? "rgba(255, 255, 255, 0.95)"
      : "rgba(248, 250, 252, 0.45)";

    ctx.font = mouseIsNearby
      ? `${fontSize + 4}px monospace`
      : `${fontSize}px monospace`;

    ctx.fillText(text, x, dropY);

    if (dropY > window.innerHeight && Math.random() > 0.975) {
      drops[index] = 0;
    } else {
      drops[index] = dropY + fontSize;
    }
  });

  drawBurstSymbols();

  animationId = requestAnimationFrame(drawCodeRain);
}

// Start the effect unless the user prefers less motion.
function startCodeRain() {
  if (prefersReducedMotion.matches) {
    return;
  }

  cancelAnimationFrame(animationId);
  lastDrawTime = 0;
  resizeCanvas();
  drawCodeRain();
}

// Stop the effect and clear the canvas.
function stopCodeRain() {
  cancelAnimationFrame(animationId);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

// Keep the animation fitting the screen.
window.addEventListener("resize", resizeCanvas);

// Save the latest mouse position for the glow effect.
window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

// Remove the hover effect when the mouse leaves the page.
window.addEventListener("mouseleave", () => {
  mouse.x = null;
  mouse.y = null;
});

// Add an interactive burst wherever the user clicks.
window.addEventListener("click", (event) => {
  createClickBurst(event.clientX, event.clientY);
});

// React if the user changes their motion preference.
prefersReducedMotion.addEventListener("change", () => {
  if (prefersReducedMotion.matches) {
    stopCodeRain();
  } else {
    startCodeRain();
  }
});

// Run the animation.
startCodeRain();
