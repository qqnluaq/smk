include.module( 'merge-config', [ 'util' ], function () {
    "use strict";

    var pathMatchers = []

    function addPathMatchStrategy( pathPattern, handler ) {
        pathMatchers.push( {
            regex: new RegExp( '^' + pathPattern + '$' ),
            path: pathPattern,
            strategy: handler
        } )
    }

    addPathMatchStrategy( '',                                           objectMerge )
    addPathMatchStrategy( '/name',                                      valueMerge )
    addPathMatchStrategy( '/viewer',                                    objectMerge )
    addPathMatchStrategy( '/viewer/location',                           assignMerge )
    addPathMatchStrategy( '/layers',                                    arrayOfObjectMerge( 'id' ) )
    addPathMatchStrategy( '/layers<.+?>/id',                            ignoreMerge )
    addPathMatchStrategy( '/layers<.+?>/attributes',                    assignMerge )
    addPathMatchStrategy( '/layers<.+?>/queries',                       arrayOfObjectMerge( 'id' ) )
    addPathMatchStrategy( '/layers<.+?>/queries<.+?>/parameters',       arrayOfObjectMerge( 'id' ) )
    addPathMatchStrategy( '/tools',                                     toolMerge )
    addPathMatchStrategy( '/tools<.+?>/type',                           ignoreMerge )
    addPathMatchStrategy( '/tools<.+?>/instance',                       ignoreMerge )
    addPathMatchStrategy( '/tools<.+?>/position',                       assignMerge )
    addPathMatchStrategy( '/tools<layers,.+?>/display',                 arrayOfObjectMerge( 'id' ) )
    addPathMatchStrategy( '/tools<layers,.+?>/display<.+?>(/items<.+?>)*/items',   arrayOfObjectMerge( 'id' ) )
    addPathMatchStrategy( '/tools<.+?>/internalLayers',                 arrayOfObjectMerge( 'id' ) )
    addPathMatchStrategy( '/tools<.+?>/internalLayers<.+?>/style',      assignMerge )

    function getPathStrategy( path ) {
        for ( var i = 0; i < pathMatchers.length; i += 1 ) {
            var pm = pathMatchers[ i ]

            if ( !pm.regex.test( path ) ) continue

            if ( path != pm.path )
                console.debug( JSON.stringify( path ), '~', JSON.stringify( pm.path ) )

            return pm.strategy
        }
    }

    var typeStrategy = {
        object: objectMerge,
        array: arrayMerge,
        boolean: valueMerge,
        number: valueMerge,
        string: valueMerge,
    }

    function deref( objectIndex ) {
        var o = objectIndex[ 0 ], i = objectIndex[ 1 ]
        if ( i == null ) return o
        return o[ i ]
    }

    function merge( base, source, path ) {
        var strategy = getPathStrategy( path )
        if ( strategy ) {
            return strategy( base, source, path )
        }

        var btype = SMK.UTIL.type( deref( base ) )
        strategy = typeStrategy[ btype ]
        if ( strategy ) {
            return strategy( base, source, path )
        }

        var stype = SMK.UTIL.type( deref( source ) )
        strategy = typeStrategy[ stype ]
        if ( strategy ) {
            return strategy( base, source, path )
        }

        if ( stype == 'null' || stype == 'undefined' ) {
            return
        }

        console.warn( path, 'no merge strategy', base, source )
        throw Error( 'no merge strategy for "' + path + '"' )
    }

    function ignoreMerge( base, source, path ) {
        console.debug( path, 'ignored' )
    }

    function assignMerge( base, source, path ) {
        var b = deref( base ),
            s = deref( source )

        if ( !b ) {
            base[0][ base[1] ] = s
            console.log( path, '=', JSON.parse( JSON.stringify( s ) ) )
            return
        }

        if ( s === null ) {
            delete base[0][ base[1] ]
            console.log( path, 'deleted' )
            return
        }

        base[0][ base[1] ] = s
        console.log( path, '=', JSON.parse( JSON.stringify( s ) ) )
    }

    function assertObject( v, ctx, path  ) {
        if ( SMK.UTIL.type( v ) != 'object' ) throw Error( 'Expected an Object in ' + ctx + ' at ' + path )
    }

    function assertArray( v, ctx, path ) {
        if ( SMK.UTIL.type( v ) != 'array' ) throw Error( 'Expected an Array in ' + ctx + ' at ' + path )
    }

    function assertValue( v, ctx, path  ) {
        var t = SMK.UTIL.type( v )
        if ( t != 'number' && t != 'string' && t != 'boolean' ) throw Error( 'Expected a Value in ' + ctx + ' at ' + path )
    }

    function valueMerge( base, source, path ) {
        var b = deref( base ),
            s = deref( source )

        if ( !b ) {
            base[0][ base[1] ] = s
            console.log( path, '=', JSON.parse( JSON.stringify( s ) ) )
            return
        }

        if ( s === null ) {
            delete base[0][ base[1] ]
            console.log( path, 'deleted' )
            return
        }

        assertValue( s, 'source', path )
        base[0][ base[1] ] = s
        console.log( path, '=', JSON.parse( JSON.stringify( s ) ) )
    }

    function objectMerge( base, source, path ) {
        var b = deref( base ),
            s = deref( source )

        if ( !b ) {
            base[0][ base[1] ] = s
            console.log( path, '=', s )
            return
        }

        if ( s === null ) {
            delete base[0][ base[1] ]
            console.log( path, 'deleted' )
            return
        }

        assertObject( b, 'base', path )
        assertObject( s, 'source', path )

        Object.keys( s ).forEach( function ( k ) {
            merge( [ b, k ], [ s, k ], path + '/' + k )
        } )
    }

    function arrayMerge( base, source, path ) {
        var b = deref( base ),
            s = deref( source )

        if ( !b ) {
            base[0][ base[1] ] = s
            console.log( path, '=', s )
            return
        }

        if ( s === null ) {
            delete base[0][ base[1] ]
            console.log( path, 'deleted' )
            return
        }

        assertArray( b, 'base', path )
        assertArray( s, 'source', path )

        base[0][ base[1] ] = b.concat( s )
        console.log( path, 'concat', s )
    }

    function arrayOfObjectMerge( key ) {
        return function ( base, source, path ) {
            var b = deref( base ),
                s = deref( source )

            if ( !b ) b = []

            if ( s === null ) {
                delete base[0][ base[1] ]
                console.log( path, 'deleted' )
                return
            }

            assertArray( b, 'base', path )
            assertArray( s, 'source', path )

            var res = []

            b.forEach( function ( bo ) {
                updateObjectSet( res, bo, key, path )
            } )

            s.forEach( function ( so ) {
                updateObjectSet( res, so, key, path )
            } )

            base[0][ base[1] ] = res
        }
    }

    function updateObjectSet( set, item, key, path ) {
        assertArray( set, 'set', path )
        assertObject( item, 'item', path  )

        var keyVal = item[ key ],
            matchAll = keyVal == '*'
        
        if ( keyVal == null ) throw Error( 'Key value is null at ' + path )

        var indexes = set
            .map( function ( o, i ) {
                if ( matchAll ) return i
                if ( o[ key ] == keyVal ) return i
            } )
            .filter( function ( i ) {
                return i != null
            } )

        if ( matchAll || indexes.length > 0 ) {
            if ( indexes.length > 1 && !matchAll ) throw Error( 'Match more than 1 object at ' + path )

            var item2 = JSON.parse( JSON.stringify( item ) )
            delete item2[ key ]

            indexes.forEach( function ( i ) {
                merge( [ set, i ], [ [ item2 ], 0 ], path + '<' + set[ i ][ key ] + '>' )
            } )
        }
        else {
            set.push( item )
            console.log( path, 'concat', item )
        }
    }

    function toolMerge( base, source, path ) {
        var b = deref( base ),
            s = deref( source )

        assertArray( b, 'base', path )
        assertArray( s, 'source', path )

        s.forEach( function ( so, si ) {
            if ( !so.instance ) {
                arrayOfObjectMerge( 'type' )( base, [ [ [ so ] ], 0 ], path )
                return
            }

            if ( so.type == '*' ) {
                console.warn( 'tool type is *, but instance not null, skipping', so )
                return
            }

            var inst = b.find( function ( bo ) {
                return bo.type == so.type && bo.instance == so.instance
            } )

            if ( !inst ) {
                var baseInst = b.find( function ( bo ) {
                    return bo.type == so.type && bo.instance === true
                } )

                if ( baseInst ) {
                    inst = JSON.parse( JSON.stringify( baseInst ) )
                    inst.instance = so.instance
                    console.log( 'copied base instance', JSON.parse( JSON.stringify( inst ) ) )
                }
                else {
                    inst = {
                        type: so.type,
                        instance: so.instance
                    }
                    console.log( 'created base instance', JSON.parse( JSON.stringify( inst ) ) )
                }

                b.push( inst )
            }

            merge( [ [ inst ], 0 ], [ [ so ], 0 ], path + '<' + so.type + ',' + so.instance + '>' )
        } )
    }

    var mergeConfigs = function  ( configs ) {
        var base = JSON.parse( JSON.stringify( SMK.CONFIG ) )
        var inline = 0

        while( configs.length > 0 ) {
            var source = configs.shift()

            var $s = 'config ' + JSON.stringify( source.$source || 'inline #' + (inline += 1, inline) )
            delete source.$source
            console.groupCollapsed( $s )

            console.debug( 'merging:', JSON.parse( JSON.stringify( { base: base, source: source } ) ) )
            merge( [ { '$': base }, '$' ], [ { '$': source }, '$' ], '' )

            console.groupEnd( $s )
        }
        console.log( 'merged config', JSON.parse( JSON.stringify( base ) ) )

        return base
    }

    mergeConfigs.merge = merge
    mergeConfigs.arrayOfObjectMerge = arrayOfObjectMerge
    mergeConfigs.assignMerge = assignMerge
    mergeConfigs.ignoreMerge = ignoreMerge
    mergeConfigs.objectMerge = objectMerge
    mergeConfigs.toolMerge = toolMerge
    mergeConfigs.valueMerge = valueMerge

    return mergeConfigs
} )
