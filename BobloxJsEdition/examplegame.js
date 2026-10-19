/**
 * This is a sort of guide and not a template
 * I suggest you create your own file from scratch and just read off this one
 * 
 * API
 * saveImageToStorage {@link save_image}
 * loadSavedImage {@link load_image}
 * 
 * SETUP
 * setup part 1 {@link game_name}
 * setup part 2 {@link image_loading}
 * setup part 3 {@link metadata}
 * 
 * CODING
 * coding {@link game_tick}
 */



/** @typedef {Object} game_name */
// you can replace the "examplegame" with whatever string you want
// however you should try to keep it unique so you dont accidentally collide with someone else's game
const namespace = "examplegame"
//#region duplication check
// editing this block is not reccomended
const __thisScriptNode = document.currentScript;
if (window.games && window.games[namespace]) {
    if (__thisScriptNode) __thisScriptNode.remove();
    throw new Error("Duplicate runtime detected");
}
const myid = __thisScriptNode.id || `./${namespace}.js` // changing the fallback is typically not needed
//#endregion



//#region API
//#region assets
/**
 * @typedef {Object} load_image 
 * Before you load a image you must first save it {@link save_image}
 * loadSavedImage has 2 properties, a url and a callback
 * the url is a image url however ive only tested jsdelivr
 * 
 */



//#endregion
//#endregion


//#region image loading
/** @typedef {Object} image_loading */
// this is a very simple helper function that stores and loads images for you 

function loadimage(url) {
    const img = new Image();

    saveImageToStorage(url).then(() => {
        loadSavedImage(url, (src) => {
            if (src) img.src = src;
        });
    });

    return img; 
}

//#endregion



//#region metadata
/** @typedef {Object} metadata */

var image = loadimage("https://cdn.jsdelivr.net/gh/taxiePurrs/BobloxJs@main/BobloxJsEdition/tycoon/skybox1.png")

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
    Skybox: image,
    foreground: image,
    icon: image,
    gravity: 1930.44,
    floors: [
        { xstart: 0, xend: 1920, y: 940, enabled: true, passable: false, Ladder: false },
    ],
    ceilings: [
        { xstart: 600, xend: 1746, y: 618, enabled: false }
    ],
    walls: [
        { x: 1173, ystart: 596, yend: 618, width: 573, enabled: false }
    ]
}
//#endregion



//#region tick
/** @typedef {Object} game_tick */

// this function runs after the player physics but before player draw
// most of your code should be located here
let gametick = function (deltatime, tick) { // ...

}
window[namespace] = gametick(a, b)
window[namespace+"UI"] = function(){};
window[namespace+"Leaving"] = function(){};
//#endregion