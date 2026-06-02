include.module( 'base-map.streets-v2-js', [], function ( inc ) {
    "use strict";

    // taken from
    // https://www.arcgis.com/home/item.html?id=55ebf90799fa4a3fa57562700a68c405
    
    return function ( defineBaseMap, defineBaseMapType ) {
        defineBaseMap( 'streets-v2', {
            title: 'Streets',
            type: 'esri-vector-tile',
            url: 'de26a3cf4cc9451298ea173c4b324736',
        } )
    }
} )
