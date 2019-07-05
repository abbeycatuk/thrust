/*
 * thrust
 *
 * Copyright (C) 2018 AbbeyCat (abbeycatuk@gmail.com)
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

var game = {
    fuel        : 0,
    lives       : 0,
    score       : 0,
    level       : 0,
    start_level : 1
};

function game_init() {

    game.lives = 3;
    game.score = 0;
    
    game.level = game.start_level;
    level_init();
    
}
