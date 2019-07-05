/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* global environment, ship, context, canvas, landscape, mySound, sound, audio_missile, audio_explosion */

var particle_type = { MISSILE: 1, ENEMY_MISSILE: 2, GENERAL_PARTICLE: 3, SMOKE: 4 };
var particles = [];

function particle_init() {

    particles = [];

}

function particle_register( count, type, x, y, min_rotation, max_rotation ) {
    
    var colour, speed, timeout, i;

    switch ( type ) {

        case particle_type.MISSILE :
            colour  = '#00ff00';
            speed   = 100;
            timeout = 2000;
            break;

        case particle_type.ENEMY_MISSILE :
            colour  = '#ff0000';
            timeout = 3000;
            break;

        case particle_type.SMOKE :
            colour  = '#00ff00';
            speed   = 25;
            timeout = 500;
            break;

    }
    
    for ( i = 1; i <= count; i++ ) {

        switch ( type ) {

            case particle_type.ENEMY_MISSILE :
                speed   = 100;
                break;

            case particle_type.GENERAL_PARTICLE :
                colour  = (Math.random()>0.5) ? '#ffff00' : '#00ff00';
                speed   = 50 + Math.random() * 50;
                timeout = 1000 + Math.random() * 500;
                break;

        }

        // rotation
        rotation = min_rotation + Math.random() * ( max_rotation - min_rotation );
        if ( rotation < min_rotation ) { rotation = min_rotation; }
        if ( rotation > max_rotation ) { rotation = max_rotation; }
        particles.push( { type: type, x: x, y: y, colour: colour, rotation: rotation, speed: speed, timeout: timeout } );

    }

}

function particle_update() {

    var i = 0;
    
    while ( i < particles.length ) {
        
        particles[i].timeout -= environment.refresh_rate;
        if ( particles[i].timeout <= 0 ) {
            particles.splice(i, 1);
        }
        else {
            particles[i].x += ( particles[i].speed * (environment.refresh_rate / 1000) ) * Math.cos( particles[i].rotation * Math.PI / 180 );
            particles[i].y -= ( particles[i].speed * (environment.refresh_rate / 1000) ) * Math.sin( particles[i].rotation * Math.PI / 180 );
            particles[i].y += environment.gravity * (environment.refresh_rate / 1000);
        }
        
        i++;
        
    }
    
}

function particle_render( particle_type ) {
    
    var i = 0;
    var screen_x, screen_y;

    while ( i < particles.length ) {
        
        if ( particles[i].type === particle_type || particle_type === undefined ) {
            
            screen_x = particles[i].x - landscape.x;
            screen_y = particles[i].y - landscape.y;
            if ( screen_x < 0 ) { screen_x += canvas.width * landscape.screens; }

            context.fillStyle = particles[i].colour;
            context.fillRect( screen_x, screen_y, 2,2 );
            
        }
        
        i++;
        
    }
}

function particle_render_missile() {
    
    particle_render( particle_type.MISSILE );

}

function particle_render_enemy_missile() {
    
    particle_render( particle_type.ENEMY_MISSILE );

}

function particle_render_general_particle() {
    
    particle_render( particle_type.GENERAL_PARTICLE );

}

function particle_render_smoke() {
    
    particle_render( particle_type.SMOKE );

}

function particle_count( type ) {
    
    var count = 0;
    var i = 0;

    while ( i < particles.length ) {
        if ( particles[i].type === type ) {
            count++;
        }
        i++;
    }
    
    return count;
    
}

/**
 * 
 * checks MISSILE particles specifically to see if they have just hit something on screen, 
 * using pixel-based collision detection. if detected, boundary checks can then be run against 
 * the various possible things that may have collided as Thrust works in such a way that objects 
 * don't overlap in terms of basic bounding boxes, so this is a nice cheap solution.
 * 
 * @param {type} type
 * @returns {undefined}
 * 
 */
function particle_missile_collision_check( type ) {
    
    var i = 0;
    
    while ( i < particles.length ) {
        
        // only interested in particle types that are capable of 'colliding'
        if ( particles[i].type === type ) {

            screen_x = particles[i].x - landscape.x;
            screen_y = particles[i].y - landscape.y;
            if ( screen_x < 0 ) { screen_x += canvas.width * landscape.screens; }
        
            // did you hit the ball whilst carrying it?
            if ( ship.carrying ) {
                ball_bounds_check( particles[i].x, particles[i].y );
            }
            
            /**
             * cheap collision detection (including off-screen checks)
             * if the pixel is on-screen, do the pixel-based check
             * otherwise just do the boundary check
             */
            var hit_something = false;
            if ( screen_x >= 0 && screen_x < canvas.width && screen_y >= 0 && screen_y < canvas.height ) {
                // on-screen checks
                if ( graphics_point_check( screen_x, screen_y ) || graphics_point_check( screen_x+1, screen_y+1 ) ) {
                    hit_something = true;
                    reactor_bounds_check( particles[i].x, particles[i].y, particles[i].type );
                    fuel_bounds_check( particles[i].x, particles[i].y, particles[i].type );
                    limpet_bounds_check( particles[i].x, particles[i].y, particles[i].type );
                    door_bounds_check( particles[i].x, particles[i].y, particles[i].type );
                }
            } else {
                // off-screen checks
                hit_something = 
                    reactor_bounds_check(   particles[i].x, particles[i].y, particles[i].type ) ||
                    fuel_bounds_check(      particles[i].x, particles[i].y, particles[i].type ) ||
                    limpet_bounds_check(    particles[i].x, particles[i].y, particles[i].type ) ||
                    door_bounds_check(      particles[i].x, particles[i].y, particles[i].type );
            }
            
            if ( hit_something ) {
                // kill off the particle
                particles.splice(i, 1);
            }
            
        }
        
        i++;
        
    }
    
}
