/** Base character model (mesh + skeleton, may include an idle clip). */
export const CHARACTER_MODEL_PATH = '/models/waifu/character.glb';
/**
 * Each animation .glb contains the same skeleton with a different clip.
 * We load them separately and extract only the AnimationClip.
 */
export const ANIMATION_PATHS = {
    idle: '/models/waifu/character.glb',
    climbing: '/models/waifu/climbing.glb',
    joyfulJump: '/models/waifu/joyful-jump.glb',
    jumpingDown: '/models/waifu/jumping-down.glb',
    kneelingPointing: '/models/waifu/kneeling-pointing.glb',
    rumbaDancing: '/models/waifu/rumba-dancing.glb',
    sittingLaughing: '/models/waifu/sitting-laughing.glb',
    standingClap: '/models/waifu/standing-clap.glb',
};
const MOOD_ANIMATION = {
    idle: 'idle',
    victory: 'standingClap',
    levelup: 'joyfulJump',
    sad: 'jumpingDown',
    working: 'kneelingPointing',
    climbing: 'climbing',
    jumpingDown: 'jumpingDown',
    rumbaDancing: 'rumbaDancing',
    sittingLaughing: 'sittingLaughing',
};
export function moodToAnimation(mood) {
    return MOOD_ANIMATION[mood];
}
