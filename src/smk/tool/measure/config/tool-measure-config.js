include.module( 'tool-measure-config', [
    'tool-base-config',
    'tool-widget-config',
    'tool-panel-config'
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ](
        inc[ 'tool-widget-config' ](
        inc[ 'tool-panel-config' ]( {
            type: 'measure',
            order: 6,
            position: [ 'shortcut-menu', 'list-menu' ],
            icon: 'straighten',
            title: 'Measurement',
            unit: 'metric'
        } ) ) )
    )
} )
