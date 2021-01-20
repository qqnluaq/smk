include.module( 'tool-zoom-leaflet', [ 'tool-zoom', 'leaflet' ], function () {
    "use strict";

    SMK.TYPE.ZoomTool.addInitializer( function ( smk ) {
        // if ( smk.$device == 'mobile' ) return

        if ( this.mouseWheel ) {
            smk.$viewer.map.scrollWheelZoom.enable()
        }

        if ( this.doubleClick ) {
            smk.$viewer.map.doubleClickZoom.enable()
        }

        if ( this.box ) {
            smk.$viewer.map.boxZoom.enable()
        }

        if ( this.control ) {
            smk.on( this.id, {
                'trigger-zoom-in': function () {
                    smk.$viewer.map.zoomIn()
                },               
                'trigger-zoom-out': function () {
                    smk.$viewer.map.zoomOut()
                },               
            } )   
        }
    } )
} )

