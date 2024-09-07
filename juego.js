var fondo;
var carro;
var cursores;
var enemigos;
var timer;

var gasolinas;
var timerGasolina;

var balas;
var tiempoBala = 0;
var botonDisparo;
var sonidoDisparos;

var sonidoFondo;

var vidas = 3;
var groupVidas;
var invulnerable = false;
var invulnerabilidadTimer;
var parpadeoTimer;
var visibidadCarro = true;

var textoFinJuego;

var textoPuntaje;
var textoNivel;
var puntaje = 0;
var nivel = 1;
var velocidadEnemigos = 200;



var Juego = {
    preload: function () {
        juego.load.image('bg','img/bg.png');
        juego.load.image('carro','img/carro.png');
        juego.load.image('carroMalo','img/carroMalo.png');
        juego.load.image('gasolina','img/gas.png');
        juego.load.image('bala','img/bala.png');
        juego.load.image('vida','img/vida.png');
        juego.load.spritesheet('explosion','img/explosion.png',32,32);
        juego.load.audio('sonidoDisparo','sonidos/DISPARO.mp3');
        juego.load.audio('sonidoFondo','sonidos/FONDO.mp3');
        juego.forceSingleUpdate = true;
    },

    create: function () {
        fondo = juego.add.tileSprite(0,0,290,540,'bg');

        carro = juego.add.sprite(juego.width/2,496,'carro');
        juego.physics.arcade.enable(carro,true);
        carro.anchor.setTo(0.5);

        // Reproducir sonido de fondo en bucle ##################
        sonidoFondo = juego.add.audio('sonidoFondo');
        sonidoFondo.loop = true;  // Hacer que el sonido se repita
        sonidoFondo.play();       // Reproducir el sonido
        // ######################################################

        //disparo#######################
        botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        balas=juego.add.group();
        balas.enableBody=true;
        balas.physicsBodyType = Phaser.Physics.ARCADE;
        balas.createMultiple(20,'bala');
        balas.setAll('anchor.x',0.5);
        balas.setAll('anchor.y',0.5);
        balas.setAll('outOfBoundsKill', true);
        balas.setAll('checkWorldBounds', true);
        //##############################

        // vidas########################
        groupVidas = juego.add.group();
        for (var i = 0; i < vidas; i++){
            var vida = juego.add.sprite(20 + (i*40), 10, 'vida');
            groupVidas.add(vida);
        }

        // #############################
        textoFinJuego = juego.add.text(juego.width/2,juego.height/2,'FIN DE JUEGO',{
            font: '32px Arial',
            fill: '#ff0000',
            align: 'center'
        });
        textoFinJuego.anchor.setTo(0.5);
        textoFinJuego.visible = false;
        // #############################
        textoPuntaje = juego.add.text(juego.width - 20, 20, 'Puntaje: 0', {
            font: '24px Arial',
            fill: '#ffffff',
            align: 'right'
        });
        textoPuntaje.anchor.setTo(1, 0);
        // ##############################
        textoNivel = juego.add.text(20, 70, 'Nivel: 1', {
            font: '24px Arial',
            fill: '#ffffff'
        });
        


        enemigos = juego.add.group();
        juego.physics.arcade.enable(enemigos,true);
        enemigos.enableBody = true;
        enemigos.createMultiple(20,'carroMalo');
        enemigos.setAll('anchor.x',0.5);
        enemigos.setAll('anchor.y',0.5);
        enemigos.setAll('outOfBoundsKill', true);
        enemigos.setAll('checkWorldBounds', true);

        gasolinas = juego.add.group();
        juego.physics.arcade.enable(gasolinas,true);
        gasolinas.enableBody = true;
        gasolinas.createMultiple(20,'gasolina');
        gasolinas.setAll('anchor.x',0.5);
        gasolinas.setAll('anchor.y',0.5);
        gasolinas.setAll('outOfBoundsKill', true);
        gasolinas.setAll('checkWorldBounds', true);


        sonidoDisparos = juego.add.audio('sonidoDisparo');

        timer = juego.time.events.loop(1500,this.createCarroMalo,this);
        timerGasolina = juego.time.events.loop(2000, this.createGasolina,this);

        cursores = juego.input.keyboard.createCursorKeys();
        
        
    },
    update: function () {
        fondo.tilePosition.y +=3;

        if (cursores.right.isDown && carro.position.x<245) {  
            carro.position.x += 5;
        }else if (cursores.left.isDown && carro.position.x>45) {
            carro.position.x -= 5;
        }

        //DISPARO##########################################
        var bala;
        if (botonDisparo.isDown) {
            if (juego.time.now>tiempoBala) {
                bala = balas.getFirstDead(false);
            }
            if (bala) {
                bala.reset(carro.x,carro.y);
                bala.body.velocity.y = -300;
                tiempoBala = juego.time.now + 100;
                sonidoDisparos.play();
            }
        }
        //####################################################

        if (!invulnerable) {
            juego.physics.arcade.overlap(carro,gasolinas,this.perderVida,null,this);
            juego.physics.arcade.overlap(carro,enemigos,this.perderVida,null,this);
    
        }

        juego.physics.arcade.overlap(balas,enemigos,this.destruirEnemigo,null,this);
        juego.physics.arcade.overlap(balas,gasolinas,this.destruirGAS,null,this);

    },

    createCarroMalo: function () {
        var position = Math.floor(Math.random() *3) + 1;
        var enemigo = enemigos.getFirstDead();
        enemigo.physicsBodyType = Phaser.Physics.ARCADE;
        enemigo.reset(position*73,0);
        enemigo.body.velocity.y = velocidadEnemigos;
        enemigo.anchor.setTo(0.5);
    },

    createGasolina: function () {
        var position = Math.floor(Math.random() *3) + 1;
        var gasolina = gasolinas.getFirstDead();
        gasolina.physicsBodyType = Phaser.Physics.ARCADE;
        gasolina.reset(position*73,0);
        gasolina.body.velocity.y = velocidadEnemigos;
        gasolina.anchor.setTo(0.5);
    },

    destruirEnemigo: function (bala, enemigo) {
        bala.kill();
        enemigo.kill();

        this.actualizarPuntaje(10);
        this.verificarNivel();

    },
    destruirGAS: function (bala, gasolina) {
        gasolina.kill();
        bala.kill();
        

        // Crear animación de explosión
        var explosion = juego.add.sprite(gasolina.x, gasolina.y, 'explosion');
        explosion.anchor.setTo(0.5);
        var anim = explosion.animations.add('explota');
        anim.onComplete.add(function() {
            explosion.kill();
        }, this);
        explosion.animations.play('explota', 30, false);

        this.actualizarPuntaje(5);
        this.verificarNivel();
    },
    actualizarPuntaje: function (cantidad) {
      puntaje += cantidad;
      textoPuntaje.text = 'Puntaje: ' + puntaje;  
    },
    verificarNivel: function () {
        var nuevoNivel = Math.floor(puntaje / 100) + 1; // Calcular el nivel basado en el puntaje
        if (nuevoNivel > nivel) {
            nivel = nuevoNivel;
            textoNivel.text = 'Nivel: ' + nivel; // Actualizar el texto del nivel
            velocidadEnemigos += 50; // Aumentar la velocidad de los enemigos
        }
    },

    perderVida: function (carro, entidad) {
        entidad.kill();
        vidas--;
        if (vidas >= 0) {
            groupVidas.getAt(vidas).kill(); // Eliminar el sprite de vida
        }
        
        
        if (vidas <= 0) {
            // Finalizar el juego
            this.finJuego();
            //juego.state.start('gameOver'); // Asumiendo que tienes un estado 'gameOver'
        }else{
            invulnerable = true;
            parpadeoTimer = juego.time.events.loop(Phaser.Timer.SECOND * 0.1, this.parpadearCarro,this);
            juego.time.events.add(Phaser.Timer.SECOND * 3, this.quitarInvulnerabilidad,this);
        }
    },


    quitarInvulnerabilidad: function () {
        invulnerable = false;
        carro.visible = true;
        juego.time.events.remove(parpadeoTimer);
    },
    parpadearCarro: function() {
        visibidadCarro = !visibidadCarro;
        carro.visible = visibidadCarro;
    },

    finJuego: function () {
        textoFinJuego.visible = true; // Mostrar el texto de fin de juego
        carro.visible = false;
    }
    
    
    
};
