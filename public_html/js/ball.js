/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* global environment, ship, context, canvas, landscape, images */

var ball = {
    current         : { x: 0, y: 0 },
    previous        : { x: 0, y: 0 },
    radius          : 0,
    mass            : 0,
    screen          : { x: 0, y: 0 },
    stand           : { width: 9, height: 8 },
    attracted       : false
};

function ball_init() {

    ball.radius         = 0.9;                          /* metres */
    ball.mass           = 1.3;                          /* kg */
    ball.attracted      = false;
    
}

function ball_move() {

    // determine dx,dy based on previous vs current position (gives current velocity)
    var dx,dy;
    dx = ball.current.x - ball.previous.x;
    dy = ball.current.y - ball.previous.y;

    // calculate next position: velocity, gravity
    var next_x, next_y;
    next_x = ball.current.x + dx * environment.friction;
    next_y = ball.current.y + dy * environment.friction;
    next_y += ball.mass * environment.gravity * ( environment.refresh_rate / 1000 );

    // evolve position history
    ball.previous.x = ball.current.x;
    ball.previous.y = ball.current.y;
    ball.current.x = next_x;
    ball.current.y = next_y;
    
}

function ball_update() {

    if ( ship.carrying ) {
        ball_move();    
    }
    ball_screen_coords();

}

function ball_screen_coords() {
    
    ball.screen.x = ball.current.x - landscape.x;
    ball.screen.y = ball.current.y - landscape.y;
    
    // calculate screen position, account for potential horizontal wrapping
    if ( ball.screen.x < 0 ) {
        ball.screen.x += canvas.width * landscape.screens;
    } else if ( ball.screen.x >= canvas.width * landscape.screens ) {
        ball.screen.x += canvas.width * landscape.screens;
    }    

}

function ball_render() {

    context.strokeStyle = '#00ff00';
    context.beginPath();
    context.arc( ball.screen.x, ball.screen.y, ball.radius * environment.scaling, 0, 2 * Math.PI, false );
    context.stroke();
    
    if ( !ship.carrying ) {
        var x,y;
        x = ball.screen.x - ((ball.stand.width /2) );
        y = ball.screen.y + ((ball.stand.height/2) + environment.scaling / 2 );
        context.drawImage( images.stand, x,y );
    }

}


function ball_collision_check() {
    
    // only interested in the ball colliding with things if it's being carried
    if ( ship.carrying ) {
        if ( graphics_circle_check( ball.screen.x, ball.screen.y, ball.radius * environment.scaling ) ) {
            ship.crashed = true;
        }
    }
    
}

/**
 * 
 * x and y supplied are world co-ordinates
 * 
 * @param {type} x
 * @param {type} y
 * @returns {undefined}
 * 
 */
function ball_bounds_check( x, y ) {
    
    var i,r;
    
    r = ship.radius * environment.scaling;
    
    if ( x >= ball.current.x - r && x <= ball.current.x + r && y >= ball.current.y - r && y <= ball.current.y + r ) {
        ship.crashed = true;
        return true;
    }

    return false;
    
}