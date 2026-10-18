import { db, generateLocalId } from './db';

// Helper to draw realistic showcase canvas frames
function drawMountainScene(ctx, width, height, t) {
  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#1e3a8a');
  skyGrad.addColorStop(0.4, '#f59e0b');
  skyGrad.addColorStop(0.7, '#fbbf24');
  skyGrad.addColorStop(1, '#fed7aa');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Glowing Sun
  const sunY = height * 0.38 + Math.sin(t * 1.5) * 4;
  const sunGrad = ctx.createRadialGradient(width * 0.5, sunY, 10, width * 0.5, sunY, 120);
  sunGrad.addColorStop(0, '#fffbeb');
  sunGrad.addColorStop(0.3, '#fef08a');
  sunGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(width * 0.5, sunY, 120, 0, Math.PI * 2);
  ctx.fill();

  // Distant Mountain Peaks
  ctx.fillStyle = '#4338ca';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.65);
  ctx.lineTo(width * 0.25, height * 0.35);
  ctx.lineTo(width * 0.55, height * 0.58);
  ctx.lineTo(width * 0.8, height * 0.38);
  ctx.lineTo(width, height * 0.62);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Foreground Mountain with snow tips
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.8);
  ctx.lineTo(width * 0.4, height * 0.48);
  ctx.lineTo(width * 0.7, height * 0.75);
  ctx.lineTo(width, height * 0.55);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Snow on peak
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(width * 0.4, height * 0.48);
  ctx.lineTo(width * 0.34, height * 0.56);
  ctx.lineTo(width * 0.45, height * 0.54);
  ctx.closePath();
  ctx.fill();

  // Overlay text branding badge
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.roundRect(20, 20, 140, 32, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.fillText('🏔️ Swiss Alps', 35, 41);
}

function drawDogScene(ctx, width, height, t) {
  // Vibrant sunny park background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#6ee7b7');
  bgGrad.addColorStop(0.5, '#34d399');
  bgGrad.addColorStop(1, '#059669');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft bokeh circles
  for (let i = 0; i < 6; i++) {
    const x = ((i * 110 + t * 25) % width);
    const y = 80 + Math.sin(t + i) * 30;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(x, y, 40 + i * 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cute Golden Retriever Face & Head
  const headX = width / 2;
  const headY = height * 0.52 + Math.sin(t * 3) * 6;

  // Ears
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.ellipse(headX - 95, headY - 20, 35, 65, Math.PI / 6, 0, Math.PI * 2);
  ctx.ellipse(headX + 95, headY - 20, 35, 65, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();

  // Head circle
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(headX, headY, 100, 0, Math.PI * 2);
  ctx.fill();

  // Snout
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.ellipse(headX, headY + 35, 55, 45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(headX, headY + 22, 22, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(headX - 40, headY - 20, 13, 0, Math.PI * 2);
  ctx.arc(headX + 40, headY - 20, 13, 0, Math.PI * 2);
  ctx.fill();

  // Eye shines
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(headX - 43, headY - 23, 4, 0, Math.PI * 2);
  ctx.arc(headX + 37, headY - 23, 4, 0, Math.PI * 2);
  ctx.fill();

  // Cute happy tongue
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.ellipse(headX, headY + 68, 18, 25, 0, 0, Math.PI);
  ctx.fill();

  // Animated Tennis Ball
  const ballX = headX + Math.sin(t * 4) * 80;
  const ballY = height * 0.82 + Math.abs(Math.sin(t * 6)) * -25;
  ctx.fillStyle = '#84cc16';
  ctx.beginPath();
  ctx.arc(ballX, ballY, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Overlay badge
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.roundRect(20, 20, 150, 32, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.fillText('🐶 Leo The Golden', 35, 41);
}

function drawSunsetScene(ctx, width, height, t) {
  // Gorgeous sunset gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#581c87');
  grad.addColorStop(0.3, '#c026d3');
  grad.addColorStop(0.65, '#ea580c');
  grad.addColorStop(0.85, '#facc15');
  grad.addColorStop(1, '#082f49');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Giant glowing sun setting into horizon
  const sunY = height * 0.65;
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(width * 0.5, sunY, 70, 0, Math.PI * 2);
  ctx.fill();

  // Ocean water reflection
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, height * 0.65, width, height * 0.35);

  // Shimmering reflection waves
  for (let i = 0; i < 9; i++) {
    const waveY = height * 0.67 + i * 14;
    const waveW = 120 + i * 25 + Math.sin(t * 3 + i) * 15;
    ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
    ctx.fillRect(width * 0.5 - waveW / 2, waveY, waveW, 3);
  }

  // Palm tree silhouette on left
  ctx.fillStyle = '#020617';
  // Trunk
  ctx.beginPath();
  ctx.moveTo(30, height);
  ctx.quadraticCurveTo(70, height * 0.45, 110, height * 0.25);
  ctx.quadraticCurveTo(80, height * 0.45, 50, height);
  ctx.closePath();
  ctx.fill();

  // Palm leaves swaying
  const sway = Math.sin(t * 2) * 5;
  const leaves = [
    { dx: 90 + sway, dy: -30 },
    { dx: 110 + sway, dy: 10 },
    { dx: -70 - sway, dy: -20 },
    { dx: -90 - sway, dy: 15 },
    { dx: 15, dy: -70 },
  ];
  leaves.forEach((leaf) => {
    ctx.beginPath();
    ctx.moveTo(110, height * 0.25);
    ctx.quadraticCurveTo(110 + leaf.dx * 0.5, height * 0.25 + leaf.dy * 0.3, 110 + leaf.dx, height * 0.25 + leaf.dy);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#020617';
    ctx.stroke();
  });

  // Overlay badge
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.roundRect(20, 20, 160, 32, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.fillText('🌅 Malibu Horizon', 35, 41);
}

function drawCoffeeScene(ctx, width, height, t) {
  // Warm cozy cafe background
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, '#292524');
  bg.addColorStop(0.6, '#44403c');
  bg.addColorStop(1, '#1c1917');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Warm glowing fairy lights
  for (let i = 0; i < 7; i++) {
    const x = 50 + i * 90;
    const y = 50 + Math.sin(i * 1.5) * 20;
    const glow = ctx.createRadialGradient(x, y, 4, x, y, 35);
    glow.addColorStop(0, '#fde047');
    glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wooden Table
  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, height * 0.68, width, height * 0.32);

  const cupX = width / 2;
  const cupY = height * 0.62;

  // Coffee Saucer
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.ellipse(cupX, cupY + 45, 110, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ceramic Mug
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(cupX - 70, cupY - 60, 140, 100, [0, 0, 24, 24]);
  ctx.fill();

  // Mug handle
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cupX + 75, cupY - 10, 25, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  // Coffee Top & Foam
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.ellipse(cupX, cupY - 60, 70, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Latte Art Heart
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.ellipse(cupX - 12, cupY - 64, 14, 18, Math.PI / 6, 0, Math.PI * 2);
  ctx.ellipse(cupX + 12, cupY - 64, 14, 18, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();

  // Rising animated steam lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let s = -1; s <= 1; s++) {
    const steamOffset = (t * 60 + s * 40) % 90;
    const startY = cupY - 70 - steamOffset;
    if (startY > 60) {
      ctx.beginPath();
      ctx.moveTo(cupX + s * 30, startY);
      ctx.quadraticCurveTo(
        cupX + s * 30 + Math.sin(t * 4 + s) * 15,
        startY - 25,
        cupX + s * 30,
        startY - 45
      );
      ctx.stroke();
    }
  }

  // Overlay badge
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.roundRect(20, 20, 150, 32, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.fillText('☕ Morning Roast', 35, 41);
}

// Generate static Base64 image thumbnail directly from canvas
export function generateSceneThumbnail(sceneType) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  if (sceneType === 'mountain') drawMountainScene(ctx, 640, 400, 0);
  else if (sceneType === 'dog') drawDogScene(ctx, 640, 400, 0);
  else if (sceneType === 'sunset') drawSunsetScene(ctx, 640, 400, 0);
  else drawCoffeeScene(ctx, 640, 400, 0);

  return canvas.toDataURL('image/jpeg', 0.88);
}

// Generate a genuine playable animated video Blob (WebM/MP4) using MediaRecorder
export function createPlayableVideoBlob(sceneType, durationSeconds = 3) {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');

      // Check MediaRecorder support
      if (!window.MediaRecorder || !canvas.captureStream) {
        // Fallback dummy blob if browser environment doesn't support MediaRecorder
        resolve(new Blob(['fake-video-content'], { type: 'video/mp4' }));
        return;
      }

      const stream = canvas.captureStream(30);
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4',
      ];
      let selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

      const recorder = selectedMime ? new MediaRecorder(stream, { mimeType: selectedMime }) : new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMime || 'video/webm' });
        resolve(blob);
      };

      recorder.start();

      let startTime = performance.now();
      const interval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        if (sceneType === 'mountain') drawMountainScene(ctx, 640, 400, elapsed);
        else if (sceneType === 'dog') drawDogScene(ctx, 640, 400, elapsed);
        else if (sceneType === 'sunset') drawSunsetScene(ctx, 640, 400, elapsed);
        else drawCoffeeScene(ctx, 640, 400, elapsed);

        if (elapsed >= durationSeconds) {
          clearInterval(interval);
          recorder.stop();
        }
      }, 1000 / 30);
    } catch (e) {
      console.warn('Canvas video generation fallback:', e);
      resolve(new Blob(['fallback-stream'], { type: 'video/mp4' }));
    }
  });
}

// 4 realistic showcase video items described in the requirements
export async function populateSampleVideos() {
  const existingCount = await db.videos.count();
  if (existingCount > 0) {
    // Already populated
    return;
  }

  const thumb1 = generateSceneThumbnail('mountain');
  const thumb2 = generateSceneThumbnail('dog');
  const thumb3 = generateSceneThumbnail('sunset');
  const thumb4 = generateSceneThumbnail('coffee');

  const id1 = generateLocalId();
  const id2 = generateLocalId();
  const id3 = generateLocalId();
  const id4 = generateLocalId();

  const sampleItems = [
    {
      id: id1,
      localId: id1,
      title: 'Swiss Alps Golden Hour',
      videoUri: 'sample://mountain',
      caption: 'Golden hour over the snow peaks in the Swiss Alps 🏔️✨ Breathtaking view after a 4-hour morning hike! Save this spot for your next adventure.',
      hashtags: '#travel #nature #mountains #wanderlust #adventure #reels #explore',
      category: 'Travel',
      duration: 24,
      durationFormatted: '0:24',
      thumbnail: thumb1,
      status: 'Draft',
      isPosted: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
      clientCreatedAt: Date.now() - 1000 * 60 * 60 * 3,
      clientUpdatedAt: Date.now() - 1000 * 60 * 60 * 3,
      synced: false,
    },
    {
      id: id2,
      localId: id2,
      title: 'Leo Central Park Walk',
      videoUri: 'sample://dog',
      caption: 'Meet Leo! He found the biggest stick in Central Park today and refused to drop it 🐶🎾 Cutest morning walk ever.',
      hashtags: '#dogsoftiktok #goldenretriever #puppylove #pets #doglife #wholesome',
      category: 'Reels',
      duration: 18,
      durationFormatted: '0:18',
      thumbnail: thumb2,
      status: 'Posted',
      isPosted: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 8, // 8 hours ago
      clientCreatedAt: Date.now() - 1000 * 60 * 60 * 8,
      clientUpdatedAt: Date.now() - 1000 * 60 * 60 * 8,
      synced: false,
    },
    {
      id: id3,
      localId: id3,
      title: 'Pacific Waves & Sunset',
      videoUri: 'sample://sunset',
      caption: 'Chasing horizons and calm evenings by the Pacific coast 🌅🌊 Sometimes all you need is a moment of stillness and crashing waves.',
      hashtags: '#sunset #beachvibes #ocean #peaceful #mindfulness #aesthetic #travel',
      category: 'YouTube',
      duration: 32,
      durationFormatted: '0:32',
      thumbnail: thumb3,
      status: 'Draft',
      isPosted: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      clientCreatedAt: Date.now() - 1000 * 60 * 60 * 24,
      clientUpdatedAt: Date.now() - 1000 * 60 * 60 * 24,
      synced: false,
    },
    {
      id: id4,
      localId: id4,
      title: 'Morning Latte Fuel',
      videoUri: 'sample://coffee',
      caption: 'Monday fuel ☕ Oat milk latte with extra cinnamon to kickstart a productive creative week! What is your go-to morning brew?',
      hashtags: '#coffeetime #latteart #morningroutine #productivity #cafevibes #ideas',
      category: 'Ideas',
      duration: 15,
      durationFormatted: '0:15',
      thumbnail: thumb4,
      status: 'Draft',
      isPosted: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 36, // 1.5 days ago
      clientCreatedAt: Date.now() - 1000 * 60 * 60 * 36,
      clientUpdatedAt: Date.now() - 1000 * 60 * 60 * 36,
      synced: false,
    },
  ];

  await db.videos.bulkPut(sampleItems);

  // Also seed default hashtag presets in savedTagGroups
  const sampleGroups = [
    {
      id: 'grp_viral_reels',
      title: 'Viral Reels Starter',
      tags: '#reels #viral #explore #trending #reelsinstagram #fyp #creator #growth',
      createdAt: Date.now(),
    },
    {
      id: 'grp_youtube_shorts',
      title: 'YouTube Shorts Growth',
      tags: '#shorts #youtubeshorts #youtubecreator #subscribe #viralshorts #trending',
      createdAt: Date.now(),
    },
    {
      id: 'grp_travel_wander',
      title: 'Travel & Adventure',
      tags: '#travel #wanderlust #adventure #explorepage #travelgram #naturelovers #vacation',
      createdAt: Date.now(),
    },
    {
      id: 'grp_lifestyle_aesthetic',
      title: 'Aesthetic & Daily Vlog',
      tags: '#aesthetic #dailyvlog #morningroutine #mindfulness #cozyvibes #lifestyle',
      createdAt: Date.now(),
    },
  ];

  await db.savedTagGroups.bulkPut(sampleGroups);
}
