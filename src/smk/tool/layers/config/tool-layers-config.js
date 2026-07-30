include.module( 'tool-layers-config', [
    'tool-base-config',
    'tool-widget-config',
    'tool-panel-config',
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ](
        inc[ 'tool-widget-config' ](
        inc[ 'tool-panel-config' ]( {
            type: 'layers',
            enabled: false,
            order: 3,
            position: [ 'shortcut-menu', 'list-menu' ],
            icon: 'layers',
            title: 'Layers',
            command: {
                allVisibility: true,
                filter: true,
                legend: true,
            },
            glyph: {
                visible: 'visibility',
                hidden: 'visibility_off',
            },
            "display": [
                {
                    "type": "folder",
                    "title": "Base Maps",
                    "isVisible": false,
                    "isExpanded": true,
                    "showItem": false,
                    "items": [
                        {
                            "id": "topographic-basemap",
                            "type": "group",
                            "title": "Topographic",
                            "isVisible": false,
                            "showItem": false,
                            "items": [
                                {
                                    "id": "topographic-basemap-raster",
                                    "isVisible": true
                                },
                                {
                                    "id": "topographic-basemap-vector",
                                    "isVisible": true
                                }
                            ]
                        },
                        {
                            "id": "imagery-basemap",
                            "type": "group",
                            "title": "Imagery",
                            "isVisible": false,
                            "showItem": false,
                            "items": [
                                {
                                    "id": "imagery-basemap-raster",
                                    "isVisible": true
                                },
                                {
                                    "id": "imagery-basemap-vector",
                                    "isVisible": true
                                }
                            ]
                        },
                        {
                            "id": "streets-basemap",
                            "isVisible": false,
                            "showItem": false
                        }
                    ]
                }
            ]

        } ) ) )
    )
} )
