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

            this.camera.position.z = 15;
            this.camera.position.y = 2;

            this.animate();
        },

        createDungeon() {
            const geo = new THREE.BoxGeometry(20, 10, 1000);
            const mat = new THREE.MeshStandardMaterial({
                color: 0x051423,
                side: THREE.BackSide,
                roughness: 0.8,
                metalness: 0.2
            });
            this.dungeon = new THREE.Mesh(geo, mat);
            this.scene.add(this.dungeon);

            // Add some "pillars" or details
            for (let i = 0; i < 30; i++) {
                const pGeo = new THREE.CylinderGeometry(0.3, 0.5, 10, 6);
                const pMat = new THREE.MeshStandardMaterial({ color: 0x0a1e32, emissive: 0x00d2ff, emissiveIntensity: 0.2 });
                const p = new THREE.Mesh(pGeo, pMat);
                p.position.set(i % 2 === 0 ? -9.5 : 9.5, 0, -i * 15);
                this.scene.add(p);

                // Blue neon light on pillars
                const l = new THREE.PointLight(0x00d2ff, 8, 15);
                l.position.set(p.position.x * 0.9, 2, p.position.z);
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

        animate() {
            requestAnimationFrame(() => this.animate());

            // Subtle camera movement
            this.camera.position.x = Math.sin(Date.now() * 0.001) * 0.2;

            // Particles movement
            if (this.particles) {
                this.particles.rotation.y += 0.001;
                this.particles.position.z += 0.02;
                if (this.particles.position.z > 20) this.particles.position.z = -20;
            }

            // Realistic light flicker
            if (this.pointLight) {
                this.pointLight.intensity = 15 + Math.random() * 5;
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
    enterGate() {
        if (this.player.lvl < 2 && !confirm("Warning: Your level is too low. Enter anyway?")) return;

        this.three.moveForward();

        // Randomly trigger Statue of God at Level 5+
        setTimeout(() => {
            if (this.player.lvl >= 5 && Math.random() < 0.2) {
                this.triggerBoss();
                return;
            }

            const randomMob = this.mobs[Math.floor(Math.random() * this.mobs.length)];
            this.currentMob = { ...randomMob };
            this.isCombat = true;

            // Spawn 3D Mob
            this.three.spawnMob();

            document.getElementById('arena-overlay').classList.remove('hidden');
            document.getElementById('mob-name').innerText = this.currentMob.name;
            // Removed 2D sprite setting
            this.updateMobBar();
            this.combatLog(`[SYSTEM] Dungeon entered. Encountered 3D ${this.currentMob.name}!`);
        }, 1000);
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

        // Camera Shake 3D
        const originalX = this.three.camera.position.x;
        this.three.camera.position.x += 0.3;
        setTimeout(() => this.three.camera.position.x = originalX, 100);

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
            const anim = () => {
                if (this.three.mobMesh.scale.x > 0) {
                    this.three.mobMesh.scale.x -= 0.1;
                    this.three.mobMesh.scale.y -= 0.1;
                    this.three.mobMesh.scale.z -= 0.1;
                    this.three.mobMesh.rotation.y += 0.5;
                    requestAnimationFrame(anim);
                } else {
                    this.three.scene.remove(this.three.mobMesh);
                    this.three.mobMesh = null;
                }
            };
            anim();
        }

        setTimeout(() => {
            document.getElementById('arena-overlay').classList.add('hidden');
        }, 1500);
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
        document.getElementById('boss-overlay').classList.remove('hidden');
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
