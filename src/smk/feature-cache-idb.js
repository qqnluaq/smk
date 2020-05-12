include.module( 'feature-cache-idb', [], function () {
    "use strict";

    function FeatureCacheIDB( ) {
        // this.storeName = storeName
        this.db = {}
    }

    SMK.TYPE.FeatureCacheIDB = FeatureCacheIDB

    FeatureCacheIDB.prototype.getDB = function ( layerId ) {
        var self = this

        if ( !this.db[ layerId ] ) 
            this.db[ layerId ] = window.idb.openDB( 'smk-offline--' + layerId, 1, {
                upgrade: function upgrade( db ) {
                    var tileStore = db.createObjectStore( 'features', {
                        keyPath: 'id'
                    } )
                }
            } )

        return this.db[ layerId ] 
    }

    FeatureCacheIDB.prototype.getObjectCount = function ( layerId ) {
        var self = this
        
        return this.getDB( layerId ).then( function ( db ) {
            return db.count( 'features' )
        } )
    }
    
    FeatureCacheIDB.prototype.getAllFeatures = function ( layerId ) {
        var self = this

        return this.getDB( layerId ).then( function ( db ) {
            return db.getAll( 'features' )
        } )
    }

    FeatureCacheIDB.prototype.clearFeatures = function ( layerId ) {                
        return this.getDB( layerId ).then( function ( db ) {
            return db.clear( 'features' )
        } )
    }

    // FeatureCacheIDB.prototype.setTileUrl = function ( layerId, tileInfo, tile ) {
    //     var originalSrc = tile.src
    //     tile.src = ''                
    //     return this.getTile( layerId, tileInfo )
    //         .then( function ( tileInfo ) {
    //             if ( !tileInfo || !tileInfo.blob )
    //                 throw new Error('tile not found in storage')

    //             tile.src = URL.createObjectURL( tileInfo.blob )

    //             return tileInfo
    //         } )
    //         .catch( function () {
    //             tile.src = originalSrc
    //         } )
    // }

    // FeatureCacheIDB.prototype.makeKey = function ( tileInfo ) {
    //     return L.Util.template( '{x}-{y}-{z}', tileInfo )
    // }
    
    // FeatureCacheIDB.prototype.getTile = function ( layerId, tileInfo ) {                
    //     var self = this
        
    //     return this.getDB( layerId ).then( function ( db ) {
    //         return db.get( 'features', self.makeKey( tileInfo ) )
    //     } )
    // }

    FeatureCacheIDB.prototype.putFeature = function ( layerId, feature ) {
        var self = this

        return this.getDB( layerId ).then( function ( db ) {
            // var key = self.makeKey( tileInfo )
            return db.get( 'features', feature.id )
                .then( function ( res ) {
                    if ( !res ) throw new Error( 'no feature for ' + feature.id )
                    return false
                } )
                .catch( function () {
                    // return fetch( tileUrl || tileInfo.url )
                    //     .then( function ( res ) {
                    //         if ( !res.ok )
                    //             throw new Error( "Request failed with status " + res.statusText )
                            
                    //         return res.blob()
                    //     } )
                    //     .then( function ( blob ) {
                    return db.put( 'features', feature ) 
                        .then( function () {
                            return true
                        } )
                } )
        } )
    }

    // FeatureCacheIDB.convertLayerBoundsToTileInfos = function ( layer, latlngBounds, zoom ) {
    //     var bounds = L.bounds(
    //         layer._map.project( latlngBounds.getNorthWest(), zoom ),
    //         layer._map.project( latlngBounds.getSouthEast(), zoom )
    //     )

    //     var tileBounds = L.bounds(
    //         bounds.min.divideBy( layer.getTileSize().x ).floor(),
    //         bounds.max.divideBy( layer.getTileSize().x ).floor()
    //     )

    //     var tileInfos = []
    //     for ( var j = tileBounds.min.y; j <= tileBounds.max.y; j += 1 ) {
    //         for ( var i = tileBounds.min.x; i <= tileBounds.max.x; i += 1 ) {
    //             var pt = new L.Point( i, j )
    //             pt.z = zoom

    //             tileInfos.push( {
    //                 // layerId: layer.options.id,
    //                 url: layer.getTileUrl( pt ),
    //                 z: zoom,
    //                 x: i,
    //                 y: j,  
    //             } )
    //         }
    //     }

    //     return tileInfos
    // }

    // FeatureCacheIDB.convertTileInfosToGeojson = function ( layer, tileInfos ) {
    //     var ts = layer.getTileSize()

    //     return {
    //         type: 'FeatureCollection',
    //         features: tileInfos.map( function ( t ) {
    //             var topLeftPoint = new L.Point( t.x * ts.x, t.y * ts.y )
    //             var bottomRightPoint = new L.Point( topLeftPoint.x + ts.x, topLeftPoint.y + ts.y )
    
    //             var topLeftlatlng = L.CRS.EPSG3857.pointToLatLng( topLeftPoint, t.z )
    //             var botRightlatlng = L.CRS.EPSG3857.pointToLatLng( bottomRightPoint, t.z )

    //             return {
    //                 type: 'Feature',
    //                 properties: t,
    //                 geometry: {
    //                     type: 'Polygon',
    //                     coordinates: [ [
    //                         [ topLeftlatlng.lng,  topLeftlatlng.lat  ],
    //                         [ botRightlatlng.lng, topLeftlatlng.lat  ],
    //                         [ botRightlatlng.lng, botRightlatlng.lat ],
    //                         [ topLeftlatlng.lng,  botRightlatlng.lat ],
    //                         [ topLeftlatlng.lng,  topLeftlatlng.lat  ] 
    //                     ] ]
    //                 }
    //             }                
    //         } )
    //     }
    // }        

} )


