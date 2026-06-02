include.module( 'base-map.composite-js', [], function ( inc ) {
    "use strict";

    return function ( defineBaseMap, defineBaseMapType ) {
        defineBaseMapType( 'composite', function ( cfg ) {
            return cfg.layers.reduce( function ( acc, ly ) {
                var lyConfig = defineBaseMap( ly )
                if ( !lyConfig ) throw Error( 'in composite layer ' + cfg.id + ', no base map defined for ' + ly )

                var lyType = defineBaseMapType( lyConfig.type )
                if ( !lyType ) throw Error( 'in composite layer ' + cfg.id + ', base map ' + ly + ' has unknown type ' + lyConfig.type )

                var lys
                try {
                    lys = lyType( lyConfig )
                }
                catch ( e ) {
                    throw Error( 'in composite layer ' + cfg.id + ', base map ' + ly + ' failed: ' + e )
                }

                return acc.concat( lys )
            }, [] )
        } )
    }
} )
