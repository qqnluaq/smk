include.module( 'layer.layer-js', [ 'jquery', 'util', 'event' ], function () {
    "use strict";

    var LayerEvent = SMK.TYPE.Event.define( [
        'startedLoading',
        'finishedLoading',
        'changedFeature',
    ] )

    function Layer( config ) {
        var self = this

        LayerEvent.prototype.constructor.call( this )

        $.extend( this, {
            config: config,
            // visible: false,
        } )

        var loading = false
        Object.defineProperty( this, 'loading', {
            get: function () { return loading },
            set: function ( v ) {
                if ( !!v == loading ) return
                // console.log( self.config.id, v )
                loading = !!v
                if ( v )
                    self.startedLoading()
                else
                    self.finishedLoading()
            }
        } )

        Object.defineProperty( this, 'id', {
            get: function () { return config.id }
        } )
    }

    $.extend( Layer.prototype, LayerEvent.prototype )

    SMK.TYPE.Layer = Layer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Layer.prototype.initialize = function ( viewer ) {
        var self = this

        if ( SMK.UTIL.type( this.config.zoomLevels ) == 'array' && this.config.zoomLevels.length > 0 ) {
            this.config.zoomLevels = this.config.zoomLevels
                .sort( function ( a, b ) { return a - b } )
                .reduce( function ( acc, v ) { if ( acc.length > 0 && v == acc[ acc.length - 1 ] ) return acc; acc.push( v ); return acc }, [] )
            this.config.zoomMin = this.config.zoomLevels[ 0 ]
            this.config.zoomMax = this.config.zoomLevels[ this.config.zoomLevels.length - 1 ]
        }
        else if ( this.config.zoomMax || this.config.zoomMin ) {
        }
        else if ( this.config.scaleMax || this.config.scaleMin || this.config.maxScale || this.config.minScale ) {
            this.config.zoomMin = this.config.zoomMax = null 

            if ( this.config.minScale || this.config.scaleMin )
                this.config.zoomMin = viewer.getZoomBracketForScale( this.config.scaleMin || this.config.minScale )[ 1 ]
                
            if ( this.config.maxScale || this.config.scaleMax )
                this.config.zoomMax = viewer.getZoomBracketForScale( this.config.scaleMax || this.config.maxScale )[ 0 ]
        }
    }

    Layer.prototype.hasChildren = function () { return false }

    Layer.prototype.initLegends = function () {
        return SMK.UTIL.resolved()
    }

    Layer.prototype.getLegends = function ( viewer ) {
        var self = this
        
        if ( !this.legendPromise ) {
            this.legendPromise = SMK.UTIL.makePromise( function ( res, rej ) {
                res( self.initLegends( viewer ) )
            } )        
        }

        return this.legendPromise
    }

    Layer.prototype.getFeaturesAtPoint = function ( arg ) {
    }

    Layer.prototype.canMergeWith = function ( other ) {
        return false
    }

    // I know this looks backwards. But it makes sense if you think of the scale values as denominators.
    // Layer.prototype.inScaleRange = function ( view ) {
    //     // console.log( this.config.title, this.config.minScale, view.scale, this.config.maxScale )
    //     if ( this.config.maxScale && view.scale < this.config.maxScale ) return false
    //     if ( this.config.minScale && view.scale > this.config.minScale ) return false
    //     return true
    // }

    Layer.prototype.getConfig = function () {
        return this.config
    }
    
} )
