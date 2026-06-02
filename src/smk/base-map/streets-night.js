include.module( 'base-map.streets-night-js', [], function ( inc ) {
    "use strict";

    // taken from
    // https://www.arcgis.com/home/item.html?id=7e2b9be8a9c94e45b7f87857d8d168d6
    
    return function ( defineBaseMap, defineBaseMapType ) {
        defineBaseMap( 'streets-night', {
            type: 'esri-vector-tile',
            url: '86f556a2d1fd468181855a35e344567f',
        } )       
    }
} )
