(() => {
  // Canvas setup
  const canvas = document.querySelector(".code-rain");

  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!ctx) {
    return;
  }

  // Code rain settings
  const characters = ["0", "1", "7", "{", "}", "<", ">", "/", "=", ";", "(", ")", "const", "shan"];
  const fontSize = 15;
  const frameDelay = 45;
  const mouseRadius = 200;

  // Animation state
  let columns = 0;
  let drops = [];
  let bursts = [];
  let animationId = null;
  let lastDrawTime = 0;

  const mouse = {
    x: null,
    y: null,
  };

  // Resize the canvas so it stays sharp on different screens
  function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    columns = Math.floor(window.innerWidth / fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * window.innerHeight);
  }

  // Choose a random code character
  function getRandomCharacter() {
    const randomIndex = Math.floor(Math.random() * characters.length);

    return characters[randomIndex];
  }

  // Measure the distance between two points
  function getDistance(x1, y1, x2, y2) {
    const distanceX = x1 - x2;
    const distanceY = y1 - y2;

    return Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  }



  // Draw the symbols
  function drawBursts() {
    bursts = bursts.filter((burst) => burst.opacity > 0);

    bursts.forEach((burst) => {
      ctx.fillStyle = `rgba(248, 250, 252, ${burst.opacity})`;
      ctx.font = `${burst.size}px monospace`;
      ctx.fillText(burst.text, burst.x, burst.y);

      burst.x += burst.velocityX;
      burst.y += burst.velocityY;
      burst.opacity -= 0.03;
    });
  }

  // Draw one frame of the rain animation
  function drawRain(timestamp = 0) {
    if (timestamp - lastDrawTime < frameDelay) {
      animationId = requestAnimationFrame(drawRain);
      return;
    }

    lastDrawTime = timestamp;

    ctx.fillStyle = "rgba(67, 31, 80, 0.16)";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    drops.forEach((dropY, index) => {
      const x = index * fontSize;
      const isNearMouse =
        mouse.x !== null && getDistance(mouse.x, mouse.y, x, dropY) < mouseRadius;

      ctx.fillStyle = isNearMouse
        ? "rgba(255, 255, 255, 0.95)"
        : "rgba(248, 250, 252, 0.45)";

      ctx.font = isNearMouse
        ? `${fontSize + 4}px monospace`
        : `${fontSize}px monospace`;

      ctx.fillText(getRandomCharacter(), x, dropY);

      if (dropY > window.innerHeight && Math.random() > 0.975) {
        drops[index] = 0;
      } else {
        drops[index] = dropY + fontSize;
      }
    });

    drawBursts();
    animationId = requestAnimationFrame(drawRain);
  }

  // Stop the animation cleanly
  function stopRain() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  // Start the animation cleanly
  function startRain() {
    stopRain();
    lastDrawTime = 0;
    resizeCanvas();
    drawRain();
  }

  // Browser events
  window.addEventListener("resize", resizeCanvas);

  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener("click", (event) => {
    createBurst(event.clientX, event.clientY);
  });

  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) {
      stopRain();
    } else {
      startRain();
    }
  });

  // Start the effect
  if (!reducedMotion.matches) {
    startRain();
  }
})();
