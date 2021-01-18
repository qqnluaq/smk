include.module( 'tool-markup-config', [
    'tool-base-config',
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ]( {
            type: 'markup',
            order: 3
        } )
    )
} )
