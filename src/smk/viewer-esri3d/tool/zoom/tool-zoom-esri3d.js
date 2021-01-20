include.module( 'tool-zoom-esri3d', [ 'tool-zoom', 'esri3d' ], function () {
    "use strict";

    SMK.TYPE.ZoomTool.addInitializer( function ( smk ) {
        if ( this.mouseWheel ) {
            smk.$viewer.zoomHandler.mouseWheel.remove()
        }

        if ( this.doubleClick ) {
            smk.$viewer.zoomHandler.doubleClick1.remove()
            smk.$viewer.zoomHandler.doubleClick2.remove()
        }

        if ( this.box ) {
            smk.$viewer.zoomHandler.drag1.remove()
            smk.$viewer.zoomHandler.drag2.remove()
        }

        if ( this.control ) {
            smk.$viewer.zoomHandler.keyDown.remove()

            var zoomModel = new SMK.TYPE.Esri3d.widgets.Zoom.ZoomViewModel( { 
                view: smk.$viewer.view,
            } )

            smk.on( this.id, {
                'trigger-zoom-in': function () {
                    zoomModel.zoomIn()
                },               
                'trigger-zoom-out': function () {
                    zoomModel.zoomOut()
                },               
            } )   
        }
    } )

} )

