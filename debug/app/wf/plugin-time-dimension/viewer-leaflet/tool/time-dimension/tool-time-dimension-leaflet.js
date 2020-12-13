include.module( 'tool-time-dimension-leaflet', [ 'tool-time-dimension', 'leaflet' ], function () {
    "use strict";

    SMK.TYPE.TimeDimensionTool.addInitializer( function ( smk ) {
        var timeDimension = new L.TimeDimension( this.timeDimensionOptions )

        smk.$viewer.map.timeDimension = timeDimension; 
        
        var player = new L.TimeDimension.Player( {
            transitionTime: 200, 
            loop: true,
            startOver:true
        }, timeDimension );
        player.start(1 )       
    } )
} )

