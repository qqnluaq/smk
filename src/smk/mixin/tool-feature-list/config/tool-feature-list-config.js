include.module( 'tool-feature-list-config', [
    'tool-feature-list-config.marker-icon-white-png',
    'tool-feature-list-config.marker-shadow-png'
], function ( inc ) {
    "use strict";

    return function ( cfg ) {
        if ( !cfg.internalLayers ) cfg.internalLayers = []
        cfg.internalLayers.unshift(
            {
                id: 'highlight-polygon',
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
            {
                id: 'highlight-line',
                style: {
                    stroke:             true,
                    strokeColor:        "black",
                    strokeWidth:        3,
                    strokeOpacity:      0.8,
                }
            },
            {
                id: 'highlight-point',
                style: {
                    markerUrl:      inc[ 'tool-feature-list-config.marker-icon-white-png' ],
                    markerSize:     [ 25, 41 ],
                    markerOffset:   [ 12, 41 ],
                    shadowUrl:      inc[ 'tool-feature-list-config.marker-shadow-png' ],
                    shadowSize:     [ 41, 41 ]
                }
            }
        )

        return Object.assign( {
        }, cfg )
    }
} )
