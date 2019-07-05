/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
 
/* global environment, ship, ball, landscape, context, images, canvas, audio_bing, audio_thrust, audio_explosion, particle_type, game_state */

preload_graphics( function() { init(); state_machine( game_state.PRESS_FIRE_TO_PLAY ); } );

function init() {

    input_init();
    graphics_init();
    audio_init();
    environment_init();

}
