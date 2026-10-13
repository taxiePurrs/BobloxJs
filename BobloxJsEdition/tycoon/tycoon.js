//console.warn("test")
const folderurl = "https://cdn.jsdelivr.net/gh/taxiePurrs/BobloxJs@latest/BobloxJsEdition/tycoon/";

// 1. Declare variables globally so the engine can always see them
var tycoonforeground;
var TycoonSpritesheet; 
var tycoonICO;
var classicskybox;

function loadAndInitializeAssets(onCompleteCallback) {
    console.log("Syncing tycoon visual assets...");

    const fgUrl = folderurl + "TycoonForeground.png";
    const bgUrl = folderurl + "TycoonBuilding.png";
    const iconUrl = folderurl + "tycoonIcon.png";
    const skyUrl = folderurl + "skybox1.png";

    Promise.all([
        saveImageToStorage(fgUrl),
        saveImageToStorage(bgUrl),
        saveImageToStorage(iconUrl),
        saveImageToStorage(skyUrl)
    ]).then(() => {
        console.log("All image assets safely locked into storage database!");

        // Initialize fresh HTML Image contexts
        tycoonforeground = new Image();
        TycoonSpritesheet = new Image();
        tycoonICO = new Image();
        classicskybox = new Image();

        // Track how many images have successfully parsed their source blobs
        let imagesLoaded = 0;
        const totalImages = 4;

        function checkProgress() {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                console.log("All image object blobs attached and rendered into RAM!");
                if (typeof onCompleteCallback === "function") onCompleteCallback();
            }
        }

        // Bind image event triggers to confirm structural readiness
        tycoonforeground.onload = checkProgress;
        TycoonSpritesheet.onload = checkProgress;
        tycoonICO.onload = checkProgress;
        classicskybox.onload = checkProgress;

        // Assign sources asynchronously from IndexedDB blobs
        loadSavedImage(fgUrl, (src) => tycoonforeground.src = src);
        loadSavedImage(bgUrl, (src) => TycoonSpritesheet.src = src);
        loadSavedImage(iconUrl, (src) => tycoonICO.src = src);
        loadSavedImage(skyUrl, (src) => classicskybox.src = src);
    });
}

// 2. Safely initialize the game metadata map profile ONLY after resources are mapped
loadAndInitializeAssets(() => {
    window.games = window.games || {};
    
    window.games["tycoon"] = {
        functionName: "vanillatycoon",
        width: 1920,
        startposx: 90,
        startposy: 940,
        Size: 2.5,
        Skybox: classicskybox,
        foreground: tycoonforeground,
        icon: tycoonICO,
        gravity: 1930.44,
        floors: [
            { xstart: 0, xend: 1920, y: 940, enabled: true, passable: false, Ladder: false },
            { xstart: 600, xend: 1920, y: 918, enabled: false, passable: false, Ladder: false },
            { xstart: 600, xend: 1746, y: 596, enabled: false, passable: false, Ladder: false },
            { xstart: 1896, xend: 1920, y: 596, enabled: false, passable: false, Ladder: false },
            { xstart: 1746, xend: 1896, y: 885, enabled: false, passable: true, Ladder: true },
            { xstart: 1746, xend: 1896, y: 839, enabled: false, passable: true, Ladder: true },
            { xstart: 1746, xend: 1896, y: 793, enabled: false, passable: true, Ladder: true },
            { xstart: 1746, xend: 1896, y: 747, enabled: false, passable: true, Ladder: true },
            { xstart: 1746, xend: 1896, y: 701, enabled: false, passable: true, Ladder: true },
            { xstart: 1746, xend: 1896, y: 655, enabled: false, passable: true, Ladder: true },
            { xstart: 1746, xend: 1896, y: 609, enabled: false, passable: true, Ladder: true }
        ],
        ceilings: [
            { xstart: 600, xend: 1746, y: 618, enabled: false },
            { xstart: 1896, xend: 1920, y: 618, enabled: false }
        ],
        walls: [
            { x: 1908, ystart: 596, yend: 918, width: 12, enabled: false },
            { x: 1173, ystart: 596, yend: 618, width: 573, enabled: false }
        ]
    };
});


let cachedCollectorSize = 0

const tycoonoffset = 644

let tycoonbuttons = [
    {
        text: "Foundation",
        price: 0,
        displayprice: "Free",
        bit: 0,
        x: 611,
        y: 918
    },
    {
        text: "Conveyor",
        price: 0,
        displayprice: "Free",
        bit: 0,
        x: 1327,
        y: 896
    },
    {
        text: "Collector",
        price: 0,
        displayprice: "Free",
        bit: 0,
        x: 1526,
        y: 896
    },
    {
        text: "Dropper",
        price: 0,
        displayprice: "Free",
        bit: 0,
        x: 727,
        y: 896
    },
    {
        text: "Dropper",
        price: 25,
        displayprice: "$25",
        bit: 0,
        x: 917,
        y: 896
    },
    {
        text: "Dropper",
        price: 100,
        displayprice: "$100",
        bit: 0,
        x: 1107,
        y: 896
    },
    {
        text: "Upgrader",
        price: 250,
        displayprice: "$250",
        bit: 0,
        x: 1297,
        y: 896
    },
    {
        text: "Floor 2",
        price: 500,
        displayprice: "$500",
        bit: 0,
        x: 1761,
        y: 896
    },
    {
        text: "Conveyor",
        price: 500,
        displayprice: "$500",
        bit: 0,
        x: 1526,
        y: 574
    },
    {
        text: "Dropper",
        price: 750,
        displayprice: "$750",
        bit: 0,
        x: 727,
        y: 574
    },
    {
        text: "Dropper",
        price: 2000,
        displayprice: "$2K",
        bit: 0,
        x: 917,
        y: 574
    },
]

let tycoonblocks = []

function makeTycoonButton(id, bin) {
    const data = tycoonbuttons[id]
    drawRoundedRectangle(data.x, data.y, 120, 25, 5, "#e00")
    drawText(data.text, data.x + 60, data.y - 80, 30, "Arial", "#fff", "center")
    drawText(data.displayprice, data.x + 60, data.y - 50, 30, "Arial", "#fff", "center")

    if (!window.readBit(bin, id) && window.gameconfig.TycoonMoney >= data.price && inRange(PlrX, data.x, data.x + 120) && inRange(PlrY, data.y, data.y + 30)) {
        window.gameconfig.TycoonMoney -= data.price
        return window.setBit(bin, id, "1")
    }
    return window.setBit(bin, id, "0")
}

let lastTycoonDrop = 0

window.vanillatycoon = function (GameDataLoaded, dt, currentTime) {
    let tycoondata = ChangeBase(window.gameconfig.TycoonProgress, 16, 2)
    GameDataLoaded.floors[1].enabled = window.readBit(tycoondata, 0)

    const seventhbit = window.readBit(tycoondata, 7)
    GameDataLoaded.ceilings[0].enabled = seventhbit
    GameDataLoaded.ceilings[1].enabled = seventhbit
    GameDataLoaded.walls[0].enabled = seventhbit
    GameDataLoaded.walls[1].enabled = seventhbit
    for (let i = 2; i < GameDataLoaded.floors.length; i++) {
        GameDataLoaded.floors[i].enabled = seventhbit
    }

    if (seventhbit) {
        window.drawSpriteSheet(TycoonSpritesheet, 600, 596, 0, 322, 1320, 344) //floor
    } else {
        window.drawSpriteSheet(TycoonSpritesheet, 600, 918, 0, 644, 1320, 22) //floor
    }

    if (window.readBit(tycoondata, 0)) {
        if (window.readBit(tycoondata, 1)) {
            if (dt < 250 && currentTime - lastTycoonDrop >= 1000 && window.readBit(tycoondata, 2)) {
                lastTycoonDrop = currentTime
            }

            if (window.readBit(tycoondata, 3)) {
                window.drawSpriteSheet(TycoonSpritesheet, 737, 702, 0, 106 + tycoonoffset, 100, 216) // dropper 1
                if (lastTycoonDrop == currentTime) {
                    tycoonblocks.push({ x: 767, y: 732, value: 1, upgraded: false, floor: 1, yvel: 0 })
                }
            }
            if (window.readBit(tycoondata, 4)) {
                window.drawSpriteSheet(TycoonSpritesheet, 927, 702, 0, 106 + tycoonoffset, 100, 216) // dropper 2
                if (lastTycoonDrop == currentTime) {
                    tycoonblocks.push({ x: 957, y: 732, value: 2, upgraded: false, floor: 1, yvel: 0 })
                }
            }
            if (window.readBit(tycoondata, 5)) {
                window.drawSpriteSheet(TycoonSpritesheet, 1117, 702, 0, 106 + tycoonoffset, 100, 216) // dropper 3
                if (lastTycoonDrop == currentTime) {
                    tycoonblocks.push({ x: 1147, y: 732, value: 5, upgraded: false, floor: 1, yvel: 0 })
                }
            }
            if (window.readBit(tycoondata, 9)) {
                window.drawSpriteSheet(TycoonSpritesheet, 737, 380, 0, 106 + tycoonoffset, 100, 216) // dropper 2-1
                if (lastTycoonDrop == currentTime) {
                    tycoonblocks.push({ x: 767, y: 410, value: 10, upgraded: false, floor: 2, yvel: 0 })
                }
            }
            if (window.readBit(tycoondata, 10)) {
                window.drawSpriteSheet(TycoonSpritesheet, 927, 380, 0, 106 + tycoonoffset, 100, 216) // dropper 2-2
                if (lastTycoonDrop == currentTime) {
                    tycoonblocks.push({ x: 957, y: 410, value: 15, upgraded: false, floor: 2, yvel: 0 })
                }
            }

            if (window.readBit(tycoondata, 2)) {

                for (let i = 0; i < tycoonblocks.length; i++) {
                    let data = tycoonblocks[i]
                    if ((data.y < 782 && data.floor == 1) || (data.y < 460 && data.floor == 2)) {
                        data.yvel += GameDataLoaded.gravity * Size * dt
                        data.y += dt * data.yvel
                        if (data.y > 782 && data.floor == 1) {
                            data.y = 782
                        } else if (data.y > 460 && data.floor == 2) {
                            data.y = 460
                        }
                        tycoonblocks[i] = data
                        drawText(abbreviateToMoney(data.value), data.x + 20, data.y - 20, 40, "Arial", "#0d0", "center")
                        drawRectangle(data.x, data.y, 40, 40, "#e00")
                    } else {
                        data.x += dt * 285
                        tycoonblocks[i] = data
                        if ((data.x > 1482 && data.floor == 1) || (data.x > 1454 && data.floor == 2)) {
                            if (data.floor == 2 && data.y < 782) {
                                data.yvel += GameDataLoaded.gravity * Size * dt
                                data.y += dt * data.yvel
                                drawText(abbreviateToMoney(data.value), data.x + 20, data.y - 20, 40, "Arial", "#0d0", "center")
                                drawRectangle(data.x, data.y, 40, 40, "#e00")
                            } else {
                                window.gameconfig.TycoonPending += data.value
                                tycoonblocks.splice(i, 1)
                                i--
                            }
                        } else {
                            data.yvel = 0
                            if ((data.floor == 1 && window.readBit(tycoondata, 6) && data.x > 1307 && !data.upgraded)) {
                                data.upgraded = true
                                data.value *= 1.5
                            }
                            drawText(abbreviateToMoney(data.value), data.x + 20, data.y - 20, 40, "Arial", "#0d0", "center")
                            drawRectangle(data.x, data.y, 40, 40, "#e00")
                        }
                    }
                }
            }

            window.drawSpriteSheet(TycoonSpritesheet, 692, 792, 100, 196 + tycoonoffset, 952, 126) // conveyor

            if (window.readBit(tycoondata, 8)) {
                window.drawSpriteSheet(TycoonSpritesheet, 692, 470, 100, 196 + tycoonoffset, 762, 126) // conveyor 2
            }
            if (window.readBit(tycoondata, 3)) {
                if (!seventhbit) {
                    tycoondata = makeTycoonButton(7, tycoondata)
                } else {
                    if (window.readBit(tycoondata, 8)) {
                        if (window.readBit(tycoondata, 9)) {

                        } else {
                            tycoondata = makeTycoonButton(9, tycoondata)
                        }
                    } else {
                        tycoondata = makeTycoonButton(8, tycoondata)
                    }
                }
                if (window.readBit(tycoondata, 4)) {
                    if (window.readBit(tycoondata, 5)) {
                        if (window.readBit(tycoondata, 6)) {
                            window.drawSpriteSheet(TycoonSpritesheet, 1307, 702, 1320, 106 + tycoonoffset, 100, 216) // Upgrader 1
                        } else {
                            tycoondata = makeTycoonButton(6, tycoondata)
                        }
                    } else {
                        tycoondata = makeTycoonButton(5, tycoondata)
                    }
                } else {
                    tycoondata = makeTycoonButton(4, tycoondata)
                }
            } else {
                tycoondata = makeTycoonButton(3, tycoondata)
            }
        } else {
            tycoondata = makeTycoonButton(1, tycoondata)
        }
        if (window.readBit(tycoondata, 2)) {
            window.drawSpriteSheet(TycoonSpritesheet, 1452, 679, 1052, 83 + tycoonoffset, 268, 239) // collector
            const onbtn = (inRange(PlrY, 896, 926) && inRange(PlrX, 1464, 1708));
            window.gameconfig.TycoonMoney += onbtn ? window.gameconfig.TycoonPending : 0;
            window.gameconfig.TycoonPending *= onbtn ? 0 : 1;
            drawRectangle(1464, 885, 244, 21, (onbtn || window.gameconfig.TycoonPending == 0) ? "#d00" : "#0d0")
            cachedCollectorSize = drawBoundedText(abbreviateToMoney(window.gameconfig.TycoonPending), 1586, 787, 196, 68, "Arial", "#ff0", "center", cachedCollectorSize) // text
        } else {
            tycoondata = makeTycoonButton(2, tycoondata)
        }
    } else {
        tycoondata = makeTycoonButton(0, tycoondata)
    }
    window.gameconfig.TycoonProgress = ChangeBase(tycoondata, 2, 16)
}
window.vanillatycoonUI = function () {
    // draw the tycoon money hud
    const abreviateMoney = abbreviateToMoney(window.gameconfig.TycoonMoney)
    const moneywidth = checkTextWidth(abreviateMoney, "Arial", 80)
    drawPolygon("#0009", "#000", 0,
        880 - moneywidth / 2, 1080,
        960 - moneywidth / 2, 1000,
        960 + moneywidth / 2, 1000,
        1040 + moneywidth / 2, 1080
    )
    drawText(abreviateMoney, 960, 1045, 80, "Arial", "#0d0", "center")
}