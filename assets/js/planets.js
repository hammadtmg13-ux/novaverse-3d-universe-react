// NovaVerse celestial body data: names, facts, colors, sizes and orbits.
// Plain global script so React and the Three.js scene both read from this
// single source without a module loader.

window.NOVAVERSE = (function () {
    var STAR_COUNT = 2400;
    var BASE_VISITORS = 1247;

    var BODIES = [
        {
            id: 'novaprime',
            name: 'Nova Prime',
            type: 'Planet',
            color: 0x8b7bff,
            size: 3.2,
            orbitRadius: 0,
            orbitSpeed: 0,
            angleStart: 0,
            bands: true,
            ringed: true,
            palette: ['#241563', '#5b3df0', '#8b7bff', '#ff6ec7', '#241563'],
            fact: 'Nova Prime is so wide that 11 Earths could line up across it, and its rings are made of glittering ice and rock.',
            likes: 128
        },
        {
            id: 'ember',
            name: 'Ember',
            type: 'Planet',
            color: 0xff5a3c,
            size: 0.9,
            orbitRadius: 14,
            orbitSpeed: 0.02,
            angleStart: 0.6,
            bands: true,
            ringed: false,
            palette: ['#7a1503', '#c23a17', '#ff5a3c', '#ffb347', '#7a1503'],
            fact: 'Ember is the hottest world in NovaVerse, with surface winds so fierce they can strip paint off metal.',
            likes: 42
        },
        {
            id: 'azure',
            name: 'Azure',
            type: 'Planet',
            color: 0x3fa9ff,
            size: 1.1,
            orbitRadius: 19,
            orbitSpeed: 0.015,
            angleStart: 2.1,
            bands: true,
            ringed: false,
            palette: ['#062a52', '#1466b8', '#3fa9ff', '#7fd4ff', '#062a52'],
            fact: 'Azure is covered by one endless ocean, and its tallest waves can reach 30 metres high.',
            likes: 57
        },
        {
            id: 'verdant',
            name: 'Verdant',
            type: 'Planet',
            color: 0x39d98a,
            size: 1.0,
            orbitRadius: 24,
            orbitSpeed: 0.011,
            angleStart: 3.8,
            bands: true,
            ringed: false,
            palette: ['#063d24', '#128a4c', '#39d98a', '#a5f2c1', '#063d24'],
            fact: 'Verdant has forests that glow at night, lit by tiny spores that float like fireflies.',
            likes: 49
        },
        {
            id: 'frost',
            name: 'Frost',
            type: 'Planet',
            color: 0xbfe6ff,
            size: 0.8,
            orbitRadius: 29,
            orbitSpeed: 0.008,
            angleStart: 5.2,
            bands: true,
            ringed: false,
            palette: ['#274b63', '#5d8aa8', '#bfe6ff', '#eaf7ff', '#274b63'],
            fact: 'Frost is so cold that its rain falls as tiny diamonds of frozen methane.',
            likes: 33
        },
        {
            id: 'lunaone',
            name: 'Luna One',
            type: 'Moon of Nova Prime',
            color: 0xc9c9d6,
            size: 0.45,
            orbitRadius: 7.6,
            orbitSpeed: 0.12,
            angleStart: 0.4,
            bands: false,
            ringed: false,
            palette: ['#8f8fa3', '#c9c9d6', '#e8e8f2'],
            fact: 'Luna One rises twice every Nova Prime day, so its nights are never fully dark.',
            likes: 64
        },
        {
            id: 'lunatwo',
            name: 'Luna Two',
            type: 'Moon of Nova Prime',
            color: 0xd9b48a,
            size: 0.38,
            orbitRadius: 9.0,
            orbitSpeed: 0.09,
            angleStart: 2.6,
            bands: false,
            ringed: false,
            palette: ['#8a6a42', '#d9b48a', '#f2ddba'],
            fact: 'Luna Two is slowly drifting away from Nova Prime, about 3 centimetres every year.',
            likes: 41
        },
        {
            id: 'lunathree',
            name: 'Luna Three',
            type: 'Moon of Nova Prime',
            color: 0x9fd8ff,
            size: 0.32,
            orbitRadius: 10.4,
            orbitSpeed: 0.07,
            angleStart: 4.4,
            bands: false,
            ringed: false,
            palette: ['#4d7ea6', '#9fd8ff', '#d6efff'],
            fact: 'Luna Three hides underground lakes that scientists think may hold tiny alien life.',
            likes: 38
        }
    ];

    return {
        STAR_COUNT: STAR_COUNT,
        BASE_VISITORS: BASE_VISITORS,
        BODIES: BODIES
    };
})();
