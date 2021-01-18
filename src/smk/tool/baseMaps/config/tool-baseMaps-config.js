include.module( 'tool-baseMaps-config', [
    'tool-base-config',
    'tool-widget-config',
    'tool-panel-config',
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push( 
        inc[ 'tool-base-config' ](
        inc[ 'tool-widget-config' ](
        inc[ 'tool-panel-config' ]( {
            type: 'baseMaps',
            enabled: false, 
            order: 3,
            position: [ 'shortcut-menu', 'list-menu' ],
            icon: 'map',
            title: 'Base Maps',
            mapStyle: {
                width: '110px',
                height: '110px',    
            }   
        } ) ) )
    )
} )
