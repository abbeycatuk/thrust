/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

var environment = {
    friction        : 0,
    fps             : 0,
    gravity         : 0,
    refresh_rate    : 0,
    scaling         : 0,
    bar_length      : 0
};

function environment_init() {

    environment.friction        = 1;                                    /* simple friction coefficient */
    environment.fps             = 25;                                   /* frames per second */
    environment.gravity         = 9.68 * (1/environment.fps);           /* m/s2, adjusted with an overall "speed" factor */
    environment.refresh_rate    = 1000/environment.fps;                 /* ms */
    environment.scaling         = 7;                                    /* scaling factor for rendering */
    environment.bar_length      = 5 * environment.scaling;              /* metres */

}
