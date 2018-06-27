var Game = {
    audioController: true,
    bomb: [],
    clicked: 3,
    currentList: [],
    difficulty: 0,
    gameScreen: document.getElementById('game-screen'),
    lifes: 3,
    map: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    over: false,
    score: 0,
    speed: 0,

    boot: () => {
        Game.difficultyLIST ();
        Game.generateMAP ();
        Game.generateCURRENT ();
        Game.generateHTML ();
        Game.generateHIGHSCORE ();
        Game.lifeUPDATE ();
    },

    startTIMER: () => {
        let timer = new Timer ({
            ontick: ( ms ) => { 
                let time = (Math.round (ms / 1000)) - 1;

                $('#time').html (time);
            },
            onend: () => { 
                $('#fullscreen').hide(300);
                $('#page').removeClass('blur');

                $('#time').hide();

                Game.tileCLICK (); 
            }
        });

        timer.start(5);
    },

    difficultyLIST: () => {
        let list = ['Facil', 'Medio', 'Dificil'];
        if ( localStorage.getItem ('difficulty') === null ) {
            localStorage.setItem ('difficulty', 0);
        }
        
        Game.difficulty = localStorage.getItem ('difficulty');

        $('#difficulty').html ( 'Dificuldade: ' + list[Game.difficulty] );
        $('#dificuldade').html ( list[Game.difficulty] );
    },

    generateHIGHSCORE: () => {
        if ( localStorage.getItem ('highscore-' + Game.difficulty) !== null ) {
            $('#highscore').html ('Highscore: ' + localStorage.getItem ('highscore-' + Game.difficulty));
        } else {
            localStorage.setItem ('highscore-' + Game.difficulty, 0);
        }
    },

    generateHTML: () => {
        let map = Game.map;

        for ( var i = 0; i < 4; i++ ) {
            for ( var j = 0; j < 4; j++ ) {
                let mapped = map[i][j];
                let id = i + '-' + j;

                if ( mapped == 1 ) {
                    if ( Game.currentList[3] == id ) {          
                        Game.gameScreen.innerHTML  += Game.sheet (true, id, true);
                    } else {
                        Game.gameScreen.innerHTML  += Game.sheet (true, id);
                    }
                } else {
                    Game.gameScreen.innerHTML  += Game.sheet (false, id);
                }
            }
        }
    },

    generateMAP: () => {
        for ( var i = 0; i < 4; i++ ) {
            let rand = Game.random ();

            for ( var j = 0; j < 4; j++ ) {
                if ( rand == j ) {
                    Game.map[i][j] = 1;
                }
            }
        }
    },

    generateCURRENT: () => {
        Game.currentList = [];
        for ( var i = 0; i < 4; i++ ) {
            for ( var j = 0; j < 4; j++ ) {
                let current = Game.map[i][j];
                
                if (current == 1) {
                    Game.currentList.push ( i + '-' + j );
                }
            }
        }
    },

    updateMAP: () => {
        let rand = Game.random ();
        
        for ( var i = 4; i > 0; i-- ) {
            Game.map[i] = Game.map[i - 1];
        }

        Game.map[0] = [0, 0, 0, 0];
        Game.map[0][rand] = 1;

        Game.gameScreen.innerHTML = '';
        Game.generateCURRENT ();
        Game.generateHTML ();
    },
    
    scoreUPDATE: () => {
        $('#score').text ( 'Pontos: ' + Game.score );
    },

    lifeUPDATE: () => {
        let el = document.getElementById ('life-container');

        el.innerHTML = '';

        for ( var i = 0; i < 3; i++ ) {
            if ( i > (Game.lifes - 1) ) {
                el.innerHTML += '<img src="assets/image/life.png" class="lost">';
            } else {
                el.innerHTML += '<img src="assets/image/life.png">';
            }
        }
    },

    sheet: ( controller = false, data = '0-0', current = false ) => {
        let cont = 'tile';

        if ( controller ) {
            if ( current == false ) {
                cont = 'tile selected';
            } else {
                cont = 'tile selected current';
            }
        }
        
        return '<div class="'+ cont +'" id="'+ data +'"></div>';
    },

    audio: ( val = '3/0' ) => {
        if ( Game.audioController ) {
            let path = 'assets/sound/' + val.replace ('-', '/') + '.wav';
            let audio = new Audio( path );
            
            audio.play();
        }
    },

    gameOVER: () => {
        Game.lifes--;
        Game.lifeUPDATE ();
                    
        if ( Game.lifes == 0 ) { 
            Game.over = true; 
            
            if ( Game.score > localStorage.getItem ('highscore-' + Game.difficulty) ) {
                localStorage.setItem ('highscore-' + Game.difficulty, Game.score);

                $('#new-highscore').show ();
            }
            

            $('#pontos').html ( Game.score );
            $('#maior').html ( localStorage.getItem ('highscore-' + Game.difficulty) );
            $('#time').html ('3');

            $('#page').addClass('blur');
            $('#fullscreen').show(300);
            $('#game-over').show(300);
        }

        Game.audio ( 'error/error' );
    },
    
    tileCLICK: () => {
        let controller = false;

        $(document).on('click', '.tile', function(e) {
            if ( !Game.over ) {
                let id = $(this).attr('id');
                let cl = $(this).attr('class');

                if ( cl == 'tile selected current' ) {
                    if ( id.split('-')[0] == 3 ) {
                        let next = '#' + Game.currentList[Game.clicked];
                        let audio = 'keys/' + id;

                        $(this).removeClass('current');
                        $(this).addClass('clicked');

                        $(next).addClass('current');
                        
                        controller = true;

                        Game.score++;
                        Game.scoreUPDATE ();

                        Game.audio ( audio );
                    }
                } else if ( cl == 'tile' || cl == 'tile selected' || cl == 'tile selected clicked' ) {
                    $('#' + id).addClass ('error');
                    controller = true;
                    Game.gameOVER ();
                }
            }
        });

        let intervalRun = function () {
            if ( !Game.over ) {
                Game.updateMAP ();

                Game.clicked--;
                if ( Game.clicked < 0 ) Game.clicked = 3;
                
                if ( !controller ) {
                    Game.gameOVER ();
                } else {
                    controller = false;
                    
                    if ( Game.score % 5 == 0 ) {
                        Game.speedINCREMENT ();
                    }
                }

                setTimeout (intervalRun, 1000 - Game.speed * 100);
            }
        }

        setTimeout (intervalRun, 1000 - Game.speed * 100);
    },

    speedINCREMENT: () => {
        if ( Game.difficulty == 0 ) {
            if ( Game.speed <= 4.9 ) {
                Game.speed += 0.1;
            }
        } else if ( Game.difficulty == 1) {
            if ( Game.speed <= 5 ) {
                Game.speed += 0.25;
            } else if ( Game.speed <= 5.5 ) {
                Game.speed += 0.05;
            }
        } else {
            if ( Game.speed <= 5 ) {
                Game.speed += 0.5;
            } else if ( Game.speed <= 5.5 ) {
                Game.speed += 0.1;
            }
        }
    },

    random: () => {
        return Math.floor ( Math.random () * 4 );
    }
}