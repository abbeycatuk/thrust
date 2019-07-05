/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
 
/* global environment, ship, ball, landscape, context, images, canvas, audio_bing, audio_thrust, audio_explosion, particle_type, render, audio_shield, audio_theme, game, reactor */

var game_state = { LOADER: 1, TITLE_SCREEN: 2, PRESS_FIRE_TO_PLAY: 3, ENTERING_PLANET: 4, PLAYING: 5, EXPLODING: 6, LEAVING_PLANET: 7, GAME_OVER: 8, MISSION_FAILED: 9, START_GAME: 10, LEVEL_COMPLETE: 11 };
var current_state;
var effect_thickness = [ 0,1,2,3,4,5,6 , 6 , 6,5,4,3,2,1,0 ];

function state_machine( new_state ) {
    
    if ( new_state !== undefined ) {
        current_state = new_state;
    }
    switch ( current_state ) {
        case game_state.LOADER                : state_loader(); break;
        case game_state.TITLE_SCREEN          : state_title_screen(); break;
        case game_state.PRESS_FIRE_TO_PLAY    : state_press_fire_to_play(); break;
        case game_state.START_GAME            : state_start_game(); break;
        case game_state.PLAYING               : state_playing(); break;
        case game_state.ENTERING_PLANET       : state_entering_planet(); break;
        case game_state.LEAVING_PLANET        : state_leaving_planet(); break;
        case game_state.EXPLODING             : state_exploding(); break;
        case game_state.MISSION_FAILED        : state_mission_failed(); break;
        case game_state.LEVEL_COMPLETE        : state_level_complete(); break;
        case game_state.GAME_OVER             : state_game_over(); break;
    }
    
}

function state_press_fire_to_play() {

    graphics_cls();
    
    game_init();
    graphics_render( [ render.LANDSCAPE, render.REACTOR, render.FUEL, render.LIMPET, render.STARS, render.BALL, render.BAR, render.DOOR, render.HEADER ] );

    context.textAlign = 'center';
    context.fillStyle = 'red';
    context.fillText("PRESS SPACE TO PLAY", canvas.width/2, canvas.height/2 );
    
}

function state_start_game() {
    
    game_init();
    state_machine( game_state.ENTERING_PLANET );
    
}

function state_exploding( offset ) {

    // initialisation
    if ( offset === undefined ) {
        offset = 0;
        // go boom; create explosion particles
        audio_thrust.stop();
        audio_shield.stop();
        audio_explosion.play();
        particle_register( 8, particle_type.GENERAL_PARTICLE, ship.current.x, ship.current.y, 0, 360 );
        if ( ship.carrying ) {
            particle_register( 8, particle_type.GENERAL_PARTICLE, ball.current.x, ball.current.y, 0, 360 );
        }
    }
    
    // rendering / animation
    graphics_render( [ render.LANDSCAPE, render.DOOR, render.FUEL, render.LIMPET ] );
    if ( !reactor.exploded ) {
        graphics_render( [ render.REACTOR ] );
    }
    if ( !ship.carrying ) {
        graphics_render( [ render.BALL ] );
    }
    
    // particle_collision_check();
    graphics_render( [ render.STARS, render.GENERAL_PARTICLE, render.SMOKE, render.HEADER ] );
    landscape_scroll();
    particle_update();
    reactor_update();
    ball_update();
    limpet_update();
    door_update();
    fuel_update();

    offset += environment.refresh_rate;
    if ( offset >= 3000 ) {
        game.lives--;
        if ( !game.lives ) {
            state_machine( game_state.GAME_OVER );
        } else {
            level_init();
            state_machine( game_state.ENTERING_PLANET );
        }
    } else {
        setTimeout( function() { state_exploding( ++offset ); }, environment.refresh_rate );
    }
    
}

function state_entering_planet( offset ) {

    var frame;
    
    // initialisation
    if ( offset === undefined ) {
        offset = 0;
    }
    
    // rendering / animation
    // translate offset to a frame number (offset = ms elapsed, so fix to 50ms per frame)
    frame = Math.floor( offset / 50 );
    graphics_cls();
    graphics_render( [ render.LANDSCAPE, render.REACTOR, render.FUEL, render.LIMPET, render.STARS, render.BALL, render.BAR ] );
    if ( frame > 10 ) {
        graphics_render( [ render.SHIP ] );
    }
    graphics_entry_effect( '#ffff00', ship.screen.x, ship.screen.y, ship.radius, effect_thickness[frame] );
    graphics_render( [ render.HEADER ] );
    
    if ( frame === effect_thickness.length ) {
        state_machine( game_state.PLAYING );
    } else {
        setTimeout( function() { state_entering_planet(offset + environment.refresh_rate); }, environment.refresh_rate );
    }
    
}

function state_leaving_planet( offset ) {

    var frame;
    
    // initialisation
    if ( offset === undefined ) {
        offset = 0;
        audio_thrust.stop();
        audio_shield.stop();
        audio_bing.play();
    }
    
    // rendering / animation
    // translate offset to a frame number (offset = ms elapsed, so fix to 50ms per frame)
    frame = Math.floor( offset / 50 );
    graphics_render( [ render.LANDSCAPE, render.REACTOR, render.FUEL, render.STARS ] );
    if ( frame < 8 ) {
        graphics_render( [ render.SHIP, render.BALL ] );
    }
    graphics_entry_effect( '#ffff00', ship.screen.x, ship.screen.y, ship.radius, effect_thickness[frame] );
    graphics_entry_effect( '#00ff00', ball.screen.x, ball.screen.y, ball.radius, effect_thickness[frame] );
    graphics_render( [ render.HEADER ] );

    if ( frame === effect_thickness.length ) {
        if ( !ship.carrying ) {
            setTimeout( function() { state_machine( game_state.MISSION_FAILED ); }, 1000 );
        } else {
            setTimeout( function() { state_machine( game_state.LEVEL_COMPLETE ); }, 1000 );
        }
    } else {
        setTimeout( function() { state_leaving_planet(offset + environment.refresh_rate); }, environment.refresh_rate );
    }
    
}

function state_level_complete() {
    
    context.textAlign = 'center';
    context.fillStyle = 'red';
    context.fillText("LEVEL COMPLETE",canvas.width/2,canvas.height/2);
    
    game.level++;
    if ( game.level > 5 ) { game.level = 1; }
    level_init();

    setTimeout( function() { state_machine( game_state.ENTERING_PLANET ); }, 1000 );

}

function state_loader() {
    
    context.drawImage( images.loader, 0,0 );
    setTimeout( function() { state_machine( game_state.TITLE_SCREEN ); }, 1000 );
    
}

function state_title_screen() {
    
    context.drawImage( images.title, 0,0 );
    setTimeout( function() { state_machine( game_state.PRESS_FIRE_TO_PLAY ); }, 2000 );
    
}

function state_playing() {

    // set the timeout at the start of the frame
    setTimeout( state_machine, environment.refresh_rate );

    ship_update();
    ball_update();
    bar_update();
    particle_update();
    reactor_update();
    limpet_update();
    door_update();
    fuel_update();

    // render collidable scenery
    graphics_render( [ render.LANDSCAPE, render.DOOR, render.REACTOR, render.FUEL, render.LIMPET ] );

    // collision detection for enemy missiles
    graphics_get_image();
    particle_missile_collision_check( particle_type.ENEMY_MISSILE );
    
    // add further collidable objects if appropriate
    if ( !ship.shielding ) { graphics_render( [ render.ENEMY_MISSILE ] ); }
    if ( !ship.carrying )  { graphics_render( [ render.BALL ] ); }

    // collision detection for ship/ball/bar/missiles
    graphics_get_image();
    ship_collision_check();
    ball_collision_check();
    bar_collision_check();
    particle_missile_collision_check( particle_type.MISSILE );

    // render remaining items
    if ( ship.shielding ) { graphics_render( [ render.ENEMY_MISSILE ] ); }
    if ( ship.carrying )  { graphics_render( [ render.BALL ] ); }
    graphics_render( [ render.STARS, render.SHIP, render.BAR, render.MISSILE, render.GENERAL_PARTICLE, render.HEADER ] );
        
    fuel_drain_check();
    landscape_scroll();
    
    // decision whether to continue playing, or whether state change has occurred
    if ( ship.current.y <= -canvas.height ) {
        current_state = game_state.LEAVING_PLANET;
    } else if ( ship.crashed ) {
        current_state = game_state.EXPLODING;
    }
    
}

function state_mission_failed() {
    
    context.textAlign = 'center';
    context.fillStyle = 'red';
    context.fillText("MISSION FAILED",canvas.width/2,canvas.height/2);

    level_init();

    setTimeout( function() { state_machine( game_state.ENTERING_PLANET ); }, 2000 );
    
}

function state_game_over() {
    
    context.textAlign = 'center';
    context.fillStyle = 'red';
    context.fillText("GAME OVER",canvas.width/2,canvas.height/2);

    setTimeout( function() { state_machine( game_state.PRESS_FIRE_TO_PLAY ); }, 2000 );
    
}