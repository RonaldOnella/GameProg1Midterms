let gameOptions = {
    playerGravity: 700,
    playerSpeed: 200
}

export default class gameScene extends Phaser.Scene {
    constructor() {
        super('gameScene');
    }

    init(){
        this.score;
        this.isMoving = false;
    }

    preload() {
        this.load.tilemapTiledJSON('tileMap', 'tileMap.json');
        this.load.image('tile', './assets/images/tile.png');
        this.load.spritesheet('hero', './assets/images/slimeSheet.png', {frameWidth: 32, frameHeight: 25});
        this.load.spritesheet('crystal', './assets/images/collectiblesheet.png', {frameWidth:32, frameHeight: 32});
        this.load.spritesheet('finish', './assets/images/finishsheet.png', {frameWidth:32, frameHeight: 32});
        this.load.spritesheet('saw','./assets/images/spikesheet.png', {frameWidth: 35, frameHeight: 35});
        this.load.image('bkg', './assets/images/cavebkg.png');
        this.load.audio('saw', './assets/sounds/sawblade.wav');
        this.load.audio('switchG', './assets/sounds/switchGravity.mp3');
        this.load.audio('collect', './assets/sounds/crystalCollect.wav');
        this.load.audio('hit','./assets/sounds/hit.mp3');
        this.load.audio('ambiance','./assets/sounds/cave.wav')
        
    }
    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0)
        let bckgrnd = this.add.image(0,0,'bkg');
        bckgrnd.setDepth(-2);
        bckgrnd.setOrigin(0);

        //audio
        this.crystalCollection = this.sound.add('collect');
        this.flipSound = this.sound.add('switchG');
        this.hit = this.sound.add('hit');
        this.blade = this.sound.add('saw');
        this.bkgSound = this.sound.add('ambiance');
        this.soundConfig = {
            volume: 0.5,
            rate:1,
            loop: true
        }
        this.bladeConfig = {
            volume: 0.2,
            seek: 1,
            rate: 1,
            loop: true
        }
        this.bkgSound.play(this.soundConfig);

        
        
        //UI text
        this.score = 0;
        this.lives = 3;
        this.scoreText = this.add.text(425,325,'Crystals:' + this.score + '/50', {fontSize: '15px'});
        this.livesText = this.add.text(425,350,'Lives Left: ' + this.lives,{fontSize: '15px'});
        this.scoreText.setScrollFactor(0);
        this.livesText.setScrollFactor(0);
        this.livesText.setDepth(5);
        this.scoreText.setDepth(5);
        this.gravityDirection = 1;
        this.map = this.make.tilemap({
            key: 'tileMap'
        });

        //map data
        let tile = this.map.addTilesetImage('set-cave', 'tile');
        this.map.setCollision(1);
        this.layer = this.map.createLayer('layer01', tile);

        //anims
        const sawRotate = {
            key: 'sawAnim',
            frames: this.anims.generateFrameNumbers('saw',{start:0,end:4}),
            framerate: 60,
            repeat: -1
        }
        const idleConfig = {
            key: 'idle',
            frames: this.anims.generateFrameNumbers('hero',{start: 21, end: 24}),
            frameRate: 8,
            repeat: -1
        }    
        const leftIdleConfig = {
            key: 'idleLeft',
            frames: this.anims.generateFrameNumbers('hero',{start: 0, end: 3}),
            frameRate: 8,
            repeat: -1
        }
        const rightWalk = {
            key:'walkRight',
            frames: this.anims.generateFrameNumbers('hero',{start: 17, end:20}),
            frameRate:8,
        }
        const leftWalk = {
            key: 'walkLeft',
            frames: this.anims.generateFrameNumbers('hero',{start: 4, end: 7}),
            frameRate:8
        }

        const heroDeath = {
            key: 'deathAnim',
            frames: this.anims.generateFrameNumbers('hero', {start: 8, end: 16}),
            framerate: 8
        }

        const heroRespawn ={
            key: 'respawnAnim',
            frames: this.anims.generateFrameNumbers('hero',{start: 8, end : 12}),
            framerate: 4
        }

        const finishSpin = {
            key: 'finishAnim',
            frames: this.anims.generateFrameNumbers('finish',{start: 0, end: 15}),
            frameRate:16,
            repeat: -1
            
        }
        const crystalSpin ={
            key: 'crystalAnim',
            frames: this.anims.generateFrameNumbers('crystal', {start: 0, end: 15}),
            frameRate: 16   ,
            repeat: -1
        }
        this.anims.create(finishSpin)
        this.anims.create(idleConfig);
        this.anims.create(leftIdleConfig);
        this.anims.create(rightWalk);
        this.anims.create(leftWalk);
        this.anims.create(heroDeath);
        this.anims.create(heroRespawn);
        this.anims.create(sawRotate);
        this.anims.create(crystalSpin);

        //controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors.enabled = true;
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.spaceKey.on("down", function(){
            if(this.canFlipGravity){
                this.hero.body.gravity.y *= -1;
                this.canFlipGravity = false;
                this.hero.flipY = this.hero.body.gravity.y < 0
                this.flipSound.play();
            }
        }, this);
        this.spaceKey.enabled = true;
        this.canFlipGravity = true;

        //char data
        this.hero = this.physics.add.sprite(75, 2112, 'hero', 0);
        this.hero.enableBody = true;
        this.hero.body.gravity.y = gameOptions.playerGravity;
        this.hero.setBounce(0.25)
        this.hero.play('idle');
        

        //camera options
        this.cameras.main.setBounds(0, 0, 5760, 2160);
        this.cameras.main.setZoom(3);
        this.cameras.main.startFollow(this.hero);
        this.cameras.main.setDeadzone(60,60);

       
        //map objects
        this.finishLayer = this.map.getObjectLayer('finish')['objects'];
        this.finish = this.physics.add.staticGroup();
        this.finishLayer.forEach(object => {
            this.fin = this.finish.create(object.x,object.y, 'finish')
            this.fin.setScale(object.width/35, object.height/35);
            this.fin.setOrigin(0,1);
            this.fin.body.width = object.width;
            this.fin.body.height = object.height;
            this.anims.play('finishAnim',this.fin);
        });
        this.finish.refresh();

        this.sawTrap = this.map.getObjectLayer('spikes01')['objects'];
        this.spikies = this.physics.add.staticGroup();
        this.sawTrap.forEach(object => {
            this.spik = this.spikies.create(object.x, object.y, 'saw')
            this.spik.setScale(object.width/35, object.height/35);
            this.spik.setOrigin(0,1);
            this.spik.body.width = object.width;
            this.spik.body.Phaser = object.height;
            this.spik.setDepth(-1);
            this.anims.play('sawAnim',this.spik);
            this.blade.play(this.bladeConfig);
        });
        this.spikies.refresh();

        this.crystalLayer = this.map.getObjectLayer('collectible01')['objects'];
        this.crystals = this.physics.add.staticGroup();
        this.crystalLayer.forEach(object => {
            this.crys = this.crystals.create(object.x,object.y, 'crystal')
            this.crys.setScale(object.width/35, object.height/35);
            this.crys.setOrigin(0,1);
            this.crys.body.width = object.width;
            this.crys.body.height = object.height;
            this.anims.play('crystalAnim',this.crys)
        });
        this.crystals.refresh();
        console.log(this.crystals);

        //collision 
        this.physics.add.overlap(this.hero,this.finish, this.finishOrb,null,this);
        this.physics.add.overlap(this.hero,this.crystals, this.collectCryst, null, this);
        this.physics.add.collider(this.hero,this.spikies, this.trapSpike,null,this);
        this.hero.setCollideWorldBounds = true;
        
    }
    //trap collision
    trapSpike(hero,spik){
        if (this.lives > 0){
            this.hit.play();
            this.cursors.right.isDown = null;
            this.cursors.left.isDown = null;
            this.cursors.right.enabled = false;
            this.cursors.left.enabled = false;
            this.spaceKey.enabled = false;
            console.log("active");
            hero.body.gravity.y = gameOptions.playerGravity;
            hero.flipY = this.hero.body.gravity.y < 0
            hero.setPosition(75, 2110);
            hero.anims.play('respawnAnim');
            hero.on('animationcomplete', () => {hero.anims.play('idle'),this.cursors.right.enabled = true,
            this.cursors.left.enabled = true,
            this.spaceKey.enabled = true})
            this.canFlipGravity = true;
            this.lives -= 1;
            this.livesText.setText('Lives Left: ' + this.lives);
        } else {
            this.blade.stop();
            this.bkgSound.stop();
            this.hit.play();
            hero.body.gravity.y = gameOptions.playerGravity;
            hero.flipY = this.hero.body.gravity.y < 0
            hero.setPosition(75, 2110);
            this.cursors.right.isDown = null;
            this.cursors.left.isDown = null;
            this.cursors.right.enabled = false;
            this.cursors.left.enabled = false;
            this.spaceKey.enabled = false;
            hero.enabledBody = false;
            hero.anims.play('deathAnim')
            hero.on('animationcomplete', () => {this.scene.start('deathScene')})
            
        }
        return false;
    }

    //finish line collision
    finishOrb(hero,fin){
        fin.destroy(fin.x,fin.y);
        this.scene.start('endScene', {score: this.score});
        return false;

    }

    //collectibles collision
    collectCryst(hero,crys){
        console.log('active');
        this.crystalCollection.play();
        crys.destroy(crys.x,crys.y);
        this.score += 1;
        this.scoreText.setText('Crystals: ' + this.score + '/50');
        return false;
    }

    update() {

        //char movement
        this.hero.body.velocity.y = Phaser.Math.Clamp(this.hero.body.velocity.y, -800, 800);
        this.hero.body.velocity.x = this.cursors.left.isDown ? (this.cursors.right.isDown ? 0 : -1 * gameOptions.playerSpeed) : (this.cursors.right.isDown ? gameOptions.playerSpeed : 0);
        this.physics.world.collide(this.hero, this.layer, function(hero, layer){
            if(hero.body.blocked.down || hero.body.blocked.up){
                this.canFlipGravity = true;
            }
        }, null, this);

      
        if (this.cursors.right.isDown){
            this.hero.play('walkRight',true);
            this.cursors.right.on('up', () =>
                this.hero.play('idle'),        
            );
        }
        else if(this.cursors.left.isDown){
            this.hero.play('walkLeft',true);
            this.cursors.left.on('up', () =>
                this.hero.play('idleLeft'),
            );
        } 
    
    }
}
