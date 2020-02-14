include.module( 'util', null, function ( inc ) {
    "use strict";

    Object.assign( window.SMK.UTIL, {
        makePromise: function( withFn ) {
            return new Promise( withFn || function () {} )
        },

        resolved: function() {
            return Promise.resolve.apply( Promise, arguments )
        },

        rejected: function() {
            return Promise.reject.apply( Promise, arguments )
        },

        waitAll: function ( promises ) {
            return Promise.all( promises )
        },

        type: function( val ) {
            var t = typeof val
            if ( t != 'object' ) return t
            if ( Array.isArray( val ) ) return 'array'
            if ( val === null ) return 'null'
            return 'object'
        },

        templatePattern: /<%=\s*(.*?)\s*%>/g,
        templateReplace: function ( template, replacer ) {
            if ( !template ) return template
            if ( !replacer ) return template

            var m = String( template ).match( this.templatePattern );
            if ( !m ) return template;

            replacer = ( function ( inner ) {
                return function ( param, match ) {
                    var r = inner.apply( null, arguments )
                    return r == null ? match : r
                }
            } )( replacer )

            if ( m.length == 1 && m[ 0 ] == template ) {
                var x = this.templatePattern.exec( template );
                return replacer( x[ 1 ], template )
            }

            return String( template ).replace( this.templatePattern, function ( match, parameterName ) {
                return replacer( parameterName, match )
            } )
        },

        isDeepEqual: function( a, b ) {
            var at = this.type( a );
            var bt = this.type( b );

            if ( at != bt ) return false;

            switch ( at ) {
            case 'array':
                if ( a.length != b.length ) return false;

                for ( var i1 = 0; i1 < a.length; i1 += 1 )
                    if ( !SMK.UTIL.isDeepEqual( a[ i1 ], b[ i1 ] ) )
                        return false

                return true;

            case 'object':
                var ak = Object.keys( a ).sort();
                var bk = Object.keys( b ).sort();

                if ( !SMK.UTIL.isDeepEqual( ak, bk ) )
                    return false

                for ( var i2 = 0; i2 < ak.length; i2 += 1 )
                    if ( !SMK.UTIL.isDeepEqual( a[ ak[ i2 ] ], b[ ak[ i2 ] ] ) )
                        return false

                return true;

            case 'string':
                return a == b;

            default:
                return String( a ) == String( b )
            }

            throw new Error( 'not supposed to be here' )
        },

        grammaticalNumber: function ( num, zero, one, many ) {
            if ( one == null ) one = zero
            if ( many == null ) many = one
            switch ( num ) {
                case 0: return zero == null ? '' : zero.replace( '{}', num )
                case 1: return one == null ? '' : one.replace( '{}', num )
                default: return many == null ? '' : many.replace( '{}', num )
            }
        },

        makeSet: function ( values ) {
            return values.reduce( function ( accum, v ) { accum[ v ] = true; return accum }, {} )
        },

        makeDelayedCall: function ( fn, option ) {
            var timeoutId

            option = Object.assign( {
                delay: 200,
            }, option )

            function cancel() {
                if ( timeoutId ) clearTimeout( timeoutId )
                timeoutId = null
            }

            var delayedCall = function () {
                var ctxt = option.context || this
                var args = option.arguments || [].slice.call( arguments )

                cancel()

                timeoutId = setTimeout( function () {
                    timeoutId = null
                    try {
                        fn.apply( ctxt, args )
                    }
                    catch ( e ) {
                        console.warn( 'during makeDelayedCall: ', e )
                    }
                }, option.delay )
            }

            delayedCall.cancel = cancel
            delayedCall.option = option

            return delayedCall
        },

        extractCRS: function ( obj ) {
            if ( obj.properties )
                if ( obj.properties.name )
                    return obj.properties.name

            throw new Error( 'unable to determine CRS from: ' + JSON.stringify( obj ) )
        },

        reproject: function ( geojson, crs ) {
            var self = this

            return include( 'projections' ).then( function ( inc ) {
                var proj = proj4( self.extractCRS( crs ) )

                return self.traverse.GeoJSON( geojson, {
                    coordinate: function ( c ) {
                        return proj.inverse( c )
                    }
                } )
            } )
        },

        traverse: {
            GeoJSON: function ( geojson, cb ) {
                Object.assign( {
                    coordinate: function ( c ) { return c }
                }, cb )

                return this[ geojson.type ]( geojson, cb )
            },

            Point: function ( obj, cb ) {
                return {
                    type: 'Point',
                    coordinates: cb.coordinate( obj.coordinates )
                }
            },

            MultiPoint: function ( obj, cb ) {
                return {
                    type: 'MultiPoint',
                    coordinates: obj.coordinates.map( function ( c ) { return cb.coordinate( c ) } )
                }
            },

            LineString: function ( obj, cb ) {
                return {
                    type: 'LineString',
                    coordinates: obj.coordinates.map( function ( c ) { return cb.coordinate( c ) } )
                }
            },

            MultiLineString: function ( obj, cb ) {
                return {
                    type: 'MultiLineString',
                    coordinates: obj.coordinates.map( function ( ls ) { return ls.map( function ( c ) { return cb.coordinate( c ) } ) } )
                }
            },

            Polygon: function ( obj, cb ) {
                return {
                    type: 'Polygon',
                    coordinates: obj.coordinates.map( function ( ls ) { return ls.map( function ( c ) { return cb.coordinate( c ) } ) } )
                }
            },

            MultiPolygon: function ( obj, cb ) {
                return {
                    type: 'MultiPolygon',
                    coordinates: obj.coordinates.map( function ( ps ) { return ps.map( function ( ls ) { return ls.map( function ( c ) { return cb.coordinate( c ) } ) } ) } )
                }
            },

            GeometryCollection: function ( obj, cb ) {
                var self = this
                return {
                    type: 'GeometryCollection',
                    geometries: obj.geometries.map( function ( g ) { return self[ g.type ]( g, cb ) } )
                }
            },

            FeatureCollection:  function ( obj, cb ) {
                var self = this
                return {
                    type: 'FeatureCollection',
                    features: obj.features.map( function ( f ) { return self[ f.type ]( f, cb ) } )
                }
            },

            Feature: function( obj, cb ) {
                return {
                    type: 'Feature',
                    geometry: this[ obj.geometry.type ]( obj.geometry, cb ),
                    properties: obj.properties
                }
            }
        },

        circlePoints: function ( center, radius, segmentCount ) {
            var points = []
            for( var i = 0; i <= segmentCount; i += 1 )
                points.push( [
                    center.x + radius * Math.cos( 2 * Math.PI * i / segmentCount ),
                    center.y + radius * Math.sin( 2 * Math.PI * i / segmentCount )
                ] )

            return points
        },

        findNearestSite: function ( location ) {
            var query = {
                point:              [ location.longitude, location.latitude ].join( ',' ),
                outputSRS:          4326,
                locationDescriptor: 'routingPoint',
                maxDistance:        1000,
            }

            return SMK.UTIL.makePromise( function ( res, rej ) {
                $.ajax( {
                    timeout:    10 * 1000,
                    dataType:   'json',
                    url:        'https://geocoder.api.gov.bc.ca/sites/nearest.geojson',
                    data:       query,
                } ).then( res, rej )
            } )
            .then( function ( data ) {
                return {
                    longitude:           data.geometry.coordinates[ 0 ],
                    latitude:            data.geometry.coordinates[ 1 ],
                    civicNumber:         data.properties.civicNumber,
                    civicNumberSuffix:   data.properties.civicNumberSuffix,
                    fullAddress:         data.properties.fullAddress,
                    localityName:        data.properties.localityName,
                    localityType:        data.properties.localityType,
                    streetName:          data.properties.streetName,
                    streetType:          data.properties.streetType,
                    // blockID
                    // changeDate1
                    // electoralArea
                    // fullSiteDescriptor
                    // isOfficial
                    // isStreetDirectionPrefix
                    // isStreetTypePrefix
                    // locationDescriptor
                    // locationPositionalAccuracy
                    // provinceCode
                    // siteID
                    // siteName
                    // siteRetireDate
                    // siteStatus
                    // streetDirection
                    // streetQualifier
                    // unitDesignator
                    // unitNumber
                    // unitNumberSuffix
                }
            } )
        },

        wrapFunction: function ( obj, fName, outer ) {
            return ( obj[ fName ] = ( function ( inner ) {
                return outer.call( null, inner )
            } )( obj[ fName ] ) )
        },

        asyncReduce: function ( cb, accum ) {
            var self = this

            return this.resolved()
                .then( function () { return accum } )
                .then( function ( arg ) {
                    var done
                    return cb( arg, function ( res ) { done = true; return res } )
                        .then( function ( res ) {
                            if ( done ) return res
                            return self.asyncReduce( cb, res )
                        } )
                } )
        },

        projection: function ( key ) {
            var keys = [].slice.call( arguments )

            return function ( obj ) {
                return keys.reduce( function ( accum, k ) {
                    if ( k in obj ) accum[ k ] = obj[ k ]
                    return accum
                }, {} )
            }
        },

        makeId: function () {
            var a = [].slice.call( arguments )
            return a
                .filter( function ( v ) { return v !== undefined } )
                .map( function ( v ) { return ( '' + v ).toLowerCase().replace( /[^a-z0-9]+/g, '-' ).replace( /^[-]|[-]$/g, '' ) } )
                .map( function ( v ) { return v ? v : '~' } )
                .join( '=' )
        },

        makeUUID: function () {
            /* jshint -W016 */
            var d = new Date().getTime()
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
                var r = ( d + Math.random() * 16 ) % 16 | 0
                d = Math.floor( d / 16 )
                return ( c == 'x' ? r : ( r & 0x3 | 0x8 ) ).toString( 16 )
            } )
        },

encodeUrl: function ( url, data ) {
    if ( !data ) return url

    var params = Object.keys( data )
        .filter( function ( k ) { return data[ k ] } )
        .map( function ( k ) {
            return encodeURIComponent( k ) + '=' + encodeURIComponent( data[ k ] )
        } )
        .join( '&' )

    if ( /[?]\S+$/.test( url ) )
        return url + '&' + params

    if ( /[?]$/.test( url ) )
        return url + params

    return url + '?' + params
},

fetchText: function ( url, data, opt ) {
    opt = Object.assign( {
        timeout: 10000,        
    }, opt )

    data[ '_' ] = Math.round( Math.random() * 1e10 )

    var abort = new window.AbortController()
    
    var id
    if ( opt.timeout )
        id = setTimeout( function() { 
            abort.abort() 
        }, opt.timeout )

    var resetTimeout = function () {
        if ( id ) clearTimeout( id )
        id = null
    }

    var req = this.encodeUrl( url, data )

    var init = {
        method: 'GET',
        signal: abort.signal,
    }

    var response = fetch( req, init ).then( function ( response ) {
        resetTimeout()

        if ( !response.ok ) 
            throw new Error( 'request to ' + url + ' failed: [' + response.status + '] ' + response.statusText )

        return response.text()
    } )
    .catch( function ( err ) {
        resetTimeout()
        return Promise.reject( err )
    } )

    return fetchResponse( response, function () { 
        resetTimeout()
        abort.abort() 
    } )
},

fetchJson: function ( url, data, opt ) {
    var textResponse = this.fetchText( url, data, opt )

    var jsonResponse = textResponse.response.then( function ( text ) {
        return JSON.parse( text )
    } )

    return fetchResponse( jsonResponse, textResponse.abort )
},

// fetchJsonP: function ( url, data, opt ) {
//     opt = Object.assign( {
//         timeout: 10000,
//     }, opt )

//     data[ '_' ] = Math.round( Math.random() * 1e10 )

//     if ( !data.callback )
//         data.callback = 'callback_' + Util.hash( url ) + Util.hash( data )

//     var id 
//     var cancel 
//     var req = Util.encodeUrl( url, data )
//     var promise = new Promise( function ( res, rej ) {
//         function cleanup() {
//             if ( id ) clearTimeout( id )
//             id = null

//             if ( script.parentNode )
//                 script.parentNode.removeChild( script )

//             window[ data.callback ] = null
//         }

//         window[ data.callback ] = function ( payload ) {
//             cleanup()
//             res( payload )
//         }

//         cancel = function () {
//             cleanup()
//             rej( new Error( 'cancelled' ) )
//         }

//         var script = L.DomUtil.create( 'script' )
//         script.type = 'text/javascript'
//         script.async = true
//         script.src = req

//         document.getElementsByTagName( 'head' )[ 0 ].appendChild( script )
//     } )

//     if ( opt.timeout )
//         id = setTimeout( cancel, opt.timeout )

//     return fetchResponse( promise, cancel )
// }



    } )

function fetchResponse( promise, abort ) {
    return {
        response: promise, 
        abort: abort
    }
}

} )