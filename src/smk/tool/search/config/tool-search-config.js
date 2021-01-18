include.module( 'tool-search-config', [
    'tool-base-config',
    'tool-widget-config',
    'tool-panel-config',
    'tool-internal-layers-config',
    'tool-search-config.marker-icon-yellow-png',
    'tool-search-config.marker-shadow-png',
    'tool-search-config.star-icon-yellow-png',
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ](
        inc[ 'tool-widget-config' ](
        inc[ 'tool-panel-config' ](
        inc[ 'tool-internal-layers-config' ]( {
            type: 'search',
            enabled: true,
            order: 2,
            position: 'toolbar',
            icon: 'search',
            title: 'Search for Location',
            showPanel: true,
            showLocation: true,
            command: {
                identify: true,
                measure: true,
                directions: true,
            },
            internalLayer: {
                'result-selected': {
                    // id: "@search-result-selected",
                    title: "Selected Search Result",
                    style: {               
                        markerUrl: inc[ 'tool-search-config.marker-icon-yellow-png' ],
                        markerSize: [ 25, 41 ],
                        markerOffset: [ 12, 41 ],

                        shadowUrl: inc[ 'tool-search-config.marker-shadow-png' ],
                        shadowSize: [ 41, 41 ],
                    },
                    legend: {
                        point: true
                    }
                },
                'result-highlight': {
                    // id: "@search-result-highlight",
                    title: "Highlighted Search Result",
                    style: {               
                        markerUrl: inc[ 'tool-search-config.star-icon-yellow-png' ], 
                        markerSize: [ 40, 36 ],
                        markerOffset: [ 20, 18 ],

                        shadowUrl: inc[ 'tool-search-config.marker-shadow-png' ],
                        shadowSize: [ 31, 31 ],
                    },
                    legend: {
                        point: true
                    }
                },
                'results': {
                    // id: "@search-results",
                    title: "Search Results",
                    style: {               
                        markerUrl: inc[ 'tool-search-config.star-icon-yellow-png' ], 
                        markerSize: [ 20, 19 ],
                        markerOffset: [ 10, 9 ],

                        shadowUrl: inc[ 'tool-search-config.marker-shadow-png' ],
                        shadowSize: [ 21, 21 ],
                    },
                    legend: {
                        point: true
                    }
                }
            }

        } ) ) ) )
    )
} )
