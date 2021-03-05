export default class deathScene extends Phaser.Scene{
    constructor(){
        super('deathScene');
    }

    preload(){

        this.load.audio('onDeath','./assets/sounds/loseAllLife.wav')

    }

    create(){
        let gameOver = this.sound.add('onDeath')
        let musicConfig = {
            mute: false,
            volume: 0.7,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: false,
            delay: 0
        }
        gameOver.play(musicConfig);
        this.cameras.main.fadeIn(1000, 0, 0, 0)
        this.add.text(240,300, 'You ran out of lives', {fontSize: '60px', fontStyle: 'bold', fill: '#ffffff'});
        let main = this.add.text(280, 500, 'Main Menu', {fontSize: '40px', fill: '#ff0033'});
        main.setInteractive({useHandCursor:true});
        main.on('pointerdown', ()=> this.menuButton());
        let restart = this.add.text(760,500,'Restart', {fontSize:'40px', fill:'#ff0033'});
        restart.setInteractive({useHandCursor:true});
        restart.on('pointerdown',() => this.restartButton());


    }

    menuButton(){
        console.log("Loading Main Menu...");
        this.scene.start('menuScene');
    }

    restartButton(){
        console.log("Restarting...");
        this.scene.start('gameScene');
    }
        
    }
