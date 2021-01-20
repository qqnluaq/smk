include.module( 'tool-zoom-config', [
    'tool-base-config',
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ]( {
            type: 'zoom',
            position: 'actionbar',
            enabled: false,
            order: 1,
            mouseWheel: true,
            doubleClick: true,
            box: true,
            control: true,
            icon: {
                zoomIn: 'add',
                zoomOut: 'remove'
            },
            title: {
                zoomIn: 'Zoom In',
                zoomOut: 'Zoom Out'
            }
        } )
    )
} )
