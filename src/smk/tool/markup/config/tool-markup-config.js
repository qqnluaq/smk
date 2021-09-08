include.module( 'tool-markup-config', [
    'tool-base-config',
    'tool-widget-config'
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ]( 
        inc[ 'tool-widget-config' ]( {
            type: 'markup',
            instance: true,
            order: 3,
            position: 'toolbar',
            icon: 'edit',
            title: 'Markup'
        } ) )
    )
} )
