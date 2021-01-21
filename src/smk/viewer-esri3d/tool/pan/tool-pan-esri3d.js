include.module( 'tool-pan-esri3d', [ 'tool-pan', 'esri3d' ], function () {
    "use strict";

    SMK.TYPE.PanTool.addInitializer( function ( smk ) {
        var self = this

        if ( this.control ) {
            smk.$viewer.zoomHandler.keyDown.remove()

            var navModel = new SMK.TYPE.Esri3d.widgets.NavigationToggle.NavigationToggleViewModel( { 
                view: smk.$viewer.view,
            } )

            var compassModel = new SMK.TYPE.Esri3d.widgets.Compass.CompassViewModel( { 
                view: smk.$viewer.view,
            } )

            smk.on( this.id, {
                'trigger-compass': function () {
                    compassModel.reset()
                },               
                'trigger-nav-mode-pan': function () {
                    self.navMode = 'pan'
                    if ( navModel.navigationMode != 'pan' )
                        navModel.toggle()
                },               
                'trigger-nav-mode-rotate': function () {
                    self.navMode = 'rotate'
                    if ( navModel.navigationMode != 'rotate' )
                        navModel.toggle()
                },               
            } )   

            SMK.TYPE.Esri3d.core.watchUtils.watch( compassModel, "orientation", function() {
                self.compassStyle = { transform: 'rotateZ(' + compassModel.orientation.z + 'deg)' }
            } )    
        }

        smk.$viewer.panHandler.drag.remove()
        smk.$viewer.panHandler.keyDown.remove()
    } )

} )

