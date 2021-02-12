include.module( 'tool-current-location-config', [
    'tool-base-config',
    'tool-widget-config',
    'tool-internal-layers-config',
    'tool-current-location-config.my-location-png'
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push( 
        inc[ 'tool-base-config' ](
        inc[ 'tool-widget-config' ](
        inc[ 'tool-internal-layers-config' ]( {
            type: 'current-location',
            position: 'actionbar',
            order: 11,
            icon: 'my_location',
            title: 'Current Location',
            zoom: 17,
            internalLayer: {
                'current-location': {
                    title: "Current Location",
                    style: {
                        markerUrl: inc[ 'tool-current-location-config.my-location-png' ],
                        markerSize: [ 26, 26 ],
                        markerOffset: [ 13, 13 ],
                    },
                    geometryType: 'point',
                    legend: {
                        point: true
                    }
                }
            }
        } ) ) )
    )
} )
