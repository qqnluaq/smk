include.module( 'tool-actionbar-config', [
    'tool-base-config'
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ]( {
            type: 'actionbar',
            enabled: true
        } )
    )
} )
