/* ../assets/scripts/map-init.js */
document.addEventListener("DOMContentLoaded", function() {
    const map = new jsVectorMap({
        selector: "#map",
        map: "world",
        regionsSelectable: false,
        series: {
            regions: [{
                values: {
                    'ES': 'visited', 'MX': 'visited', 'US': 'visited', 
                    'IT': 'visited', 'GB': 'visited', 'BE': 'visited', 
                    'FR': 'visited', 'SI': 'visited', 'NL': 'visited', 'HN': 'visited'
                },
                attribute: 'fill',
                scale: {
                    'visited': '#558071' // Your accent green
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
});