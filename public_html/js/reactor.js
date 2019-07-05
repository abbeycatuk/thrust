/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* global environment, ship, context, canvas, landscape, images, particle_type, audio_explosion, audio_bing, audio_countdown */

var reactor = {
    current     : { x: 0, y: 0 },
    screen      : { x: 0, y: 0 },
    width       : 20,
    height      : 28,
    smoke_timer : 0,
    damage      : 0,
    critical    : false,
    exploded    : false,
    countdown   : 0
    
};

function reactor_init() {

    reactor.smoke_timer = 0;
    reactor.damage      = 0;
    reactor.critical    = false;
    reactor.exploded    = false;
    reactor.countdown   = 0;
    
}

function reactor_screen_coords() {
    
    reactor.screen.x = reactor.current.x - landscape.x;
    reactor.screen.y = reactor.current.y - landscape.y;
    
    // calculate screen position, account for potential horizontal wrapping
    if ( reactor.screen.x < 0 ) {
        reactor.screen.x += canvas.width * landscape.screens;
    } else if ( reactor.screen.x >= canvas.width * landscape.screens ) {
        reactor.screen.x += canvas.width * landscape.screens;
    }    

}

function reactor_render() {

    reactor_screen_coords();
    
    // if on countdown, the reactor only periodically appears
    if ( !reactor.critical || reactor.countdown % 1000 < 500 ) {
        context.drawImage( images.reactor, reactor.screen.x, reactor.screen.y );
        particle_render( particle_type.SMOKE );
    }

}


function reactor_update() {
    
    var s1,s2;
    
    reactor.damage -= environment.refresh_rate;
    if ( reactor.damage < 0 ) {
        reactor.damage = 0;
    }
    
    // smoke emanates only if the reactor is healthy
    if ( !reactor.damage && !reactor.critical && !reactor.exploded ) {
        reactor.smoke_timer += environment.refresh_rate;
        if ( reactor.smoke_timer > 400 ) {
            reactor.smoke_timer -= 400;
            particle_register( 1, particle_type.SMOKE, reactor.current.x+16, reactor.current.y+8, 90, 90 );
        }
    }
    
    if ( reactor.critical ) {
        s1 = Math.floor( reactor.countdown / 1000 );
        reactor.countdown -= environment.refresh_rate;
        s2 = Math.floor( reactor.countdown / 1000 );
        if ( s2 !== s1 ) {
            audio_countdown.play();
        }
        if ( reactor.countdown <= 0 ) {
            // no longer critical, but leave damage as non-zero (so smoke doesn't appear as we exit the level)
            ship.crashed        = true;
            reactor.critical    = false;
            reactor.exploded    = true;
            reactor.damage      = 1;
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
function reactor_bounds_check( x, y, type ) {
    
    var hit;
    
    x = Math.floor( x );
    y = Math.floor( y );
    
    hit = ( x >= reactor.current.x-1 && x <= reactor.current.x + reactor.width+1 && y >= reactor.current.y-1 && y <= reactor.current.y + reactor.height+1 );

    // only interested in reacting to the hit providing the reactor isn't *already* on countdown
    if ( hit && type === particle_type.MISSILE && !reactor.critical ) {

        audio_explosion.play();
        
        particle_register( 4, particle_type.GENERAL_PARTICLE, x, y, 0, 360 );

        // either initiate, or apply a relative increase to, damage
        reactor.damage = ( !reactor.damage ) ? 1000 : Math.floor( reactor.damage * 3/2 );
        if ( reactor.damage > 15000 ) {
            reactor.critical    = true;
            reactor.countdown   = 10000; /* ms */
        }
                
        
    }

    return hit;
    
}