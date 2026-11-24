// NovaVerse 3D scene, polished edition, built with Three.js.
// Richer lighting and glow on the planet and rings, shooting stars, a soft
// atmosphere halo, and a smooth camera with drag inertia and damped zoom.
// Exposes window.NovaScene.init(container, callbacks) and .dispose().
// Callbacks: onSelect(bodyId) when a planet or moon is clicked,
// onReady() after the first frame renders.

(function () {
    var THREE = window.THREE;
    if (!THREE) {
        window.NovaScene = {
            init: function () { return { dispose: function () {} }; },
            dispose: function () {}
        };
        return;
    }

    var DATA = window.NOVAVERSE || { BODIES: [], STAR_COUNT: 2400 };
    var BODIES = DATA.BODIES;
    var STAR_COUNT = DATA.STAR_COUNT;

    // Canvas texture with horizontal color bands for a planet surface.
    function bandTexture(palette, width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width || 512;
        canvas.height = height || 256;
        var ctx = canvas.getContext('2d');
        var bands = 14;
        for (var i = 0; i < bands; i++) {
            var y = (i / bands) * canvas.height;
            ctx.fillStyle = palette[i % palette.length];
            ctx.fillRect(0, y, canvas.width, canvas.height / bands + 1);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
            ctx.fillRect(0, y, canvas.width, 2);
        }
        // Soft cloud streaks for a richer surface.
        for (var j = 0; j < 60; j++) {
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (Math.random() * 0.09) + ')';
            var w = 20 + Math.random() * 90;
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, w, 2 + Math.random() * 3);
        }
        for (var k = 0; k < 260; k++) {
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (Math.random() * 0.08) + ')';
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
        }
        var tex = new THREE.CanvasTexture(canvas);
        if (THREE.SRGBColorSpace) {
            tex.colorSpace = THREE.SRGBColorSpace;
        } else {
            tex.encoding = THREE.sRGBEncoding;
        }
        return tex;
    }

    // Soft radial glow texture used for the planet glow and the nebula clouds.
    function glowTexture() {
        var canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        var ctx = canvas.getContext('2d');
        var grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.45)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
        var tex = new THREE.CanvasTexture(canvas);
        if (THREE.SRGBColorSpace) {
            tex.colorSpace = THREE.SRGBColorSpace;
        } else {
            tex.encoding = THREE.sRGBEncoding;
        }
        return tex;
    }

    // Ring texture with concentric bands of varying brightness.
    function ringTexture() {
        var canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        var ctx = canvas.getContext('2d');
        var cx = 128;
        var cy = 128;
        for (var r = 128; r > 40; r -= 3) {
            var alpha = 0.25 + Math.random() * 0.6;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(205, 190, 255, ' + alpha.toFixed(2) + ')';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        var tex = new THREE.CanvasTexture(canvas);
        if (THREE.SRGBColorSpace) {
            tex.colorSpace = THREE.SRGBColorSpace;
        } else {
            tex.encoding = THREE.sRGBEncoding;
        }
        return tex;
    }

    function init(container, callbacks) {
        callbacks = callbacks || {};
        var glowTex = glowTexture();

        var renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (THREE.SRGBColorSpace) {
            renderer.outputColorSpace = THREE.SRGBColorSpace;
        }
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        container.appendChild(renderer.domElement);

        var scene = new THREE.Scene();
        scene.background = new THREE.Color(0x020010);
        scene.fog = new THREE.FogExp2(0x04001a, 0.0032);

        var camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 800);
        camera.position.set(0, 7, 27);

        // Richer lighting: soft ambient, a strong warm sun, a violet rim
        // light from behind and a pink fill light for depth.
        scene.add(new THREE.AmbientLight(0x8899ff, 0.85));

        var sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
        sunLight.position.set(22, 14, 20);
        scene.add(sunLight);

        var rimLight = new THREE.PointLight(0x7b5cff, 1000, 140);
        rimLight.position.set(-16, -9, -12);
        scene.add(rimLight);

        var warmLight = new THREE.PointLight(0xff6ec7, 500, 90);
        warmLight.position.set(12, -6, 14);
        scene.add(warmLight);

        var universe = new THREE.Group();
        scene.add(universe);

        var clickable = [];
        var orbiters = [];
        var rings = null;
        var outerRing = null;
        var planetGlow = null;

        BODIES.forEach(function (body) {
            var geo = new THREE.SphereGeometry(body.size, 48, 32);
            var mat;
            if (body.bands) {
                mat = new THREE.MeshStandardMaterial({
                    map: bandTexture(body.palette),
                    roughness: 0.7,
                    metalness: 0.12,
                    emissive: body.color,
                    emissiveIntensity: 0.16
                });
            } else {
                mat = new THREE.MeshStandardMaterial({
                    color: body.color,
                    roughness: 0.85,
                    metalness: 0.05,
                    emissive: body.color,
                    emissiveIntensity: 0.1
                });
            }
            var mesh = new THREE.Mesh(geo, mat);
            mesh.userData.bodyId = body.id;
            universe.add(mesh);
            clickable.push(mesh);
            orbiters.push({ mesh: mesh, body: body, angle: body.angleStart });

            if (body.ringed) {
                // Bright inner ring.
                var ringGeo = new THREE.RingGeometry(body.size * 1.35, body.size * 2.2, 96, 1);
                var ringMat = new THREE.MeshBasicMaterial({
                    map: ringTexture(),
                    transparent: true,
                    opacity: 0.9,
                    side: THREE.DoubleSide,
                    depthWrite: false
                });
                rings = new THREE.Mesh(ringGeo, ringMat);
                rings.rotation.x = -1.15;
                rings.rotation.y = 0.2;
                universe.add(rings);

                // Faint outer ring for extra depth.
                var outerGeo = new THREE.RingGeometry(body.size * 2.3, body.size * 2.65, 96, 1);
                var outerMat = new THREE.MeshBasicMaterial({
                    map: ringTexture(),
                    transparent: true,
                    opacity: 0.35,
                    side: THREE.DoubleSide,
                    depthWrite: false
                });
                outerRing = new THREE.Mesh(outerGeo, outerMat);
                outerRing.rotation.x = -1.15;
                outerRing.rotation.y = 0.2;
                universe.add(outerRing);

                // Soft atmosphere halo around the planet.
                var haloGeo = new THREE.SphereGeometry(body.size * 1.18, 48, 32);
                var haloMat = new THREE.MeshBasicMaterial({
                    color: 0x8b7bff,
                    transparent: true,
                    opacity: 0.16,
                    side: THREE.BackSide,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });
                var halo = new THREE.Mesh(haloGeo, haloMat);
                universe.add(halo);

                // Layered glow: a strong core glow and a wide soft glow.
                var glowMat = new THREE.SpriteMaterial({
                    map: glowTex,
                    color: 0x8b7bff,
                    transparent: true,
                    opacity: 0.5,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });
                planetGlow = new THREE.Sprite(glowMat);
                planetGlow.scale.set(20, 20, 1);
                universe.add(planetGlow);

                var wideGlowMat = new THREE.SpriteMaterial({
                    map: glowTex,
                    color: 0x5b3df0,
                    transparent: true,
                    opacity: 0.18,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });
                var wideGlow = new THREE.Sprite(wideGlowMat);
                wideGlow.scale.set(36, 36, 1);
                universe.add(wideGlow);
            }
        });

        // Starfield: 2,400 stars in two layers so they can twinkle out of phase.
        function makeStars(count, radiusMin, radiusMax) {
            var positions = new Float32Array(count * 3);
            var colors = new Float32Array(count * 3);
            var palette = [new THREE.Color(0xffffff), new THREE.Color(0xcfe4ff), new THREE.Color(0xffd7f0), new THREE.Color(0xfff2c9)];
            for (var i = 0; i < count; i++) {
                var r = radiusMin + Math.random() * (radiusMax - radiusMin);
                var theta = Math.random() * Math.PI * 2;
                var phi = Math.acos(2 * Math.random() - 1);
                positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = r * Math.cos(phi);
                var c = palette[Math.floor(Math.random() * palette.length)];
                colors[i * 3] = c.r;
                colors[i * 3 + 1] = c.g;
                colors[i * 3 + 2] = c.b;
            }
            var geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            var mat = new THREE.PointsMaterial({
                size: 0.55,
                vertexColors: true,
                transparent: true,
                opacity: 0.9,
                sizeAttenuation: true,
                depthWrite: false
            });
            return new THREE.Points(geo, mat);
        }

        var starsA = makeStars(Math.floor(STAR_COUNT / 2), 70, 150);
        var starsB = makeStars(Math.ceil(STAR_COUNT / 2), 70, 150);
        scene.add(starsA);
        scene.add(starsB);

        // Nebula clouds: large soft glowing sprites drifting far away.
        var nebulas = [];
        var nebulaColors = [0x7b5cff, 0xff6ec7, 0x3fa9ff, 0x39d98a, 0xb04dff, 0xff8ad8];
        for (var i = 0; i < 6; i++) {
            var mat = new THREE.SpriteMaterial({
                map: glowTex,
                color: nebulaColors[i],
                transparent: true,
                opacity: 0.14,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            var sprite = new THREE.Sprite(mat);
            var angle = (i / 6) * Math.PI * 2;
            sprite.position.set(Math.cos(angle) * 55, (Math.random() - 0.5) * 40, Math.sin(angle) * 55 - 20);
            var scale = 45 + Math.random() * 30;
            sprite.scale.set(scale, scale, 1);
            scene.add(sprite);
            nebulas.push(sprite);
        }

        // Floating dust particles near the center for depth.
        function makeDust(count) {
            var positions = new Float32Array(count * 3);
            for (var i = 0; i < count; i++) {
                var r = 8 + Math.random() * 26;
                var theta = Math.random() * Math.PI * 2;
                positions[i * 3] = Math.cos(theta) * r;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
                positions[i * 3 + 2] = Math.sin(theta) * r;
            }
            var geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            var mat = new THREE.PointsMaterial({
                color: 0xaabbff,
                size: 0.12,
                transparent: true,
                opacity: 0.5,
                depthWrite: false
            });
            return new THREE.Points(geo, mat);
        }

        var dust = makeDust(350);
        universe.add(dust);

        // Shooting stars: three glowing streaks that spawn at random, fly
        // across the sky and fade out.
        var shooters = [];
        for (var s = 0; s < 3; s++) {
            var sMat = new THREE.SpriteMaterial({
                map: glowTex,
                color: 0xffffff,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            var streak = new THREE.Sprite(sMat);
            streak.scale.set(7, 0.35, 1);
            scene.add(streak);
            shooters.push({
                sprite: streak,
                active: false,
                life: 0,
                duration: 1.2,
                dir: new THREE.Vector3(1, 0, 0),
                speed: 45,
                delay: Math.random() * 4
            });
        }

        function spawnShooter(sh) {
            var startX = -60 + Math.random() * 60;
            var startY = 10 + Math.random() * 30;
            var startZ = -40 - Math.random() * 30;
            sh.sprite.position.set(startX, startY, startZ);
            var dir = new THREE.Vector3(0.8 + Math.random() * 0.4, -(0.15 + Math.random() * 0.25), 0.1);
            dir.normalize();
            sh.dir.copy(dir);
            sh.sprite.material.rotation = Math.atan2(dir.y, dir.x);
            sh.life = 0;
            sh.active = true;
        }

        // Smooth camera: drag with inertia, damped wheel zoom, gentle
        // auto rotation when idle.
        var rotY = 0;
        var rotX = 0.12;
        var targetRotY = 0;
        var targetRotX = 0.12;
        var velY = 0;
        var velX = 0;
        var dist = 27;
        var targetDist = 27;
        var dragging = false;
        var lastX = 0;
        var lastY = 0;
        var moved = 0;
        var lastInteract = performance.now();

        var el = renderer.domElement;

        function onPointerDown(e) {
            dragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            moved = 0;
            velY = 0;
            velX = 0;
            lastInteract = performance.now();
            el.setPointerCapture(e.pointerId);
        }

        function onPointerMove(e) {
            if (!dragging) {
                return;
            }
            var dx = e.clientX - lastX;
            var dy = e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            moved += Math.abs(dx) + Math.abs(dy);
            velY = dx * 0.005;
            velX = dy * 0.005;
            targetRotY += velY;
            targetRotX += velX;
            targetRotX = Math.max(-0.9, Math.min(0.9, targetRotX));
            lastInteract = performance.now();
        }

        function onPointerUp(e) {
            dragging = false;
            lastInteract = performance.now();
            if (moved < 6) {
                handleClick(e.clientX, e.clientY);
            }
        }

        function onWheel(e) {
            e.preventDefault();
            targetDist = Math.max(13, Math.min(55, targetDist + e.deltaY * 0.02));
            lastInteract = performance.now();
        }

        el.addEventListener('pointerdown', onPointerDown);
        el.addEventListener('pointermove', onPointerMove);
        el.addEventListener('pointerup', onPointerUp);
        el.addEventListener('wheel', onWheel, { passive: false });

        // Click a planet or moon to open its info panel.
        var raycaster = new THREE.Raycaster();
        var pointer = new THREE.Vector2();

        function handleClick(x, y) {
            pointer.x = (x / window.innerWidth) * 2 - 1;
            pointer.y = -(y / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            var hits = raycaster.intersectObjects(clickable, false);
            if (hits.length > 0 && typeof callbacks.onSelect === 'function') {
                callbacks.onSelect(hits[0].object.userData.bodyId);
            }
        }

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener('resize', onResize);

        // Animation loop.
        var clock = new THREE.Clock();
        var rafId = 0;
        var readyFired = false;

        function animate() {
            rafId = requestAnimationFrame(animate);
            var delta = Math.min(clock.getDelta(), 0.05);
            var t = clock.elapsedTime;

            orbiters.forEach(function (o) {
                if (o.body.orbitRadius > 0) {
                    o.angle += o.body.orbitSpeed * delta;
                    o.mesh.position.x = Math.cos(o.angle) * o.body.orbitRadius;
                    o.mesh.position.z = Math.sin(o.angle) * o.body.orbitRadius;
                }
                o.mesh.rotation.y += delta * 0.05;
            });

            if (rings) {
                rings.rotation.z += delta * 0.02;
            }
            if (outerRing) {
                outerRing.rotation.z += delta * 0.012;
            }
            if (planetGlow) {
                planetGlow.material.opacity = 0.42 + Math.sin(t * 0.9) * 0.1;
            }

            starsA.material.opacity = 0.7 + Math.sin(t * 1.3) * 0.25;
            starsB.material.opacity = 0.7 + Math.sin(t * 1.3 + Math.PI) * 0.25;

            nebulas.forEach(function (n, i) {
                n.material.rotation += delta * 0.01 * (i % 2 === 0 ? 1 : -1);
            });

            dust.rotation.y += delta * 0.01;

            // Shooting stars.
            shooters.forEach(function (sh) {
                if (!sh.active) {
                    sh.delay -= delta;
                    if (sh.delay <= 0 && Math.random() < 0.02) {
                        spawnShooter(sh);
                    }
                    return;
                }
                sh.life += delta;
                var p = sh.life / sh.duration;
                if (p >= 1) {
                    sh.active = false;
                    sh.sprite.material.opacity = 0;
                    sh.delay = 2 + Math.random() * 6;
                    return;
                }
                sh.sprite.position.addScaledVector(sh.dir, sh.speed * delta);
                sh.sprite.material.opacity = Math.sin(p * Math.PI) * 0.9;
            });

            // Idle auto rotation and drag inertia.
            if (performance.now() - lastInteract > 4000) {
                targetRotY += delta * 0.05;
            }
            if (!dragging) {
                targetRotY += velY;
                targetRotX += velX;
                targetRotX = Math.max(-0.9, Math.min(0.9, targetRotX));
                velY *= 0.94;
                velX *= 0.94;
            }

            rotY += (targetRotY - rotY) * 0.07;
            rotX += (targetRotX - rotX) * 0.07;
            universe.rotation.y = rotY;
            universe.rotation.x = rotX;

            dist += (targetDist - dist) * 0.08;
            camera.position.z = dist;

            renderer.render(scene, camera);

            if (!readyFired) {
                readyFired = true;
                if (typeof callbacks.onReady === 'function') {
                    callbacks.onReady();
                }
            }
        }

        animate();

        return {
            dispose: function () {
                cancelAnimationFrame(rafId);
                el.removeEventListener('pointerdown', onPointerDown);
                el.removeEventListener('pointermove', onPointerMove);
                el.removeEventListener('pointerup', onPointerUp);
                el.removeEventListener('wheel', onWheel);
                window.removeEventListener('resize', onResize);
                renderer.dispose();
                if (renderer.domElement.parentNode === container) {
                    container.removeChild(renderer.domElement);
                }
            }
        };
    }

    window.NovaScene = {
        init: init,
        dispose: function () {}
    };
})();
