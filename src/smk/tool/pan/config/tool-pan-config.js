include.module( 'tool-pan-config', [
    'tool-base-config',
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ]( {
            type: 'pan',
            position: 'actionbar',
            enabled: false,
            order: 2,
            control: true,
            icon: {
                compass: 'navigation',
                navModePan: 'open_with',
                navModeRotate: '3d_rotation'
            },
            title: {
                compass: 'Reset Orientation',
                navModePan: 'Panning Mode',
                navModeRotate: 'Rotate Mode'
            }
        } )
    )
} )
