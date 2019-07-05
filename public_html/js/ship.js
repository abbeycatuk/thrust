/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* global environment, context, canvas, landscape, particle_type, audio_missile, game, audio_thrust, audio_shield */

var ship = {
    current         : { x: 0, y: 0 },
    previous        : { x: 0, y: 0 },
    radius          : 0,
    mass            : 0,
    rotation        : 0,
    rotation_rate   : 0,
    rotating        : 0,
    thrusting       : false,
    thrust          : 0,
    screen          : { x: 0, y: 0},
    screen_p1       : { x: 0, y: 0},
    screen_p2       : { x: 0, y: 0},
    screen_p3       : { x: 0, y: 0},
    crashed         : true,
    max_speed       : 6,
    shielding       : false,
    shield_counter  : 0,
    carrying        : false
};

function ship_init() {

    ship.rotation       = 90;                           /* degrees */
    ship.radius         = 1;                            /* metres */
    ship.rotation_rate  = 360/environment.fps;          /* complete rotation in 1 second */
    ship.rotating       = 0;
    ship.thrusting      = false;
    ship.thrust         = environment.gravity * 10;     /* power */
    ship.mass           = 1.0;                          /* kg */
    ship.crashed        = false;
    ship.shielding      = false;
    ship.shield_display = 0;
    ship.carrying       = false;

}

function ship_update() {

    var depleting;
    
    ship_rotate();
    ship_move();
    ship_screen_coords();
    
    depleting = 0;
    
    if ( ship.shielding && game.fuel ) {
        ship.shield_display = !ship.shield_display;
        depleting++;
    }

    if ( ship.thrusting && game.fuel ) {
        depleting++;
    }
    
    if ( depleting ) {
        game.fuel -= ( 12 * depleting ) * ( environment.refresh_rate / 1000 );
        if ( game.fuel < 0 )
        {
            audio_thrust.stop();
            audio_shield.stop();
            game.fuel = 0;
        }
        
    }
    
}

function ship_rotate() {

    ship.rotation += ship.rotating * ship.rotation_rate;
    ship.rotation = ship.rotation < 0 ? ship.rotation + 360 : ship.rotation >= 360 ? ship.rotation - 360 : ship.rotation;

}

function ship_move() {

    var dx,dy;
    
    // determine dx,dy based on previous vs current position (gives current velocity)
    dx = ship.current.x - ship.previous.x;
    dy = ship.current.y - ship.previous.y;

    // limit horizontal speed (vertical doesn't matter - you crash, or leave!)
    dx = dx > ship.max_speed ? ship.max_speed : dx < -ship.max_speed ? -ship.max_speed : dx;

    // calculate next position: velocity, gravity, thrust
    var next_x, next_y;
    next_x = ship.current.x + dx * environment.friction;
    next_y = ship.current.y + dy * environment.friction;
    next_y += ship.mass * environment.gravity * (environment.refresh_rate / 1000);
    if ( ship.thrusting ) {
        var v = ship.thrust * ( environment.refresh_rate / 1000 );
        next_x += v * Math.cos( ship.rotation * Math.PI / 180 );
        next_y -= v * Math.sin( ship.rotation * Math.PI / 180 );
    }
    
    // evolve position history
    ship.previous.x = ship.current.x;
    ship.previous.y = ship.current.y;
    ship.current.x = next_x;
    ship.current.y = next_y;

}

function ship_screen_coords() {
    
    var ship_x, ship_y, ship_r;

    // calculate screen position, account for potential horizontal wrapping
    ship_x = ship.current.x - landscape.x;
    ship_y = ship.current.y - landscape.y;
    if ( ship_x < 0 ) {
        ship_x += canvas.width * landscape.screens;
    } else if ( ship_x >= canvas.width * landscape.screens ) {
        ship_x += canvas.width * landscape.screens;
    }
    
    ship.screen.x = ship_x;
    ship.screen.y = ship_y;

    // get ready for collision/rendering
    ship_r = ship.radius * environment.scaling;
    ship.screen_p1.x = ship_x + ship_r * Math.cos( ( ship.rotation        ) * Math.PI / 180 );
    ship.screen_p1.y = ship_y - ship_r * Math.sin( ( ship.rotation        ) * Math.PI / 180 );
    ship.screen_p2.x = ship_x + ship_r * Math.cos( ( ship.rotation +  135 ) * Math.PI / 180 );
    ship.screen_p2.y = ship_y - ship_r * Math.sin( ( ship.rotation +  135 ) * Math.PI / 180 );
    ship.screen_p3.x = ship_x + ship_r * Math.cos( ( ship.rotation +  225 ) * Math.PI / 180 );
    ship.screen_p3.y = ship_y - ship_r * Math.sin( ( ship.rotation +  225 ) * Math.PI / 180 );

}

function ship_collision_check() {
    
    if ( graphics_line_check( ship.screen_p1.x, ship.screen_p1.y , ship.screen_p2.x, ship.screen_p2.y ) ||
         graphics_line_check( ship.screen_p2.x, ship.screen_p2.y , ship.screen_p3.x, ship.screen_p3.y ) ||
         graphics_line_check( ship.screen_p3.x, ship.screen_p3.y , ship.screen_p1.x, ship.screen_p1.y ) ) {
         ship.crashed = true;
    }
    
}

function ship_render() {

    // if shields are activated, toggle between ship and circle
    if ( ship.shielding && ship.shield_display ) {
        context.strokeStyle = '#ff0000';
        context.beginPath();
        context.arc( ship.screen.x, ship.screen.y, ship.radius * environment.scaling, 0, 2 * Math.PI, false );
        context.stroke();
    } else {
        context.strokeStyle = '#ffff00';
        context.beginPath();
        context.moveTo( ship.screen_p1.x, ship.screen_p1.y );
        context.lineTo( ship.screen_p2.x, ship.screen_p2.y );
        context.lineTo( ship.screen_p3.x, ship.screen_p3.y );
        context.lineTo( ship.screen_p1.x, ship.screen_p1.y );
        context.stroke();
    }

}

function ship_fire() {

    if ( particle_count( particle_type.MISSILE ) < 4 ) {
    
        audio_missile.play();
        particle_register( 
            1, 
            particle_type.MISSILE, 
            ship.current.x + ( ship.radius * environment.scaling ) * Math.cos( ship.rotation * Math.PI / 180 ), 
            ship.current.y - ( ship.radius * environment.scaling ) * Math.sin( ship.rotation * Math.PI / 180 ), 
            ship.rotation,
            ship.rotation
        );
    
    }
        
}