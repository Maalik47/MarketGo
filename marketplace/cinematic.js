// ============================================================
// CINEMATIC ENGINE — Premium Marketplace
// Minimal Three.js + GSAP + Lenis + Anime.js
// ============================================================
(function() {
'use strict';

if (typeof THREE === 'undefined' || typeof gsap === 'undefined') {
    var _check = setInterval(function() {
        if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined') {
            clearInterval(_check);
            init();
        }
    }, 200);
    return;
}
init();

function init() {

// ===== THREE.JS — MINIMAL AMBIENT BACKGROUND =====
(function() {
    var container = document.getElementById('three-canvas');
    if (!container) return;
    var W = window.innerWidth, H = window.innerHeight;

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var bgColor = new THREE.Color(0xf5f3ef);
    scene.background = bgColor;

    var camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.set(0, 0, 18);

    // Ambient light
    var ambient = new THREE.AmbientLight(0x222244, 0.5);
    scene.add(ambient);

    // Dynamic accent colors from original palette
    var accentPr = new THREE.Color(0xf59e0b);
    var accentSec = new THREE.Color(0xfbbf24);
    var accentWarm = new THREE.Color(0xf97316);

    // Dual point lights for dynamic illumination
    var light1 = new THREE.PointLight(accentPr, 1.0, 30);
    light1.position.set(4, 3, 6);
    scene.add(light1);
    var light2 = new THREE.PointLight(accentSec, 0.6, 25);
    light2.position.set(-5, -2, 4);
    scene.add(light2);

    // Gradient textures helper
    function createGradientTexture(stops) {
        var c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        var ctx = c.getContext('2d');
        var g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 512, 512);
        return new THREE.CanvasTexture(c);
    }

    // Gradient mesh — purple halo
    var gradTex = createGradientTexture([[0, '#f59e0b'], [0.3, '#d4870a'], [0.7, '#e8d5b0'], [1, '#f5f3ef']]);
    var gradMat = new THREE.MeshBasicMaterial({
        map: gradTex, transparent: true, opacity: 0.04,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    var gradMesh = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), gradMat);
    gradMesh.position.z = -14;
    gradMesh.rotation.x = 0.4;
    gradMesh.rotation.y = 0.6;
    scene.add(gradMesh);

    // Second gradient — cyan drift
    var gradTex2 = createGradientTexture([[0, '#fbbf24'], [0.4, '#d4a010'], [0.8, '#ede0c0'], [1, '#f5f3ef']]);
    var gradMat2 = new THREE.MeshBasicMaterial({
        map: gradTex2, transparent: true, opacity: 0.03,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    var gradMesh2 = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), gradMat2);
    gradMesh2.position.z = -10;
    gradMesh2.rotation.x = -0.3;
    gradMesh2.rotation.y = -0.8;
    scene.add(gradMesh2);

    // Third gradient — warm pink accent
    var gradTex3 = createGradientTexture([[0, '#f97316'], [0.5, '#d46520'], [1, '#f5f3ef']]);
    var gradMat3 = new THREE.MeshBasicMaterial({
        map: gradTex3, transparent: true, opacity: 0.02,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    var gradMesh3 = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), gradMat3);
    gradMesh3.position.z = -6;
    gradMesh3.rotation.x = 0.2;
    gradMesh3.rotation.y = -0.4;
    scene.add(gradMesh3);

    // Enhanced particles — 600 dots with color variation
    var pc = 600;
    var pGeo = new THREE.BufferGeometry();
    var pPos = new Float32Array(pc * 3);
    var pCol = new Float32Array(pc * 3);
    var pSiz = new Float32Array(pc);
    var pVel = [];
    var colors = [accentPr, accentSec, accentWarm];
    for (var i = 0; i < pc; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 35;
        pPos[i*3+1] = (Math.random() - 0.5) * 35;
        pPos[i*3+2] = (Math.random() - 0.5) * 25 - 5;
        var col = colors[Math.floor(Math.random() * colors.length)];
        pCol[i*3] = col.r; pCol[i*3+1] = col.g; pCol[i*3+2] = col.b;
        pSiz[i] = 0.02 + Math.random() * 0.05;
        pVel.push({
            x: (Math.random() - 0.5) * 0.002,
            y: (Math.random() - 0.5) * 0.002,
            phase: Math.random() * Math.PI * 2,
        });
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    pGeo.setAttribute('size', new THREE.BufferAttribute(pSiz, 1));
    var pMat = new THREE.PointsMaterial({
        size: 0.04, transparent: true, opacity: 0.08,
        vertexColors: true, blending: THREE.AdditiveBlending,
        depthWrite: false, sizeAttenuation: true,
    });
    var particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Mouse
    var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    document.addEventListener('mousemove', function(e) {
        mouse.tx = (e.clientX / W - 0.5) * 2;
        mouse.ty = (e.clientY / H - 0.5) * -2;
    });

    function onResize() {
        W = window.innerWidth; H = window.innerHeight;
        camera.aspect = W / H; camera.updateProjectionMatrix();
        renderer.setSize(W, H);
    }
    window.addEventListener('resize', onResize);

    // Animation loop — constant cinematic motion
    var clock = new THREE.Clock();
    function animate() {
        var t = clock.getElapsedTime();
        mouse.x += (mouse.tx - mouse.x) * 0.02;
        mouse.y += (mouse.ty - mouse.y) * 0.02;

        // Cinematic camera sway — always moving
        camera.position.x = Math.sin(t * 0.03) * 1.2 + mouse.x * 0.2;
        camera.position.y = Math.cos(t * 0.025) * 0.8 + mouse.y * 0.15;
        camera.position.z = 18 + Math.sin(t * 0.02) * 0.3;
        camera.lookAt(0, 0, 0);

        // Gradient meshes — constant slow orbit with breathing opacity
        gradMesh.rotation.x = 0.4 + Math.sin(t * 0.04) * 0.15;
        gradMesh.rotation.y = 0.6 + Math.cos(t * 0.05) * 0.2;
        gradMesh.position.x = Math.sin(t * 0.02) * 0.5;
        gradMesh.position.y = Math.cos(t * 0.03) * 0.3;
        gradMat.opacity = 0.12 + Math.sin(t * 0.03) * 0.03;

        gradMesh2.rotation.x = -0.3 + Math.sin(t * 0.035 + 1) * 0.12;
        gradMesh2.rotation.y = -0.8 + Math.cos(t * 0.045 + 1) * 0.18;
        gradMesh2.position.x = Math.cos(t * 0.025) * 0.4;
        gradMesh2.position.y = Math.sin(t * 0.02) * 0.3;
        gradMat2.opacity = 0.08 + Math.sin(t * 0.025 + 1) * 0.02;

        gradMesh3.rotation.x = 0.2 + Math.sin(t * 0.05 + 2) * 0.1;
        gradMesh3.rotation.y = -0.4 + Math.cos(t * 0.04 + 2) * 0.15;
        gradMesh3.position.x = Math.sin(t * 0.03 + 2) * 0.6;
        gradMesh3.position.y = Math.cos(t * 0.04 + 2) * 0.4;
        gradMat3.opacity = 0.05 + Math.sin(t * 0.04 + 2) * 0.015;

        // Particles — organic undulating drift
        var pos = particles.geometry.attributes.position.array;
        for (var i = 0; i < pc; i++) {
            var phase = pVel[i].phase;
            pos[i*3] += pVel[i].x + Math.sin(t * 0.005 + phase) * 0.0005;
            pos[i*3+1] += pVel[i].y + Math.cos(t * 0.006 + phase) * 0.0005;
            pos[i*3+2] += Math.sin(t * 0.003 + phase) * 0.0003;
            if (Math.abs(pos[i*3]) > 17) pVel[i].x *= -1;
            if (Math.abs(pos[i*3+1]) > 17) pVel[i].y *= -1;
        }
        particles.geometry.attributes.position.needsUpdate = true;

        // Background slow color shift
        var bDrift = Math.sin(t * 0.008) * 0.5 + 0.5;
        bgColor.setHSL(0.08 + bDrift * 0.02, 0.04, 0.94);

        // Dual lights — orbiting with complementary colors
        light1.position.x = Math.sin(t * 0.03) * 5;
        light1.position.z = Math.cos(t * 0.04) * 4;
        light1.position.y = Math.sin(t * 0.025) * 3;
        light1.color.lerp(accentPr, 0.01);

        light2.position.x = Math.cos(t * 0.035) * 6;
        light2.position.z = Math.sin(t * 0.03) * 5;
        light2.position.y = Math.cos(t * 0.02) * 2;
        light2.color.lerp(accentSec, 0.01);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
})();

// ===== LENIS SMOOTH SCROLL =====
(function() {
    if (typeof Lenis === 'undefined') return;
    var lenis = new Lenis({
        duration: 1.2,
        easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.8,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', function() {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
        var hdr = document.querySelector('header');
        var wall = document.getElementById('intro-wall');
        if (hdr && wall) {
            if (wall.getBoundingClientRect().bottom <= 0) {
                hdr.classList.add('header-scrolled');
            } else {
                hdr.classList.remove('header-scrolled');
            }
        }
    });

    window._lenis = lenis;

    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.scrollerProxy(document.body, {
            scrollTop: function() { return lenis.scroll; },
            scrollLeft: function() { return 0; },
            getBoundingClientRect: function() {
                return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
            },
            pinType: document.body.style.transform ? 'transform' : 'fixed',
        });
    }
})();

// ===== GSAP + ANIME.JS UTILITIES =====
(function() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    gsap.defaults({ ease: 'power3.out' });

    // Magnetic hover
    function magneticHover(selector, pull) {
        if (pull === undefined) pull = 0.3;
        var els = document.querySelectorAll(selector);
        els.forEach(function(el) {
            var rect = el.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power2.out' });
            var yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power2.out' });
            el.addEventListener('mousemove', function(e) {
                xTo((e.clientX - cx) * pull);
                yTo((e.clientY - cy) * pull);
            });
            el.addEventListener('mouseleave', function() { xTo(0); yTo(0); });
        });
    }

    // 3D tilt
    function tilt3D(selector, intensity) {
        if (intensity === undefined) intensity = 12;
        var els = document.querySelectorAll(selector);
        els.forEach(function(el) {
            el.style.perspective = '1000px';
            el.style.transformStyle = 'preserve-3d';
            el.addEventListener('mousemove', function(e) {
                var rect = el.getBoundingClientRect();
                var x = (e.clientX - rect.left) / rect.width - 0.5;
                var y = (e.clientY - rect.top) / rect.height - 0.5;
                gsap.to(el, {
                    rotationY: x * intensity, rotationX: -y * intensity * 0.6,
                    scale: 1.02, duration: 0.2, ease: 'power2.out',
                    transformPerspective: 1000,
                });
            });
            el.addEventListener('mouseleave', function() {
                gsap.to(el, { rotationY: 0, rotationX: 0, scale: 1, duration: 0.4, ease: 'power2.out' });
            });
        });
    }

    // Reveal
    function revealElements(selector, options) {
        var opts = options || {};
        var els = document.querySelectorAll(selector);
        if (!els.length) return;
        gsap.set(els, {
            opacity: 0, y: opts.y || 30,
            scale: opts.scale || 0.97,
            filter: 'blur(' + (opts.blur || 2) + 'px)',
        });
        gsap.to(els, {
            opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
            duration: 1.0, stagger: opts.stagger || 0.06,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: els[0].parentElement || els[0],
                start: 'top 85%', toggleActions: 'play none none none',
            }
        });
    }

    // Counter
    function animateCounter(element, target, suffix) {
        if (!element) return;
        var obj = { val: 0 };
        gsap.to(obj, {
            val: target, duration: 1.8, ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 85%', toggleActions: 'play none none none' },
            onUpdate: function() { element.textContent = Math.round(obj.val) + (suffix || ''); }
        });
    }

    // Parallax
    function parallaxLayer(selector, speed) {
        gsap.to(selector, {
            y: function() { return -window.innerHeight * (speed || 0.05); },
            ease: 'none',
            scrollTrigger: {
                trigger: 'body', start: 'top top', end: 'bottom top',
                scrub: 1.2, invalidateOnRefresh: true,
            }
        });
    }

    window._cinematic = {
        magneticHover: magneticHover,
        tilt3D: tilt3D,
        revealElements: revealElements,
        animateCounter: animateCounter,
        parallaxLayer: parallaxLayer,
        lenis: function() { return window._lenis; },
    };

    // Auto-init
    setTimeout(function() {
        if (document.querySelectorAll('.btn-primary, .btn-outline, .btn-add-cart').length) {
            magneticHover('.btn-primary, .btn-outline, .btn-add-cart', 0.3);
        }
        if (document.querySelectorAll('.product-card, .plan-card, .dash-card, .about-card').length) {
            tilt3D('.product-card, .plan-card, .dash-card, .about-card', 12);
        }
    }, 500);
})();

// ===== ANIME.JS MOTION SYSTEM =====
(function() {
    if (typeof anime === 'undefined') {
        var _w = setInterval(function() {
            if (typeof anime !== 'undefined') { clearInterval(_w); initA(); }
        }, 200);
        return;
    }
    initA();

    function initA() {

    // Smooth float — gentle ambient bob
    function smoothFloat(selector) {
        var els = document.querySelectorAll(selector);
        if (!els.length) return;
        els.forEach(function(el) {
            anime({
                targets: el, translateY: [-4, 4],
                duration: 4000 + Math.random() * 2000,
                delay: Math.random() * 1000,
                loop: true, direction: 'alternate',
                easing: 'easeInOutSine',
            });
        });
    }

    // Stagger entrance — smooth reveal with animation
    function staggerIn(selector, options) {
        var els = document.querySelectorAll(selector);
        if (!els.length) return;
        var opts = Object.assign({
            translateY: [30, 0], opacity: [0, 1],
            scale: [0.97, 1], duration: 1200,
            delay: anime.stagger(50),
            easing: 'easeOutExpo',
        }, options);
        anime({
            targets: els, translateY: opts.translateY,
            opacity: opts.opacity, scale: opts.scale,
            duration: opts.duration, delay: opts.delay,
            easing: opts.easing,
        });
    }

    // Smooth counter
    function smoothCounter(element, target, suffix) {
        if (!element) return;
        var obj = { val: 0 };
        anime({
            targets: obj, val: target,
            duration: 2000, easing: 'easeOutExpo', round: 1,
            update: function() {
                element.textContent = Math.round(obj.val) + (suffix || '');
            }
        });
    }

    window._animeMotion = {
        smoothFloat: smoothFloat,
        staggerIn: staggerIn,
        smoothCounter: smoothCounter,
    };

    // Auto-init ambient float on cards
    setTimeout(function() {
        if (document.querySelectorAll('.product-card, .plan-card, .dash-card, .about-card, .about-value, .about-stat, .hero-stat').length) {
            smoothFloat('.product-card, .plan-card, .dash-card, .about-card, .about-value, .about-stat, .hero-stat');
        }
    }, 1000);

    } // initA
})();

} // init
})();
