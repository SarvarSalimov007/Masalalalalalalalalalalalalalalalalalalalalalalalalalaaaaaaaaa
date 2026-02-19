const game = {
    player: {
        lvl: 1,
        job: "REAWAKENED",
        title: "SYSTEM USER",
        hp: 100, maxHp: 100,
        mp: 50, maxMp: 50,
        fatigue: 0, maxFatigue: 100,
        xp: 0, xpToNext: 100,
        stats: { str: 10, agi: 10, sen: 10, vit: 10, int: 10 },
        points: 5,
        skills: { bloodlust: { active: false, cooldown: 0 } }
    },
    quests: [
        { id: "push", val: 0, target: 100 },
        { id: "curl", val: 0, target: 100 },
        { id: "squat", val: 0, target: 100 },
        { id: "run", val: 0, target: 10 }
    ],
    mobs: [
        { name: "Goblin", hp: 30, maxHp: 30, damage: 5, xp: 20, sprite: "👺" },
        { name: "Orc Warrior", hp: 80, maxHp: 80, damage: 12, xp: 50, sprite: "👹" },
        { name: "Shadow Wolf", hp: 50, maxHp: 50, damage: 18, xp: 40, sprite: "🐺" }
    ],
    currentMob: null,
    isCombat: false,

    // 3D Engine (Three.js)
    three: {
        scene: null,
        camera: null,
        renderer: null,
        composer: null,
        dungeon: null,
        particles: null,
        pointLight: null,
        mobMesh: null,
        slashMesh: null,
        playerMesh: null,
        moveState: { w: false, a: false, s: false, d: false, shift: false },
        init() {
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), antialias: true, alpha: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.toneMapping = THREE.ReinhardToneMapping;

            // Post-processing
            const renderScene = new THREE.RenderPass(this.scene, this.camera);
            const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
            bloomPass.threshold = 0.2;
            bloomPass.strength = 1.2;
            bloomPass.radius = 0.5;

            this.composer = new THREE.EffectComposer(this.renderer);
            this.composer.addPass(renderScene);
            this.composer.addPass(bloomPass);

            // Fog for atmosphere
            this.scene.fog = new THREE.FogExp2(0x020b14, 0.05);

            // Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
            this.scene.add(ambientLight);

            this.pointLight = new THREE.PointLight(0x00d2ff, 15, 100);
            this.pointLight.position.set(0, 5, 5);
            this.scene.add(this.pointLight);

            this.createDungeon();
            this.createParticles();
            this.createSlash();
            this.createPlayer();

            this.camera.position.z = 5;
            this.camera.position.y = 2.5;

            // Keyboard Listeners
            window.addEventListener('keydown', (e) => this.handleKey(e.key.toLowerCase(), true));
            window.addEventListener('keyup', (e) => this.handleKey(e.key.toLowerCase(), false));

            // Mouse Click for Attack
            window.addEventListener('mousedown', (e) => {
                if (e.button === 0 && !game.isCombat) game.three.triggerSlash();
            });

            this.animate();
        },

        createPlayer() {
            // Detailed Shadow Monarch Silhouette
            const group = new THREE.Group();
            const mat = new THREE.MeshStandardMaterial({
                color: 0x020b14,
                emissive: 0x32c5ff,
                emissiveIntensity: 0.1,
                roughness: 0.3,
                metalness: 0.8
            });

            // Torso
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1, 0.4), mat);
            torso.position.y = 1;
            group.add(torso);

            // Head
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), mat);
            head.position.y = 1.65;
            group.add(head);

            // Glowing Eyes (Two small red emitters)
            const eyeGeo = new THREE.PlaneGeometry(0.05, 0.02);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
            const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
            eyeL.position.set(-0.1, 1.65, 0.23);
            const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
            eyeR.position.set(0.1, 1.65, 0.23);
            group.add(eyeL, eyeR);

            // Arms
            const armGeo = new THREE.BoxGeometry(0.15, 0.8, 0.15);
            const armL = new THREE.Mesh(armGeo, mat);
            armL.position.set(-0.4, 1.1, 0);
            const armR = new THREE.Mesh(armGeo, mat);
            armR.position.set(0.4, 1.1, 0);
            group.add(armL, armR);

            // Legs
            const legGeo = new THREE.BoxGeometry(0.2, 1, 0.2);
            const legL = new THREE.Mesh(legGeo, mat);
            legL.position.set(-0.2, 0.5, 0);
            const legR = new THREE.Mesh(legGeo, mat);
            legR.position.set(0.2, 0.5, 0);
            group.add(legL, legR);

            // Flowing Cape (Shadow monarch vibe)
            const capeGeo = new THREE.PlaneGeometry(0.8, 2.2, 4, 4);
            const capeMat = new THREE.MeshStandardMaterial({
                color: 0x01050a,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9,
                emissive: 0x111111
            });
            this.cape = new THREE.Mesh(capeGeo, capeMat);
            this.cape.position.set(0, 0.5, -0.3);
            this.cape.rotation.x = 0.1;
            group.add(this.cape);

            this.playerMesh = group;
            this.scene.add(this.playerMesh);

            this.populateCorridor();

            // Mouse Look Variables
            this.pitch = 0;
            this.yaw = 0;

            // Mouse Interaction (Pointer Lock)
            window.addEventListener('mousedown', (e) => {
                if (e.button === 0) {
                    if (document.pointerLockElement !== game.three.renderer.domElement) {
                        game.three.renderer.domElement.requestPointerLock();
                    } else {
                        if (!game.isCombat) game.three.triggerSlash();
                    }
                }
            });

            window.addEventListener('mousemove', (e) => {
                if (document.pointerLockElement === game.three.renderer.domElement) {
                    this.yaw -= e.movementX * 0.002;
                    this.pitch -= e.movementY * 0.002;
                    this.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.pitch));
                }
            });
        },

        populateCorridor() {
            // Spawn static Shadow Soldiers to fill the corridor
            for (let i = 1; i < 10; i++) {
                const group = new THREE.Group();
                const mat = new THREE.MeshStandardMaterial({ color: 0x020b14, emissive: 0x32c5ff, emissiveIntensity: 0.05 });

                const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.8, 6), mat);
                group.add(body);
                const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), mat);
                head.position.y = 1.1;
                group.add(head);

                group.position.set(i % 2 === 0 ? -7 : 7, 0, -i * 30);
                group.rotation.y = Math.random() * Math.PI;
                this.scene.add(group);
            }
        },

        handleKey(key, isPressed) {
            if (this.moveState.hasOwnProperty(key)) this.moveState[key] = isPressed;
            if (key === 'shift') this.moveState.shift = isPressed;
        },

        generateStoneTexture(width = 512, height = 512) {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // Background dark stone
            ctx.fillStyle = '#051423';
            ctx.fillRect(0, 0, width, height);

            // Add grain/noise
            for (let i = 0; i < 50000; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 2;
                const alpha = Math.random() * 0.1;
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fillRect(x, y, size, size);
            }

            // Draw stone blocks/cracks
            ctx.strokeStyle = '#020b14';
            ctx.lineWidth = 4;
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                ctx.moveTo(Math.random() * width, 0);
                ctx.lineTo(Math.random() * width, height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, Math.random() * height);
                ctx.lineTo(width, Math.random() * height);
                ctx.stroke();
            }

            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(5, 50);
            return texture;
        },

        createDungeon() {
            const stoneTex = this.generateStoneTexture();

            // Dungeon Walls/Floor
            const geo = new THREE.BoxGeometry(20, 10, 1000);
            const mat = new THREE.MeshStandardMaterial({
                map: stoneTex,
                side: THREE.BackSide,
                roughness: 0.9,
                metalness: 0.1,
                bumpMap: stoneTex,
                bumpScale: 0.2
            });
            this.dungeon = new THREE.Mesh(geo, mat);
            this.scene.add(this.dungeon);

            // Add some "pillars" or details
            for (let i = 0; i < 35; i++) {
                const pGeo = new THREE.CylinderGeometry(0.5, 0.7, 10, 8);
                const pMat = new THREE.MeshStandardMaterial({
                    color: 0x0a1e32,
                    map: stoneTex,
                    emissive: 0x00d2ff,
                    emissiveIntensity: 0.1
                });
                const p = new THREE.Mesh(pGeo, pMat);
                p.position.set(i % 2 === 0 ? -9.2 : 9.2, 0, -i * 15);
                this.scene.add(p);

                // Blue neon light on pillars - Cinematic flickering
                const l = new THREE.PointLight(0x00d2ff, 10, 20);
                l.position.set(p.position.x * 0.8, 2, p.position.z);
                this.scene.add(l);
            }
        },

        createParticles() {
            const pGeo = new THREE.BufferGeometry();
            const pCount = 2000;
            const posArray = new Float32Array(pCount * 3);

            for (let i = 0; i < pCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 50;
            }

            pGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            const pMat = new THREE.PointsMaterial({
                size: 0.05,
                color: 0x00d2ff,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });

            this.particles = new THREE.Points(pGeo, pMat);
            this.scene.add(this.particles);
        },

        createSlash() {
            const geo = new THREE.PlaneGeometry(5, 0.2);
            const mat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: 0, side: THREE.DoubleSide });
            this.slashMesh = new THREE.Mesh(geo, mat);
            this.scene.add(this.slashMesh);
        },

        spawnMob() {
            if (this.mobMesh) this.scene.remove(this.mobMesh);

            const group = new THREE.Group();

            // Detailed Shadow Knight Silhouette
            const knightMat = new THREE.MeshStandardMaterial({ color: 0x020b14, emissive: 0x32c5ff, emissiveIntensity: 0.2, roughness: 0.5 });

            // Reusable geometries
            const headGeo = new THREE.SphereGeometry(0.4, 8, 8);
            const torsoGeo = new THREE.BoxGeometry(1, 1.5, 0.6);
            const limbGeo = new THREE.CylinderGeometry(0.15, 0.15, 1, 6);

            // Head
            const head = new THREE.Mesh(headGeo, knightMat);
            head.position.y = 1.8;
            group.add(head);

            // Glowing Visor
            const visorGeo = new THREE.PlaneGeometry(0.4, 0.1);
            const visorMat = new THREE.MeshBasicMaterial({ color: 0xff3c3c });
            const visor = new THREE.Mesh(visorGeo, visorMat);
            visor.position.set(0, 1.9, 0.35);
            group.add(visor);

            // Torso
            const torso = new THREE.Mesh(torsoGeo, knightMat);
            torso.position.y = 1;
            group.add(torso);

            // Arms
            const armL = new THREE.Mesh(limbGeo, knightMat);
            armL.position.set(-0.7, 1.2, 0);
            armL.rotation.z = Math.PI / 4;
            const armR = new THREE.Mesh(limbGeo, knightMat);
            armR.position.set(0.7, 1.2, 0);
            armR.rotation.z = -Math.PI / 4;
            group.add(armL, armR);

            // Shoulder Spikes
            const spikeGeo = new THREE.ConeGeometry(0.2, 0.5, 4);
            const spikeL = new THREE.Mesh(spikeGeo, knightMat);
            spikeL.position.set(-0.5, 1.8, 0);
            const spikeR = new THREE.Mesh(spikeGeo, knightMat);
            spikeR.position.set(0.5, 1.8, 0);
            group.add(spikeL, spikeR);

            // Aura Particles for Mob
            const mobAura = new THREE.Points(
                new THREE.SphereGeometry(1.5, 16, 16),
                new THREE.PointsMaterial({ color: 0x00d2ff, size: 0.05, transparent: true, opacity: 0.3 })
            );
            group.add(mobAura);

            group.position.set(0, 0, -10);
            this.mobMesh = group;
            this.scene.add(this.mobMesh);

            // Dynamic spawn effect
            this.mobMesh.scale.set(0, 0, 0);
            const anim = () => {
                if (this.mobMesh && this.mobMesh.scale.x < 1) {
                    this.mobMesh.scale.x += 0.05;
                    this.mobMesh.scale.y += 0.05;
                    this.mobMesh.scale.z += 0.05;
                    requestAnimationFrame(anim);
                }
            };
            anim();
        },

        spawnBoss() {
            if (this.mobMesh) this.scene.remove(this.mobMesh);

            const group = new THREE.Group();

            // Giant Statue of God
            const stoneMat = new THREE.MeshStandardMaterial({
                color: 0x444444,
                roughness: 0.9,
                metalness: 0
            });

            // Huge Head
            const headGeo = new THREE.BoxGeometry(4, 5, 4);
            const head = new THREE.Mesh(headGeo, stoneMat);
            head.position.y = 10;
            group.add(head);

            // Giant Glowing Eyes
            const eyeGeo = new THREE.PlaneGeometry(1, 0.5);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
            eyeL.position.set(-1.2, 10.5, 2.01);
            const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
            eyeR.position.set(1.2, 10.5, 2.01);
            group.add(eyeL, eyeR);

            // Giant Torso
            const torsoGeo = new THREE.BoxGeometry(8, 12, 6);
            const torso = new THREE.Mesh(torsoGeo, stoneMat);
            torso.position.y = 2;
            group.add(torso);

            // Massive Hands
            const handGeo = new THREE.BoxGeometry(2, 2, 2);
            const handL = new THREE.Mesh(handGeo, stoneMat);
            handL.position.set(-6, 2, 3);
            const handR = new THREE.Mesh(handGeo, stoneMat);
            handR.position.set(6, 2, 3);
            group.add(handL, handR);

            group.position.set(0, -2, -30);
            this.mobMesh = group;
            this.scene.add(this.mobMesh);

            // Shake camera on boss appearance
            let count = 0;
            const shake = setInterval(() => {
                this.camera.position.x += (Math.random() - 0.5) * 0.5;
                this.camera.position.y += (Math.random() - 0.5) * 0.5;
                count++;
                if (count > 20) {
                    clearInterval(shake);
                    this.camera.position.x = 0;
                    this.camera.position.y = 2;
                }
            }, 50);
        },

        animate() {
            requestAnimationFrame(() => this.animate());

            // Real-time Controls & 3rd Person Camera
            if (!game.isCombat) {
                const speed = (this.moveState.shift ? 0.35 : 0.15);
                const direction = new THREE.Vector3();

                // Keyboard movement relative to camera yaw
                if (this.moveState.w) direction.z -= 1;
                if (this.moveState.s) direction.z += 1;
                if (this.moveState.a) direction.x -= 1;
                if (this.moveState.d) direction.x += 1;

                direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
                this.camera.position.addScaledVector(direction, speed);

                // Update Player Mesh (3rd person follow)
                if (this.playerMesh) {
                    // Player is 4 units IN FRONT of camera
                    this.playerMesh.position.set(
                        this.camera.position.x - Math.sin(this.yaw) * 4,
                        0.5,
                        this.camera.position.z - Math.cos(this.yaw) * 4
                    );
                    this.playerMesh.rotation.y = this.yaw;

                    // Animate Cape
                    if (this.cape) {
                        const time = Date.now() * 0.005;
                        for (let i = 0; i < this.cape.geometry.attributes.position.count; i++) {
                            const x = this.cape.geometry.attributes.position.getX(i);
                            const y = this.cape.geometry.attributes.position.getY(i);
                            this.cape.geometry.attributes.position.setZ(i, Math.sin(x * 2 + time) * 0.1);
                        }
                        this.cape.geometry.attributes.position.needsUpdate = true;
                    }
                }

                // Mouse Look Update
                this.camera.rotation.order = 'YXZ';
                this.camera.rotation.y = this.yaw;
                this.camera.rotation.x = this.pitch;
            }

            // Particles movement
            if (this.particles) {
                this.particles.rotation.y += 0.001;
                this.particles.position.z += 0.02;
                if (this.particles.position.z > this.camera.position.z + 10) this.particles.position.z = this.camera.position.z - 50;
            }

            // Realistic light flicker
            if (this.pointLight) {
                this.pointLight.intensity = 15 + Math.random() * 5;
                this.pointLight.position.set(this.camera.position.x, 5, this.camera.position.z - 5);
            }

            // Mob breathing & floating animation
            if (this.mobMesh) {
                this.mobMesh.position.y = Math.sin(Date.now() * 0.003) * 0.1;
                this.mobMesh.rotation.y += 0.002;

                // Automatic Battle Trigger when close
                const dist = this.camera.position.distanceTo(this.mobMesh.position);
                if (dist < 6 && !game.isCombat) {
                    game.enterGate(true); // Direct enter
                }
            }

            this.composer.render();
        },

        moveForward() {
            const targetZ = this.camera.position.z - 10;
            const anim = () => {
                if (this.camera.position.z > targetZ) {
                    this.camera.position.z -= 0.2;
                    requestAnimationFrame(anim);
                }
            };
            anim();
        },

        triggerSlash() {
            this.slashMesh.material.opacity = 1;
            this.slashMesh.position.set(0, 1, -8);
            this.slashMesh.rotation.z = Math.random() * Math.PI;

            const anim = () => {
                if (this.slashMesh.material.opacity > 0) {
                    this.slashMesh.material.opacity -= 0.1;
                    this.slashMesh.scale.x += 0.1;
                    requestAnimationFrame(anim);
                }
            };
            anim();
        }
    },

    init() {
        this.three.init();
        this.updateUI();
        this.switchTab('quest');
    },

    updateUI() {
        // Player Stats
        document.getElementById('lvl-val').innerText = this.player.lvl.toString().padStart(2, '0');
        document.getElementById('job-val').innerText = this.player.job;
        document.getElementById('title-val').innerText = this.player.title;
        document.getElementById('points-val').innerText = this.player.points;

        this.updateBar('hp-bar', this.player.hp, this.player.maxHp);
        this.updateBar('mp-bar', this.player.mp, this.player.maxMp);
        this.updateBar('fatigue-bar', this.player.fatigue, this.player.maxFatigue);
        this.updateBar('xp-bar', this.player.xp, this.player.xpToNext);

        document.getElementById('str-val').innerText = this.player.stats.str;
        document.getElementById('agi-val').innerText = this.player.stats.agi;
        document.getElementById('sen-val').innerText = this.player.stats.sen;
        document.getElementById('vit-val').innerText = this.player.stats.vit;
        document.getElementById('int-val').innerText = this.player.stats.int;

        // Quests
        if (document.getElementById('push-count')) {
            document.getElementById('push-count').innerText = this.quests[0].val;
            document.getElementById('curl-count').innerText = this.quests[1].val;
            document.getElementById('squat-count').innerText = this.quests[2].val;
            document.getElementById('run-count').innerText = this.quests[3].val;
        }
    },

    updateBar(id, current, max) {
        const bar = document.getElementById(id);
        const percent = Math.min((current / max) * 100, 100);
        bar.style.width = percent + "%";
        bar.nextElementSibling.innerText = `${Math.floor(current)}/${max}`;
    },

    allocate(stat) {
        if (this.player.points > 0) {
            this.player.stats[stat]++;
            this.player.points--;
            if (stat === 'vit') { this.player.maxHp += 20; this.player.hp += 20; }
            if (stat === 'int') { this.player.maxMp += 10; this.player.mp += 10; }
            this.updateUI();
            this.msg(`[SYSTEM] Point allocated to ${stat.toUpperCase()}`);
        }
    },

    // Quest System
    switchTab(tab, event) {
        const btns = document.querySelectorAll('.tab-btn');
        btns.forEach(b => b.classList.remove('active'));
        if (event) event.target.classList.add('active');

        const content = document.getElementById('tab-content');
        if (tab === 'quest') {
            content.innerHTML = `
                <h3>DAILY QUEST: PREPARATIONS TO BECOME STRONG</h3>
                <ul id="quest-list">
                    <li class="quest-item" onclick="game.completeQuestStep(0)">Push-ups [ <span id="push-count">${this.quests[0].val}</span> / 100 ]</li>
                    <li class="quest-item" onclick="game.completeQuestStep(1)">Curl-ups [ <span id="curl-count">${this.quests[1].val}</span> / 100 ]</li>
                    <li class="quest-item" onclick="game.completeQuestStep(2)">Squats [ <span id="squat-count">${this.quests[2].val}</span> / 100 ]</li>
                    <li class="quest-item" onclick="game.completeQuestStep(3)">Running [ <span id="run-count">${this.quests[3].val}</span> / 10km ]</li>
                </ul>
                <div class="warning-text">WARNING: FAILURE TO COMPLETE WILL RESULT IN PENALTY.</div>
            `;
        } else if (tab === 'inventory') {
            content.innerHTML = `<h3>INVENTORY</h3><p>Empty. Earn rewards from Gates.</p>`;
        } else if (tab === 'skills') {
            content.innerHTML = `<h3>SKILLS</h3>
                <div class="quest-item"><strong>BLOODLUST</strong> (Level 1) - Increase Damage but drain MP.</div>`;
        }
    },

    completeQuestStep(index) {
        const q = this.quests[index];
        if (q.val < q.target) {
            q.val += Math.floor(Math.random() * 10) + 10;
            if (q.val > q.target) q.val = q.target;
            this.player.fatigue += 2;
            this.updateUI();
            this.checkQuests();
        }
    },

    checkQuests() {
        if (this.quests.every(q => q.val >= q.target)) {
            this.msg("[SYSTEM] DAILY QUEST COMPLETED.");
            this.gainXP(50);
            this.quests.forEach(q => q.val = 0);
            this.updateUI();
        }
    },

    gainXP(amt) {
        this.player.xp += amt;
        if (this.player.xp >= this.player.xpToNext) {
            this.player.lvl++;
            this.player.xp -= this.player.xpToNext;
            this.player.xpToNext = Math.floor(this.player.xpToNext * 1.5);
            this.player.points += 5;
            this.showLevelUp();
        }
        this.updateUI();
    },

    showLevelUp() {
        const overlay = document.getElementById('level-up-overlay');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.add('hidden'), 2000);
    },

    // Combat System
    enterGate(direct = false) {
        if (!direct && this.player.lvl < 2 && !confirm("Warning: Your level is too low. Enter anyway?")) return;

        // Randomly trigger Statue of God at Level 5+
        if (this.player.lvl >= 5 && Math.random() < 0.2) {
            this.triggerBoss();
            return;
        }

        const randomMob = this.mobs[Math.floor(Math.random() * this.mobs.length)];
        this.currentMob = { ...randomMob };
        this.isCombat = true;

        // Spawn 3D Mob ahead of player if not already there
        if (!this.three.mobMesh) {
            this.three.spawnMob();
            this.three.mobMesh.position.set(this.three.camera.position.x, 0, this.three.camera.position.z - 15);
        }

        document.getElementById('arena-overlay').classList.remove('hidden');
        document.getElementById('mob-name').innerText = this.currentMob.name;
        this.updateMobBar();
        this.combatLog(`[SYSTEM] Battle started with ${this.currentMob.name}!`);
    },

    updateMobBar() {
        this.updateBar('mob-hp-bar', this.currentMob.hp, this.currentMob.maxHp);
    },

    attack() {
        if (!this.isCombat) return;

        // Player turn
        const damage = this.player.stats.str * 2 + Math.floor(Math.random() * 5);
        this.currentMob.hp -= damage;
        this.combatLog(`You dealt ${damage} damage!`);

        // 3D Visual Feedback
        this.three.triggerSlash();
        if (this.three.mobMesh) {
            this.three.mobMesh.position.x += 0.5;
            setTimeout(() => this.three.mobMesh.position.x -= 0.5, 100);
        }

        if (this.currentMob.hp <= 0) {
            this.winCombat();
            return;
        }

        // Mob turn
        setTimeout(() => this.mobTurn(), 600);
    },

    mobTurn() {
        if (!this.isCombat) return;
        const damage = Math.max(1, this.currentMob.damage - (this.player.stats.vit / 5));
        this.player.hp -= damage;
        this.combatLog(`${this.currentMob.name} dealt ${Math.floor(damage)} damage!`);

        // Damage Flash & Camera Shake 3D
        document.body.classList.add('damage-flash');
        setTimeout(() => document.body.classList.remove('damage-flash'), 400);

        const originalX = this.three.camera.position.x;
        this.three.camera.position.x += 0.5;
        this.three.camera.position.y += 0.2;
        setTimeout(() => {
            this.three.camera.position.x = originalX;
            this.three.camera.position.y = 2;
        }, 100);

        this.updateUI();

        if (this.player.hp <= 0) {
            this.gameOver();
        }
    },

    winCombat() {
        this.isCombat = false;
        this.combatLog(`${this.currentMob.name} DEFEATED!`);
        this.gainXP(this.currentMob.xp);

        // Dissolve Mob
        if (this.three.mobMesh) {
            const mesh = this.three.mobMesh;
            const anim = () => {
                if (mesh.scale.x > 0.05) {
                    mesh.scale.x -= 0.05;
                    mesh.scale.y -= 0.05;
                    mesh.scale.z -= 0.05;
                    mesh.rotation.y += 0.2;
                    requestAnimationFrame(anim);
                } else {
                    this.three.scene.remove(mesh);
                    if (this.three.mobMesh === mesh) this.three.mobMesh = null;
                }
            };
            anim();
        }

        setTimeout(() => {
            document.getElementById('arena-overlay').classList.add('hidden');
        }, 1000);
    },

    runAway() {
        this.isCombat = false;
        this.combatLog("You escaped from the Gate!");
        setTimeout(() => {
            document.getElementById('arena-overlay').classList.add('hidden');
        }, 1000);
    },

    combatLog(txt) {
        const log = document.getElementById('combat-log');
        log.innerHTML += `<div>> ${txt}</div>`;
        log.scrollTop = log.scrollHeight;
    },

    // Boss System
    triggerBoss() {
        this.three.spawnBoss();
        document.getElementById('boss-overlay').classList.remove('hidden');
        this.msg("[SYSTEM] A MONARCH LEVEL THREAT HAS APPEARED!", true);
    },

    command(type) {
        if (type === 'bow') {
            this.msg("[SYSTEM] THE GOD IS PLEASED. YOU ARE SPARED.");
            this.player.title = "GOD'S CHOSEN";
            this.player.stats.int += 10;
        } else {
            this.msg("[SYSTEM] WRONG CHOICE. INSTANT DEATH.", true);
            this.player.hp = 0;
            this.updateUI();
        }
        setTimeout(() => {
            document.getElementById('boss-overlay').classList.add('hidden');
            // Remove boss mesh if spared
            if (this.player.hp > 0 && this.three.mobMesh) {
                this.three.scene.remove(this.three.mobMesh);
                this.three.mobMesh = null;
            }
        }, 3000);
    },

    gameOver() {
        alert("YOU HAVE DIED. THE SYSTEM IS REBOOTING...");
        location.reload();
    },

    msg(text, isWarning = false) {
        const el = document.getElementById('status-msg');
        el.innerText = text;
        el.style.color = isWarning ? "#ff3c3c" : "#32c5ff";
    }
};

window.onload = () => game.init();
window.onresize = () => {
    if (game.three.renderer) {
        game.three.camera.aspect = window.innerWidth / window.innerHeight;
        game.three.camera.updateProjectionMatrix();
        game.three.renderer.setSize(window.innerWidth, window.innerHeight);
        game.three.composer.setSize(window.innerWidth, window.innerHeight);
    }
};
