include.module( 'base-map.streets-v2-js', [], function ( inc ) {
    "use strict";

    // taken from
    // https://www.arcgis.com/home/item.html?id=55ebf90799fa4a3fa57562700a68c405
    
    return function ( defineBaseMap, defineBaseMapType ) {
        defineBaseMap( 'streets-v2', {
            type: 'composite',
            title: 'Streets',
            layers: [
                '--streets-v2-vector',
                // '--world-streets-v2-vector',
            ]
        } )

        defineBaseMap( '--streets-v2-vector', {
            type: 'esri-vector-tile',
            url: '5bb68ae14a8a4daea914f2ca51a3fe21',
            internal: true,
        } )

        defineBaseMap( '--world-streets-v2-vector', {
            type: 'esri-vector-tile',
            url: '4eb066f7efd540669dc26c14612cf989',
            internal: true,
        } )        
    }
} )
