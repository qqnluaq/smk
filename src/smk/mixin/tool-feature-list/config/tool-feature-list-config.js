include.module( 'tool-feature-list-config', [
    'tool-feature-list-config.marker-icon-white-png',
    'tool-feature-list-config.marker-shadow-png'
], function ( inc ) {
    "use strict";

    return function ( cfg ) {
        cfg.internalLayer = Object.assign( {
            'highlight-polygon': {
                // title: "Identify Search Area",
                geometryType: 'polygon',
                style: {
                    fill:               true,
                    stroke:             true,
                    fillColor:          "white",
                    fillOpacity:        0.5,
                    strokeColor:        "black",
                    strokeWidth:        3,
                    strokeOpacity:      0.8,
                }
            },
            'highlight-line': {
                // title: "Identify Search Area",
                geometryType: 'polyline',
                style: {
                    stroke:             true,
                    strokeColor:        "black",
                    strokeWidth:        3,
                    strokeOpacity:      0.8,
                }
            },
            'highlight-point': {
                // title: "Identify Search Area",
                geometryType: 'point',
                style: {
                    markerUrl:      inc[ 'tool-feature-list-config.marker-icon-white-png' ],
                    markerSize:     [ 25, 41 ],
                    markerOffset:   [ 12, 41 ],
                    shadowUrl:      inc[ 'tool-feature-list-config.marker-shadow-png' ],
                    shadowSize:     [ 41, 41 ]
                }
            }
        }, cfg.internalLayer )

        return Object.assign( {
        }, cfg )
    }
} )
