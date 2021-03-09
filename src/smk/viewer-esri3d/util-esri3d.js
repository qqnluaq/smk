include.module( 'util-esri3d', [ 'types-esri3d', 'terraformer' ], function ( inc ) {
    "use strict";

    var featureId = 1000

    var geojsonType = {
        Point: function ( obj ) {
            return [ Object.assign( { type: 'point' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        MultiPoint: function ( obj ) {
            return obj.coordinates.reduce( function ( acc, c ) {
                return acc.concat( convertGeojson( { type: 'Point', coordinates: c } ) )
            }, [] )
        },

        LineString: function ( obj ) {
            return [ Object.assign( { type: 'polyline' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        MultiLineString: function ( obj ) {
            return [ Object.assign( { type: 'polyline' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        Polygon: function ( obj ) {
            return [ Object.assign( { type: 'polygon' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        MultiPolygon: function ( obj ) {
            return [ Object.assign( { type: 'polygon' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        GeometryCollection: function ( obj ) {
            return obj.geometries.reduce( function ( acc, g ) {
                return acc.concat( convertGeojson( g ) )
            }, [] )
        },

        FeatureCollection:  function ( obj ) {
            return obj.features.reduce( function ( acc, f ) {
                return acc.concat( convertGeojson( f ) )
            }, [] )
        },

        Feature:  function ( obj ) {
            return convertGeojson( obj.geometry ).map( function ( g ) {
                featureId += 1
                return {
                    geometry:   g,
                    attributes: Object.assign( { 
                        _geojsonGeometry: obj.geometry, 
                        _featureId: featureId 
                    }, obj.properties )
                }    
            } )
        },
    }

    function convertGeojson( geojson ) {
        return geojsonType[ geojson.type || 'Feature' ]( geojson )
    }

    Object.assign( window.SMK.UTIL, {
        geoJsonToEsriGraphics: function ( geojson ) {
            return convertGeojson( geojson )
        },
        
        mapSymbolsToGraphics: function ( graphics, symbols ) {
            var self = this

            return graphics.reduce( function ( acc, g ) {
                return acc.concat( self.symbolsForGraphic( g, symbols ).map( function ( symbol, i ) {
                    var g1
                    if ( g.clone ) {
                        g1 = g.clone()
                    }
                    else {
                        g1 = Object.assign( {}, g )
                    }

                    g1.symbol = symbol
                    g1.attributes._symbolIndex = i

                    return g1
                } ) )
            }, [] ) 
        },

        symbolsForGraphic: function ( graphic, symbols ) {
            symbols = [].concat( symbols || [] )
            if ( symbols.length == 0 ) symbols.push( {} )

            return symbols.map( function ( symbol, i ) {
                var s = symbol[ graphic.geometry.type ]
                if ( SMK.UTIL.type( s ) == 'function' )
                    return s( graphic.attributes ) 

                return s
            } )
        },

        smkStyleToEsriSymbol: function ( styleConfig, viewer ) {
            var line = {
                type: 'line-3d',
                symbolLayers: [ {
                    type: 'line',
                    size: styleConfig.strokeWidth,
                    material: {
                        color: color( styleConfig.strokeColor, styleConfig.strokeOpacity ),
                    },
                    cap: styleConfig.strokeCap,
                    join: styleConfig.strokeJoin
                } ]
            }

            var point
            if ( styleConfig.markerUrl ) {
                var sz = styleConfig.markerSize,
                    cx = sz[ 0 ] / 2,
                    cy = sz[ 1 ] / 2,
                    off = styleConfig.markerOffset || [],
                    ox = off[ 0 ] || cx,
                    oy = off[ 1 ] || cy,
                    x = ox / sz[ 0 ] - 0.5,
                    y = oy / sz[ 1 ] - 0.5

                point = {
                    type: 'point-3d',
                    symbolLayers: [
                        {
                            type:       'icon',
                            size:       Math.max.apply( Math, styleConfig.markerSize ) + 'px',
                            anchor:     'relative',
                            anchorPosition: { x: x, y: y },
                            resource: {
                                href: viewer.resolveAttachmentUrl( styleConfig.markerUrl, null, 'png' )
                            }
                        }
                    ]
                }
            }
            else {
                var sw = styleConfig.strokeWidth || 3,
                    fc = styleConfig.fillColor || '#3388ff',
                    fo = styleConfig.fillOpacity || 0.2,
                    sc = styleConfig.strokeColor || '#3388ff',
                    so = styleConfig.strokeOpacity || 1

                point = {
                    type: 'point-3d',
                    symbolLayers: [ {
                        type: 'icon',
                        size: sw,
                        resource: {
                            primitive: 'circle'
                        },
                        material: {
                            color: color( fc, fo ),
                        },
                        outline: {
                            size: 1,
                            color: color( sc, so ),
                        }
                    }  ]
                }
            }

            var fill = {
                type: 'polygon-3d',
                symbolLayers: []
            }

            if ( styleConfig.fill )
                 fill.symbolLayers.push( {
                    type: 'fill',
                    material: {
                        color: color( styleConfig.fillColor, styleConfig.fillOpacity )
                    },
                } )

            if ( styleConfig.stroke !== false )
                fill.symbolLayers.push( line.symbolLayers[ 0 ] )

            var styles = [
                {
                    point: point,
                    polyline: line,
                    polygon: fill
                }
            ]

            if ( styleConfig.labelAttribute ) {
                styles.unshift( {
                    point: function ( prop ) {
                        return {
                            type: 'text',
                            color: styleConfig.labelColor || 'black',
                            haloColor: styleConfig.labelBackgroundColor, 
                            haloSize: 3,
                            text: prop[ styleConfig.labelAttribute ] + '\n\n'
                        }                        
                    } 
                 } )
            }

            return styles 

            function color( c, a ) {
                var ec = new SMK.TYPE.Esri3d.Color( c )
                ec.a = a
                return ec
            }
        }

    } )

} )