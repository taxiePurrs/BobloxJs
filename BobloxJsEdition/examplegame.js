/**
 * main game tick - {@link gametick}
 * metadata - {@link window.games[namespace]}
*/

const namespace = "examplegame" // game namespace, this will be the name and internal refrence for your game

//#region duplication check
// editing this block is not reccomended
const __thisScriptNode = document.currentScript;
if (window.games && window.games[namespace]) {
    if (__thisScriptNode) __thisScriptNode.remove();
    throw new Error("Duplicate runtime detected");
}
const myid = __thisScriptNode.id || `./${namespace}.js` // changing the fallback is typically not needed
//#endregion

//#region metadata
/**
 * @memberof window.games
 */
//this is the game data and collision geometry
window.games[namespace] = {
    // metadata
    functionName: namespace, // do not edit unless you understand what you are doing
    width: 1920,  /*absolute width of the playing field
                    note that the camera is always 1920x1080 no matter the screen resolution
                    also i currently dont support anything other than 1920*/
    startposx: 960, // start position in x coordinate from left side of the screen
    startposy: 540, // start position in y coordinate from top of the screen
    Size: 2.5,      // player model and render size, i reccomend anywhere between 2.5 and 3
    // image data
    // this part is trickier because you have to load the images yourself
}
//#endregion

//#region tick
// this function runs after the player physics but before player draw
// most of your code should be located here
let gametick = function (deltatime, tick) { // ...

}
//#endregion