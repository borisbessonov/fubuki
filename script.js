// Инициализация Matter.js
const Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body;

// Создаем движок с временной гравитацией
const engine = Engine.create({
  gravity: { x: 0, y: 1 } // Включаем гравитацию для начального падения
});
const world = engine.world;

// Создаем рендерер для физических объектов
const physicsCanvas = document.getElementById('physicsCanvas');
const render = Render.create({
  canvas: physicsCanvas,
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    background: 'transparent',
    showSleeping: false
  }
});
Render.run(render);

// Функция создания физических объектов
function createPhysicsObjects() {
  World.clear(world, true);
  
  const boundaryOptions = {
    isStatic: true,
    render: { visible: false },
    collisionFilter: { group: -1 }
  };
  
  const thickness = 50;
  const boundaries = [
    Bodies.rectangle(window.innerWidth/2, window.innerHeight + thickness/2, 
                   window.innerWidth + thickness*2, thickness, boundaryOptions),
    Bodies.rectangle(window.innerWidth/2, -thickness/2, 
                   window.innerWidth + thickness*2, thickness, boundaryOptions),
    Bodies.rectangle(-thickness/2, window.innerHeight/2, 
                   thickness, window.innerHeight + thickness*2, boundaryOptions),
    Bodies.rectangle(window.innerWidth + thickness/2, window.innerHeight/2, 
                   thickness, window.innerHeight + thickness*2, boundaryOptions)
  ];
  
  const colors = ['#000000'];
  const objects = [];
  
  // Создаем объекты сразу внизу экрана
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight - 100 - Math.random() * 50; // Размещаем внизу экрана
    const sides = Math.floor(Math.random() * 4) + 3;
    const radius = 20 + Math.random() * 30;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const bodyOptions = {
      restitution: 0.3,
      friction: 0.5, // Увеличиваем трение для стабильности
      density: 0.005,
      render: { 
        fillStyle: color,
        strokeStyle: '#000',
        lineWidth: 1
      },
      chamfer: { radius: 5 },
      isStatic: true // Сначала делаем статичными
    };
    
    let body;
    if (Math.random() > 0.5) {
      body = Bodies.polygon(x, y, sides, radius, bodyOptions);
    } else {
      body = Bodies.circle(x, y, radius * 0.7, bodyOptions);
    }
    
    objects.push(body);
  }
  
  World.add(world, boundaries.concat(objects));
  
  // Через 1 секунду делаем объекты динамическими
  setTimeout(() => {
    const bodies = Matter.Composite.allBodies(engine.world);
    for (let i = 0; i < bodies.length; i++) {
      const body = bodies[i];
      if (!body.isStatic) continue;
      if (body === boundaries[0] || body === boundaries[1] || 
          body === boundaries[2] || body === boundaries[3]) continue;
      
      Body.setStatic(body, false);
    }
    // Отключаем гравитацию после "усадки"
    setTimeout(() => {
      engine.gravity.y = 0;
    }, 1000);
  }, 1000);
}

// Настройки левитации
const levitationSettings = {
  sensitivity: 0.05,
  maxForce: 0.5,
  damping: 0.95
};

let scrollForce = 0;
let lastScrollY = window.scrollY;

// Обработчик скролла для левитации
window.addEventListener('scroll', function() {
const deltaY = window.scrollY - lastScrollY;
lastScrollY = window.scrollY;

scrollForce = deltaY * levitationSettings.sensitivity;
scrollForce = Math.max(-levitationSettings.maxForce, 
                 Math.min(levitationSettings.maxForce, scrollForce));
});

// Применяем силу к объектам в каждом кадре
Matter.Events.on(engine, 'beforeUpdate', function() {
const bodies = Matter.Composite.allBodies(engine.world);

// Применяем силу левитации
for (let i = 0; i < bodies.length; i++) {
const body = bodies[i];
if (!body.isStatic) {
Body.applyForce(body, body.position, {
  x: 0,
  y: -scrollForce // Отрицательное значение для подъема при скролле вверх
});
}
}

// Постепенно уменьшаем силу
scrollForce *= levitationSettings.damping;

// Ограничиваем скорость объектов
for (let i = 0; i < bodies.length; i++) {
const body = bodies[i];
if (!body.isStatic) {
const maxSpeed = 2;
const velocity = body.velocity;
const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

if (speed > maxSpeed) {
  Body.setVelocity(body, {
    x: velocity.x * maxSpeed / speed,
    y: velocity.y * maxSpeed / speed
  });
}
}
}
});

// Обработчик изменения размера окна
window.addEventListener('resize', function() {
render.options.width = window.innerWidth;
render.options.height = window.innerHeight;
Render.setPixelRatio(render, window.devicePixelRatio);
createPhysicsObjects();
});

// Инициализация
createPhysicsObjects();
// Используйте:
const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);

// Анимация груди
const canvas = document.getElementById('physicsLayer');
const ctx = canvas.getContext('2d');
const bodyImg = document.getElementById('bodyImage');

const breastsImg = new Image();
breastsImg.src = 'boobs.png';

const breast = {
x: bodyImg.width * 0.1,
baseY: bodyImg.height * 0.69,
currentY: bodyImg.height * 0.69,
velocity: 0.1,
stiffness: 0.9,
damping: 0.92,
offsetX: -60,
offsetY: -80,
scale: 1.0,
width: 460,
height: 460,
keepAspect: true
};

let breastLastScrollY = window.scrollY;
let isImageLoaded = false;

breastsImg.onload = () => {
isImageLoaded = true;
draw();
};

window.addEventListener('scroll', () => {
const delta = (window.scrollY - breastLastScrollY) * -1;
breast.velocity += delta * 0.005;
breastLastScrollY = window.scrollY;
});

function updatePhysics(dt) {
const force = (breast.baseY - breast.currentY) * breast.stiffness;
breast.velocity += force * dt;
breast.velocity *= breast.damping;
breast.currentY += breast.velocity * dt * 60;
}

function draw() {
ctx.clearRect(0, 0, canvas.width, canvas.height);

if(!isImageLoaded) return;

let renderWidth, renderHeight;

if(breast.keepAspect) {
const aspect = breastsImg.width / breastsImg.height;
renderWidth = breast.width * breast.scale;
renderHeight = renderWidth / aspect;
} else {
renderWidth = breast.width * breast.scale;
renderHeight = breast.height * breast.scale;
}

ctx.drawImage(
breastsImg,
breast.x + breast.offsetX,
breast.currentY + breast.offsetY,
renderWidth,
renderHeight
);

requestAnimationFrame(() => {
updatePhysics(1/60);
draw();
});
}

bodyImg.onload = () => {
canvas.width = bodyImg.width;
canvas.height = bodyImg.height;
};

const textElement = document.querySelector('.name_outline_bg');
    let time = 0.5;
    const filter = document.querySelector('#wiggle-filter feTurbulence');
    
    function animateWiggle() {
      time += 0.5;
      
      // Быстро меняем seed для дрожащего эффекта
      const seed = Math.floor(time * 0.1) % 10;
      filter.setAttribute('seed', seed);
      


      const scale = 1 + Math.random() * 20; // Рандомные скачки
      filter.setAttribute('seed', Math.floor(Math.random() * 2));
      document.querySelector('#wiggle-filter feDisplacementMap').setAttribute('scale', scale);
      
      requestAnimationFrame(animateWiggle);
    }
    
    animateWiggle();

    // Настройки параллакса
    const parallaxSettings = {
      outline: { intensity: 0.03 },  // Меньше интенсивность (дальний слой)
      title: { intensity: 0.05 }     // Больше интенсивность (ближний слой)
    };

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let normalizedX = 0;
    let normalizedY = 0;

    // Следим за положением курсора
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      
      // Нормализуем координаты от -1 до 1
      normalizedX = (mouseX / window.innerWidth) * 2 - 1;
      normalizedY = (mouseY / window.innerHeight) * 2 - 1;
      
      updateParallax();
      updateCursor();
    });

    // Обновление позиций элементов
    function updateParallax() {
      // Применяем параллакс к outline тексту
      const outline = document.querySelector('.name_outline_bg');
      const outlineX = normalizedX * parallaxSettings.outline.intensity * 1000;
      const outlineY = normalizedY * parallaxSettings.outline.intensity * 1000;
      outline.style.transform = `translate(calc(-50% + ${outlineX}px), calc(-50% + ${outlineY}px))`;
      
      // Применяем параллакс к основному тексту
      const title = document.querySelector('.title');
      const titleX = normalizedX * parallaxSettings.title.intensity * 100;
      const titleY = normalizedY * parallaxSettings.title.intensity * 100;
      title.style.transform = `translate(calc(-50% + ${titleX}px), calc(-50% + ${titleY}px)) translateX(${getMarqueeOffset()})`;
    }

    // Обновление кастомного курсора
    function updateCursor() {
      const cursor = document.querySelector('.cursor');
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    }

    // Для анимации marquee
    function getMarqueeOffset() {
      // Можно привязать к позиции курсора, если нужно
      return '0%';
    }

    
    // Инициализация
    updateParallax();
    updateCursor();

    // Анимация картинки девушки (добавляем новый код)
const girlImage = document.getElementById('bodyImage');
const girl = {
    baseY: 0,
    currentY: 0,
    velocity: 0,
    stiffness: 0.25,
    damping: 0.95,
    maxOffset: 5
};

let girlLastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const delta = (window.scrollY - girlLastScrollY) * 1; // 1 для обратного направления
    girl.velocity += delta * 0.008;
    girlLastScrollY = window.scrollY;
});

function updateGirlPhysics(dt) {
    const force = (girl.baseY - girl.currentY) * girl.stiffness;
    girl.velocity += force * dt;
    girl.velocity *= girl.damping;
    girl.currentY += girl.velocity * dt * 60;
    
    // Ограничиваем максимальное смещение
    if (Math.abs(girl.currentY) > girl.maxOffset) {
        girl.currentY = girl.maxOffset * Math.sign(girl.currentY);
        girl.velocity *= 0.5;
    }
}

function animateGirl() {
    updateGirlPhysics(1/60);
    girlImage.style.transform = `translateY(${girl.currentY}px)`;
    requestAnimationFrame(animateGirl);
}

// Запускаем анимацию после загрузки изображения
girlImage.onload = () => {
    animateGirl();
};
if (girlImage.complete) {
    animateGirl();
}

// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  // Проверяем существование элемента
  const cursorImage = document.getElementById('cursorImage');
  if (!cursorImage) {
    console.error('Element #cursorImage not found! Creating it...');
    const newCursorImage = document.createElement('div');
    newCursorImage.id = 'cursorImage';
    newCursorImage.style.position = 'fixed';
    newCursorImage.style.pointerEvents = 'none';
    newCursorImage.style.zIndex = '1000';
    newCursorImage.style.display = 'none';
    document.body.appendChild(newCursorImage);
  }

  // Массив изображений (убедитесь, что пути правильные)
  const fubukiImages = [
    'fubuki-images/01.webp',
    'fubuki-images/02.webp',
    'fubuki-images/03.webp',
    'fubuki-images/04.webp',
    'fubuki-images/05.webp',
    'fubuki-images/06.webp',
    'fubuki-images/07.webp',
    'fubuki-images/08.webp',
    'fubuki-images/09.webp',
    'fubuki-images/10.webp',
    'fubuki-images/11.webp',
    'fubuki-images/12.webp',
    'fubuki-images/13.webp',
    'fubuki-images/14.webp',
    'fubuki-images/15.webp'
    // ... остальные изображения
  ].map(img => {
    // Добавляем проверку пути
    if (!img.startsWith('http') && !img.startsWith('/')) {
      return 'fubuki-images/' + img.split('/').pop();
    }
    return img;
  });

  let currentImageIndex = 0;
  let imagesLoaded = 0;

  // Функция предзагрузки изображений
  function preloadImages(callback) {
    fubukiImages.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === fubukiImages.length && callback) callback();
      };
      img.onerror = () => console.error('Error loading image:', src);
    });
  }

  // Функция загрузки следующего изображения
  function loadNextImage() {
    const cursorImage = document.getElementById('cursorImage');
    if (!cursorImage || fubukiImages.length === 0) return;
    
    try {
      const img = document.createElement('img');
      img.src = fubukiImages[currentImageIndex];
      img.style.display = 'block';
      img.style.width = '120px';
      img.style.height = 'auto';
      img.style.maxWidth = 'none';
      
      cursorImage.innerHTML = '';
      cursorImage.appendChild(img);
      cursorImage.style.display = 'block';
      
      currentImageIndex = (currentImageIndex + 1) % fubukiImages.length;
    } catch (e) {
      console.error('Error in loadNextImage:', e);
    }
  }

// Обновленная функция setupEventListeners
function setupEventListeners() {
  const cursorImage = document.getElementById('cursorImage');
  if (!cursorImage) return;

  // Обработчик движения мыши
  document.addEventListener('mousemove', (e) => {
    // Расчет скорости мыши
    const now = performance.now();
    const timeDelta = now - lastTimestamp;
    
    if (timeDelta > 0) {
      mouseVelocityX = (e.clientX - lastMouseX) / timeDelta * 100;
      mouseVelocityY = (e.clientY - lastMouseY) / timeDelta * 100;
    }
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    lastTimestamp = now;
    
    // Позиционирование курсора
    cursorImage.style.left = `${e.clientX + -50}px`;
    cursorImage.style.top = `${e.clientY + 30}px`;
  });

  // Остальные обработчики
  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget || e.relatedTarget === document.documentElement) {
      cursorImage.style.display = 'none';
    }
  });

  document.addEventListener('mouseover', () => {
    cursorImage.style.display = 'block';
  });

  // Запускаем анимацию покачивания
  requestAnimationFrame(applyWobbleEffect);
}

  // Инициализация
  preloadImages(() => {
    loadNextImage();
    setInterval(loadNextImage, 2000);
    setupEventListeners();
  });
});

// Добавляем новые переменные для анимации
let mouseVelocityX = 0;
let mouseVelocityY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let lastTimestamp = 0;

// Функция для расчета скорости мыши
function calculateMouseVelocity(e) {
  const now = performance.now();
  const timeDelta = now - lastTimestamp;
  
  if (timeDelta > 0) {
    mouseVelocityX = (e.clientX - lastMouseX) / timeDelta * 100;
    mouseVelocityY = (e.clientY - lastMouseY) / timeDelta * 100;
  }
  
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  lastTimestamp = now;
}

function applyWobbleEffect() {
  const cursorImage = document.getElementById('cursorImage');
  if (!cursorImage || !cursorImage.firstChild) {
    requestAnimationFrame(applyWobbleEffect);
    return;
  }
  
  const img = cursorImage.firstChild;
  const intensity = Math.min(1, Math.sqrt(mouseVelocityX**2 + mouseVelocityY**2) / 1);
  
  // Уменьшаем влияние скорости по X, чтобы избежать переворота
  const tiltX = mouseVelocityX * 0.1; // Уменьшил коэффициент с 0.3 до 0.1
  const tiltY = mouseVelocityY * 0.2;
  
  // Плавное покачивание (только по вертикали)
  const wobble = Math.sin(performance.now() / 200) * 10 * intensity;
  
  // Новая трансформация - только наклон по X и небольшой наклон по Y
  img.style.transform = `
    rotate(${tiltX}deg)
    skewX(${tiltX * 0.3}deg)
    translateY(${wobble}px)
  `;
  
  // Сохраняем фильтр с тенью, но убираем размытие
  img.style.filter = `drop-shadow(0 0 5px rgba(0, 0, 0, 0.47))`;
  
  requestAnimationFrame(applyWobbleEffect);
}

