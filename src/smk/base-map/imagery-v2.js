
include.module( 'base-map.imagery-v2-js', [], function ( inc ) {
    "use strict";

    return function ( defineBaseMap, defineBaseMapType ) {
        defineBaseMap( 'imagery-v2', {
            type: 'composite',
            title: 'Imagery',
            layers: [
                '--imagery-v2-vector',
                '--imagery-v2-tiles',
            ]
        } )

        defineBaseMap( '--imagery-v2-vector', {
            type: 'esri-vector-tile',
            url: '85e2f70a08494305b60af53bd6fd5cbe'
        } )

        defineBaseMap( '--imagery-v2-tiles', {
            type: 'esri-tiled-map',
            order: 25,
            title: 'Imagery',
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
        } )                    
    }
} )
