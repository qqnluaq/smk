include.module( 'tool-current-location-config', [
    'tool-base-config',
    'tool-widget-config',
    'tool-internal-layers-config',
    'tool-current-location-config.my-location-png'
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push( inc[ 'tool-base-config' ]( inc[ 'tool-widget-config' ]( inc[ 'tool-internal-layers-config' ]( {
        type: 'current-location',
        position: 'actionbar',
        order: 11,
        icon: 'my_location',
        title: 'Current Location',
        zoom: 17,
        internalLayers: [
            {
                id: 'current-location',
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
        ]
    } ) ) ) )

    SMK.CONFIG.viewer.displayContext.push( {
        id: 'current-location',
        items: [ {
            id: 'CurrentLocationTool',
            type: 'group',
            title: 'Current Location',
            class: 'smk-inline-legend',
            isVisible: false,
            isInternal: true,
            showItem: false,
            items: [
                { id: 'CurrentLocationTool--current-location' }
            ]
        } ]
    } )
} )
