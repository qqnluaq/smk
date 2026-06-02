include.module( 'base-map.oceans-v2-js', [], function ( inc ) {
    "use strict";

    // taken from
    // https://www.arcgis.com/home/item.html?id=67ab7f7c535c4687b6518e6d2343e8a2
    
    return function ( defineBaseMap, defineBaseMapType ) {
        defineBaseMap( 'oceans-v2', {
            type: 'composite',
            title: 'Oceans',
            layers: [
                '--world-oceans-v2-tiles',
                '--world-oceans-v2-labels-vector'
            ]
        } )

        defineBaseMap( '--world-oceans-v2-labels-vector', {
            type: 'esri-vector-tile',
            url: '94329802cbfa44a18f423e6f1a0b875c',
            internal: true,
        } )

        defineBaseMap( '--world-oceans-v2-tiles', {
            type: 'esri-tiled-map',
            url: 'https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer',
            internal: true,
        } )             
    }
} )
