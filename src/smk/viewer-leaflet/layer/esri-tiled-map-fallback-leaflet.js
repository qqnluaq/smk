/* global Map, fetch, createImageBitmap */
include.module( 'layer-leaflet.esri-tiled-map-fallback-leaflet-js', [], function () {
    "use strict";

    // Draws the deepest level an Esri tile cache holds at each place, enlarged, where the cache stops short.
    //
    // Past that level the cache answers 200 with a grey "Map data not yet available" tile. The service's tilemap
    // says which tiles exist, as the ArcGIS JS API reads it.
    //
    // Ported from bcgov/nr-bcws-wfprev#1325 (esri-tile-fallback.ts). There it patches L.esri.TiledMapLayer for
    // every user; here it is a subclass, used only by the esri-tiled-map basemap type.

    // The tilemap is asked in blocks of this many tiles a side, so the tiles beside each other share one request
    var BLOCK = 32
    // Further up, the part of the tile to enlarge is under one pixel
    var MAX_STEPS = 8
    // Decoded ancestor tiles kept, and tilemap blocks kept
    var MAX_ANCESTORS = 64
    var MAX_BLOCKS = 512

    function pow2( k ) { return Math.pow( 2, k ) }

    // The drawImage arguments for the part of an ancestor `k` levels up that lies under the tile at x, y, at full size.
    // One source pixel past each edge, so the edges blend into the next tile with no seam.
    function enlargeRect( width, k, x, y ) {
        var scale = pow2( k )
        var size = Math.floor( width / scale )
        return [ ( x % scale ) * size - 1, ( y % scale ) * size - 1, size + 2, size + 2, -scale, -scale, ( size + 2 ) * scale, ( size + 2 ) * scale ]
    }

    // Keeps at most `max` entries, dropping the oldest
    function remember( cache, key, value, max ) {
        cache.set( key, value )
        if ( cache.size > max ) cache.delete( cache.keys().next().value )
        return value
    }

    function EsriTileFallback() {
        this.blocks = new Map()
        this.ancestors = new Map()
    }

    // Whether the cache at `service` (its MapServer url, ending in a slash) holds the tile at level z, row y, column x:
    // true or false from the tilemap, null when the tilemap has no answer, so the tile is asked as before.
    EsriTileFallback.prototype.hasTile = function ( service, query, z, y, x ) {
        var url = service + 'tilemap/' + z + '/' + ( y - ( y % BLOCK ) ) + '/' + ( x - ( x % BLOCK ) ) + '/' + BLOCK + '/' + BLOCK + query

        var block = this.blocks.get( url )
        if ( !block )
            block = remember( this.blocks, url, fetch( url )
                .then( function ( r ) { return r.ok ? r.json() : null } )
                .catch( function () { return null } ), MAX_BLOCKS )

        return block.then( function ( b ) {
            var at = b && b.location
            if ( !b || !b.valid || !Array.isArray( b.data ) || !at ) return null
            var row = y - at.top
            var col = x - at.left
            if ( row < 0 || col < 0 || row >= at.height || col >= at.width ) return null
            return b.data[ row * at.width + col ] === 1
        } )
    }

    // How many levels up from `tile` the cache holds its place: 0 when it holds the tile itself or will not say.
    // `level` gives the service level for a map zoom, undefined where the service has none.
    EsriTileFallback.prototype.levelsUp = function ( service, query, tile, level ) {
        var self = this

        function step( k ) {
            if ( k > MAX_STEPS || tile.z - k < 0 ) return Promise.resolve( 0 )

            var z = level( tile.z - k )
            if ( z === undefined ) return Promise.resolve( 0 )

            var scale = pow2( k )
            return self.hasTile( service, query, z, Math.floor( tile.y / scale ), Math.floor( tile.x / scale ) )
                .then( function ( has ) {
                    return has !== false ? k : step( k + 1 )
                } )
        }

        return step( 0 )
    }

    // The image for a tile, drawn from the part of its ancestor `k` levels up, enlarged, as an object url
    EsriTileFallback.prototype.enlarge = function ( ancestorUrl, k, tile ) {
        return this.ancestor( ancestorUrl ).then( function ( whole ) {
            var canvas = document.createElement( 'canvas' )
            canvas.width = canvas.height = whole.width
            var ctx = canvas.getContext( '2d' )
            ctx.drawImage.apply( ctx, [ whole ].concat( enlargeRect( whole.width, k, tile.x, tile.y ) ) )

            return new Promise( function ( res ) { canvas.toBlob( res ) } )
        } )
        .then( function ( blob ) {
            if ( !blob ) throw new Error( 'Could not draw the tile from ' + ancestorUrl )
            return URL.createObjectURL( blob )
        } )
    }

    // One fetch and decode for all the tiles that enlarge the same ancestor
    EsriTileFallback.prototype.ancestor = function ( url ) {
        var self = this

        var image = this.ancestors.get( url )
        if ( !image ) {
            image = fetch( url )
                .then( function ( r ) {
                    if ( !r.ok ) throw new Error( 'HTTP ' + r.status + ' for ' + url )
                    return r.blob()
                } )
                .then( function ( b ) { return createImageBitmap( b ) } )
            remember( this.ancestors, url, image, MAX_ANCESTORS )
            image.catch( function () { self.ancestors.delete( url ) } )
        }
        return image
    }

    var fallback

    // The src for a tile: the tile itself, or its ancestor enlarged where the cache stops short of it
    function resolveTile( layer, coords ) {
        var direct = layer.getTileUrl( coords )
        var lodMap = layer._lodMap
        if ( !layer._smkTilemap || !lodMap || lodMap === 'crs' ) return Promise.resolve( direct )

        var query = layer.options.token ? '?token=' + layer.options.token : ''

        return fallback.levelsUp( layer.options.url, query, coords, function ( zoom ) { return lodMap[ zoom ] } )
            .then( function ( k ) {
                if ( !k ) return direct

                var scale = pow2( k )
                var up = { z: coords.z - k, x: Math.floor( coords.x / scale ), y: Math.floor( coords.y / scale ) }
                var ancestorUrl = L.Util.template( layer.tileUrl,
                    L.Util.extend( { s: layer._getSubdomain( up ), x: up.x, y: up.y, z: lodMap[ up.z ] }, layer.options ) )

                return fallback.enlarge( ancestorUrl, k, coords )
            } )
            .catch( function () { return direct } )
    }

    var FallbackLayer

    // Makes an esri-leaflet TiledMapLayer that draws the deepest level its cache holds, enlarged, instead of the
    // grey "not yet available" tile, on services whose metadata lists Tilemap. Other services, and every tile the
    // cache holds, load as before.
    SMK.UTIL.esriTiledMapLayerWithFallback = function ( option ) {
        if ( !FallbackLayer ) {
            fallback = new EsriTileFallback()

            var base = L.esri.TiledMapLayer.prototype

            FallbackLayer = L.esri.TiledMapLayer.extend( {
                // The layer asks for its service metadata once, when first added, to map map zooms to service levels.
                // Note from the same answer whether the service has a tilemap.
                metadata: function ( callback, context ) {
                    var layer = this
                    return base.metadata.call( this, function ( error, meta ) {
                        if ( !error ) layer._smkTilemap = /\bTilemap\b/.test( ( meta && meta.capabilities ) || '' )
                        return callback.call( this, error, meta )
                    }, context )
                },

                // As esri-leaflet 3.0.19's createTile, except that the src waits for the tilemap's answer
                createTile: function ( coords, done ) {
                    if ( this._smkTilemap === false ) return base.createTile.call( this, coords, done )

                    var self = this
                    var tile = document.createElement( 'img' )
                    L.DomEvent.on( tile, 'load', L.Util.bind( this._tileOnLoad, this, done, tile ) )
                    L.DomEvent.on( tile, 'error', L.Util.bind( this._tileOnError, this, done, tile ) )
                    if ( this.options.crossOrigin ) tile.crossOrigin = ''
                    tile.alt = ''

                    function load() {
                        resolveTile( self, coords ).then( function ( src ) {
                            var isBlob = src.indexOf( 'blob:' ) === 0
                            // Leaflet gives a tile it drops before it loads an empty src: leave that one be
                            if ( tile.getAttribute( 'src' ) ) {
                                if ( isBlob ) URL.revokeObjectURL( src )
                                return
                            }
                            if ( isBlob ) tile.addEventListener( 'load', function () { URL.revokeObjectURL( src ) }, { once: true } )
                            tile.src = src
                        } )
                    }

                    if ( this._lodMap === 'crs' || ( this._lodMap && this._lodMap[ this._getZoomForUrl() ] !== undefined ) )
                        load()
                    else
                        this.once( 'lodmap', load, this )

                    return tile
                }
            } )
        }

        return new FallbackLayer( option )
    }

} )
