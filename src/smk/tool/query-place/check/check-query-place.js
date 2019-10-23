include.module( 'check-query-place', [], function ( inc ) {
    "use strict";

    return function ( smk, tool ) {
        smk.tools.push( Object.assign( {}, tool, {
            type: 'query-results',
            instance: 'place',
            enabled: true,
        } ) )

        smk.tools.push( Object.assign( {}, tool, {
            type: 'query-feature',
            instance: 'place',
            enabled: true,
        } ) )
    }
    
} )