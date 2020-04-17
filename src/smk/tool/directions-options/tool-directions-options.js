include.module( 'tool-directions-options', [ 
    'tool.tool-base-js', 
    'tool.tool-panel-js', 
    'component-select-option',
    'tool-directions-options.panel-directions-options-html' 
], function ( inc ) {
    "use strict";

    Vue.component( 'directions-options-panel', {
        extends: SMK.COMPONENT.ToolPanelBase,
        template: inc[ 'tool-directions-options.panel-directions-options-html' ],
        props: {
            'truck' : Boolean, 
            'optimal' : Boolean, 
            'roundTrip' : Boolean, 
            'criteria': String,
            'truckRoute': Number,
            'truckHeight': Number,
            'truckWidth': Number,
            'truckLength': Number,
            'truckWeight': Number,
            'truckHeightUnit': Number,
            'truckWidthUnit': Number,
            'truckLengthUnit': Number,
            'truckWeightUnit': Number,
            'oversize' : Boolean, 
            'command': Object,
            'bespoke': Object
        },
        methods: {
            fromUnit: function ( val, unit ) {
                return ( val * unit )
            },
            toUnit: function ( val, unit ) {
                return ( val / unit )
            },
            formatNumber: function ( value, fractionPlaces ) {
                var i = Math.floor( value ),
                    f = value - i

                return i.toString() + f.toFixed( fractionPlaces ).substr( 1 )
            }
        }
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    return SMK.TYPE.Tool.define( 'DirectionsOptionsTool', 
        function () {
            SMK.TYPE.ToolPanel.call( this, 'directions-options-panel' )
        
            this.defineProp( 'truck' )
            this.defineProp( 'optimal' )
            this.defineProp( 'roundTrip' )
            this.defineProp( 'criteria' )
            this.defineProp( 'truckRoute' )
            this.defineProp( 'truckHeight', { validate: positiveFloat } )
            this.defineProp( 'truckWidth', { validate: positiveFloat } )
            this.defineProp( 'truckLength', { validate: positiveFloat } )
            this.defineProp( 'truckWeight', { validate: positiveFloat } )
            this.defineProp( 'truckHeightUnit' )
            this.defineProp( 'truckWidthUnit' )
            this.defineProp( 'truckLengthUnit' )
            this.defineProp( 'truckWeightUnit' )
            this.defineProp( 'oversize' )
            this.defineProp( 'command' )
            this.defineProp( 'bespoke' )
    
            this.truck = false
            this.optimal = false
            this.roundTrip = false
            this.criteria = 'shortest'
            this.truckRoute = null
            this.truckHeight = null
            this.truckWidth = null
            this.truckLength = null
            this.truckWeight = null
            this.truckHeightUnit = 1
            this.truckWidthUnit = 1
            this.truckLengthUnit = 1
            this.truckWeightUnit = 1
            this.oversize = false
            this.command = {}
            this.bespoke = {}

            function positiveFloat( newVal, oldVal, propName ) {
                var i = parseFloat( newVal )
                if ( !newVal || !i ) return null
                if ( i < 0 ) return oldVal
                return i
            }   
        },
        function ( smk ) {
            var self = this

            var directions = smk.$tool[ 'directions' ]
    
            var findRouteDelayed = SMK.UTIL.makeDelayedCall( function () {
                directions.findRoute()
            } )
    
            smk.on( this.id, {
                'change': function ( ev, comp ) {
                    Object.assign( self, ev )
    
                    comp.$forceUpdate()
                    findRouteDelayed()
                },
            } )
    
            smk.$viewer.handlePick( 3, function ( location ) {
                if ( !self.active ) return
    
                directions.active = true
    
                return false
            } )        
    
            this.bespoke.create = function ( el ) {
                SMK.HANDLER.get( self.id, 'activated' )( smk, self, el )
            }
        }
    )    
} )

