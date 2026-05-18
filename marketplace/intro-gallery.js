(function() {
    'use strict';

    var introWall = document.getElementById('intro-wall');
    var container = document.getElementById('gallery-container');
    if (!introWall || !container) return;

    var layers = [];
    var textures = [];
    var loaded = 0;
    var lastTime = 0;
    var DEPTH_LAYERS = 5;
    var IMAGES_PER_LAYER = 10;
    var MAX_WIDTH = 160;
    var MAX_HEIGHT = 160;
    var dragActive = false;
    var lastX = 0;
    var dragVelocity = 0;
    var speedFactor = 1;
    var animId = null;
    var isVisible = true;

    var LAYER_CONFIG = [
        { scale: 1.5, speed: 80,  opacity: 1.0 },
        { scale: 1.0, speed: 40,  opacity: 0.85 },
        { scale: 0.8, speed: 30,  opacity: 0.7 },
        { scale: 0.6, speed: 20,  opacity: 0.55 },
        { scale: 0.5, speed: 15,  opacity: 0.4 }
    ];

    var IMAGE_PATHS = [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200',
        'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=200',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
        'https://images.unsplash.com/photo-1706894854720-f5b6338443f8?w=200',
        'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=200',
        'https://images.unsplash.com/photo-1603618090554-f7a5079ffb54?w=200',
        'https://images.unsplash.com/photo-1644360266788-572e62457a5f?w=200',
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200',
        'https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=200',
        'https://images.unsplash.com/photo-1637713871652-4c9f1e601209?w=200',
        'https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f?w=200',
        'https://images.unsplash.com/photo-1608571702346-bf078a741b19?w=200',
        'https://images.unsplash.com/photo-1609595781706-90b0b3a832f1?w=200',
        'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=200',
        'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=200',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200',
        'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=200',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200'
    ];

    var shuffledImages = [];
    var currentImageIndex = 0;

    function shuffleArray(array) {
        var arr = array.slice();
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        }
        return arr;
    }

    function getNextRandomImage() {
        if (currentImageIndex >= shuffledImages.length) {
            shuffledImages = shuffleArray(IMAGE_PATHS);
            currentImageIndex = 0;
        }
        return shuffledImages[currentImageIndex++];
    }

    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    var camera;

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function fallbackTexture(layer) {
        var c = document.createElement('canvas');
        c.width = MAX_WIDTH;
        c.height = MAX_HEIGHT;
        var ctx = c.getContext('2d');
        var colors = ['#4a6572', '#344955', '#232f34', '#1c2529', '#0f1518'];
        ctx.fillStyle = colors[layer] || '#111';
        ctx.fillRect(0, 0, c.width, c.height);
        return new THREE.CanvasTexture(c);
    }

    for (var l = 0; l < DEPTH_LAYERS; l++) { layers[l] = []; }

    function resize() {
        var rect = introWall.getBoundingClientRect();
        var w = rect.width;
        var h = rect.height;
        renderer.setSize(w, h);
        if (!camera) {
            camera = new THREE.OrthographicCamera(0, w, h, 0, -1000, 1000);
            camera.position.z = 10;
        } else {
            camera.right = w;
            camera.top = h;
            camera.updateProjectionMatrix();
        }
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            if (!layer) continue;
            for (var j = 0; j < layer.length; j++) {
                var s = layer[j];
                scene.remove(s);
                if (s.material && s.material.map) s.material.map.dispose();
                if (s.material) s.material.dispose();
                if (s.geometry) s.geometry.dispose();
            }
        }
        layers = [];
        for (var k = 0; k < DEPTH_LAYERS; k++) layers[k] = [];
        if (textures.length === DEPTH_LAYERS * IMAGES_PER_LAYER) fillViewport();
    }

    var loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    var TOTAL = DEPTH_LAYERS * IMAGES_PER_LAYER;

    function loadAll() {
        shuffledImages = shuffleArray(IMAGE_PATHS);
        currentImageIndex = 0;
        for (var l = 0; l < DEPTH_LAYERS; l++) {
            for (var i = 0; i < IMAGES_PER_LAYER; i++) {
                var path = getNextRandomImage();
                loader.load(path, function(tex) {
                    textures.push(tex);
                    loaded++;
                    var pct = Math.round((loaded / TOTAL) * 100);
                    var el = document.getElementById('gallery-loading');
                    if (el) el.textContent = 'Cargando ' + pct + '%';
                    if (loaded === TOTAL) initSprites();
                }, undefined, function() {
                    textures.push(fallbackTexture(l));
                    loaded++;
                    var pct = Math.round((loaded / TOTAL) * 100);
                    var el = document.getElementById('gallery-loading');
                    if (el) el.textContent = 'Cargando ' + pct + '%';
                    if (loaded === TOTAL) initSprites();
                });
            }
        }
    }

    function initSprites() {
        fillViewport();
        var loadingEl = document.getElementById('gallery-loading');
        if (loadingEl) loadingEl.style.display = 'none';
        var uiEl = document.getElementById('gallery-ui');
        if (uiEl) uiEl.style.display = 'block';
        var overlay = document.querySelector('.intro-overlay');
        if (overlay) overlay.classList.add('ready');
        lastTime = performance.now();
        animate();
    }

    function addSprite(layerIndex, startX) {
        var cfg = LAYER_CONFIG[layerIndex];
        var texIndex = Math.floor(Math.random() * textures.length);
        var texture = textures[texIndex] || fallbackTexture(layerIndex);
        var mat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: cfg.opacity
        });
        var sprite = new THREE.Sprite(mat);
        var image = texture.image;
        var width = MAX_WIDTH;
        var height = MAX_HEIGHT;
        if (image && image.width && image.height) {
            var ratio = image.width / image.height;
            if (ratio > 1) {
                width = MAX_WIDTH;
                height = MAX_WIDTH / ratio;
            } else {
                height = MAX_HEIGHT;
                width = MAX_HEIGHT * ratio;
            }
        }
        var sizeVar = rand(0.85, 1.15);
        var w = width * cfg.scale * sizeVar;
        var h = height * cfg.scale * sizeVar;
        var spacing = w * rand(0.5, 0.9);
        sprite.scale.set(w, h, 1);
        var rect = introWall.getBoundingClientRect();
        sprite.position.set(startX + w / 2 + spacing, rand(h / 2, rect.height - h / 2), -layerIndex * 50);
        var speedVariation = rand(0.45, 1.15);
        sprite.userData = {
            speed: cfg.speed * speedVariation,
            width: w,
            height: h,
            seed: rand(0, 1000),
            baseY: sprite.position.y,
            opacity: cfg.opacity
        };
        layers[layerIndex].push(sprite);
        scene.add(sprite);
        return sprite;
    }

    function cleanupSprites() {
        var rect = introWall.getBoundingClientRect();
        var w = rect.width;
        var bufferZone = w * 0.5;
        for (var l = 0; l < DEPTH_LAYERS; l++) {
            var sprites = layers[l];
            if (!sprites || sprites.length === 0) continue;
            var maxSprites = IMAGES_PER_LAYER + 3;
            if (sprites.length > maxSprites) {
                for (var i = sprites.length - 1; i >= 0; i--) {
                    var s = sprites[i];
                    var ud = s.userData;
                    var shouldRemove = false;
                    if (speedFactor > 0) {
                        shouldRemove = (s.position.x - ud.width / 2) > (w + bufferZone);
                    } else if (speedFactor < 0) {
                        shouldRemove = (s.position.x + ud.width / 2) < (-bufferZone);
                    }
                    if (shouldRemove) {
                        scene.remove(s);
                        if (s.material && s.material.map) s.material.map.dispose();
                        if (s.material) s.material.dispose();
                        sprites.splice(i, 1);
                        if (sprites.length <= maxSprites) break;
                    }
                }
            }
        }
    }

    function fillViewport() {
        var rect = introWall.getBoundingClientRect();
        var w = rect.width;
        for (var l = 0; l < DEPTH_LAYERS; l++) {
            var sprites = layers[l];
            if (!sprites) continue;
            var rightMost = sprites.length > 0
                ? Math.max.apply(null, sprites.map(function(s) { return s.position.x + s.userData.width / 2; }))
                : -w * 1.2;
            while (rightMost < w) {
                addSprite(l, rightMost);
                sprites = layers[l];
                rightMost = Math.max.apply(null, sprites.map(function(s) { return s.position.x + s.userData.width / 2; }));
            }
        }
    }

    function animate() {
        if (!isVisible) {
            animId = requestAnimationFrame(animate);
            return;
        }
        var now = performance.now();
        var dt = Math.min(40, now - lastTime) / 1000;
        lastTime = now;
        var rect = introWall.getBoundingClientRect();
        var w = rect.width;
        dragVelocity *= 0.92;
        speedFactor = dragVelocity !== 0 ? (dragVelocity > 0 ? 1 : -1) : speedFactor;
        if (Math.random() < 0.01) cleanupSprites();
        for (var l = 0; l < layers.length; l++) {
            var sprites = layers[l];
            if (!sprites || !sprites.length) continue;
            for (var i = 0; i < sprites.length; i++) {
                var s = sprites[i];
                var ud = s.userData;
                s.position.x += ud.speed * speedFactor * dt;
                if (speedFactor > 0 && s.position.x - ud.width / 2 > w) {
                    s.position.x = -ud.width / 2 - rand(0, ud.width);
                } else if (speedFactor < 0 && s.position.x + ud.width / 2 < 0) {
                    s.position.x = w + ud.width / 2 + rand(0, ud.width);
                }
                var pulse = 1 + Math.sin(now * 0.001 + ud.seed) * 0.015;
                s.scale.x = ud.width * pulse;
                s.scale.y = ud.height * pulse;
                s.position.y = ud.baseY + Math.sin(now * 0.001 + ud.seed) * 5;
                s.material.opacity = ud.opacity;
            }
        }
        renderer.render(scene, camera);
        animId = requestAnimationFrame(animate);
    }

    function getX(e) {
        return e.touches ? e.touches[0].clientX : e.clientX;
    }

    container.addEventListener('mousedown', function(e) {
        dragActive = true;
        lastX = getX(e);
    });
    container.addEventListener('mousemove', function(e) {
        if (!dragActive) return;
        var x = getX(e);
        var dx = x - lastX;
        lastX = x;
        dragVelocity = dx * 0.02;
    });
    window.addEventListener('mouseup', function() { dragActive = false; });
    container.addEventListener('touchstart', function(e) {
        dragActive = true;
        lastX = getX(e);
    }, { passive: true });
    container.addEventListener('touchmove', function(e) {
        if (!dragActive) return;
        var x = getX(e);
        var dx = x - lastX;
        lastX = x;
        dragVelocity = dx * 0.02;
    }, { passive: true });
    window.addEventListener('touchend', function() { dragActive = false; });

    var visibilityObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            isVisible = entry.isIntersecting;
            if (!isVisible) {
                dragActive = false;
            }
        });
    }, { threshold: 0 });
    visibilityObserver.observe(introWall);

    var resizeTimer = null;
    function debouncedResize() {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 200);
    }
    window.addEventListener('resize', debouncedResize);

    resize();
    loadAll();
})();
