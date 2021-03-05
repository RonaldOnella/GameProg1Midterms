export default class menuScene extends Phaser.Scene {

    constructor(){
        super('menuScene');
    }

    preload(){
        this.load.image('backg', './assets/images/menubkg.png')

    }

    create(){
        this.cameras.main.fadeIn(1000, 0, 0, 0)
        let bkg = this.add.image(0,0,'backg')
        bkg.setDepth(-1);
        bkg.setOrigin(0);
        let start = this.add.text(700,500, 'Start Game', {fontSize: '40px', fill: '#FF0000'});
        this.add.text(350,250, 'Collector Blob',{fontSize:'60px',stroke: '#fff', strokeThickness: 3,  fontStyle: 'bold', fill: '#0000FF'});
        this.add.text(640,550, 'Movement: <- ->',{fontSize:'40px'});
        this.add.text(480,600, 'Space:', {fontSize:'40px'});
        this.add.text(630,600, 'Change Gravity Up/Down', {fontSize:'40px'});
        start.setInteractive({useHandCursor: true});
        start.on('pointerdown', () => this.startButton());
    }

    startButton(){
        console.log("Game Start!");
        this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.scene.start('gameScene');
        

    }




}