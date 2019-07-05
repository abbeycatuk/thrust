/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* global environment, ship, context, canvas, landscape */

var star = {
    colour : [ '#ffff00', '#00ff00' ]
};
var stars = [];

function stars_init() {

    var i;
    
    for ( i = 1; i <= 20; i++ ) {
        stars[ i ] = star_create();
    }
    
}

function stars_render() {

    var i, x, y;
    
    for ( i = 1; i <= 20; i++ ) {
   
        context.fillStyle = star.colour[ i % 2 ];
        x = stars[ i ].position.x - landscape.x;
        y = stars[ i ].position.y - landscape.y;
        context.fillRect( x,y , 2,2 );
        
        if ( ( stars[ i ].timeout -= environment.refresh_rate ) <= 0 ) {
            stars[ i ] = star_create();
        }
        
    }

}

function star_create() {
    
    return  {
            position : { x: Math.random()*canvas.width * landscape.screens, y: -(canvas.height/4 + Math.random()*canvas.height) },
            timeout  : 500 + Math.floor( Math.random()*2000 )
            };

}