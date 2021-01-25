include.module( 'tool-location-config', [
    'tool-base-config',
    'tool-panel-config',
    'tool-internal-layers-config',
    'tool-location-config.marker-icon-blue-png',
    'tool-location-config.marker-shadow-png'
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ](
        inc[ 'tool-panel-config' ](
        inc[ 'tool-internal-layers-config' ]( {
            type: 'location',
            enabled: true,
            showHeader: false,
            internalLayer: {
                'location': {
                    title: "Picked Location",
                    geometryType: 'point',
                    style: {
                        markerUrl:      inc[ 'tool-location-config.marker-icon-blue-png' ],
                        markerSize:     [ 25, 41 ],
                        markerOffset:   [ 12, 41 ],
                        shadowUrl:      inc[ 'tool-location-config.marker-shadow-png' ],
                        shadowSize:     [ 41, 41 ]
                    },
                    legend: {
                        point: true
                    }
                }
            }
        } ) ) )
    )
} )
