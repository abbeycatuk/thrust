/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

var audio_missile;
var audio_thrust;
var audio_bing;
var audio_explosion;
var audio_countdown;
var audio_shield;
var audio_beepbeep;
var audio_enemy;

function audio_init() {

    audio_bing          = new Howl( { src: ['audio/bing.ogg',           'audio/bing.mp3'            ], loop: false } );
    audio_missile       = new Howl( { src: ['audio/missile.ogg',        'audio/missile.mp3'         ], loop: false } );
    audio_thrust        = new Howl( { src: ['audio/thrust.ogg',         'audio/thrust.mp3'          ], loop: true  } );
    audio_explosion     = new Howl( { src: ['audio/explosion.ogg',      'audio/explosion.mp3'       ], loop: false } );
    audio_countdown     = new Howl( { src: ['audio/countdown.ogg',      'audio/countdown.mp3'       ], loop: false } );
    audio_shield        = new Howl( { src: ['audio/shield.ogg',         'audio/shield.mp3'          ], loop: true  } );
    audio_beepbeep      = new Howl( { src: ['audio/beepbeep.ogg',       'audio/beepbeep.mp3'        ], loop: false } );
    audio_enemy         = new Howl( { src: ['audio/enemy.ogg',          'audio/enemy.mp3'           ], loop: false } );
    
}
