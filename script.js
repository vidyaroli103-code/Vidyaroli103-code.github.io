// Global variables
let scene, camera, renderer, audio, audioContext, analyser;
let balloons = [], confettiParticles = [], fireworks = [];
let cake, candles = [], floatingMessages = [];
let userImageTexture = null;
let wishes = [
    "Mehak, you're the light of my life! Happy Birthday, sis! 🎉",
    "May your day be as sweet as you are. Love, Prince. 🍰",
    "Here's to more adventures and laughter. You're amazing! 🎈",
    "Wishing you endless joy and all your dreams come true. 💖",
    "From your big bro: You're my favorite person. Happy Birthday! 🌟"
];
let currentWishIndex = 0;

// Initialize Three.js scene
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Room (simple box)
    const roomGeometry = new THREE.BoxGeometry(20, 10, 20);
    const roomMaterial = new THREE.MeshLambertMaterial({ color: 0xfff8dc, side: THREE.BackSide });
    const room = new THREE.Mesh(roomGeometry, roomMaterial);
    scene.add(room);

    // Cake
    const cakeGeometry = new THREE.CylinderGeometry(2, 2, 1, 32);
    const cakeMaterial = new THREE.MeshLambertMaterial({ color: 0xff69b4 });
    cake = new THREE.Mesh(cakeGeometry, cakeMaterial);
    cake.position.set(0, -3, 0);
    scene.add(cake);

    // Candles (5 candles)
    for (let i = 0; i < 5; i++) {
        const candleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
        const candleMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const candle = new THREE.Mesh(candleGeometry, candleMaterial);
        candle.position.set(-1 + i * 0.5, -2, 0);
        scene.add(candle);
        candles.push(candle);

        // Flame (small sphere with animation)
        const flameGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xff4500 });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.y = 0.5;
        candle.add(flame);
    }

    // Balloons (10 floating balloons)
    for (let i = 0; i < 10; i++) {
        const balloonGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const balloonMaterial = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
        const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
        balloon.position.set((Math.random() - 0.5) * 10, Math.random() * 5, (Math.random() - 0.5) * 10);
        scene.add(balloon);
        balloons.push(balloon);
    }

    // Floating messages (text in 3D space)
    wishes.forEach((wish, index) => {
        const textGeometry = new THREE.TextGeometry(wish, { font: 'helvetiker', size: 0.2, height: 0.01 });
        const textMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set((Math.random() - 0.5) * 10, Math.random() * 5, (Math.random() - 0.5) * 10);
        scene.add(textMesh);
        floatingMessages.push(textMesh);
    });

    camera.position.set(0, 0, 10);

    // Audio setup
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audio = new Audio('https://www.youtube.com/watch?v=nkfXm1kpIZk'); // Placeholder: Replace with actual music URL
    audio.loop = true;
    audio.volume = 0.5;
    audio.play();

    // Volume control
    document.getElementById('volume').addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });

    // Image upload
    document.getElementById('https://postimg.cc/K46x1PXd').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    userImageTexture = new THREE.Texture(img);
                    userImageTexture.needsUpdate = true;
                    cake.material.map = userImageTexture; // Apply to cake
                    cake.material.needsUpdate = true;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Interactions
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('touchstart', onTouch);

    // Countdown
    updateCountdown();

    // Hide loading
    document.getElementById('loading').style.display = 'none';

    animate();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Animate balloons (float gently)
    balloons.forEach(balloon => {
        balloon.position.y += Math.sin(Date.now() * 0.001 + balloon.position.x) * 0.01;
    });

    // Animate floating messages (rotate slowly)
    floatingMessages.forEach(msg => {
        msg.rotation.y += 0.01;
    });

    // Flicker candles on hover (simulate with mouse)
    candles.forEach(candle => {
        if (candle.children[0]) {
            candle.children[0].scale.y = 1 + Math.sin(Date.now() * 0.01) * 0.1;
        }
    });

    // Confetti and fireworks animation
    confettiParticles.forEach(particle => {
        particle.position.y -= 0.05;
        if (particle.position.y < -5) particle.visible = false;
    });
    fireworks.forEach(fw => {
        fw.position.y += 0.1;
        if (fw.position.y > 10) fw.visible = false;
    });

    renderer.render(scene, camera);
}

// Click interactions
function onClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Pop balloons
    const balloonIntersects = raycaster.intersectObjects(balloons);
    if (balloonIntersects.length > 0) {
        const balloon = balloonIntersects[0].object;
        scene.remove(balloon);
        balloons.splice(balloons.indexOf(balloon), 1);
        // Play pop sound (placeholder)
        playSound('pop.mp3'); // Replace with actual sound URL
    }

    // Slice cake to reveal wish
    const cakeIntersects = raycaster.intersectObject(cake);
    if (cakeIntersects.length > 0) {
        document.getElementById('wishes').innerHTML = wishes[currentWishIndex];
        currentWishIndex = (currentWishIndex + 1) % wishes.length;
    }
}

// Mouse move for cursor-following balloons
function onMouseMove(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Make first balloon follow cursor
    if (balloons.length > 0) {
        balloons[0].position.x = mouse.x * 5;
        balloons[0].position.y = mouse.y * 5;
    }
}

// Touch for mobile
function onTouch(event) {
    event.preventDefault();
    onClick(event.touches[0]);
}

// Happy Birthday button: Trigger confetti and fireworks
document.getElementById('happyBtn').addEventListener('click', () => {
    // Confetti
    for (let i = 0; i < 50; i++) {
        const confettiGeometry = new THREE.PlaneGeometry(0.1, 0.1);
        const confettiMaterial = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const confetti = new THREE.Mesh(confettiGeometry, confettiMaterial);
        confetti.position.set((Math.random() - 0.5) * 10, 5, (Math.random() - 0.5) * 10);
        scene.add(confetti);
        confettiParticles.push(confetti);
    }

    // Fireworks
    for (let i = 0; i < 10; i++) {
        const fireworkGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const fireworkMaterial = new THREE.MeshBasicMaterial({ color: 0xff4500 });
        const firework = new THREE.Mesh(fireworkGeometry, fireworkMaterial);
        firework.position.set((Math.random() - 0.5) * 10, -5, (Math.random() - 0.5) * 10);
        scene.add(firework);
        fireworks.push(firework);
    }
});

// Surprise pop-ups
setInterval(() => {
    if (Math.random() > 0.8) {
        const popup = document.getElementById('popup');
        document.getElementById('popupText').innerText = "Surprise! You're the best sister ever! 💕";
        popup.classList.remove('hidden');
        setTimeout(() => popup.classList.add('hidden'), 3000);
    }
}, 10000);

// Countdown function
function updateCountdown() {
    const now = new Date();
    const birthday = new Date(now.getFullYear(), 11, 14); // Dec 14
    if (now > birthday) birthday.setFullYear(now.getFullYear() + 1);
    const diff = birthday - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    document.getElementById('timer').innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    setTimeout(updateCountdown, 1000);
}

// Play sound (placeholder)
function playSound(url) {
    const sound = new Audio(url);
    sound.play();
}

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start
init();
