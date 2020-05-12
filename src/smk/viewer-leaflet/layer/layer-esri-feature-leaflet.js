include.module( 'layer-leaflet.layer-esri-feature-leaflet-js', [ 'layer.layer-esri-feature-js' ], function () {
    "use strict";

    function EsriFeatureLeafletLayer() {
        SMK.TYPE.Layer[ 'esri-feature' ].prototype.constructor.apply( this, arguments )
    }

    $.extend( EsriFeatureLeafletLayer.prototype, SMK.TYPE.Layer[ 'esri-feature' ].prototype )

    SMK.TYPE.Layer[ 'esri-feature' ][ 'leaflet' ] = EsriFeatureLeafletLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'esri-feature' ][ 'leaflet' ].create = function ( layers, zIndex ) {
        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )
        var ly = layers[ 0 ]

        var opt = {
            url: ly.config.serviceUrl
        }

        if ( ly.config.zoomMin ) {
            opt.minZoom = ly.config.zoomMin
            // if ( ly.config.zoomMinVisibleBelow )
            //     opt.minNativeZoom = ly.config.zoomMin
        }

        if ( ly.config.zoomMax ) {
            opt.maxZoom = ly.config.zoomMax
            // if ( ly.config.zoomMaxVisibleAbove )
            //     opt.maxNativeZoom = ly.config.zoomMax
        }

        if ( ly.config.where )
            opt.where = ly.config.where

        if ( ly.config.drawingInfo ) {
            opt.drawingInfo = ly.config.drawingInfo
            if ( opt.drawingInfo.renderer && opt.drawingInfo.renderer.symbol && opt.drawingInfo.renderer.symbol.url )
                // opt.drawingInfo.renderer.symbol.url = this.resolveUrl( opt.drawingInfo.renderer.symbol.url )
                opt.drawingInfo.renderer.symbol.url = ( new URL( opt.drawingInfo.renderer.symbol.url, document.location ) ).toString()
        }
        
        var layer = L.esri.featureLayer( opt )
        
        if ( ly.legendCacheResolve ) {
            layer.legend( function ( err, leg ) {
                ly.legendCacheResolve( err ? null : leg.layers[ 0 ].legend )
                ly.legendCacheResolve = null
            } )
        }

        layer.on( 'load', function ( ev ) {
            if ( layer._currentImage )
                layer._currentImage.setZIndex( zIndex )

            ly.loading = false
        } )

        layer.on( 'loading', function ( ev ) {
            ly.loading = true
        } )

        layer.getAllFeatures = function () {
            var fts = []
            this.eachFeature( function ( ly ) {
                console.log(ly)
                var ft = SMK.UTIL.clone( ly.feature )
                ft.style = convertStyle( ly.options )
                fts.push( ft )
            } )
            return fts
        }

        return layer
    }

    function convertStyle( opt ) {
        // options:
        // clickable: true
        // color: "rgb(26,26,26)"
        // fillColor: "rgb(152,230,0)"
        // fillOpacity: 1
        // opacity: 1
        // pane: "markerPane"
        // proportionalPolygon: false
        // radius: 4.498875
        // stroke: true
        // url: "https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0/"
        // weight: 0.9997499999999999        

        // color:       styleConfig.strokeColor,
        // weight:      styleConfig.strokeWidth,
        // opacity:     styleConfig.strokeOpacity,
        // lineCap:     styleConfig.strokeCap,
        // dashArray:   styleConfig.strokeDashes,
        // // lineJoin:    styleConfig.,
        // dashOffset:  styleConfig.strokeDashOffset,
        // fill:        styleConfig.fill,
        // fillColor:   styleConfig.fillColor,
        // fillOpacity: styleConfig.fillOpacity,

        return {
            strokeColor:        opt.color,        
            // strokeWidth:        opt.weight,  
            strokeWidth:        opt.radius * 2,  
            strokeOpacity:      opt.opacity, 
            // strokeCap:          opt.    
            // strokeDashes:       opt.        
            // strokeDashOffset:   opt.            
            // fill:               opt.stroke
            fillColor:          opt.fillColor,
            fillOpacity:        opt.fillOpacity,        
        }
    }
} )
