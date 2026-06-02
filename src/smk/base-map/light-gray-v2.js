include.module( 'base-map.light-gray-v2-js', [], function ( inc ) {
    "use strict";

    return function ( defineBaseMap, defineBaseMapType ) {
        defineBaseMap( 'light-gray-v2', {
            type: 'composite',
            title: 'Light Gray',
            layers: [
                '--world-light-gray-v2-vector',
                // '--world-light-gray-v2-label-vector',
            ]
        } )

        defineBaseMap( '--world-light-gray-v2-vector', {
            type: 'esri-vector-tile',
            url: '291da5eab3a0412593b66d384379f89f'
        } )

        defineBaseMap( '--world-light-gray-v2-label-vector', {
            type: 'esri-vector-tile',
            url: '1768e8369a214dfab4e2167d5c5f2454'
        } )
    }
} )
