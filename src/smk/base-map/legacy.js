include.module( 'base-map.legacy-js', [  ], function ( inc ) {
    "use strict";

    return function ( defineBaseMap, defineBaseMapType ) {
        //
        // Legacy basemaps, all are marked as deprecated
        //

        defineBaseMap( 'Topographic', {
            deprecated: true,
            type: 'esri-basemap',
            order: 1,
            key: 'Topographic',
            title: 'Topographic',
            option: {
                maxNativeZoom: 16
            },
        } )


        defineBaseMap( 'Streets', {
            deprecated: true,
            type: 'esri-basemap',
            order: 2,
            key: 'Streets',
            title: 'Streets',
            option: {
                maxNativeZoom: 19,
                maxZoom: 30
            }
        } )

        
        defineBaseMap( 'Imagery', {
            deprecated: true,
            type: 'composite',
            order: 3,
            title: 'Imagery',
            layers: [
                '--imagery-esri',
                '--imagery-transportation-esri',
                '--imagery-labels-esri'
            ]
        } )
            defineBaseMap( '--imagery-esri', {
                internal: true,
                deprecated: true,
                type: 'esri-basemap',
                order: 3,
                key: 'Imagery',
                title: 'Imagery',
                option: {
                    maxNativeZoom: 20,
                    maxZoom: 30
                },
            } )
            defineBaseMap( '--imagery-transportation-esri', {
                internal: true,
                deprecated: true,
                type: 'esri-basemap',
                order: 3,
                key: 'ImageryTransportation',
                title: 'Imagery Transportation',
                option: {
                    maxNativeZoom: 19,
                    maxZoom: 30,
                    tileSize: 512,
                    zoomOffset: -1
                },
            } )
            defineBaseMap( '--imagery-labels-esri', {
                internal: true,
                deprecated: true,
                type: 'esri-basemap',
                order: 3,
                key: 'ImageryLabels',
                title: 'Imagery Labels',
                option: {
                    maxNativeZoom: 19,
                    maxZoom: 30,
                    tileSize: 512,
                    zoomOffset: -1
                },
            } )


        defineBaseMap( 'Oceans', {
            deprecated: true,
            type: 'esri-basemap',
            order: 4,
            key: 'Oceans',
            title: 'Oceans',
            labels: [ 'OceansLabels' ],
        } )


        defineBaseMap( 'NationalGeographic', {
            deprecated: true,
            type: 'esri-basemap',
            order: 5,
            key: 'NationalGeographic',
            title: 'National Geographic',
        } )


        defineBaseMap( 'ShadedRelief', {
            deprecated: true,
            type: 'esri-basemap',
            order: 6,
            key: 'ShadedRelief',
            title: 'Shaded Relief',
        } )


        defineBaseMap( 'DarkGray', {
            deprecated: true,
            type: 'esri-basemap',
            order: 7,
            key: 'DarkGray',
            title: 'Dark Gray',
        } )


        defineBaseMap( 'Gray', {
            deprecated: true,
            type: 'esri-basemap',
            order: 8,
            key: 'Gray',
            title: 'Gray',
        } )
    }
} )
