/* ===== STARFIELD ===== */
var canvas = document.getElementById("stars");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var stars = [];
for (var i = 0; i < 300; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2,
    s: Math.random() * 0.5 + 0.2,
  });
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < stars.length; i++) {
    var star = stars[i];
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    star.y += star.s;
    if (star.y > canvas.height) star.y = 0;
  }
  requestAnimationFrame(drawStars);
}
drawStars();

/* ===== IMPACT LOGIC ===== */
var mars = document.getElementById("mars");
var meteor = document.getElementById("meteor");
var fragmentsContainer = document.getElementById("fragments");
var shockwave = document.getElementById("shockwave");
var retry = document.getElementById("retry");
var scanOverlay = document.getElementById("scanOverlay");

function createFragments(x, y, count, type) {
  if (!type) type = "meteor";
  for (var i = 0; i < count; i++) {
    var frag = document.createElement("div");
    frag.classList.add(type === "meteor" ? "fragment" : "planet-frag");
    frag.style.left = x + "px";
    frag.style.top = y + "px";
    fragmentsContainer.appendChild(frag);
    var angle = Math.random() * Math.PI * 2;
    var distX = Math.random() * window.innerWidth;
    var distY = Math.random() * window.innerHeight;
    frag.animate(
      [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        {
          transform:
            "translate(" +
            Math.cos(angle) * distX +
            "px," +
            Math.sin(angle) * distY +
            "px) rotate(" +
            (Math.random() * 720 - 360) +
            "deg)",
          opacity: 1,
        },
      ],
      { duration: 2000, easing: "ease-out", fill: "forwards" }
    );
  }
}

function triggerImpact() {
  meteor.style.transition = "none";
  meteor.style.transform = "rotate(45deg)";
  meteor.offsetHeight;

  var marsRect = mars.getBoundingClientRect();
  var meteorRect = meteor.getBoundingClientRect();

  var deltaX =
    marsRect.left +
    marsRect.width / 2 -
    (meteorRect.left + meteorRect.width / 2);
  var deltaY =
    marsRect.top +
    marsRect.height / 2 -
    (meteorRect.top + meteorRect.height / 2);

  meteor.style.transition = "transform 1.2s ease-in";
  meteor.style.transform =
    "translate(" + deltaX + "px," + deltaY + "px) rotate(45deg)";

  setTimeout(function () {
    meteor.style.display = "none";
    mars.classList.add("explode");
    shockwave.style.opacity = 0.4;
    createFragments(
      marsRect.left + marsRect.width / 2,
      marsRect.top + marsRect.height / 2,
      20,
      "planet"
    );
    createFragments(
      marsRect.left + marsRect.width / 2,
      marsRect.top + marsRect.height / 2,
      25,
      "meteor"
    );

    // Astronaut reacts with small shake
    var astronaut = document.getElementById("astronaut");
    astronaut.animate(
      [
        { transform: "translate(0,0)" },
        { transform: "translate(0,-20px)" },
        { transform: "translate(0,0)" },
      ],
      { duration: 500, easing: "ease-out" }
    );
  }, 1200);
}

retry.onclick = function () {
  // Scan effect
  scanOverlay.style.opacity = 1;
  scanOverlay.animate([{ top: "0%" }, { top: "100%" }], {
    duration: 800,
    easing: "linear",
  });

  setTimeout(function () {
    scanOverlay.style.opacity = 0;
    meteor.style.display = "block";
    meteor.style.transition = "none";
    meteor.style.transform = "rotate(45deg)";
    mars.classList.remove("explode");
    fragmentsContainer.innerHTML = "";
    shockwave.style.opacity = 0;
    meteor.offsetHeight;
    setTimeout(triggerImpact, 200);
  }, 800);
};

/* ===== ASTRONAUT DRAG & INTERACTIVITY ===== */
var astronaut = document.getElementById("astronaut");
var isDragging = false;
var offsetX = 0;
var offsetY = 0;

astronaut.addEventListener("mousedown", function (e) {
  isDragging = true;
  offsetX = e.clientX - astronaut.offsetLeft;
  offsetY = e.clientY - astronaut.offsetTop;
  astronaut.style.transform = "scale(1.2)";
  e.preventDefault();
});
document.addEventListener("mouseup", function () {
  if (isDragging) astronaut.style.transform = "scale(1)";
  isDragging = false;
});
document.addEventListener("mousemove", function (e) {
  if (!isDragging) return;
  var ax = e.clientX - offsetX;
  var ay = e.clientY - offsetY;
  astronaut.style.left = ax + "px";
  astronaut.style.top = ay + "px";
  var dx = e.movementX || 0;
  astronaut.style.transform = "scale(1) rotate(" + dx * 0.2 + "deg)";
});
astronaut.addEventListener("dblclick", function () {
  var initialTop = astronaut.offsetTop;
  var jumpHeight = 80;
  var duration = 300;
  var start = null;
  function animateJump(timestamp) {
    if (!start) start = timestamp;
    var progress = timestamp - start;
    var newTop =
      initialTop -
      jumpHeight * Math.sin(Math.min(progress / duration, 1) * Math.PI);
    astronaut.style.top = newTop + "px";
    if (progress < duration) {
      requestAnimationFrame(animateJump);
    } else {
      astronaut.style.top = initialTop + "px";
      astronaut.style.transform = "scale(1) rotate(0deg)";
    }
  }
  requestAnimationFrame(animateJump);
});

/* ===== INITIAL IMPACT ===== */
window.onload = function () {
  setTimeout(triggerImpact, 1200);
};
