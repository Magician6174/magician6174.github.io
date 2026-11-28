(() => {
  const demo = document.querySelector('[data-robot-demo]');
  const canvas = demo.querySelector('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;

  const caption = demo.querySelector('figcaption');
  const toggle = demo.querySelector('button');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const sceneWidth = 640;
  const sceneHeight = 440;
  const shoulder = { x: 157, y: 307 };
  const upperLength = 195;
  const lowerLength = 181;
  const sourcePad = 332;
  const targetPad = 513;
  const aboveTable = 233;
  const graspHeight = 313;
  const transferRise = 63;
  const blockHeight = 337;

  // Each half-cycle moves the same block from one pad to the other.
  const keyframes = [
    { time: 0, travel: 0, y: aboveTable, grip: 21 },
    { time: 900, travel: 0, y: graspHeight, grip: 21 },
    { time: 1250, travel: 0, y: graspHeight, grip: 14 },
    { time: 2150, travel: 0, y: aboveTable, grip: 14 },
    { time: 3700, travel: 1, y: aboveTable, grip: 14 },
    { time: 4600, travel: 1, y: graspHeight, grip: 14 },
    { time: 4950, travel: 1, y: graspHeight, grip: 21 },
    { time: 5850, travel: 1, y: aboveTable, grip: 21 },
  ];
  const duration = keyframes.at(-1).time;
  let elapsed = 0;
  let previousTime;
  let request;
  let playing = !reduceMotion.matches;

  function polygon(points, fill, stroke) {
    context.beginPath();
    context.moveTo(...points[0]);
    for (const point of points.slice(1)) context.lineTo(...point);
    context.closePath();
    context.fillStyle = fill;
    context.fill();
    if (stroke) {
      context.strokeStyle = stroke;
      context.lineWidth = 1;
      context.stroke();
    }
  }

  function line(a, b, color, width = 1) {
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = width;
    context.stroke();
  }

  function disk(x, y, radius, fill, stroke) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fillStyle = fill;
    context.fill();
    if (stroke) {
      context.lineWidth = 1.4;
      context.strokeStyle = stroke;
      context.stroke();
    }
  }

  function roundedBox(x, y, width, height, radius, fill, stroke) {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.fillStyle = fill;
    context.fill();
    if (stroke) {
      context.lineWidth = 1;
      context.strokeStyle = stroke;
      context.stroke();
    }
  }

  function paintStation() {
    const light = context.createRadialGradient(300, 190, 0, 300, 190, 365);
    light.addColorStop(0, '#193440');
    light.addColorStop(1, '#0a121d');
    context.fillStyle = light;
    context.fillRect(0, 0, sceneWidth, sceneHeight);

    for (let x = 32; x < sceneWidth; x += 32) {
      line({ x, y: 0 }, { x, y: 327 }, '#bddbea12');
    }
    for (let y = 24; y < 327; y += 32) {
      line({ x: 0, y }, { x: sceneWidth, y }, '#bddbea12');
    }

    polygon([[35, 378], [613, 378], [568, 315], [95, 315]], '#142735', '#365769');
    polygon([[35, 378], [613, 378], [607, 393], [40, 393]], '#0e1924', '#29414f');
    for (let x = 102; x < 580; x += 46) {
      line({ x: 320 + (x - 320) * 0.79, y: 316 }, { x, y: 378 }, '#87b3c329');
    }
    for (const y of [329, 346, 365]) {
      line({ x: 95 - (y - 315) * 0.95, y }, { x: 568 + (y - 315) * 0.71, y }, '#87b3c329');
    }

    for (const x of [sourcePad, targetPad]) {
      polygon([[x - 40, 360], [x + 39, 360], [x + 28, 337], [x - 28, 337]], '#203a3c', '#629181');
      line({ x: x - 17, y: 357 }, { x: x + 17, y: 357 }, '#a5e885', 2);
    }

    roundedBox(94, 351, 126, 20, 5, '#080f17', '#3e6073');
    roundedBox(105, 342, 103, 18, 5, '#3e5869', '#7d9ba7');
    roundedBox(126, 307, 62, 43, 8, '#233746', '#748c9c');
    line({ x: 138, y: 339 }, { x: 177, y: 339 }, '#a5e885', 3);
  }

  function drawLink(a, b, width) {
    const gradient = context.createLinearGradient(a.x, a.y, b.x, b.y);
    gradient.addColorStop(0, '#93aeb9');
    gradient.addColorStop(0.42, '#ecf5f2');
    gradient.addColorStop(1, '#788e9c');
    line(a, b, '#0a1220', width + 10);
    line(a, b, '#476475', width + 3);
    line(a, b, gradient, width);
    const start = { x: a.x + (b.x - a.x) * 0.22, y: a.y + (b.y - a.y) * 0.22 };
    const end = { x: a.x + (b.x - a.x) * 0.78, y: a.y + (b.y - a.y) * 0.78 };
    line(start, end, '#153349', 8);
    line(start, end, '#a9eb83', 3);
  }

  function drawJoint(point, radius) {
    disk(point.x, point.y, radius, '#162b39', '#7295a6');
    disk(point.x, point.y, radius * 0.72, '#3b5d6e', '#98aeb7');
    disk(point.x, point.y, radius * 0.45, '#0d1e2b', '#b9f879');
    disk(point.x, point.y, radius * 0.15, '#dcf8d1');
  }

  function drawBlock(x, y) {
    const left = x - 13;
    const top = y - 12;
    polygon([[left, top], [left + 7, top - 6], [left + 32, top - 6], [left + 25, top]], '#fff2a6', '#ffdf82');
    polygon([[left + 25, top], [left + 32, top - 6], [left + 32, top + 17], [left + 25, top + 23]], '#ac672e', '#e3a257');
    roundedBox(left, top, 25, 23, 2, '#f4b85c', '#ffdc84');
    line({ x: left + 5, y: top + 5 }, { x: left + 19, y: top + 5 }, '#ffe7a2', 1.5);
  }

  function calculateElbow(wrist) {
    const dx = wrist.x - shoulder.x;
    const dy = wrist.y - shoulder.y;
    const distance = Math.hypot(dx, dy);
    const cosine = (upperLength ** 2 + distance ** 2 - lowerLength ** 2) / (2 * upperLength * distance);
    const angle = Math.atan2(dy, dx) - Math.acos(Math.max(-1, Math.min(1, cosine)));
    return {
      x: shoulder.x + upperLength * Math.cos(angle),
      y: shoulder.y + upperLength * Math.sin(angle),
    };
  }

  function drawTransfer() {
    const time = elapsed % duration;
    const reverse = Math.floor(elapsed / duration) % 2 === 1;
    const from = reverse ? targetPad : sourcePad;
    const to = reverse ? sourcePad : targetPad;
    const index = keyframes.findIndex(frame => frame.time > time);
    const start = keyframes[index - 1];
    const end = keyframes[index];
    const progress = (time - start.time) / (end.time - start.time);
    const ease = progress * progress * (3 - 2 * progress);
    const interpolate = (a, b) => a + (b - a) * ease;
    const travel = interpolate(start.travel, end.travel);
    const wrist = {
      x: from + (to - from) * travel,
      y: interpolate(start.y, end.y) - 4 * transferRise * travel * (1 - travel),
    };
    const grip = interpolate(start.grip, end.grip);
    const carrying = time >= keyframes[2].time && time < keyframes[5].time;

    paintStation();
    context.save();
    context.setLineDash([3, 7]);
    context.beginPath();
    context.moveTo(sourcePad, aboveTable);
    context.quadraticCurveTo((sourcePad + targetPad) / 2, aboveTable - 2 * transferRise, targetPad, aboveTable);
    context.lineWidth = 1.3;
    context.strokeStyle = '#a5e88567';
    context.stroke();
    context.restore();

    drawArm(wrist);
    drawBlock(carrying ? wrist.x : time < keyframes[2].time ? from : to, carrying ? wrist.y + 24 : blockHeight);
    roundedBox(wrist.x - 19, wrist.y + 7, 38, 11, 3, '#819bac', '#bbced4');
    for (const side of [-1, 1]) {
      const x = wrist.x + side * grip;
      line({ x: wrist.x + side * 11, y: wrist.y + 18 }, { x, y: wrist.y + 23 }, '#b6cbd5', 5);
      line({ x, y: wrist.y + 23 }, { x, y: wrist.y + 32 }, '#c8dbe0', 4);
    }
  }

  function drawArm(wrist) {
    const elbow = calculateElbow(wrist);
    drawLink(shoulder, elbow, 46);
    drawLink(elbow, wrist, 34);
    drawJoint(shoulder, 30);
    drawJoint(elbow, 24);
    drawJoint(wrist, 16);
  }

  // The pen and its visible ink use the same continuous figure-eight trajectory.
  function penPoint(t) {
    return { x: 410 + 87 * Math.sin(t), y: 280 + 41 * Math.sin(2 * t) };
  }

  function drawPlotter(progress) {
    paintStation();
    roundedBox(300, 218, 220, 121, 6, '#142432', '#708b99');
    const angle = progress * 2 * Math.PI;
    context.beginPath();
    for (let i = 0; i <= 160; i++) {
      const point = penPoint(angle * i / 160);
      if (i === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    }
    context.strokeStyle = '#7cf4e3';
    context.lineWidth = 3;
    context.stroke();
    const tip = penPoint(angle);
    const wrist = { x: tip.x, y: tip.y - 30 };
    drawArm(wrist);
    roundedBox(tip.x - 5, wrist.y + 9, 10, 15, 2, '#cfdee4');
    polygon([[tip.x - 5, tip.y - 7], [tip.x + 5, tip.y - 7], [tip.x, tip.y]], '#7cf4e3');
  }

  function drawRover(progress) {
    context.fillStyle = '#10222e';
    context.fillRect(0, 0, sceneWidth, sceneHeight);
    for (let x = 0; x < sceneWidth; x += 32) line({x, y: 0}, {x, y: sceneHeight}, '#25404b');
    for (let y = 0; y < sceneHeight; y += 32) line({x: 0, y}, {x: sceneWidth, y}, '#25404b');

    const obstacles = [[298, 193, 49], [496, 105, 28], [102, 310, 39], [425, 339, 24]];
    for (const [x, y, r] of obstacles) {
      disk(x, y, r, '#304b59', '#738e9a');
      disk(x, y, r - 6, '#253d4a');
    }
    context.beginPath();
    context.ellipse(320, 220, 195, 107, 0, 0, 2 * Math.PI);
    context.setLineDash([3, 9]);
    context.strokeStyle = '#84bba1';
    context.stroke();
    context.setLineDash([]);
    const t = progress * 2 * Math.PI;
    const x = 320 + 195 * Math.cos(t);
    const y = 220 + 107 * Math.sin(t);
    const heading = Math.atan2(107 * Math.cos(t), -195 * Math.sin(t));
    for (let i = 0; i < 36; i++) {
      const angle = t * 3 + i * Math.PI / 18;
      const dx = Math.cos(angle), dy = Math.sin(angle);
      let range = 118;
      for (const [cx, cy, radius] of obstacles) {
        const along = (cx - x) * dx + (cy - y) * dy;
        const across = (cx - x) * dy - (cy - y) * dx;
        if (along > 0 && Math.abs(across) < radius) {
          range = Math.min(range, along - Math.sqrt(radius ** 2 - across ** 2));
        }
      }
      const hit = { x: x + range * dx, y: y + range * dy };
      line({x, y}, hit, range < 118 ? '#68dbbd88' : '#63ccb635');
      if (range < 118) disk(hit.x, hit.y, 2.5, '#acf2bc');
    }
    context.save();
    context.translate(x, y);
    context.rotate(heading);
    for (const side of [-1, 1]) roundedBox(-17, side * 17 - 3, 32, 7, 2, '#09111a', '#8ea6b2');
    roundedBox(-21, -14, 44, 28, 7, '#b5cbd1', '#e7efef');
    disk(-3, 0, 10, '#203847', '#819ca7');
    disk(-3, 0, 4, '#b7ee8c');
    line({x: 17, y: -7}, {x: 17, y: 7}, '#214352', 3);
    context.restore();
  }

  const scenes = [
    ['Pick and place', 'A robot arm transfers a block between two pads.', duration, drawTransfer],
    ['Pen plotting', 'A robot arm draws a figure eight with a pen.', 6500, drawPlotter],
    ['LiDAR navigation', 'A mobile robot follows a loop while range sensors detect nearby obstacles.', 8500, drawRover],
  ];
  let scene = 0;
  const label = caption.querySelector('span');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = toggle.className;
  next.textContent = 'Next task';
  caption.style.flexWrap = 'wrap';
  caption.insertBefore(next, toggle);

  function selectScene(index) {
    scene = index;
    elapsed = 0;
    label.lastChild.textContent = ' ' + scenes[scene][0];
    canvas.setAttribute('aria-label', scenes[scene][1]);
    draw();
  }

  function draw() {
    scenes[scene][3](elapsed / scenes[scene][2]);
  }

  next.addEventListener('click', () => selectScene((scene + 1) % scenes.length));

  function tick(now) {
    if (previousTime !== undefined) elapsed += Math.min(now - previousTime, 50);
    if (elapsed >= scenes[scene][2]) selectScene((scene + 1) % scenes.length);
    previousTime = now;
    draw();
    request = requestAnimationFrame(tick);
  }

  function syncPlayback() {
    cancelAnimationFrame(request);
    previousTime = undefined;
    toggle.textContent = playing ? 'Pause animation' : 'Play animation';
    if (playing && !document.hidden) request = requestAnimationFrame(tick);
  }

  function resize() {
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = sceneWidth * scale;
    canvas.height = sceneHeight * scale;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    draw();
  }

  resize();
  demo.querySelector('img').hidden = true;
  canvas.hidden = false;
  caption.hidden = false;
  toggle.addEventListener('click', () => {
    playing = !playing;
    syncPlayback();
  });
  reduceMotion.addEventListener('change', event => {
    playing = !event.matches;
    syncPlayback();
  });
  document.addEventListener('visibilitychange', syncPlayback);
  addEventListener('resize', resize);
  syncPlayback();
})();
