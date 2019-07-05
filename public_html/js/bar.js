/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* global environment, ship, context, ball, canvas, landscape, audio_beepbeep */

function bar_update() {

    var dx, dy, length, ratio, ship_wrapped, ball_wrapped, wrap_required;
    
    // determine (prior to any potential bar calculations) whether ship/ball require horizontal wrapping
    // (this logic is simple, yet subtle - get this wrong and exhibited behaviour can easily confuse)
    ship_wrapped = landscape_has_wrapped( ship.current.x );
    ball_wrapped = landscape_has_wrapped( ball.current.x );
    if ( ship.carrying ) {
        if ( ship_wrapped || ball_wrapped ) {
            wrap_required = ( ship_wrapped ) ? landscape_wrap_required( ship.current.x ) : landscape_wrap_required( ball.current.x );
            ship.current.x  += wrap_required;
            ship.previous.x += wrap_required;
            ball.current.x  += wrap_required;
            ball.previous.x += wrap_required;
        }
    } else if ( ship_wrapped ) {
        wrap_required = landscape_wrap_required( ship.current.x );
        ship.current.x  += wrap_required;
        ship.previous.x += wrap_required;
    }

    // what's the length of the actual (or potential) bar between ship and ball?
    dx = ship.current.x - ball.current.x;
    dy = ship.current.y - ball.current.y;
    length = Math.sqrt( dx*dx + dy*dy );

    if ( ship.carrying ) {
        // physics restricts length
        if ( length !== environment.bar_length ) {
            ratio = ( 1 - ( environment.bar_length / length ) ) / 2;
            ship.current.x -= dx * ratio;
            ship.current.y -= dy * ratio;
            ball.current.x += dx * ratio;
            ball.current.y += dy * ratio;
        }
    }
    else {
        // not carrying, but did we just pick it up?
        if ( ball.attracted && length >= environment.bar_length ) {
            audio_beepbeep.play();
            ship.carrying = true;
        }

    }

}

function bar_collision_check() {
    
    // only interested in the bar colliding with things if it's being carried
    if ( ship.carrying ) {
        if ( graphics_line_check( ball.screen.x, ball.screen.y , ship.screen.x, ship.screen.y ) ) {
            ship.crashed = true;
        }
    }

}

function bar_render() {

    var dx, dy, length;
    dx = ship.current.x - ball.current.x;
    dy = ship.current.y - ball.current.y;
    length = Math.sqrt( dx*dx + dy*dy );
    
    ball.attracted = ship.shielding && length < environment.bar_length;
    
    if ( ship.carrying || ball.attracted ) {
        context.strokeStyle = '#ff0000';
        context.beginPath();
        context.moveTo( ball.screen.x, ball.screen.y );
        context.lineTo( ship.screen.x, ship.screen.y );
        context.stroke();
    }

}