/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* global context, canvas, graphics_loaded, environment, particle_type, ship_render, stars_render, particle_render_missile, particle_render_enemy_missile, particle_render_general_particle, particle_render_smoke, landscape_render_header, landscape_render, reactor_render, ball_render, bar_render, fuel_render, limpet_render, door_render */

var render = { LANDSCAPE: 1, REACTOR: 2, SHIP: 3, BALL: 4, BAR: 5, STARS: 6, HEADER: 7, MISSILE: 8, ENEMY_MISSILE: 9, GENERAL_PARTICLE: 10, SMOKE: 11, FUEL: 12, LIMPET: 13, DOOR: 14, SWITCH: 15 };
var canvas;
var context;
var sources = {
    header:     'images/header.jpg',
    loader:     'images/loader.jpg',
    title:      'images/title.jpg',
    reactor:    'images/reactor.jpg',
    fuel:       'images/fuel.jpg',
    stand:      'images/stand.png',
    limpet_1:   'images/limpet-1.png',
    limpet_2:   'images/limpet-2.png',
    limpet_3:   'images/limpet-3.png',
    limpet_4:   'images/limpet-4.png',
    digits:     'images/digits.png',
    door_left:  'images/door-left.png',
    door_right: 'images/door-right.png'
  };
var images = {};

function preload_graphics( callback ) {

    graphics_load_images( sources, callback );

}

function graphics_init() {

    canvas      = document.getElementById("c");
    context     = canvas.getContext("2d");
    graphics_resize_canvas();

    // get the font rendering so its ready
    context.font = "8px Gugi";
    context.fillText( 'INITIALISING...', 0,0 );

}

function graphics_load_images( sources, callback ) {

    var src;
    var loadedImages;
    var numImages;
    
    numImages       = 0;
    loadedImages    = 0;
    for ( src in sources ) {
        numImages++;
    }
    
    for ( src in sources ) {
        
      images[ src ] = new Image();
      images[ src ].onload = function() {
        if ( ++loadedImages >= numImages ) {
          callback();
        }
      };
      
      images[ src ].src = sources[ src ];
      
    }
  
}

function graphics_render( arr ) {

    var i;

    for ( i = 0; i < arr.length; i++ ) {
        
        switch ( arr[i] ) {
            case render.LANDSCAPE:         landscape_render(); break;
            case render.REACTOR:           reactor_render(); break;
            case render.SHIP:              ship_render(); break;
            case render.BALL:              ball_render(); break;
            case render.BAR:               bar_render(); break;
            case render.STARS:             stars_render(); break;
            case render.HEADER:            landscape_render_header(); break;
            case render.MISSILE:           particle_render_missile(); break;
            case render.ENEMY_MISSILE:     particle_render_enemy_missile(); break;
            case render.GENERAL_PARTICLE:  particle_render_general_particle(); break;
            case render.SMOKE:             particle_render_smoke(); break;
            case render.FUEL:              fuel_render(); break;
            case render.LIMPET:            limpet_render(); break;
            case render.DOOR:              door_render(); break;
        }
        
    }
    
}

function graphics_cls() {

    context.fillStyle = 'black';
    context.fillRect( 0,0 , canvas.width,canvas.height );

}

/**
 * 
 * simply ensures the canvas we draw to is 320x256 pixels in size
 * (irrespective of how large it might be rendered in the browser)
 *
 */
function graphics_resize_canvas() {

    canvas.width  = 320;
    canvas.height = 256;

}

/**
 * 
 * gets an array of pixel data that can be used for collision detection purposes
 * the imageData returned is a 2d array of RGBA byte values
 * 
 */
function graphics_get_image() {
    
    imageData = context.getImageData( 0,0, canvas.width, canvas.height );

}

/**
 * 
 * simple line drawing algorithm, that uses imageData to check if 
 * any pixels on that line have an RGB component; this is used by the collision
 * checking code to determine whether a collision has occurred.
 * 
 * @param {type} x1
 * @param {type} y1
 * @param {type} x2
 * @param {type} y2
 * @returns {Boolean}
 * 
 */
function graphics_line_check( x1,y1 , x2,y2 ) {
    
    var threshold;

    // employ a small threshold for checking RGB values (canvas rendering can subtly interfere with otherwise expected values)
    threshold = 8;
    
    // integers required
    x1 = Math.floor( x1 );
    y1 = Math.floor( y1 );
    x2 = Math.floor( x2 );
    y2 = Math.floor( y2 );
    
    var quadrant, x, y, dx, dy, err, finished, found;

    // always L->R
    var temp_x, temp_y;
    if ( x2 < x1 ) {
        temp_x = x1; x1 = x2; x2 = temp_x;
        temp_y = y1; y1 = y2; y2 = temp_y;
    }
    
    // determine quadrant
    if ( ( x2-x1 ) > Math.abs( y2-y1 ) ) {
        quadrant = ( y2 < y1 ) ? 2 : 3;
    } else {
        quadrant = ( y2 < y1 ) ? 1 : 4;
    }
            
    dx          = Math.abs( x2-x1 );
    dy          = Math.abs( y2-y1 );
    x           = x1;
    y           = y1;
    err         = ( quadrant === 1 || quadrant === 4 ) ? dx / 2 : dy / 2;
    found       = false;
    finished    = false;
    
    while ( !finished ) {

        index = 4 * (y * 320 + x);
        if ( imageData.data[index] >= threshold || imageData.data[index+1] >= threshold || imageData.data[index+2] >= threshold ) {
            found    = true;
            finished = true;
        }
        
        switch ( quadrant ) {
            
            case 1 :
                y--;
                err += dx; if ( err > dy ) { x++; err -= dy; }
                finished = ( y < y2 );
                break;

            case 2 :
                x++;
                err += dy; if ( err > dx ) { y--; err -= dx; }
                finished = ( x > x2 );
                break;
            
            case 3 :
                x++;
                err += dy; if ( err > dx ) { y++; err -= dx; }
                finished = ( x > x2 );
                break;
            
            case 4 :
                y++;
                err += dx; if ( err > dy ) { x++; err -= dy; }
                finished = ( y > y2 );
                break;

        }

    }
    
    return found;
    
}

/**
 * 
 * simple (rough) circle drawing algorithm, that uses imageData to check if 
 * any pixels on the circumference have an RGB component; this is used by the collision
 * checking code to determine whether a collision has occurred.
 * 
 * @param {type} cx
 * @param {type} cy
 * @param {type} radius
 * @returns {Boolean}
 * 
 */
function graphics_circle_check( cx, cy, radius ) {
    
    var x, y, threshold;

    // employ a small threshold for checking RGB values (canvas rendering can subtly interfere with otherwise expected values)
    threshold = 8;
    
    for ( i = 0; i < 360; i += (360/60) ) {
    
        x = Math.floor( cx + radius * Math.cos( i * Math.PI / 180 ) );
        y = Math.floor( cy + radius * Math.sin( i * Math.PI / 180 ) );
        
        index = 4 * (y * canvas.width + x);
        if ( imageData.data[index] >= threshold || imageData.data[index+1] >= threshold || imageData.data[index+2] >= threshold ) {
            return true;
        }
        
    }

    return false;
     
}

function graphics_point_check( x, y ) {

    var threshold;
    
    // employ a small threshold for checking RGB values (canvas rendering can subtly interfere with otherwise expected values)
    threshold = 8;
    
    // integers required
    x = Math.floor( x );
    y = Math.floor( y );

    index = 4 * (y * canvas.width + x);
    if ( imageData.data[index] >= threshold || imageData.data[index+1] >= threshold || imageData.data[index+2] >= threshold ) {
        return true;
    }
    
    return false;
    
}

function graphics_entry_effect( colour, x, y, radius, val ) {

    var half_radius, y1, x2, y3, x4;
    
    half_radius = radius * environment.scaling / 2;
    y1 = y - half_radius;
    x2 = x + half_radius;
    y3 = y + half_radius;
    x4 = x - half_radius;
    
    context.fillStyle = colour;
    while ( val-- > 0 ) {
        context.fillRect( x - half_radius,y1 , radius * environment.scaling, -val );
        context.fillRect( x2,y - half_radius , +val, radius * environment.scaling );
        context.fillRect( x - half_radius,y3 , radius * environment.scaling, +val );
        context.fillRect( x4,y - half_radius , -val, radius * environment.scaling );
        y1 -= 8;
        x2 += 8;
        y3 += 8;
        x4 -= 8;
    }
    
}
