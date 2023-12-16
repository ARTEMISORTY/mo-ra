var cursorCircle = document.getElementById('cursorCircle');
var rainContainer = document.getElementById('rain');

document.body.addEventListener('mousemove', function(e) {
    cursorCircle.style.left = e.clientX + 'px';
    cursorCircle.style.top = e.clientY + 'px';
    cursorCircle.style.display = 'block';
});

function generateRaindrops() {
    rainContainer.innerHTML = '';
    var numberOfDrops = document.getElementById('dropSlider').value;
    var speedMultiplier = document.getElementById('speedSlider').value;
    var radius = document.getElementById('radiusSlider').value;

    for (var i = 0; i < numberOfDrops; i++) {
        var drop = document.createElement('div');
        drop.className = 'drop';
        var baseSpeed = 0.5 + Math.random() * 1.5;
        var speed = baseSpeed * speedMultiplier;
        var red = document.getElementById('redSlider').value;
        var green = document.getElementById('greenSlider').value;
        var blue = document.getElementById('blueSlider').value;
        var color = `rgb(${red}, ${green}, ${blue})`;

        drop.style.backgroundColor = color;
        drop.style.width = radius * 2 + 'px';
        drop.style.height = radius * 2 + 'px';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.borderRadius = '50%';
        drop.style.animationDuration = speed + 's';
        drop.style.animationDelay = Math.random() * 2 + 's';
        
        rainContainer.appendChild(drop);
    }
}

function bounceDrop(drop) {
    var angle = Math.random() * 360;
    var distance = 100;

    drop.style.transition = 'transform 0.5s linear';
    drop.style.transform = `translate(${distance * Math.cos(angle)}px, ${distance * Math.sin(angle)}px)`;
    drop.style.opacity = 0;

    setTimeout(function() {
        scatterDrop(drop);
    }, 500);
}

function scatterDrop(drop) {
    drop.parentNode.removeChild(drop);
    for (var i = 0; i < 5; i++) {
        var smallDrop = document.createElement('div');
        smallDrop.className = 'small-drop';
        smallDrop.style.left = drop.style.left;
        smallDrop.style.top = drop.getBoundingClientRect().top + 'px';
        var scatterSize = Math.random() * 5;
        smallDrop.style.width = scatterSize + 'px';
        smallDrop.style.height = scatterSize + 'px';
        var scatterSpeed = Math.random() * 2 + 's';
        var scatterAngle = Math.random() * 360;
        smallDrop.style.animation = `scatter ${scatterSpeed} linear forwards`;
        smallDrop.style.transform = `rotate(${scatterAngle}deg)`;
        document.body.appendChild(smallDrop);
    }
}

function detectCollisions() {
    var drops = document.querySelectorAll('.drop');
    var circleRect = cursorCircle.getBoundingClientRect();

    drops.forEach(function(drop) {
        var dropRect = drop.getBoundingClientRect();
        if (circleRect.left < dropRect.right && circleRect.right > dropRect.left &&
            circleRect.top < dropRect.bottom && circleRect.bottom > dropRect.top) {
            bounceDrop(drop);
        }
    });
}

setInterval(detectCollisions, 100);

document.getElementById('dropSlider').addEventListener('input', generateRaindrops);
document.getElementById('speedSlider').addEventListener('input', generateRaindrops);
document.getElementById('radiusSlider').addEventListener('input', generateRaindrops);
document.getElementById('redSlider').addEventListener('input', generateRaindrops);
document.getElementById('greenSlider').addEventListener('input', generateRaindrops);
document.getElementById('blueSlider').addEventListener('input', generateRaindrops);

generateRaindrops();

// Canvas-based animation logic

var c = document.getElementById("c");
var ctx = c.getContext("2d");
var cH;
var cW;
var bgColor = "#FF6138";
var animations = [];

var c = document.getElementById("c");
var ctx = c.getContext("2d");
var cH;
var cW;
var bgColor = "#FF6138";
var animations = [];

var colorPicker = (function() {
  var colors = ["#FF6138", "#FFBE53", "#2980B9", "#282741"];
  var index = 0;
  function next() {
    index = index++ < colors.length-1 ? index : 0;
    return colors[index];
  }
  function current() {
    return colors[index]
  }
  return {
    next: next,
    current: current
  }
})();

function removeAnimation(animation) {
  var index = animations.indexOf(animation);
  if (index > -1) animations.splice(index, 1);
}

function calcPageFillRadius(x, y) {
  var l = Math.max(x - 0, cW - x);
  var h = Math.max(y - 0, cH - y);
  return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
}

function addClickListeners() {
  document.addEventListener("touchstart", handleEvent);
  document.addEventListener("mousedown", handleEvent);
};

function handleEvent(e) {
    if (e.touches) { 
      e.preventDefault();
      e = e.touches[0];
    }
    var currentColor = colorPicker.current();
    var nextColor = colorPicker.next();
    var targetR = calcPageFillRadius(e.pageX, e.pageY);
    var rippleSize = Math.min(200, (cW * .4));
    var minCoverDuration = 750;
    
    var pageFill = new Circle({
      x: e.pageX,
      y: e.pageY,
      r: 0,
      fill: nextColor
    });
    var fillAnimation = anime({
      targets: pageFill,
      r: targetR,
      duration:  Math.max(targetR / 2 , minCoverDuration ),
      easing: "easeOutQuart",
      complete: function(){
        bgColor = pageFill.fill;
        removeAnimation(fillAnimation);
      }
    });
    
    var ripple = new Circle({
      x: e.pageX,
      y: e.pageY,
      r: 0,
      fill: currentColor,
      stroke: {
        width: 3,
        color: currentColor
      },
      opacity: 1
    });
    var rippleAnimation = anime({
      targets: ripple,
      r: rippleSize,
      opacity: 0,
      easing: "easeOutExpo",
      duration: 900,
      complete: removeAnimation
    });
    
    var particles = [];
    for (var i=0; i<32; i++) {
      var particle = new Circle({
        x: e.pageX,
        y: e.pageY,
        fill: currentColor,
        r: anime.random(24, 48)
      })
      particles.push(particle);
    }
    var particlesAnimation = anime({
      targets: particles,
      x: function(particle){
        return particle.x + anime.random(rippleSize, -rippleSize);
      },
      y: function(particle){
        return particle.y + anime.random(rippleSize * 1.15, -rippleSize * 1.15);
      },
      r: 0,
      easing: "easeOutExpo",
      duration: anime.random(1000,1300),
      complete: removeAnimation
    });
    animations.push(fillAnimation, rippleAnimation, particlesAnimation);
}

function extend(a, b){
  for(var key in b) {
    if(b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
}

var Circle = function(opts) {
  extend(this, opts);
}

Circle.prototype.draw = function() {
  ctx.globalAlpha = this.opacity || 1;
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
  if (this.stroke) {
    ctx.strokeStyle = this.stroke.color;
    ctx.lineWidth = this.stroke.width;
    ctx.stroke();
  }
  if (this.fill) {
    ctx.fillStyle = this.fill;
    ctx.fill();
  }
  ctx.closePath();
  ctx.globalAlpha = 1;
}

var animate = anime({
  duration: Infinity,
  update: function() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cW, cH);
    animations.forEach(function(anim) {
      anim.animatables.forEach(function(animatable) {
        animatable.target.draw();
      });
    });
  }
});

var resizeCanvas = function() {
  cW = window.innerWidth;
  cH = window.innerHeight;
  c.width = cW * devicePixelRatio;
  c.height = cH * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
};

(function init() {
  resizeCanvas();
  if (window.CP) {
    window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 6000; 
  }
  window.addEventListener("resize", resizeCanvas);
  addClickListeners();
  if (!!window.location.pathname.match(/fullcpgrid/)) {
    startFauxClicking();
  }
  handleInactiveUser();
})();

function handleInactiveUser() {
  var inactive = setTimeout(function(){
    fauxClick(cW/2, cH/2);
  }, 2000);
  
  function clearInactiveTimeout() {
    clearTimeout(inactive);
    document.removeEventListener("mousedown", clearInactiveTimeout);
    document.removeEventListener("touchstart", clearInactiveTimeout);
  }
  
  document.addEventListener("mousedown", clearInactiveTimeout);
  document.addEventListener("touchstart", clearInactiveTimeout);
}

function startFauxClicking() {
  setTimeout(function(){
    fauxClick(anime.random( cW * .2, cW * .8), anime.random(cH * .2, cH * .8));
    startFauxClicking();
  }, anime.random(200, 900));
}

function fauxClick(x, y) {
  var fauxClick = new Event("mousedown");
  fauxClick.pageX = x;
  fauxClick.pageY = y;
  document.dispatchEvent(fauxClick);
}