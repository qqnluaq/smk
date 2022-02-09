include.module( 'tool-coordinate', [ 'tool', 'tool-coordinate.coordinate-html' ], function ( inc ) {
    "use strict";

    return SMK.TYPE.Tool.define( 'CoordinateTool',
        null,
        function ( smk ) {
            var self = this

            if ( smk.$device == 'mobile' ) return
    
            this.model = {
                latitude: null,
                longitude: null,
            }
    
            this.vm = new Vue( {
                el: smk.addToStatus( inc[ 'tool-coordinate.coordinate-html' ] ),
                data: this.model,
                methods: {
                    formatValue: function ( v ) {
                        switch ( self.format ) {
                            case 'DDM': 
                                var s = Math.sign( v ),
                                    a = Math.abs( v ),
                                    i = Math.floor( a ),
                                    m = ( a - i ) * 60
                                return ( s * i ) + ' ' + formatNumber( m, 6, 3 )
                                                        
                            case 'DD': 
                                return formatNumber( v, 6, 3 )

                            default:
                                return formatNumber( v, 6, 3 )
                        }
                    }
                }
            } )
    
            smk.$viewer.changedLocation( function ( ev ) {
                if ( ev.map && ev.map.latitude ) {
                    self.model.latitude = ev.map.latitude
                    self.model.longitude = ev.map.longitude
                }
                else {
                    self.model.latitude = null
                    self.model.longitude = null
                }
            } )    

            function formatNumber( value, precision, fractionPlaces ) {
                var rounded = parseFloat( value.toPrecision( precision ) )
        
                if ( !fractionPlaces )
                    return rounded.toLocaleString()
        
                var a = Math.abs( rounded ),
                    s = Math.sign( rounded ),
                    i = Math.floor( a ),
                    f = a - i
                return ( s * i ).toLocaleString() + f.toFixed( fractionPlaces ).substr( 1 )
            }        
        }
    )
} )
