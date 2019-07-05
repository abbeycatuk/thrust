/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* global environment, ship, context, canvas, ball, images, current_state, game_state, game, reactor */

var landscape = {
    x: 0,
    y: 0,
    scroll_x: 0,
    scroll_y: 0,
    screens : 3,
    colour : '#ff0000'
};

// scenery is an array of 2 element values {left,right}
var scenery;

function landscape_init() {

    landscape.scroll_x = 0;
    landscape.scroll_y = 0;
    
    // y position starts 1/2 screen up from the origin (-canvas.height/2)
    landscape.x = 0;
    landscape.y = -canvas.height/2; 


}

function landscape_render_header() {
    
    context.drawImage(images.header, 0,0 );
    
    // fuel level
    var v,i;
    v = Math.floor(game.fuel).toString();
    for ( i = 0; i < v.length; i++ )
    {
        context.drawImage( images.digits, v[i]*8,0, 8,6, 40+i*8,9, 8,6 );
    }
    
    // lives
    context.drawImage( images.digits, game.lives*8,0, 8,6, 152,9, 8,6 );
    
    // score
    v = game.score.toString();
    for ( i = 0; i < v.length; i++ )
    {
        context.drawImage( images.digits, v[i]*8,0, 8,6, 280-v.length*8+i*8,9, 8,6 );
    }

    // countdown
    if ( reactor.critical ) {
        context.drawImage( images.digits, Math.floor(reactor.countdown / 1000)*8,0, 8,6, 120,9, 8,6 );
        context.drawImage( images.digits, Math.floor(reactor.countdown / 1000)*8,0, 8,6, 180,9, 8,6 );
    }

}

function landscape_render() {

    var y, index, x_left, x_right;

    // rendering of landscape always starts with a CLS
    graphics_cls();
    
    context.strokeStyle = landscape.colour;
    scenery_index = landscape.y;
    for (y = 0; y < canvas.height; y += 2) {

        // scenery only requires rendering if "in play" (don't bother rendering outer space)
        index = scenery_index;
        if (index > 0) {

            // beyond the scenery bounds and it's just rock, rock, rock
            if ( index >= scenery.length ) {
                
                context.beginPath();
                context.moveTo(0, y - 0.5);
                context.lineTo((canvas.width*landscape.screens), y - 0.5);
                context.stroke();
                
            } else {

                // get left/right values, adjusted for current x-scroll value; then wrap as required
                x_left  = scenery[ index + 0 ] - landscape.x;
                x_right = scenery[ index + 1 ] - landscape.x;
                if ( x_right < 0 ) {
                    x_left  += canvas.width * landscape.screens;
                    x_right += canvas.width * landscape.screens;
                }
                if ( x_right >= canvas.width * landscape.screens ) {
                    x_left  -= canvas.width * landscape.screens;
                    x_right -= canvas.width * landscape.screens;
                }

                context.beginPath();
                context.moveTo(0, y - 0.5);
                context.lineTo(x_left, y - 0.5);
                context.moveTo(x_right, y - 0.5);
                context.lineTo((canvas.width*landscape.screens), y - 0.5);
                context.stroke();

            }

        }

        scenery_index += 2;

    }

}

function landscape_scroll() {

    // if currently playing, request/further scrolling, if ship exceeds screen boundaries
    if ( current_state === game_state.PLAYING ) {
        if      ( ship.screen.x >= canvas.width  * 0.8 ) { landscape.scroll_x = +canvas.width  / 2; }
        else if ( ship.screen.x <  canvas.width  * 0.2 ) { landscape.scroll_x = -canvas.width  / 2; }
        if      ( ship.screen.y >= canvas.height * 0.8 ) { landscape.scroll_y = +canvas.height / 2; }
        else if ( ship.screen.y <  canvas.height * 0.2 ) { landscape.scroll_y = -canvas.height / 2; }
    }
   
    // scroll as required
    if ( landscape.scroll_x ) {
        scroll_rate_x = ( landscape.scroll_x > 0 ) ? +8 : -8;
        landscape.x         += scroll_rate_x;
        landscape.scroll_x  -= scroll_rate_x;
        if ( landscape.x < 0 ) {
            landscape.x += ( canvas.width*landscape.screens );
        } else if ( landscape.x >= ( canvas.width*landscape.screens ) ) {
            landscape.x -= ( canvas.width*landscape.screens );
        }
    }

    if ( landscape.scroll_y ) {
        scroll_rate_y = ( landscape.scroll_y > 0 ) ? +8 : -8;
        landscape.y         += scroll_rate_y;
        landscape.scroll_y  -= scroll_rate_y;
    }
    
}

function landscape_has_wrapped( x ) {
    
    return ( (x < 0) || (x >= canvas.width * landscape.screens) );
    
}

function landscape_wrap_required( x ) {
    
    return ( x < 0 ) ? +canvas.width * landscape.screens : -canvas.width * landscape.screens;
        
}