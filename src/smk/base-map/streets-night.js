include.module( 'base-map.streets-night-js', [], function ( inc ) {
    "use strict";

    // taken from
    // https://www.arcgis.com/home/item.html?id=7e2b9be8a9c94e45b7f87857d8d168d6
    
    return function ( defineBaseMap, defineBaseMapType ) {
        defineBaseMap( 'streets-night', {
            type: 'composite',
            title: 'Night',
            layers: [
                '--streets-night-vector',
                // '--world-night-vector',
            ]
        } )

        defineBaseMap( '--streets-night-vector', {
            type: 'esri-vector-tile',
            url: '39993eb699cf449fb205a8b942e3431c',
            internal: true,
        } )       

        defineBaseMap( '--world-streets-night-vector', {
            type: 'esri-vector-tile',
            url: '77cdce3e37204a06be9da9572e892fde',
            internal: true,
        } )               
    }
} )
