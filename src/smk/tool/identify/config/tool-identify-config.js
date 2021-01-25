include.module( 'tool-identify-config', [
    'tool-base-config',
    'tool-widget-config',
    'tool-panel-config',
    'tool-panel-feature-config',
    'tool-feature-list-config',
    'tool-internal-layers-config',
    'tool-identify-config.crosshair-png'
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ](
        inc[ 'tool-widget-config' ](
        inc[ 'tool-panel-config' ](
        inc[ 'tool-panel-feature-config' ](
        inc[ 'tool-internal-layers-config' ](
        inc[ 'tool-feature-list-config' ]( {
            type: 'identify',
            enabled: false,
            order: 5,
            position: 'list-menu',
            icon: 'info_outline',
            title: 'Identify Features',
            command: {
                select: true,
                radius: false,
                radiusUnit: false,
                nearBy: true
            },
            radius: 5,
            radiusUnit: 'px',
            internalLayer: {
                'search-area': {
                    // title: "Identify Search Area",
                    geometryType: 'polygon',
                    style: {
                        stroke:             false,
                        fill:               true,
                        fillColor:          "white",
                        fillOpacity:        0.5,
                    },
                },
                'search-border-1': {
                    // title: "Identify Search Area Border",
                    geometryType: 'polyline',
                    style: {
                        strokeWidth:        6,
                        strokeColor:        "black",
                        strokeOpacity:      1,
                        strokeCap:          "butt",
                    },
                },
                'search-border-2': {
                    // title: "Identify Search Area Border",
                    geometryType: 'polyline',
                    style: {
                        strokeWidth:        6,
                        strokeColor:        "white",
                        strokeOpacity:      1,
                        strokeCap:          "butt",
                    }
                },
                'location': {
                    title: "Identify Location",
                    geometryType: 'point',
                    style: {
                        markerUrl: inc[ 'tool-identify-config.crosshair-png' ],
                        markerSize: [ 40, 40 ],
                        markerOffset: [ 20, 20 ]
                    },
                    legend: {
                        point: true
                    }
                },
                'edit-search-area': {
                    // title: "Identify Edit Search Area",
                    geometryType: 'polygon',
                    style: {
                        strokeWidth:        3,
                        strokeColor:        "red",
                        strokeOpacity:      1
                    }
                    // legend: {
                    //     line: true
                    // }
                }
            }
        } ) ) ) ) ) )
    )
} )
