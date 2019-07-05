/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* global environment, ship, context, canvas, landscape, images, offset, audio_explosion, fuel, particle_type */

var door_type = { LEFT_RIGHT: 1, UP_DOWN: 2 };
var door_state = { CLOSED: 0, OPENING: 1, OPEN: 2, CLOSING: 3 };
var door;

function door_init() {

    door = undefined;
    
    // horizontal example
    /*
    door = {
        current         : { x: 160, y: 0 },
        screen          : { x: 0, y: 0 },
        widths          : [ 100,100,100,100,100 ],
        type            : door_type.LEFT_RIGHT,
        state           : door_state.CLOSED,
        timer           : 1000, // ms delay before starts closing again
        switches        : [ { current : { x: 250, y: -20 }, screen: { x: 0, y: 0 } } ],
        offset          : 0,
        offset_limit    : 50 // pixels
    };
    */
   
    // vertical example
    /*
    door = {
        current         : { x: 160, y: 0 },
        screen          : { x: 0, y: 0 },
        widths          : [ 100,100,100,100,100,100,100,100,100,100 ],
        type            : door_type.UP_DOWN,
        state           : door_state.CLOSED,
        timer           : 1000,
        switches        : [ { x: 250, y: -20 } ],
        offset          : 0,
        offset_limit    : 10 // door.widths.length
    };
       
    // horizontal (angled) example
    door = {
        current         : { x: 160, y: 0 },
        screen          : { x: 0, y: 0 },
        widths          : [ 100,110,120,130,120,110,100 ],
        type            : door_type.LEFT_RIGHT,
        state           : door_state.OPENING,
        timer           : 2000, // ms delay before starts closing again
        countdown       : 0,
        switches        : [ { x: 250, y: -20 } ],
        offset          : 0,
        offset_limit    : 50 // pixels
    };
    */
      
}

function door_update() {

    if ( door === undefined ) { return; }
    
    /* 25fps = 50ms = 0.01*50 = 0.5pixel per frame = 12.5pixels per second */
    var door_rate = 0.04 * environment.refresh_rate;
    
    switch ( door.state ) {
    
        case door_state.OPENING :
            door.offset += door_rate;
            if ( door.offset >= door.offset_limit ) {
                door.offset     = door.offset_limit;
                door.state      = door_state.OPENED;
            }
            break;

        case door_state.CLOSING :
            door.offset -= door_rate;
            if ( door.offset <= 0 ) {
                door.offset = 0;
                door.state  = door_state.CLOSED;
            }
            break;
        
        case door_state.OPENED :
            door.countdown -= environment.refresh_rate;
            if ( door.countdown <= 0 ) {
                door.state = door_state.CLOSING;
            }
            break;
    }
    
    door_screen_coords();

}

function door_screen_coords() {
    
    if ( door === undefined ) { return; }
    
    door.screen.x = door.current.x - landscape.x;
    door.screen.y = door.current.y - landscape.y;
    
    // calculate screen position, account for potential horizontal wrapping
    if ( door.screen.x < 0 ) {
        door.screen.x += canvas.width * landscape.screens;
    } else if ( door.screen.x >= canvas.width * landscape.screens ) {
        door.screen.x += canvas.width * landscape.screens;
    }    
    
    // calculate associated switches as well
    var i;
    for ( i = 0; i < door.switches.length; i++ ) {
      
        door.switches[i].screen.x = door.switches[i].current.x - landscape.x;
        door.switches[i].screen.y = door.switches[i].current.y - landscape.y;

        // calculate screen position, account for potential horizontal wrapping
        if ( door.switches[i].screen.x < 0 ) {
            door.switches[i].screen.x += canvas.width * landscape.screens;
        } else if ( door.switches[i].screen.x >= canvas.width * landscape.screens ) {
            door.switches[i].screen.x += canvas.width * landscape.screens;
        }    
            
    }

}

function door_render() {

    if ( door === undefined ) { return; }
    
    var i,x,width,y;
    
    for ( i = 0; i < door.widths.length; i++ ) {
    
        x       = door.screen.x;
        y       = door.screen.y + i*2;
        width   = ( door.type === door_type.LEFT_RIGHT ) ? door.widths[i] - door.offset : door.widths[i];
        
        // render line if LEFT/RIGHT door, or UP/DOWN door and door sufficiently closed for this line to need displaying
        if ( door.type === door_type.LEFT_RIGHT || (i > door.offset) && y < canvas.height ) {
            context.beginPath();
            context.moveTo( x, y-0.5 );
            context.lineTo( x + width, y-0.5 );
            context.stroke();
        }
    
    }

    // render the switches
    for ( i = 0; i < door.switches.length; i++ ) {
        context.drawImage( door.switches[i].left ? images.door_left : images.door_right, door.switches[i].screen.x, door.switches[i].screen.y );
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
function door_bounds_check( x, y, type ) {
    
    if ( door === undefined ) { return false; }
    
    var i;
    
    for ( i = 0; i < door.switches.length; i++ ) {
        
        if ( x >= door.switches[i].current.x && x <= door.switches[i].current.x + fuel.width && y >= door.switches[i].current.y && y <= door.switches[i].current.y + fuel.height ) {

            if ( type === particle_type.MISSILE ) {

                // hit the door and it goes bang and the timer is set/reset
                audio_explosion.play();
                door.countdown  = door.timer;

                // only worry about this if the door is currently CLOSED or CLOSING
                if ( door.state === door_state.CLOSED || door.state === door_state.CLOSING ) {
                    particle_register( 4, particle_type.GENERAL_PARTICLE, x, y, 0, 360 );
                    door.state = door_state.OPENING;
                }
            }
                
            return true;
                
        }
        
    }
    
    return false;
    
}