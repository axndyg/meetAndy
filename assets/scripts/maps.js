// Draws the travel map. Called by render.js once the #map element exists.
// The list of visited countries lives in assets/data/slices.js.
function initTravelMap(selector, countries) {
    const visited = {};
    countries.forEach(code => { visited[code] = 'visited'; });

    return new jsVectorMap({
        selector: selector,
        map: "world",
        regionsSelectable: false,
        series: {
            regions: [{
                values: visited,
                attribute: 'fill',
                scale: {
                    'visited': '#558071' // accent green
                }
            }]
        },
        style: {
            initial: {
                fill: 'rgba(255, 255, 255, 0.15)',
                stroke: 'rgba(255, 255, 255, 0.2)',
                strokeWidth: 0.5
            },
            hover: {
                fillOpacity: 0.8,
                fill: '#78ab9a'
            }
        }
    });
}
