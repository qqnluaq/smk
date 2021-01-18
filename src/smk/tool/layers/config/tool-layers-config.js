include.module( 'tool-layers-config', [
    'tool-base-config',
    'tool-widget-config',
    'tool-panel-config',
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ](
        inc[ 'tool-widget-config' ](
        inc[ 'tool-panel-config' ]( {
            type: 'layers',
            enabled: false,
            order: 3,
            position: [ 'shortcut-menu', 'list-menu' ],
            icon: 'layers',
            title: 'Layers',
            command: {
                allVisibility: true,
                filter: true,
                legend: true,
            },
            glyph: {
                visible: 'visibility',
                hidden: 'visibility_off',
            }
        } ) ) )
    )
} )
