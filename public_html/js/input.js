/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* global environment, ship, context, audio_thrust, game_state, state, current_state, particle_type, ship_r, audio_shield, audio_theme, game */

function input_init() {

    window.addEventListener( 'keyup'  , input_key_up_listener,   false );
    window.addEventListener( 'keydown', input_key_down_listener, false );

}

function input_key_down_listener( e ) {

    var code = e.keyCode;
    
    switch ( current_state ) {
                    
        case game_state.PLAYING :
            // A, S, Shift, Enter, Space
            switch (code) {
                case 65: ship.rotating  = +1;
                    break;
                case 83: ship.rotating  = -1;
                    break;
                case 16: if ( !ship.thrusting && game.fuel ) { ship.thrusting = true; audio_thrust.play(); }
                    break;
                case 13: ship_fire();
                    break;
                case 32: if ( !ship.shielding && game.fuel ) { ship.shielding = true; audio_shield.play(); }
                    break;
            }
            break;
            
    }
    
}

function input_key_up_listener( e ) {

    var code = e.keyCode;
    
    switch ( current_state ) {
    
        case game_state.PLAYING :
            switch (code) {
                case 16: ship.thrusting = false; audio_thrust.stop();   break;
                case 65: ship.rotating  = 0;                            break;
                case 83: ship.rotating  = 0;                            break;
                case 32: ship.shielding = false; audio_shield.stop();   break;
            }
            break;
        case game_state.PRESS_FIRE_TO_PLAY :
            switch (code) {
                case 32: game.start_level = 1; state_machine( game_state.START_GAME );   break;
                case 49: game.start_level = 1; state_machine( game_state.START_GAME );   break;
                case 50: game.start_level = 2; state_machine( game_state.START_GAME );   break;
                case 51: game.start_level = 3; state_machine( game_state.START_GAME );   break;
                case 52: game.start_level = 4; state_machine( game_state.START_GAME );   break;
                case 53: game.start_level = 5; state_machine( game_state.START_GAME );   break;
                case 54: game.start_level = 6; state_machine( game_state.START_GAME );   break;
            }
            break;
    }
    
}
