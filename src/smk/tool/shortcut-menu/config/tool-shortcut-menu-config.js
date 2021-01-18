include.module( 'tool-shortcut-menu-config', [
    'tool-base-config',
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ]( {
            type: 'shortcut-menu',
            order: 10
        } )
    )
} )
