include.module( 'base-map.streets-night-js', [], function ( inc ) {
    "use strict";

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
            url: '39993eb699cf449fb205a8b942e3431c'
        } )       

        defineBaseMap( '--world-streets-night-vector', {
            type: 'esri-vector-tile',
            url: '77cdce3e37204a06be9da9572e892fde'
        } )               
    }
} )
