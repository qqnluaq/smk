include.module( 'tool-reset-view-config', [
    'tool-base-config',
    'tool-widget-config'
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push( 
        inc[ 'tool-base-config' ](
        inc[ 'tool-widget-config' ]( {
            type: 'reset-view',
            position: 'actionbar',
            icon: 'zoom_out_map',
            title: 'Reset View'
        } ) )
    )
} )
