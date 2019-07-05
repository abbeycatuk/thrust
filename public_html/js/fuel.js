/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* global environment, ship, context, canvas, landscape, images, audio_beepbeep, audio_explosion, particle_type, game */

var fuel = {
    width          : 16,
    height         : 14,
    capacity       : 375 /* fuel to load*/
};
var pods = [];

function fuel_init() {

    pods = [];
    
}

function fuel_screen_coords() {
    
    var i;
    
    for ( i = 0; i < pods.length; i++ ) {

        pods[i].screen.x = pods[i].current.x - landscape.x;
        pods[i].screen.y = pods[i].current.y - landscape.y;

        // calculate screen position, account for potential horizontal wrapping
        if ( pods[i].screen.x < 0 ) {
            pods[i].screen.x += canvas.width * landscape.screens;
        } else if ( pods[i].screen.x >= canvas.width * landscape.screens ) {
            pods[i].screen.x += canvas.width * landscape.screens;
        }    

    }

}

function fuel_render() {

    var i;
    
    for ( i = 0; i < pods.length; i++ ) {
        // only render and check for fuel drain if its fuelled up
        if ( pods[i].remaining ) {
            context.drawImage( images.fuel, pods[i].screen.x, pods[i].screen.y );
        }
        
    }
    
}

function fuel_update() {
    
    fuel_screen_coords();

}

function fuel_drain_check() {

    var i, x, y, r;
    
    if ( !ship.shielding ) {
        return;
    }
    
    for ( i = 0; i < pods.length; i++ ) {
        
        // only render and check for fuel drain if its fuelled up
        if ( pods[i].remaining ) {
            
            if ( Math.abs(ship.current.x - pods[i].current.x) < fuel.width ) {
                if ( pods[i].current.y - ship.current.y < 40 && pods[i].current.y - ship.current.y > 0 ) {

                    // sapping (each pod contains 375 units of fuel, delivered over 1 second)
                    pods[i].remaining -= 375 * (environment.refresh_rate / 1000);
                    game.fuel += 375 * (environment.refresh_rate / 1000);
                    if ( pods[i].remaining <= 0 ) {
                        audio_beepbeep.play();
                        pods.splice( i--, 1 );
                    } else {
                        // flickering lines to visualise fuel being drained from the pod
                        if ( ( pods[i].remaining % 100 ) < 50 ) {
                            context.strokeStyle = '#ffff00';
                            context.beginPath();
                            var r = ship.radius * environment.scaling * 1.5;
                            x = ship.screen.x + r * Math.cos( ( 225 ) * Math.PI / 180 );
                            y = ship.screen.y - r * Math.sin( ( 225 ) * Math.PI / 180 );
                            context.moveTo( x   , y    );
                            context.lineTo( x-10, y+30 );
                            x = ship.screen.x + r * Math.cos( ( 315 ) * Math.PI / 180 );
                            context.moveTo( x   , y    );
                            context.lineTo( x+10, y+30 );
                            context.stroke();
                        }
                    }

                }
            }
        
        }
        
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
function fuel_bounds_check( x, y, type ) {
    
    var i;
    
    x = Math.floor( x );
    y = Math.floor( y );
    
    for ( i = 0; i < pods.length; i++ ) {
    
        if ( x >= pods[i].current.x-1 && x <= pods[i].current.x + fuel.width+1 && y >= pods[i].current.y-1 && y <= pods[i].current.y + fuel.height+1 ) {

            // fuel hit (if it's a MISSILE)
            if ( type === particle_type.MISSILE ) {
                game.score += 150;
                audio_explosion.play();
                particle_register( 4, particle_type.GENERAL_PARTICLE, x, y, 0, 360 );
                pods.splice(i, 1);
            }
            return true;
            
        }
        
    }
    
    return false;
    
}