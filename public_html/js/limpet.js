/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* global environment, ship, context, canvas, landscape, images, particle_type, audio_enemy, current_state, game_state, audio_explosion, limpet_1, limpet_2, limpet_3, limpet_4, game, reactor */

var limpet = {
    width   : 20,
    height  : 14
};
var limpet_config;
var limpets = [];

function limpet_init() {

    limpet_config = 
    [
        {},
        { img: images.limpet_1, x_offset: +14, y_offset: - 1, angle_min:   0, angle_max:  90 },
        { img: images.limpet_2, x_offset: + 4, y_offset: - 1, angle_min:  90, angle_max: 180 },
        { img: images.limpet_3, x_offset: + 4, y_offset: +13, angle_min: 180, angle_max: 270 },
        { img: images.limpet_4, x_offset: +14, y_offset: +13, angle_min: 270, angle_max: 360 }
    ];

    limpets = [];
        
}

function limpet_update() {

    var i, x, y, min, max;
    
    if ( current_state === game_state.PLAYING ) {
        
        for ( i = 0; i < limpets.length; i++ ) {

            if ( Math.floor( Math.random() * 255 ) < 5 && !reactor.damage ) {
                
                audio_enemy.play();
                
                // work out position and angle-range for projectile
                x   = limpet_config[ limpets[i].direction ].x_offset;
                y   = limpet_config[ limpets[i].direction ].y_offset;
                min = limpet_config[ limpets[i].direction ].angle_min;
                max = limpet_config[ limpets[i].direction ].angle_max;
                
                particle_register( 1, particle_type.ENEMY_MISSILE, limpets[i].current.x + x, limpets[i].current.y + y, min, max );
                return;
                
            }

        }

    }
    
    limpet_screen_coords();

}

function limpet_screen_coords() {
    
    var i;
    
    for ( i = 0; i < limpets.length; i++ ) {

        limpets[i].screen.x = limpets[i].current.x - landscape.x;
        limpets[i].screen.y = limpets[i].current.y - landscape.y;

        // calculate screen position, account for potential horizontal wrapping
        if ( limpets[i].screen.x < 0 ) {
            limpets[i].screen.x += canvas.width * landscape.screens;
        } else if ( limpets[i].screen.x >= canvas.width * landscape.screens ) {
            limpets[i].screen.x += canvas.width * landscape.screens;
        }    

    }

}

function limpet_render() {

    var i;
    
    for ( i = 0; i < limpets.length; i++ ) {
        context.drawImage( limpet_config[ limpets[i].direction ].img, limpets[i].screen.x,limpets[i].screen.y );
    }
        
}


/**
 * 
 * x and y supplied are world co-ordinates
 * 
 * @param {type} x
 * @param {type} y
 * @param {type} type
 * @returns {undefined}
 * 
 */
function limpet_bounds_check( x, y, type ) {
    
    var i;
    
    x = Math.floor( x );
    y = Math.floor( y );
    
    for ( i = 0; i < limpets.length; i++ ) {
        
        if ( x >= limpets[i].current.x-1 && x <= limpets[i].current.x + limpet.width+1 && y >= limpets[i].current.y-1 && y <= limpets[i].current.y + limpet.height+1 ) {

            // limpet hit (if it's a MISSILE)
            if ( type === particle_type.MISSILE ) {
                game.score += 750;
                audio_explosion.play();
                particle_register( 4, particle_type.GENERAL_PARTICLE, x, y, 0, 360 );
                limpets.splice(i, 1);
            }
            return true;

        }
        
    }
    
    return false;
    
}