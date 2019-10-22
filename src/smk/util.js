/* jshint esversion: 9 */
/* jshint -W014 */

include.module( 'util', null, function ( inc ) {
    "use strict";

    //used by import geojson to keep track of the many multipoint collections
    var multiPointCollectionCounter;

    Object.assign( window.SMK.UTIL, {

        makePromise: function( withFn ) {
            return new Promise( withFn || function () {} );
        },

        resolved: function() {
            return Promise.resolve.apply( Promise, arguments );
        },

        rejected: function() {
            return Promise.reject.apply( Promise, arguments );
        },

        waitAll: function ( promises ) {
            return Promise.all( promises );
        },

        type: function( val ) {
            var t = typeof val;
            if ( t != 'object' ) return t;
            if ( Array.isArray( val ) ) return 'array';
            if ( val === null ) return 'null';
            return 'object';
        },

        templatePattern: /<%=\s*(.*?)\s*%>/g,
        templateReplace: function ( template, replacer ) {
            if ( !replacer ) return template;

            var m = template.match( this.templatePattern );
            if ( !m ) return template;

            replacer = ( function ( inner ) {
                return function ( param, match ) {
                    var r = inner.apply( null, arguments );
                    return r == null ? match : r;
                };
            } )( replacer );

            if ( m.length == 1 && m[ 0 ] == template ) {
                var x = this.templatePattern.exec( template );
                return replacer( x[ 1 ], template );
            }

            return template.replace( this.templatePattern, function ( match, parameterName ) {
                return replacer( parameterName, match );
            } );
        },

        isDeepEqual: function( a, b ) {
            var at = this.type( a );
            var bt = this.type( b );

            if ( at != bt ) return false;

            switch ( at ) {
            case 'array':
                if ( a.length != b.length ) return false;

                for ( var i1 = 0; i1 < a.length; i1 += 1 )
                    if ( !SMK.UTIL.isDeepEqual( a[ i1 ], b[ i1 ] ) )
                        return false;

                return true;

            case 'object':
                var ak = Object.keys( a ).sort();
                var bk = Object.keys( b ).sort();

                if ( !SMK.UTIL.isDeepEqual( ak, bk ) )
                    return false;

                for ( var i2 = 0; i2 < ak.length; i2 += 1 )
                    if ( !SMK.UTIL.isDeepEqual( a[ ak[ i2 ] ], b[ ak[ i2 ] ] ) )
                        return false;

                return true;

            case 'string':
                return a == b;

            default:
                return String( a ) == String( b );
            }

            throw new Error( 'not supposed to be here' );
        },

        grammaticalNumber: function ( num, zero, one, many ) {
            if ( one == null ) one = zero;
            if ( many == null ) many = one;
            switch ( num ) {
                case 0: return zero == null ? '' : zero.replace( '{}', num );
                case 1: return one == null ? '' : one.replace( '{}', num );
                default: return many == null ? '' : many.replace( '{}', num );
            }
        },

        makeSet: function ( values ) {
            return values.reduce( function ( accum, v ) { accum[ v ] = true; return accum }, {} );
        },

        makeDelayedCall: function ( fn, option ) {
            var timeoutId;

            function cancel() {
                if ( timeoutId ) clearTimeout( timeoutId );
                timeoutId = null;
            }

            var delayedCall = function () {
                var ctxt = option.context || this;
                var args = option.arguments || [].slice.call( arguments );

                cancel();

                timeoutId = setTimeout( function () {
                    timeoutId = null;
                    fn.apply( ctxt, args );
                }, option.delay || 200 );
            };

            delayedCall.cancel = cancel;

            return delayedCall;
        },

        extractCRS: function ( obj ) {
            if ( obj.properties )
                if ( obj.properties.name )
                    return obj.properties.name;

            throw new Error( 'unable to determine CRS from: ' + JSON.stringify( obj ) );
        },

        reproject: function ( geojson, crs ) {
            var self = this;

            return include( 'projections' ).then( function ( inc ) {
                var proj = proj4( self.extractCRS( crs ) );

                return self.traverse.GeoJSON( geojson, {
                    coordinate: function ( c ) {
                        return proj.inverse( c );
                    }
                } );
            } );
        },

        traverse: {
            GeoJSON: function ( geojson, cb ) {
                Object.assign( {
                    coordinate: function ( c ) { return c }
                }, cb );

                return this[ geojson.type ]( geojson, cb );
            },

            Point: function ( obj, cb ) {
                return {
                    type: 'Point',
                    coordinates: cb.coordinate( obj.coordinates )
                };
            },

            MultiPoint: function ( obj, cb ) {
                return {
                    type: 'MultiPoint',
                    coordinates: obj.coordinates.map( function ( c ) { return cb.coordinate( c ) } )
                };
            },

            LineString: function ( obj, cb ) {
                return {
                    type: 'LineString',
                    coordinates: obj.coordinates.map( function ( c ) { return cb.coordinate( c ) } )
                };
            },

            MultiLineString: function ( obj, cb ) {
                return {
                    type: 'MultiLineString',
                    coordinates: obj.coordinates.map( function ( ls ) { return ls.map( function ( c ) { return cb.coordinate( c ) } ) } )
                };
            },

            Polygon: function ( obj, cb ) {
                return {
                    type: 'Polygon',
                    coordinates: obj.coordinates.map( function ( ls ) { return ls.map( function ( c ) { return cb.coordinate( c ) } ) } )
                };
            },

            MultiPolygon: function ( obj, cb ) {
                return {
                    type: 'MultiPolygon',
                    coordinates: obj.coordinates.map( function ( ps ) { return ps.map( function ( ls ) { return ls.map( function ( c ) { return cb.coordinate( c ) } ) } ) } )
                };
            },

            GeometryCollection: function ( obj, cb ) {
                var self = this
                return {
                    type: 'GeometryCollection',
                    geometries: obj.geometries.map( function ( g ) { return self[ g.type ]( g, cb ) } )
                };
            },

            FeatureCollection:  function ( obj, cb ) {
                var self = this
                return {
                    type: 'FeatureCollection',
                    features: obj.features.map( function ( f ) { return self[ f.type ]( f, cb ) } )
                };
            },

            Feature: function( obj, cb ) {
                return {
                    type: 'Feature',
                    geometry: this[ obj.geometry.type ]( obj.geometry, cb ),
                    properties: obj.properties
                };
            }
        },

        circlePoints: function ( center, radius, segmentCount ) {
            var points = [];
            for( var i = 0; i <= segmentCount; i += 1 )
                points.push( [
                    center.x + radius * Math.cos( 2 * Math.PI * i / segmentCount ),
                    center.y + radius * Math.sin( 2 * Math.PI * i / segmentCount )
                ] );

            return points;
        },

        findNearestSite: function ( location ) {
            var query = {
                point:              [ location.longitude, location.latitude ].join( ',' ),
                outputSRS:          4326,
                locationDescriptor: 'routingPoint',
                maxDistance:        1000,
            };

            return SMK.UTIL.makePromise( function ( res, rej ) {
                $.ajax( {
                    timeout:    10 * 1000,
                    dataType:   'json',
                    url:        'https://geocoder.api.gov.bc.ca/sites/nearest.geojson',
                    data:       query,
                } ).then( res, rej );
            } )
            .then( function ( data ) {
                return {
                    longitude:           data.geometry.coordinates[ 0 ],
                    latitude:            data.geometry.coordinates[ 1 ],
                    civicNumber:         data.properties.civicNumber,
                    civicNumberSuffix:   data.properties.civicNumberSuffix,
                    fullAddress:         data.properties.fullAddress,
                    localityName:        data.properties.localityName,
                    localityType:        data.properties.localityType,
                    streetName:          data.properties.streetName,
                    streetType:          data.properties.streetType,
                    // blockID
                    // changeDate1
                    // electoralArea
                    // fullSiteDescriptor
                    // isOfficial
                    // isStreetDirectionPrefix
                    // isStreetTypePrefix
                    // locationDescriptor
                    // locationPositionalAccuracy
                    // provinceCode
                    // siteID
                    // siteName
                    // siteRetireDate
                    // siteStatus
                    // streetDirection
                    // streetQualifier
                    // unitDesignator
                    // unitNumber
                    // unitNumberSuffix
                };
            } );
        },

        wrapFunction: function ( obj, fName, outer ) {
            return ( obj[ fName ] = ( function ( inner ) {
                return outer.call( null, inner );
            } )( obj[ fName ] ) );
        },

        asyncReduce: function ( cb, accum ) {
            var self = this;

            return this.resolved()
                .then( function () { return accum } )
                .then( function ( arg ) {
                    var done;
                    return cb( arg, function ( res ) { done = true; return res } )
                        .then( function ( res ) {
                            if ( done ) return res;
                            return self.asyncReduce( cb, res );
                        } )
                } );
        },

        projection: function ( key ) {
            var keys = [].slice.call( arguments );

            return function ( obj ) {
                return keys.reduce( function ( accum, k ) {
                    if ( k in obj ) accum[ k ] = obj[ k ];
                    return accum;
                }, {} );
            };
        },

        makeId: function () {
            var a = [].slice.call( arguments );
            return a
                .filter( function ( v ) { return v !== undefined } )
                .map( function ( v ) { return ( '' + v ).toLowerCase().replace( /[^a-z0-9]+/g, '-' ).replace( /^[-]|[-]$/g, '' ) } )
                .map( function ( v ) { return v ? v : '~' } )
                .join( '=' )
        },

        /////////////////////////////////////////////////////// START OF GEO JSON IMPORT SUPPORT ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        

            //print a geoJSONfile to a leaflet map
        addGeoJSONFileToMap: function ( geoJSONFile, color, stroke, fill, opacity, strokeWidth, lineCap, lineJoin, dashArray, dashOffset, fillColor, fillOpacity, fillRule ) {

        console.log ("color, stroke, fill, opacity, strokeWidth, lineCap, lineJoin, dashArray, dashOffset, fillColor, fillOpacity, is: ", 
        color, stroke, fill, opacity, strokeWidth, lineCap, lineJoin, dashArray, dashOffset, fillColor, fillOpacity, fillRule);

        //used to give each geometry collections added in the file to the map an ID that will be combined with date to be unique to this session
        // useful when trying to rebuild geomtry collections later
        let geometryCollectionCounter = 0;
        
        let date = new Date();
        let featureCollectionTimeAdded = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(); 

        let geoJSONStyle = {
            "color": color,
            "weight": strokeWidth,
            "opacity": opacity,
            "stroke": stroke,
            "strokeWidth": strokeWidth,
            "fill": fill,
            "lineCap": lineCap,
            "lineJoin": lineJoin,
            "dashArray": dashArray,
            "dashOffset": dashOffset,
            "fillColor": fillColor,
            "fillOpacity": fillOpacity,
            "fillRule": fillRule,
            
        };
        
        console.log(geoJSONFile);
        geoJSONFile = JSON.parse(geoJSONFile);
        console.log("GeoJSON file parsed: ", geoJSONFile);

        let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;

        if (geoJSONFile.type == "Feature") {

            switch(geoJSONFile.geometry.type) {
                case "GeometryCollection":
                    SMK.UTIL.addGeoJSONGeometryCollectionAndStyleToMap(geoJSONFile, null, geoJSONStyle, map, "GeometryCollection", geometryCollectionCounter, "No Collection");
                    geometryCollectionCounter += 1;
                    break;
                case "Point":
                    SMK.UTIL.addGeoJSONPointAsCircleMarker(geoJSONFile, null, geoJSONStyle, map, "Point", "No Collection", "No Geo Collection", "No Geo Collection");
                    break;
                case "MultiPoint":
                    SMK.UTIL.addGeoJSONMultiPointsAsCircleMarker(geoJSONFile, null, geoJSONStyle, map, "MultiPoint", "No Collection", "No Geo Collection", "No Geo Collection");
                    break;
                default:
                    let mapLayer = L.geoJSON(geoJSONFile, {
                        style: geoJSONStyle,
                        originalGeoJSONType: geoJSONFile.geometry.type,
                        featureCollectionTime: "No Collection",
                        alt: "No Collection"
                    }).addTo(map);
                    this.ifContentExists(mapLayer, geoJSONFile);
            }
        } else if ( geoJSONFile.type == "FeatureCollection") {
            for ( let feature in geoJSONFile.features){
                if (geoJSONFile.features[feature].type == "Feature") {
                    switch(geoJSONFile.features[feature].geometry.type) {
                        // the types are passed in to addgeoJSONFeatureAndStyleToMap so that leaflet has access to them in objects, useful elsewhere
                        case "Point":
                            SMK.UTIL.addGeoJSONPointAsCircleMarker(geoJSONFile, feature, geoJSONStyle, map, "Point", featureCollectionTimeAdded, "No Geo Collection", "No Geo Collection");
                            break;
                        case "LineString":
                            SMK.UTIL.addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "LineString", featureCollectionTimeAdded);
                            break;
                        case "Polygon":
                            SMK.UTIL.addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "Polygon", featureCollectionTimeAdded);
                            break;
                        case "MultiPoint":
                            SMK.UTIL.addGeoJSONMultiPointsAsCircleMarker(geoJSONFile, feature, geoJSONStyle, map, "MultiPoint", featureCollectionTimeAdded, "No Geo Collection", "No Geo Collection");
                            break;
                        case "MultiLineString":
                            SMK.UTIL.addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "MultiLineString", featureCollectionTimeAdded);
                            break;
                        case "MultiPolygon":
                            SMK.UTIL.addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "MultiPolygon", featureCollectionTimeAdded);
                            break;
                        case "GeometryCollection":
                            SMK.UTIL.addGeoJSONGeometryCollectionAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "GeometryCollection", geometryCollectionCounter, featureCollectionTimeAdded);
                            geometryCollectionCounter += 1;
                            break;
                        default:
                            console.log("Not one of the defaults");   
                    }
                // line strings are here also in case they're in included inside a file without being in a feature
                }  else if (geoJSONFile.features[feature].type == "LineString") {
                    SMK.UTIL.addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "LineString", featureCollectionTimeAdded);
                }
            }
        } else {
            return false;
        }
        return true;
    },


    ifContentExists: function ( leafletMapLayer, geoJSONFile) {
            console.log( leafletMapLayer,  geoJSONFile);
            if (typeof geoJSONFile.properties != "undefined"){
                if (geoJSONFile.properties.content != null) {
                    leafletMapLayer.bindTooltip(geoJSONFile.properties.content, {
                        permanent: true
                    }).openTooltip();
                }
            }
    },

    addGeoJSONPointAsCircleMarker: function (geoJSONFile, feature, geoJSONStyle, map, type, featureCollectionTimeAdded, geometryCollectionCounter, geoCollectionHour) {
        
        console.log("Inside add geo JSON Point as circle marker");
        let geojsonMarkerOptions = {
            radius: 1,
            fillColor: geoJSONStyle.fillColor,
            color: geoJSONStyle.color,
            weight: geoJSONStyle.weight,
            opacity: geoJSONStyle.opacity,
            fillOpacity: geoJSONStyle.fillOpacity,
            featureCollectionTime: featureCollectionTimeAdded,
            originalGeoJSONType: type,
            style: geoJSONStyle,
            creationID: geometryCollectionCounter,
            geoCollectionHour: geoCollectionHour
            

        };
        let mapLayer;

        if (feature == null && featureCollectionTimeAdded == "No Collection" && geometryCollectionCounter == "No Geo Collection"){
            // handles if there is no feature collection and no geometry collection aka just adding a feature by itself

            let geoJSONPointCoords = geoJSONFile.geometry.coordinates;
            let latlng = [];
            latlng[0] = geoJSONPointCoords[1];
            latlng[1] = geoJSONPointCoords[0];
            

            mapLayer = L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile);
            

        } else if (geometryCollectionCounter != "No Geo Collection" && featureCollectionTimeAdded != "No Collection"){
            //handles if there is a geometry collection and a feature collection
            let geoJSONPointCoords = geoJSONFile.coordinates;
            let latlng = [];
            latlng[0] = geoJSONPointCoords[0][1];
            latlng[1] = geoJSONPointCoords[0][0];

            mapLayer = L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile);

        } else if (geometryCollectionCounter != "No Geo Collection") {
            // handles if there is just a geo collection
            let geoJSONPointCoords = geoJSONFile.coordinates;
            let latlng = [];
            latlng[0] = geoJSONPointCoords[0][1];
            latlng[1] = geoJSONPointCoords[0][0];

            mapLayer = L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile);
        
            
        

        } else {
            // else handles if there is just a feature collection
            let geoJSONPointCoords = geoJSONFile.features[feature].geometry.coordinates;
            let latlng = [];
            latlng[0] = geoJSONPointCoords[1];
            latlng[1] = geoJSONPointCoords[0];


            mapLayer = L.geoJSON(geoJSONFile.features[feature], {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile.features[feature]);
        }


        
    },




    addGeoJSONMultiPointsAsCircleMarker: function (geoJSONFile, feature, geoJSONStyle, map, type, featureCollectionTimeAdded, geometryCollectionCounter, geoCollectionHour) {
        
        
        console.log("Inside add geo JSON Point as circle marker");
        let geojsonMarkerOptions = {
            radius: 1,
            fillColor: geoJSONStyle.fillColor,
            color: geoJSONStyle.color,
            weight: geoJSONStyle.weight,
            opacity: geoJSONStyle.opacity,
            fillOpacity: geoJSONStyle.fillOpacity,
            featureCollectionTime: featureCollectionTimeAdded,
            originalGeoJSONType: type,
            id : multiPointCollectionCounter,
            style: geoJSONStyle,
            creationID: geometryCollectionCounter,
            geoCollectionHour: geoCollectionHour


        };
        let mapLayer;

        if (feature == null && featureCollectionTimeAdded == "No Collection" && geometryCollectionCounter == "No Geo Collection"){
            // handles if there is no feature collection and no geometry collection aka just adding a feature by itself
            let geoJSONPointCoords = geoJSONFile.geometry.coordinates;
            let latlng = [];
            latlng[0] = geoJSONPointCoords[0][1];
            latlng[1] = geoJSONPointCoords[0][0];

            mapLayer = L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile);


        } else if (geometryCollectionCounter != "No Geo Collection" && featureCollectionTimeAdded != "No Collection"){
            //handles if there is a geometry collection and a feature collection

            let geoJSONPointCoords = geoJSONFile.coordinates;
            let latlng = [];
            latlng[0] = geoJSONPointCoords[0][1];
            latlng[1] = geoJSONPointCoords[0][0];


            mapLayer = L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile);


        } else if (geometryCollectionCounter != "No Geo Collection") {
            // handles if there is just a geo collection
            let geoJSONPointCoords = geoJSONFile.coordinates;
            let latlng = [];
            latlng[0] = geoJSONPointCoords[0][1];
            latlng[1] = geoJSONPointCoords[0][0];

            mapLayer = L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile);


        } else {
            // else handles if there is just a feature collection
            let geoJSONPointCoords = geoJSONFile.features[feature].geometry.coordinates;
            let latlng = [];
            latlng[0] = geoJSONPointCoords[0][1];
            latlng[1] = geoJSONPointCoords[0][0];

            mapLayer = L.geoJSON(geoJSONFile.features[feature], {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile.features[feature]);
            
        }
        multiPointCollectionCounter += 1;
    },

    //default function used to add most features to a map
    addgeoJSONFeatureAndStyleToMap: function(geoJSONFile, feature, geoJSONStyle, map, type, featureCollectionTimeAdded) {
        
        let mapLayer = L.geoJSON(geoJSONFile.features[feature], {
            style: geoJSONStyle,
            originalGeoJSONType: type,
            featureCollectionTime: featureCollectionTimeAdded,
            originalGeoJSONFeatureCollection: geoJSONFile,
        }).addTo(map);
        this.ifContentExists(mapLayer, geoJSONFile.features[feature]);

    },

        //need to be able to identify geometry collections created in the session
        // need to break the geometry collection objects into individual types, but add the information that they're originally from a geometry collection
        // and include information on which geometry collection they're from so they can be re-assembled
    addGeoJSONGeometryCollectionAndStyleToMap: function(geoJSONFileGeoCollection, feature, geoJSONStyle, map, type, geometryCollectionCounter, featureCollectionTimeAdded){
        let date = new Date();
        let time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(); 

        console.log("The geometry collection looks like: ", geoJSONFileGeoCollection);
        let mapLayer;
        


        // in case the geometry collection isn't part of a feature collection
        if (feature == null && featureCollectionTimeAdded == "No Collection"){
            for (let geometry in geoJSONFileGeoCollection.geometry.geometries){
                //console.log("The inner geometries should be: ", geoJSONFileGeoCollection.geometry.geometries[geometry])

                if (geoJSONFileGeoCollection.geometry.geometries[geometry].type == "MultiPoint"){


                    SMK.UTIL.addGeoJSONMultiPointsAsCircleMarker(geoJSONFileGeoCollection.geometry.geometries[geometry], null, geoJSONStyle, map, "MultiPoint", "No Collection", geometryCollectionCounter, time);

                } else if(geoJSONFileGeoCollection.geometry.geometries[geometry].type == "Point") {
                    SMK.UTIL.addGeoJSONPointAsCircleMarker(geoJSONFileGeoCollection.geometry.geometries[geometry], null, geoJSONStyle, map, "Point", "No Collection", geometryCollectionCounter, time);

                } else {
                    mapLayer = L.geoJSON(geoJSONFileGeoCollection.geometry.geometries[geometry], {
                        style: geoJSONStyle,
                        originalGeoJSONType: type,
                        geoCollectionSubType: geoJSONFileGeoCollection.geometry.geometries[geometry].type,
                        hour: time,
                        creationID: geometryCollectionCounter,
                        originalGeometryCollectionObject: geoJSONFileGeoCollection,
                        featureCollectionTime: featureCollectionTimeAdded

                    }).addTo(map);
                    this.ifContentExists(mapLayer, geoJSONFileGeoCollection.geometry.geometries[geometry]);
                }
            }

        } else {
            for (let geometry in geoJSONFileGeoCollection.features[feature].geometry.geometries){
                //console.log("The inner geometries should be: ", geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry])

                if (geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry].type == "MultiPoint"){
                    SMK.UTIL.addGeoJSONMultiPointsAsCircleMarker(geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry], feature, geoJSONStyle, map, "MultiPoint", featureCollectionTimeAdded, geometryCollectionCounter, time);

                } else if(geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry].type == "Point") {
                    SMK.UTIL.addGeoJSONPointAsCircleMarker(geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry], feature, geoJSONStyle, map, "Point", featureCollectionTimeAdded, geometryCollectionCounter, time);

                } else {
                mapLayer = L.geoJSON(geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry], {
                    style: geoJSONStyle,
                    originalGeoJSONType: type,
                    geoCollectionSubType: geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry].type,
                    hour: time,
                    creationID: geometryCollectionCounter,
                    originalGeometryCollectionObject: geoJSONFileGeoCollection.features[feature],
                    featureCollectionTime:featureCollectionTimeAdded

                }).addTo(map);
                this.ifContentExists(mapLayer, geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry]);
            }
        }
    }
},
///////////////////////////////////////////////////end of geoJSON importing support //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////////////////Rebuilding the map with a new Config file ///////////////////////////////////////////////////////////////////////////////////


// Call this to destroy the map, and then rebuild it using the passed in map config file
rebuildSMKMAP: async function(mapConfig) {

    let baseURL = window.location.origin;
    var smkAttr = {
        'id':           '1',
        'container-sel': '#smk-map-frame' ,
        'title-sel':    'head title' ,
        'config':       [mapConfig] ,
        'base-url':     baseURL,
        'service-url':  null,
    };


    // need to have a variant if this is attached to the document body, or if it's attached to a div
    let smkMAPDIV = document.getElementById("smk-map-frame");

    if (smkMAPDIV.nodeName == "BODY"){

        smkMAPDIV.remove();
        document.body = document.createElement("body");
        document.body.setAttribute("id", "smk-map-frame");

    } else {

        smkMAPDIV.remove();
        let divNode = document.createElement("DIV"); 
        divNode.setAttribute("id", "smk-map-frame");
        document.body.appendChild(divNode);
    }
    


    let map = SMK.MAP[ smkAttr[ 'id' ] ] = new SMK.TYPE.SmkMap( smkAttr  );
    
    await map.initialize();

    //after the map is initialized we want to draw all the GeoJSON and drawings from the config onto the map
    this.checkDrawings(mapConfig);



},



////////////////////////////////////////////////////////////////////SMK EXPORT FUNCTIONALITY //////////////////////////////////////////////////////////////////////////////////////////




    // returns a nice geoJSON object with or without styles
    GeoJSONcreator: class  {

        //feature collection time is the time that the feature collection was created, used to group parts of feature collections that are seperated back together
        // multiPointID is used to put back together multi points that get seperated
        // geometryCollectionIDAndMultiPoint is used to put points and multi points back into their respective geocollections
        // geometryCollection hour is used in tandem with geometryCollectionIDAndMultiPoint to reassmble multi points and points with their geo collections
        
        constructor(mainType,  geometryType, coordinates, propertyName, propertyContent, propertyStyle, radius, featureCollectionTime, multiPointID, geometryCollectionIDPointAndMultiPoint, geometryCollectionHour ){
            this.mainType = mainType;
            this.geometryType = geometryType;
            this.coordinates = coordinates;
            this.name = propertyName;
            this.content = propertyContent;
            this.style = propertyStyle;
            this.radius = radius;
            this.featureCollectionTime = featureCollectionTime;
            this.multiPointID = multiPointID;
            this.geometryCollectionIDPointAndMultiPoint = geometryCollectionIDPointAndMultiPoint;
            this.geometryCollectionHour = geometryCollectionHour;
        }


        getGeoJSONObjectWithStyle(){
            let geoJSON = '{"type": "","geometry": {"type": "","coordinates": ""}, "properties": { "name" : "", "content": "", "style" : "", "radius" : "", "featureCollectionTime": null, "multiPointID": null, "geometryCollectionIDPointAndMultiPoint": null, "geometryCollectionHour": null } }';
            geoJSON = JSON.parse(geoJSON);

            geoJSON.type = this.mainType;
            geoJSON.geometry.type = this.geometryType;
            geoJSON.geometry.coordinates = this.coordinates;
            geoJSON.properties.name = this.name;
            geoJSON.properties.content = this.content;
            geoJSON.properties.style = this.style;
            geoJSON.properties.radius = this.radius;
            geoJSON.properties.featureCollectionTime = this.featureCollectionTime;
            geoJSON.properties.multiPointID = this.multiPointID;
            geoJSON.properties.geometryCollectionIDPointAndMultiPoint = this.geometryCollectionIDPointAndMultiPoint;
            geoJSON.properties.geometryCollectionHour = this.geometryCollectionHour;
            
            return geoJSON;
        }

    },


    //fetches the current state from copyIntoJSONObject, then rebuilds the map with that information
    // essentially rebuilds the map exactly as it is, but integrates added layers into the smk tools by re-initing
    rebuildMapWithSessionExportJSONObject: function ( smk ){
        let mapConfigJSON = this.copyIntoJSONObject(smk);
        
        mapConfigJSON = JSON.parse(JSON.stringify(mapConfigJSON));
        
        this.rebuildSMKMAP(mapConfigJSON);
        

    },
  

    // creates a JSON object using the same structure as the eventual format as a map-config file
    createSMKJSONObject : function() {
        let smkJSONHolder = {
                "lmfId": null,
                "lmfRevision" : null,
                "version" : null,
                "name": null,
                "project": null,
                "createdBy" : null,
                "createdDate" : null,
                "modifiedBy" : null, 
                "modifiedDate" : null,
                "published": null,
                "surround": {
                    "type": null,
                    "title": null,
                    "imageSrc": null
                },
                "viewer": {
                    "type": null,
                    "location": {
                        "extent": [],
                        "center": [],
                        "zoom": null
                    },
                "baseMap" : null,
                "activeTool" : null,
                "clusterOption": {
                    "showCoverageOnHover": null
                },
                "device": null,
                "themes": [],
                "deviceAutoBreakpoint": null,
                "panelWidth": null
            },
            "layers": [ 
                {}

            ],
            "tools": [
                {}
            ],
            "_id": null,
            "_rev": null,
            "drawings": [
            ]
            };
            return smkJSONHolder;
    },

    //check if the passed object has tooltip, if it does it has content to be returned
    checkForContent: function( obj) {
        let content = null;
        if ( obj._tooltip ) {
            content = obj._tooltip._content;
        }
        return content;
    },

        //going to compare all the tools in the toolsArray against themselves, if they don't have duplicate they can be added to the filteredToolsArray
        removeDuplicateTools: function ( toolsArray){
            let filteredToolsArray = [];
            //sometimes smk likes to duplicate tools, this way we can remove them
            for (let tempTool in toolsArray){
                let matchCount = 0;
                for (let possibleDuplicateTool in toolsArray){
                    if ( JSON.stringify(toolsArray[tempTool]) == JSON.stringify(toolsArray[possibleDuplicateTool]) ){
                        
                        // break on null tools, don't want to add them to our array
                        if (toolsArray[possibleDuplicateTool] == null){
                            break;
                        }
    
                        matchCount = (matchCount + 1);
                        // it's expected that match count will generally equal one for most tools as we're comparing it versus the same array (in fact it would be very weird if not everything hit one)
                        // however if something hit's two that means there is a duplicate and we should add it and delete the duplicate
                        if (matchCount == 2){
                            filteredToolsArray.push(toolsArray[tempTool]);
                            toolsArray[possibleDuplicateTool] = null;
                            break;
                        }
                    }
    
                    if (possibleDuplicateTool == toolsArray.length - 1){
                        // we're in the last leg of the toolsArray, meaning we didn't find a match. Since we didn't find a match we should add this tool to the tools array
                        filteredToolsArray.push(toolsArray[tempTool]);
                    }
                }
            }
    
            return filteredToolsArray;
        },

    // copy over the current values from smk into our json object holder
    copyFromsmk: function( jsonObjectHolder, smk) {

        

        if ( jsonObjectHolder.hasOwnProperty("lmfId")  && smk.hasOwnProperty('lmfId')){
            //////console.log ("both have a lmfid property")
            jsonObjectHolder.lmfId = smk.lmfId;
        }
        if ( jsonObjectHolder.hasOwnProperty("lmfRevision")  && smk.hasOwnProperty('lmfRevision')){
            //////console.log ("both have a lmfRevision property")
            jsonObjectHolder.lmfRevision = smk.lmfRevision;
        }
        if ( jsonObjectHolder.hasOwnProperty("version")  && smk.hasOwnProperty('version')){
            //////console.log ("both have a version property")
            jsonObjectHolder.version = smk.version;
        }
        if ( jsonObjectHolder.hasOwnProperty("name")  && smk.hasOwnProperty('name')){
            //////console.log ("both have a name property")
            jsonObjectHolder.name = smk.name;
        }
        if ( jsonObjectHolder.hasOwnProperty("project")  && smk.hasOwnProperty('project')){
            //////console.log ("both have a project property")
            jsonObjectHolder.project = smk.project;
        }
        if ( jsonObjectHolder.hasOwnProperty("createdBy")  && smk.hasOwnProperty('createdBy')){
            //////console.log ("both have a createdBy property")
            jsonObjectHolder.createdBy = smk.createdBy;
        }
        if ( jsonObjectHolder.hasOwnProperty("createdDate")  && smk.hasOwnProperty('createdDate')){
            //////console.log ("both have a createdDate property")
            jsonObjectHolder.createdDate = smk.createdDate;
        }
        if ( jsonObjectHolder.hasOwnProperty("modifiedBy")  && smk.hasOwnProperty('modifiedBy')){
            //////console.log ("both have a modifiedBy property")
            jsonObjectHolder.modifiedBy = smk.modifiedBy;
        }
        if ( jsonObjectHolder.hasOwnProperty("modifiedDate")  && smk.hasOwnProperty('modifiedDate')){
            //////console.log ("both have a modifiedDate property")
            jsonObjectHolder.modifiedDate = smk.modifiedDate;
        }
        if ( jsonObjectHolder.hasOwnProperty("published")  && smk.hasOwnProperty('published')){
            //////console.log ("both have a published property")
            jsonObjectHolder.published = smk.published;
        }
        if ( jsonObjectHolder.hasOwnProperty("surround")  && smk.hasOwnProperty('surround')){
            //////console.log ("both have a surround property")
            jsonObjectHolder.surround = smk.surround;
        }
        if ( jsonObjectHolder.hasOwnProperty("viewer")  && smk.hasOwnProperty('viewer')){
            jsonObjectHolder.viewer = JSON.parse(JSON.stringify(smk.viewer));  //
            
            // handle basemap
            let baseMap;
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Topo_Map")) {
                baseMap = "Topographic"; 
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Street_Map")) {
                baseMap = "Streets";
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Imagery")) {
                baseMap = "Imagery";
                
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Ocean_Base")) {
                baseMap = "Oceans";
                
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("NatGeo_World_Map")) {
                baseMap = "NationalGeographic";
                
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Dark_Gray_Base")) {
                baseMap = "DarkGray";
                
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Light_Gray_Base")) {
                baseMap = "Gray";
                
            }
            jsonObjectHolder.viewer.baseMap = baseMap;
        }
        if ( jsonObjectHolder.hasOwnProperty("layers")  && smk.hasOwnProperty('layers')){
            //////console.log ("both have a layers property")
            jsonObjectHolder.layers = JSON.parse(JSON.stringify(smk.layers)); //
        }
        if ( jsonObjectHolder.hasOwnProperty("tools")  && smk.hasOwnProperty("tools")){
            //////console.log ("both have a tools property")
            jsonObjectHolder.tools = JSON.parse(JSON.stringify(smk.tools)); //

            jsonObjectHolder.tools = SMK.UTIL.removeDuplicateTools(jsonObjectHolder.tools);


        }
        if ( jsonObjectHolder.hasOwnProperty("_id")  && smk.hasOwnProperty('_id')){
            //////console.log ("both have a _id property")
            jsonObjectHolder._id = smk._id;
        }
        if ( jsonObjectHolder.hasOwnProperty("_rev")  && smk.hasOwnProperty('_rev')){
            //////console.log ("both have a _rev property")
            jsonObjectHolder._rev = smk._rev;
        }
        return jsonObjectHolder;
    },




    //jsonObjectHolder.tools[tool].display
    //turns off every display element so it can be compared to their current state and turned on again if necessary
    recursiveToggleDisplayOff: function (  displayArray ){

        for ( let displayItem in displayArray){
            displayArray[displayItem].isVisible = false;
            if (typeof displayArray[displayItem].isExpanded != "undefined" && displayArray[displayItem].items > 0){
                displayArray[displayItem].items = this.recursiveToggleDisplayOff(displayArray[displayItem].items);
            }
        return displayArray;
        }
    },


    // matches every item in the toolArray with items in the itemVisibilityArray, and assigns the visibility status of itemVisibility array to toolArray
    recursiveSetDisplayVisibility: function (toolArray, itemVisibilityArray){
        for (let  tool in toolArray){
            for (let item in itemVisibilityArray){
                if (toolArray[tool].id == itemVisibilityArray[item].id){
                    toolArray[tool].isVisible = itemVisibilityArray[item].isActuallyVisible;

                    if ( typeof toolArray[tool].isExpanded != "undefined" && typeof itemVisibilityArray[item].isExpanded != "undefined"){
                        toolArray[tool].isExpanded = itemVisibilityArray[item].isExpanded;
                    }
                    if (typeof toolArray[tool].items  != "undefined" && toolArray[tool].items.length > 0 && typeof itemVisibilityArray[item].items !="undefined" && itemVisibilityArray[item].items.length > 1){
                        toolArray[tool].items = this.recursiveSetDisplayVisibility(toolArray[tool].items, itemVisibilityArray[item].items );
                    }
                }
            }
        }
        return toolArray;
    },

    // takes the empty JSON holder and the smk object and fills the smkJSON holder with the useful values of smk to create a JSON file that can be used as a map-config
    // or at least as a similar file
    copyIntoJSONObject: function( smk ){
        let jsonObjectHolder = this.createSMKJSONObject();
        jsonObjectHolder = this.copyFromsmk ( jsonObjectHolder, smk);

        // check state and set it appropriately for the various tool displayers
        // first turn everything off
        for (let tool in jsonObjectHolder.tools) {
            if (jsonObjectHolder.tools[tool].type == "layers") {
                jsonObjectHolder.tools[tool].display = this.recursiveToggleDisplayOff(jsonObjectHolder.tools[tool].display);
                jsonObjectHolder.tools[tool].display = this.recursiveSetDisplayVisibility( jsonObjectHolder.tools[tool].display, SMK.MAP[1].$viewer.layerDisplayContext.root.items);
            }
        }
        
        // can find co-ordinates and zoom here, but only if it's changed
        if (smk.$viewer.map._animateToCenter){
            //////console.log(smk.$viewer.map._animateToCenter)
            jsonObjectHolder.viewer.location.center[0] = smk.$viewer.map._animateToCenter.lng;
            jsonObjectHolder.viewer.location.center[1] = smk.$viewer.map._animateToCenter.lat;
        }
        if (smk.$viewer.map._animateToZoom){
            //////console.log(smk.$viewer.map._animateToZoom)
            jsonObjectHolder.viewer.location.zoom = smk.$viewer.map._animateToZoom;
        }
        //handle all the exports of leaflet drawing layers as well as GeoJSON layers here
        if (smk.$viewer.type == "leaflet") {
            jsonObjectHolder = this.handleLeafletDrawingsAndGeoJSONLayers( smk, jsonObjectHolder );
        } else {
            ////console.log ("No esri3D support for circles yet, sorry.")
        }
        return jsonObjectHolder;
    },

    // Takes all the Layer information that comes from drawings or GeoJSON and converts it to GeoJSON for export 
    fillDrawingsWithGeoJSON: function( smk, jsonObjectHolder){
        let arrayOfGeometryCollections = [];
        let arrayOfMultiPoints = [];

        //this is a loop through every layer on the map
        for (let drawing in smk.$viewer.map._layers) {
            // if (typeof smk.$viewer.map._layers[drawing].options.style == "undefined") is true it means these are leaflet drawn drawings and not geoJson imports
            // this if is for leaflet layers created by the leaflet drawing tool
            if (typeof smk.$viewer.map._layers[drawing].options.style == "undefined") {
                    let drawingObj = this.getLeaftletDrawing(drawing, smk );
                    //check if drawing exists, and then convert it to geoJSON before adding it to the jsonObjectHolder
                    if (drawingObj != null) {
                        let geoJSONDrawingObj = this.convertLeafletDrawingToGeoJSON(drawingObj);
                        jsonObjectHolder.drawings.push( geoJSONDrawingObj );
                    }
                
                } else if (typeof smk.$viewer.map._layers[drawing].options.style !== "undefined" && typeof smk.$viewer.map._layers[drawing]._latlngs !== "undefined" ) {
                    // these should be all the layers imported through the geojson import tool in layerimport AKA were originally in GeoJSON
                    // need to handle geometry collections differently than straight geoJSON features
                    if (smk.$viewer.map._layers[drawing].options.originalGeoJSONType == "GeometryCollection"){
                        // check if arrayOfGeometryCollection already has a geometry collection in it
                        // if it does we need to find which element contains the other geometry collection pieces
                        if (arrayOfGeometryCollections.length != 0) {
                            for ( let element in arrayOfGeometryCollections) {
                                if (  this.checkForMatchingGeometryCollectionIDsAndHour(arrayOfGeometryCollections[element], smk.$viewer.map._layers[drawing])) {
                                    arrayOfGeometryCollections[element].arrayOfGeoCollectionElements.push(smk.$viewer.map._layers[drawing]);
                                } else {
                                    // only should be added if we've already checked the other elements in the array to make sure there was nothing there
                                    if (element == arrayOfGeometryCollections.length - 1) {
                                        //must be a part of a different geometry collection
                                        arrayOfGeometryCollections.push(  this.createJSONGeometryCollectionObject(smk.$viewer.map._layers[drawing])   );
                                    }
                                }
                            }                          
                        } else {
                            // if the array doesn't have any elements in it, we can add the first element to the array which contains this geometry element
                            // as well as it's ID and Time for identification
                            arrayOfGeometryCollections.push(  this.createJSONGeometryCollectionObject(smk.$viewer.map._layers[drawing])   );
                        }
                    } else {
                        // handles everything that isn't a GeoJSON Geometry Collection
                        let geoJSONFromImport = this.retrieveExistingGeoJSONFromLeaflet(smk.$viewer.map._layers[drawing]);
                        jsonObjectHolder.drawings.push(geoJSONFromImport);
                    }

                // handles addition of point and multi point markers that only have a _latlng not a _latlngs
                } else if (typeof smk.$viewer.map._layers[drawing].options.style !== "undefined" && typeof smk.$viewer.map._layers[drawing]._latlng !== "undefined") {
                    if (smk.$viewer.map._layers[drawing].options.originalGeoJSONType == "MultiPoint") {
                        //multi points require special handling of their GeoJSON once retrieved to be reassembled into their multiarray form rather than seperate multipoint arrays
                        if (arrayOfMultiPoints.length != 0) {
                            for ( let element in arrayOfMultiPoints) {
                                if (  this.checkForMatchingMultiPointIDs(arrayOfMultiPoints[element], smk.$viewer.map._layers[drawing])) {
                                    arrayOfMultiPoints[element].arrayOfMultiPointElements.push(    smk.$viewer.map._layers[drawing]  );
                                } else {
                                    // only should be added if we've already checked the other elements in the array to make sure there was nothing there
                                    if (element == arrayOfMultiPoints.length - 1) {
                                    arrayOfMultiPoints.push( this.createJSONMultiPointCollectionObject(smk.$viewer.map._layers[drawing] ));
                                    }
                                }
                            }                          
                        } else {
                            // if the array doesn't have any elements in it, we can add the first element to the array which contains this multipoint element
                            // as well as it's ID and Time for identification
                            arrayOfMultiPoints.push( this.createJSONMultiPointCollectionObject(smk.$viewer.map._layers[drawing] ));
                        }
                    } else {
                        //the else just deals with regular points which are of course less complicated than multipoints
                        let geoJSONFromImport = this.retrieveExistingGeoJSONFromLeaflet(smk.$viewer.map._layers[drawing]);
                        jsonObjectHolder.drawings.push(geoJSONFromImport);
                    }
             }
        }

        // with all the multi point collections gathered together we need to assemble each element into the array (containing seperate multi points) into one multi point for each array element
        if (arrayOfMultiPoints.length != 0) {
            for (let multiPointElement in arrayOfMultiPoints){
                let multiPointGeoJSON = this.reassembleMultiPoints(arrayOfMultiPoints[multiPointElement]);
                jsonObjectHolder.drawings.push(multiPointGeoJSON);
            }
        } 

        
        // Once all the geomtry collections are collected they need to be built into their correct geoJSON, 
        if (arrayOfGeometryCollections.length != 0) {
            for (let element in arrayOfGeometryCollections){
                let geoJSONFromImport = this.reassembleGeoJSONGeometryCollection(arrayOfGeometryCollections[element]);
                jsonObjectHolder.drawings.push(geoJSONFromImport);
            }
        }

        // Now that the geometry collections are collected and identified, and all the multipoints and points are assemblemed in JSON, the two can be combined
        // we can loop through the available drawings for geometry collections, and then if a point matches their ID and hour it can be added to that geometry collection
        // if an encountered point has no collection then we can break
        // we'll make the changes into a copied version of jsonObjectHolder and then assign that to the actual jsonObjectHolder once the changes are made
        let tempJsonObjectHolder = jsonObjectHolder.drawings;
        tempJsonObjectHolder = this.combineGeometryCollectionsAndPointsAndMultiPoints(tempJsonObjectHolder, jsonObjectHolder);
        
        

        // still need to handle the chance that points and multipoints may have come from a geocollection made entirely of them, so we need to scan each element outside of a geocollection
        // and if it has a geocollection propery, then we need to scan each geocollection to see if the geocollectionID of the lone point/multi point matches the point of the geocollection
        // if there is a match, it's already inside and we can keep going, but if it finishes the loop without finding any geocollections with that ID then it needs to create it's geocollection
        tempJsonObjectHolder = this.handlePointAndMultiPointOnlyGeoCollections( tempJsonObjectHolder );

        


        // Now that all the points and multi points that should be inside their geoCollections are safely inside we'll copy over everything inside a geoCollection, or outside that has the
        // No Geo Collection value for their geometryCollectionIDPointAndMultiPoint
        jsonObjectHolder.drawings = [];
        for (let drawing in tempJsonObjectHolder){
            if ( typeof tempJsonObjectHolder[drawing].properties != "undefined" && typeof tempJsonObjectHolder[drawing].properties.geometryCollectionIDPointAndMultiPoint != "undefined" && tempJsonObjectHolder[drawing].geometry.type != "GeometryCollection" && tempJsonObjectHolder[drawing].properties.geometryCollectionIDPointAndMultiPoint != "No Geo Collection" && tempJsonObjectHolder[drawing].properties.geometryCollectionIDPointAndMultiPoint != null){
                //nothing happens because we're not adding anything
            } else {
                jsonObjectHolder.drawings.push(tempJsonObjectHolder[drawing]);
            }  
        }
        return jsonObjectHolder;
    },



    // we can loop through the available drawings for geometry collections, and then if a point matches their ID and hour it can be added to that geometry collection
    // we'll make the changes into a copied version of jsonObjectHolder and then assign that to the actual jsonObjectHolder once the changes are made
    // this does not handle points and multi points that come from GeoCollections only made up of points and multi points, that is handled by handlePointAndMultiPointONlyGeoCollections
    combineGeometryCollectionsAndPointsAndMultiPoints: function( tempJsonObjectHolder, jsonObjectHolder){
        for ( let maybeGeoCollection in jsonObjectHolder.drawings){
            // is this a geometry collection or is it a geometry collection inside a feature, both are fine
            if (jsonObjectHolder.drawings[maybeGeoCollection].type == "Feature" || jsonObjectHolder.drawings[maybeGeoCollection].geometry.type == "GeometryCollection" ){
                for (let maybeGeoCollectionElement in jsonObjectHolder.drawings){
                    if (this.isPointOrMultiFromGeoCollection(jsonObjectHolder.drawings[maybeGeoCollectionElement], jsonObjectHolder.drawings[maybeGeoCollection] ) ) {
                        // because features keep their properties above their geometry, the properties need to be grabbed and recombined with the geometry collection to fit in a geo collection
                        let tempJsonPointOrMultiPointObject = jsonObjectHolder.drawings[maybeGeoCollectionElement].geometry;
                        tempJsonPointOrMultiPointObject.properties = (jsonObjectHolder.drawings[maybeGeoCollectionElement].properties);
                        tempJsonObjectHolder[maybeGeoCollection].geometry.geometries.push(tempJsonPointOrMultiPointObject);
                    }
                }
            }
        }
        return tempJsonObjectHolder;
    },


        // Handles the chance that points and multipoints may have come from a geocollection made entirely of them, so we need to scan each element outside of a geocollection
        // and if it has a geocollection propery, then we need to scan each geocollection to see if the geocollectionID of the lone point/multi point matches the point of the geocollection
        // if there is a match, it's already inside and we can keep going
        // if there is match and it's not already inside it's probably from a geocollection that was created during this function and should be added
        //but if it finishes the loop without finding any geocollections with that ID then it needs to create it's geocollection
        handlePointAndMultiPointOnlyGeoCollections: function  ( tempJsonObjectHolder) {
        for (let geoJSONElement in tempJsonObjectHolder){
            if ( // check if our object is a geoJSON element that is supposed to be a part of a GeoCollection
                typeof tempJsonObjectHolder[geoJSONElement].properties != "undefined"
                && typeof tempJsonObjectHolder[geoJSONElement].properties.geometryCollectionIDPointAndMultiPoint != "undefined" 
                && tempJsonObjectHolder[geoJSONElement].geometry.type != "GeometryCollection"
                && tempJsonObjectHolder[geoJSONElement].properties.geometryCollectionIDPointAndMultiPoint != "No Geo Collection" 
                && tempJsonObjectHolder[geoJSONElement].properties.geometryCollectionIDPointAndMultiPoint != null){
                // if it is we need to see if there are any geojson collections with that information, if there are we need to check if the element exists inside the collection
                let elementExistsInCollection = false;

                loopToCheckIfOurElementShouldBelongToAnExistingCollection:
                    for (let geoJSONCollection in tempJsonObjectHolder){
                        if ( // if this object is a geometry collection, since we know that we should compare ID's to see if this is a geometry collection our current element came from
                        tempJsonObjectHolder[geoJSONCollection].geometryCollectionIDPointAndMultiPoint != "undefined"
                        &&  tempJsonObjectHolder[geoJSONCollection].geometryCollectionHour != "undefined"){
                           
                            if ( // if this means this object came from this geometry collection, now we need to check if it's already inside it
                                tempJsonObjectHolder[geoJSONCollection].geometryCollectionIDPointAndMultiPoint == tempJsonObjectHolder[geoJSONElement].properties.geometryCollectionIDPointAndMultiPoint
                                && tempJsonObjectHolder[geoJSONCollection].geometryCollectionHour  == tempJsonObjectHolder[geoJSONElement].properties.geometryCollectionHour){
                                    

                                    loopToCheckIfOurElementIsAlreadyInTheCollection:
                                        for (let geometryCollectionElement in tempJsonObjectHolder[geoJSONCollection].geometry.geometries){
                                            if( 
                                            tempJsonObjectHolder[geoJSONCollection].geometry.geometries[geometryCollectionElement].type == tempJsonObjectHolder[geoJSONElement].geometry.type
                                            && tempJsonObjectHolder[geoJSONCollection].geometry.geometries[geometryCollectionElement].coordinates == tempJsonObjectHolder[geoJSONElement].geometry.coordinates){
                                                // if this is a match then the object already exists inside this geometry collection and we can break this loop
                                                // because we found our element inside an existing collection, we don't need to check for other collections (its specfic ID came from this one)
                                                elementExistsInCollection = true;
                                                break loopToCheckIfOurElementShouldBelongToAnExistingCollection;
                                            } else if ( geometryCollectionElement == tempJsonObjectHolder[geoJSONCollection].geometry.geometries.length - 1 ){
                                                // if this else occurs it means we checked every element and this point does not already exist, but it should be a part of this collection
                                                // this likely occurs because this GeoCollection was created during this loop, and so this point can be added to it

                                                // because features keep their properties above their geometry, the properties need to be grabbed and recombined with the geometry collection to fit in a geo collection
                                                let tempJsonPointOrMultiPointObject = tempJsonObjectHolder[geoJSONElement].geometry;
                                                tempJsonPointOrMultiPointObject.properties = (tempJsonObjectHolder[geoJSONElement].properties);
                                                tempJsonObjectHolder[geoJSONCollection].geometry.geometries.push(tempJsonPointOrMultiPointObject);
                                                elementExistsInCollection = true;
                                                break loopToCheckIfOurElementShouldBelongToAnExistingCollection;

                                            }  

                                        }
                                }
                        }
                    }
                    // so if we've checked every element and there are no geometry collections we've come from then we need to create one of our own, and add ourselves to it
                    if (!elementExistsInCollection){
                        //create the geometrycolelction shell
                        let geometryCollectionJSON = '{"type": "Feature", "geometry": { "type": "GeometryCollection", "geometries": [] }, "geometryCollectionHour" : "", "geometryCollectionIDPointAndMultiPoint": ""}';
                        geometryCollectionJSON = JSON.parse(geometryCollectionJSON);
                        // add the outer values to the geometry collection
                        geometryCollectionJSON.geometryCollectionHour = tempJsonObjectHolder[geoJSONElement].properties.geometryCollectionHour;
                        geometryCollectionJSON.geometryCollectionIDPointAndMultiPoint = tempJsonObjectHolder[geoJSONElement].properties.geometryCollectionIDPointAndMultiPoint;

                        // add the first point or multi point element to the geometry collection
                        let tempJsonPointOrMultiPointObject = tempJsonObjectHolder[geoJSONElement].geometry;
                        tempJsonPointOrMultiPointObject.properties = (tempJsonObjectHolder[geoJSONElement].properties);
                        geometryCollectionJSON.geometry.geometries.push(tempJsonPointOrMultiPointObject);

                        // add the new geometry collection to the end of the tempJsonObjectHolder
                        tempJsonObjectHolder.push(geometryCollectionJSON);
                    }

            }

        }
            return tempJsonObjectHolder;
    },

    //first check if feature is a point or multi point
    // if not then return
    // then if it is,
    // check if it's geometryCollectionIDPointAndMultiPoint equals "No Geo Collection", if so then return
    // if not then compare it's geometryCollectionIDPointAndMultiPoint and geometryCollecionHour for a match
    isPointOrMultiFromGeoCollection : function ( maybeGeoCollectionPointOrMultiPoint, geoCollection){
        let match = false;

        // if this is true the geoCollection is not a geoCollection
        if (typeof geoCollection.geometryCollectionHour == "undefined" && typeof geoCollection.geometryCollectionIDPointAndMultiPoint  == "undefined"){
            return match;
        }
        //checking if it's a point or multi point, if it isn't return false
        if (maybeGeoCollectionPointOrMultiPoint.geometry.type == "Point" || maybeGeoCollectionPointOrMultiPoint.geometry.type == "MultiPoint"){
                // checking if it's part of a geo collection, if it isn't return false
            if (maybeGeoCollectionPointOrMultiPoint.properties.geometryCollectionIDPointAndMultiPoint == "No Geo Collection"){
                return match;
            }
            //checking if ID's and hours match
            if (maybeGeoCollectionPointOrMultiPoint.properties.geometryCollectionIDPointAndMultiPoint == geoCollection.geometryCollectionIDPointAndMultiPoint && maybeGeoCollectionPointOrMultiPoint.properties.geometryCollectionHour == geoCollection.geometryCollectionHour){
                
                match = true;
                return match;
            }
        }
        return match;
    },

    createJSONMultiPointCollectionObject: function  ( geoJSONFromLeaflet ) {
        let jsonArrayElements = '{ "id": "", "arrayOfMultiPointElements": [] }';
        jsonArrayElements = JSON.parse(jsonArrayElements);
        jsonArrayElements.id = geoJSONFromLeaflet.options.id;
        jsonArrayElements.arrayOfMultiPointElements.push(geoJSONFromLeaflet);

        return jsonArrayElements;
    },


    reassembleMultiPoints: function ( multiPointElements){
        let multiPointGeoJSONIndividual = [];

        for (let individualMultiPoints in multiPointElements.arrayOfMultiPointElements){
            multiPointGeoJSONIndividual.push(this.retrieveExistingGeoJSONFromLeaflet(multiPointElements.arrayOfMultiPointElements[individualMultiPoints]));
        }
        for (let singleMultiPoint in multiPointGeoJSONIndividual){
            if (singleMultiPoint != 0) {
            
            //by putting all the points in the same section of the GeoJSON you reassmble the multipoint correctly
            multiPointGeoJSONIndividual[0].geometry.coordinates.push(multiPointGeoJSONIndividual[singleMultiPoint].geometry.coordinates[0]);
            }
        }
        //that's also why we only return the first point, as it has all the other points inside it
        return multiPointGeoJSONIndividual[0];
    },

    checkForMatchingMultiPointIDs : function (arrayOfMultiPoints, multiPointElement){
        let match = false;
        if (arrayOfMultiPoints.id == multiPointElement.options.id ){
            match = true;
        }
        return match;
    },

    handleLeafletDrawingsAndGeoJSONLayers: function  ( smk, jsonObjectHolder ){
                   // geometry collections can be multiple objects and must be stored in an array of their subelements until they can be all collected at once
                    jsonObjectHolder = this.fillDrawingsWithGeoJSON(smk, jsonObjectHolder);
                   //  wrap everything that comes from a feature collection in it's feature collection, that way markers which are outside their feature collections
                   // will not interfere, eg we will only check markers outside feature elements versus markers inside feature elements

                   // we can assume that points appear by themselves, or as part of a collection which contains other non point elements

                   let arrayOfFeatureCollections = [];
                   for ( let drawing in jsonObjectHolder.drawings){
                        let featureCollection = '{ "type": "FeatureCollection", "features" : [], "properties": { "featureCollectionID" : null}} ';
                        featureCollection = JSON.parse(featureCollection);
                        let featureCollectionID = null;

                        switch(jsonObjectHolder.drawings[drawing].geometry.type) {
                            case "Point":
                                featureCollectionID = this.getFeatureElementFeatureCollectionTime( jsonObjectHolder.drawings[drawing]);
                                arrayOfFeatureCollections = this.buildingAFeatureCollection ( arrayOfFeatureCollections, featureCollection, featureCollectionID, jsonObjectHolder.drawings[drawing]);
                                break;
                            case "LineString":                                
                                featureCollectionID = this.getFeatureElementFeatureCollectionTime( jsonObjectHolder.drawings[drawing]);                               
                                arrayOfFeatureCollections = this.buildingAFeatureCollection ( arrayOfFeatureCollections, featureCollection, featureCollectionID, jsonObjectHolder.drawings[drawing]);
                                break;
                            case "Polygon":                               
                                featureCollectionID = this.getFeatureElementFeatureCollectionTime( jsonObjectHolder.drawings[drawing]);                              
                                arrayOfFeatureCollections = this.buildingAFeatureCollection ( arrayOfFeatureCollections, featureCollection, featureCollectionID, jsonObjectHolder.drawings[drawing]);
                                break;
                            case "MultiPoint":                                
                                featureCollectionID = this.getFeatureElementFeatureCollectionTime( jsonObjectHolder.drawings[drawing]);                               
                                arrayOfFeatureCollections = this.buildingAFeatureCollection ( arrayOfFeatureCollections, featureCollection, featureCollectionID, jsonObjectHolder.drawings[drawing]);
                                break;
                            case "MultiLineString":                                
                                featureCollectionID = this.getFeatureElementFeatureCollectionTime( jsonObjectHolder.drawings[drawing]);                                
                                arrayOfFeatureCollections = this.buildingAFeatureCollection ( arrayOfFeatureCollections, featureCollection, featureCollectionID, jsonObjectHolder.drawings[drawing]);
                                break;
                            case "MultiPolygon":                                
                                featureCollectionID = this.getFeatureElementFeatureCollectionTime( jsonObjectHolder.drawings[drawing]);                                
                                arrayOfFeatureCollections = this.buildingAFeatureCollection ( arrayOfFeatureCollections, featureCollection, featureCollectionID, jsonObjectHolder.drawings[drawing]);
                                break;
                            case "GeometryCollection":                            
                                featureCollectionID = this.getFeatureElementFeatureCollectionTimeForGeometryCollection( jsonObjectHolder.drawings[drawing].geometry );                            
                                arrayOfFeatureCollections = this.buildingAFeatureCollection ( arrayOfFeatureCollections, featureCollection, featureCollectionID, jsonObjectHolder.drawings[drawing]);
                                break;
                            default:
                                console.log("Not one of the choices");  
                        }
                   }
                   // now that all the featureCollections have been built it should be safe to add them to the jsonObjectHolder, though ideally we'll clear out any element with
                   // a feature collection id first, which works fine for non-markers. All loose markers outside collections 

                   // remove all features with feature elements
                   // create a temporary array to hold the drawings we want to keep
                   let tempDrawings = [];
                   for ( let drawing in jsonObjectHolder.drawings) {
                       if ( typeof jsonObjectHolder.drawings[drawing].properties =="undefined" || jsonObjectHolder.drawings[drawing].properties.featureCollectionTime != null){
                           // this if handles the loose No Collection features which are supposed to be kept as they were added outside a feature collection (for non-geo collection)
                            if (typeof jsonObjectHolder.drawings[drawing].properties !="undefined" && jsonObjectHolder.drawings[drawing].properties.featureCollectionTime == "No Collection"){
                                tempDrawings.push(jsonObjectHolder.drawings[drawing]);
                            // the else-if on the other hand handles loose No Collection features which are kept as they're added outside a feature collection but are GeometryCollections
                            } else if(typeof jsonObjectHolder.drawings[drawing].geometry.type !="undefined" && jsonObjectHolder.drawings[drawing].geometry.type == "GeometryCollection"){
                                for ( let geometryCollectionElement in jsonObjectHolder.drawings[drawing].geometry.geometries){
                                    if (typeof jsonObjectHolder.drawings[drawing].geometry.geometries[geometryCollectionElement].properties !="undefined" && jsonObjectHolder.drawings[drawing].geometry.geometries[geometryCollectionElement].properties.featureCollectionTime == "No Collection"){
                                        tempDrawings.push(jsonObjectHolder.drawings[drawing]);
                                        break;
                                    }
                                }
                            } else {
                                //this deletes all the elements that are part of feature collections and are already safely in those feature collections
                                delete jsonObjectHolder.drawings[drawing];
                            }
                       } else {
                           tempDrawings.push(jsonObjectHolder.drawings[drawing]);
                       }
                   }

                   jsonObjectHolder.drawings = tempDrawings;
                   // once they're all removed the json object holder drawings can have the feature element collections added
                   for (let featureCollectionFromArray in arrayOfFeatureCollections){
                       jsonObjectHolder.drawings.push(arrayOfFeatureCollections[featureCollectionFromArray]);
                   }
        return jsonObjectHolder;
    },

    buildingAFeatureCollection: function ( arrayOfFeatureCollections, featureCollectionJSON, featureCollectionID, geoJSONFeature ){

        //First we check if the array of feature collections is empty, if it is we skip to the else where we put the first element in it
        // However if it's not empty we start comparing it's feature collection ID, with the feature collection ID of the element we're looking to add
        // If there is a match, great add that feature to the feature collection object inside the array
        // if there isn't a match we need to wait until we've checked every element of the array, if there still isn't a match we need to create a new array element and push that
        
        // This if handles points being added which still do not have proper processing AND any feature that isn't part of a collection
        if (featureCollectionID == null || featureCollectionID == "No Collection"){
            return arrayOfFeatureCollections;
        }

        if (arrayOfFeatureCollections.length != 0) {
            for (let featureCollection in arrayOfFeatureCollections){
                
                // this is the simplest option, we looked for a match and found one so we're adding this feature to that collection
                if (arrayOfFeatureCollections[featureCollection].properties.featureCollectionID == featureCollectionID) {
                    arrayOfFeatureCollections[featureCollection].features.push(geoJSONFeature);
                    break;

                } else {
                    // this is where we checked all existing elements and couldn't find a match so we've added one
                    if (featureCollection == arrayOfFeatureCollections.length - 1){
                        featureCollectionJSON.properties.featureCollectionID = featureCollectionID;
                        featureCollectionJSON.features.push(geoJSONFeature);
                        arrayOfFeatureCollections.push( featureCollectionJSON);
                    }
                }
           }
           // this else handles the condition where there isn't anything in the array of feature collections yet so we need to place the first feature collection object into it with the first feature
        } else {
            featureCollectionJSON.properties.featureCollectionID = featureCollectionID;
            featureCollectionJSON.features.push(geoJSONFeature);
            arrayOfFeatureCollections.push( featureCollectionJSON);
        }       
        return arrayOfFeatureCollections;
    },


    getFeatureElementFeatureCollectionTime: function  ( feature ){
        return feature.properties.featureCollectionTime;
        
    },

    getFeatureElementFeatureCollectionTimeForGeometryCollection: function  ( feature ){
        for ( let geometry in feature.geometries){

           if(feature.geometries[geometry].properties.featureCollectionTime != null) {
               return feature.geometries[geometry].properties.featureCollectionTime;
           }
        }
        console.log("Wait.");
    },

    reassembleGeoJSONGeometryCollection: function ( element ){
        let geoJSONGeomtryCollectionObj = '{ "type": "Feature", "geometry": { "type": "GeometryCollection", "geometries": [] }, "geometryCollectionIDPointAndMultiPoint": null, "geometryCollectionHour": null }';
        geoJSONGeomtryCollectionObj = JSON.parse(geoJSONGeomtryCollectionObj);
        
        let geometryCollectionID = element.arrayOfGeoCollectionElements[0].options.creationID;
        let hour = element.arrayOfGeoCollectionElements[0].options.hour;
        
        for (let geoInformation in element.arrayOfGeoCollectionElements){
            

            // this function is designed to return the element as a feature object, so once we have the information we need
            // it needs to be pulled out of the geoJSON and assigned to our geometry collection object
           let geoJSON = this.retrieveExistingGeoJSONFromLeaflet( element.arrayOfGeoCollectionElements[geoInformation]);
           
            let geoJSONGeometryCollectionJSON = '{ "type": "", "coordinates": "", "properties": { "name" : null, "content" : null, "style" : null, "radius" : null, "featureCollectionTime": null }}';

            geoJSONGeometryCollectionJSON = JSON.parse(geoJSONGeometryCollectionJSON);
            geoJSONGeometryCollectionJSON.type = geoJSON.geometry.type;
            geoJSONGeometryCollectionJSON.coordinates = geoJSON.geometry.coordinates;

            geoJSONGeometryCollectionJSON.properties.name =  geoJSON.geometry.type;
            geoJSONGeometryCollectionJSON.properties.content = geoJSON.properties.content;
            geoJSONGeometryCollectionJSON.properties.style = geoJSON.properties.style;
            geoJSONGeometryCollectionJSON.properties.featureCollectionTime = geoJSON.properties.featureCollectionTime;

            geoJSONGeomtryCollectionObj.geometryCollectionIDPointAndMultiPoint = geometryCollectionID;
            geoJSONGeomtryCollectionObj.geometryCollectionHour = hour;

            geoJSONGeomtryCollectionObj.geometry.geometries.push(geoJSONGeometryCollectionJSON);

        }

        

        return geoJSONGeomtryCollectionObj;

    },

    comparePoints: function ( originalPoint, currentPoint){
        let match = false;
        
        if ( JSON.stringify(originalPoint.coordinates) === JSON.stringify(currentPoint.geometry.coordinates)){
            match = true;
            
        }
        return match;
    },


    checkForMatchingGeometryCollectionIDsAndHour: function ( arrayOfGeoCollectionElementsElement, geoJSONFromLeaflet ){
        let match = false;
        //console.log("array ID is: ", arrayOfGeoCollectionElementsElement.id, "and geoJSON id is: ", geoJSONFromLeaflet.options.creationID)
        //console.log("array hour is: ", arrayOfGeoCollectionElementsElement.hour, " and geoJSON hour is: ", geoJSONFromLeaflet.options.hour)

        if (arrayOfGeoCollectionElementsElement.id == geoJSONFromLeaflet.options.creationID && arrayOfGeoCollectionElementsElement.hour == geoJSONFromLeaflet.options.hour){
            match = true;
            //(console.log("Match!"))
        }
        return match;
    },

    createJSONGeometryCollectionObject: function  ( geoJSONFromLeaflet){
        let jsonArrayElements = '{ "id": "", "hour": "", "arrayOfGeoCollectionElements": [] }';
        jsonArrayElements = JSON.parse(jsonArrayElements);
        jsonArrayElements.id = geoJSONFromLeaflet.options.creationID;
        jsonArrayElements.hour = geoJSONFromLeaflet.options.hour;
        jsonArrayElements.arrayOfGeoCollectionElements.push(geoJSONFromLeaflet);

        return jsonArrayElements;
    },

    // retrieves actual json data from the information leaflet has in smk.$viewer.map._layers and returns a GeoJSON object
    retrieveExistingGeoJSONFromLeaflet: function ( geoJSONFromLeaflet ){
        let rebuiltGeoJSON = null;
        let geoJSONObject = null;
        let toolTipInfo = null;

        if (typeof geoJSONFromLeaflet._tooltip != "undefined" && geoJSONFromLeaflet._tooltip != null){
            toolTipInfo = geoJSONFromLeaflet._tooltip._content;
        }
        
        //console.log("The passed in object is: ", geoJSONFromLeaflet )
        //console.log("The styling for this object is: ", geoJSONFromLeaflet.options.style);
        //console.log("The co-ords for imported geoJson layers is: ", geoJSONFromLeaflet._latlngs);
        // if the object we're coming from is a GeometryCollection we want to base the switch on it's subtype rather than original type
        if ( geoJSONFromLeaflet.options.originalGeoJSONType == "GeometryCollection"){
            switch(geoJSONFromLeaflet.options.geoCollectionSubType) {
                case "Point":
                    geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "Point", this.convertLeafletLatLngToGeoJSONPointAndMultiPoints(geoJSONFromLeaflet._latlng, "Point"), "Point", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null,  geoJSONFromLeaflet.options.creationID, geoJSONFromLeaflet.options.geoCollectionHour);
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "LineString":
                    geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "LineString", this.convertLeafletLatLngArrayToGeoJSONStandard(geoJSONFromLeaflet._latlngs), "LineString", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null);
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "Polygon":
                    geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "Polygon", this.convertLeafletLatLngArrayToGeoJSONStandardForPolygons(geoJSONFromLeaflet._latlngs), "Polygon", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null);
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "MultiPoint":
                    geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "MultiPoint", this.convertLeafletLatLngToGeoJSONPointAndMultiPoints(geoJSONFromLeaflet._latlng, "MultiPoint"), "MultiPoint", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, geoJSONFromLeaflet.options.id, geoJSONFromLeaflet.options.creationID, geoJSONFromLeaflet.options.geoCollectionHour);
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "MultiLineString":
                    geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "MultiLineString", this.convertLatLngArrayToGeoJSONStandardForMultiLineStrings(geoJSONFromLeaflet._latlngs), "MultiLineString", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null);
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "MultiPolygon":
                    geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "MultiPolygon", this.convertLatLngArrayToGeoJSONStandardForMultiPolygons(geoJSONFromLeaflet._latlngs), "MultiPolygon", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null);
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                default:
                    console.log("Not one of the defaults");
            }
        } else {
            switch(geoJSONFromLeaflet.options.originalGeoJSONType) {
                case "Point":
                    geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "Point", this.convertLeafletLatLngToGeoJSONPointAndMultiPoints(geoJSONFromLeaflet._latlng, "Point"), "Point", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, geoJSONFromLeaflet.options.creationID, geoJSONFromLeaflet.options.geoCollectionHour);
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "LineString":
                    geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "LineString", this.convertLeafletLatLngArrayToGeoJSONStandard(geoJSONFromLeaflet._latlngs), "LineString", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null);
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "Polygon":
                    geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "Polygon", this.convertLeafletLatLngArrayToGeoJSONStandardForPolygons(geoJSONFromLeaflet._latlngs), "Polygon", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null);
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "MultiPoint":
                    geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "MultiPoint", this.convertLeafletLatLngToGeoJSONPointAndMultiPoints(geoJSONFromLeaflet._latlng ,"MultiPoint"), "MultiPoint", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, geoJSONFromLeaflet.options.id, geoJSONFromLeaflet.options.creationID, geoJSONFromLeaflet.options.geoCollectionHour);
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "MultiLineString":
                    geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "MultiLineString", this.convertLatLngArrayToGeoJSONStandardForMultiLineStrings(geoJSONFromLeaflet._latlngs), "MultiLineString", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null);
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "MultiPolygon":
                    geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "MultiPolygon", this.convertLatLngArrayToGeoJSONStandardForMultiPolygons(geoJSONFromLeaflet._latlngs), "MultiPolygon", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null);
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                default:
                    console.log("Not one of the defaults"); 
            }
        }
        return rebuiltGeoJSON;
    },

       //leaflet does lat, then lng, everything else is lng then lat
    // for multiple points
    convertLeafletLatLngArrayToGeoJSONStandardForPolygons: function ( latlngs ) {
        
        let holdingArray = [];
        let firstPoint = null;
        
        //for points that don't have an array of latlngs and just have one
        
        // in this case there are multiple to look for

        for (let outerArr in latlngs){
            let convertedLNGLATS = [];
            for (let latlng in latlngs[outerArr]){
                let convertedLNGLAT = [];
                convertedLNGLAT.push(latlngs[outerArr][latlng].lng);
                convertedLNGLAT.push(latlngs[outerArr][latlng].lat);
                convertedLNGLATS.push(convertedLNGLAT);
                // need to handle storage of the first geometry point so we don't forget it becuase leaflet likes to ignore the extra point
                if ( latlng == 0){      
                    firstPoint = convertedLNGLAT;
                }
                 //then if we're done the loop need to add that last element back on before we move on
                 if ( latlng == (latlngs[outerArr].length - 1) ){
                            
                    convertedLNGLATS.push(firstPoint);
                    firstPoint = null;
                }

            }
            
            holdingArray.push(convertedLNGLATS);
        }

        return holdingArray;
    
    },

     //converted for and multi line strings
     convertLatLngArrayToGeoJSONStandardForMultiLineStrings: function ( latlngs ) {
        
        let outerArray = [];
        
        
        // in this case there are multiple to look for
        for (let collectionOfCoords in latlngs){
            let convertedLNGLATS = [];
            for ( let latlng in latlngs[collectionOfCoords]) {
                let convertedLNGLAT = [];
                convertedLNGLAT.push(latlngs[collectionOfCoords][latlng].lng);
                convertedLNGLAT.push(latlngs[collectionOfCoords][latlng].lat);
                convertedLNGLATS.push(convertedLNGLAT);
            }
        outerArray.push(convertedLNGLATS);
        }
        return outerArray;
    },

    //converted for and multi line polygons
    convertLatLngArrayToGeoJSONStandardForMultiPolygons: function ( latlngs ) {

        let finalArray = [];
        let firstPoint = null;
        
        for ( let outerArrayElements in latlngs){
            let outerArray = [];
            for (let middleArrayElements in latlngs[outerArrayElements]){
                let middleArray = [];
                for ( let latlng in latlngs[outerArrayElements][middleArrayElements]) {

                    
                    let convertedLNGLAT = [];
                    convertedLNGLAT.push(latlngs[outerArrayElements][middleArrayElements][latlng].lng);
                    convertedLNGLAT.push(latlngs[outerArrayElements][middleArrayElements][latlng].lat);
                    // need to handle storage of the first geometry point so we don't forget it becuase leaflet likes to ignore the extra point
                    if ( latlng == 0){
                        
                        firstPoint = convertedLNGLAT;
                        
                    }

                    middleArray.push(convertedLNGLAT);
                    //then if we're done the loop need to add that last element back on before we move on
                    if ( latlng == (latlngs[outerArrayElements][middleArrayElements].length - 1) ){
                        
                        middleArray.push(firstPoint);
                        firstPoint = null;
                    }

                }
                outerArray.push(middleArray);
            }
            finalArray.push(outerArray);
        }
        return finalArray;
    },

    convertLeafletDrawingToGeoJSON: function  (leafletDrawingObject ){

        
        let geoJSON = null;
        let geoJSONObject = null;

        console.log("the drawing object is: ", leafletDrawingObject);

        switch (leafletDrawingObject.type){
            case "circle":
                geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "Point", this.convertLeafletLatLngToGeoJSONStandard(leafletDrawingObject), leafletDrawingObject.type, leafletDrawingObject.content, null, leafletDrawingObject.radius, null, null, null);
                geoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                break;
            case "line":
                geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "LineString", this.convertLeafletLatLngArrayToGeoJSONStandard(leafletDrawingObject.latlngs), leafletDrawingObject.type, leafletDrawingObject.content, null, null, null, null, null);
                geoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                break;
            case "polygon":
                geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "Polygon", this.convertLeafletLatLngArrayToGeoJSONStandard(leafletDrawingObject.latlngs[0]), leafletDrawingObject.type, leafletDrawingObject.content, null, null, null, null, null);
                geoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                break;
            case "marker":
                geoJSONObject = new SMK.UTIL.GeoJSONcreator("Feature", "Point", this.convertLeafletLatLngToGeoJSONStandard(leafletDrawingObject), leafletDrawingObject.type, leafletDrawingObject.content, null, null, null, null, null);
                geoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                break;
            default:
                return null;
        }

        return geoJSON;

    },

    //leaflet does lat, then lng, everything else is lng then lat
    // for multiple points
    convertLeafletLatLngArrayToGeoJSONStandard: function ( latlngs ) {
        let convertedLNGLATS = [];
        
        //for points that don't have an array of latlngs and just have one
        
        // in this case there are multiple to look for
        for (let latlng in latlngs){
            let convertedLNGLAT = [];
            convertedLNGLAT.push(latlngs[latlng].lng);
            convertedLNGLAT.push(latlngs[latlng].lat);
            convertedLNGLATS.push(convertedLNGLAT);
            
        }
        return convertedLNGLATS;
    
    },

    //leaflet does lat, then lng, everything else is lng then lat
    //for a single point
    convertLeafletLatLngToGeoJSONStandard: function ( latlng ) {
        let convertedLNGLATS = [];
        
        //for points that don't have an array of latlngs and just have one
        
        convertedLNGLATS.push(latlng.latlng.lng);
        convertedLNGLATS.push(latlng.latlng.lat);

        return convertedLNGLATS;
    },

    
    //leaflet does lat, then lng, everything else is lng then lat
    //for a single point
    convertLeafletLatLngToGeoJSONPointAndMultiPoints: function ( latlng, type ) {
        let convertedLNGLATS = [];
        if (type == "Point") {
        
        
        //for points that don't have an array of latlngs and just have one
        
        convertedLNGLATS.push(latlng.lng);
        convertedLNGLATS.push(latlng.lat);

        } else if (type == "MultiPoint"){
        
        //for points that don't have an array of latlngs and just have one
        
        convertedLNGLATS.push(latlng.lng);
        convertedLNGLATS.push(latlng.lat);
        let outerArray = [];
        outerArray.push(convertedLNGLATS);
        return outerArray;
        }

        return convertedLNGLATS;
    },
    
    getLeaftletDrawing: function (drawing, smk) {

         // handle the export of circles created in leaflet here
        if (smk.$viewer.map._layers[drawing]._mRadius && smk.$viewer.map._layers[drawing]._latlng  ) {
            ////console.log("_mRadius exists and is: ", smk.$viewer.map._layers[drawing]._mRadius)
            

            let radius = smk.$viewer.map._layers[drawing]._mRadius;
            ////console.log(radius)
            ////console.log("_latling exists and is: ", smk.$viewer.map._layers[drawing]._latlng)
            let latlng = smk.$viewer.map._layers[drawing]._latlng;
            //checking for _content which would be there if a tooltip had occured
            let content = this.checkForContent( smk.$viewer.map._layers[drawing] );
            let circleObj = { type: "circle", latlng, radius, content};

            return circleObj;

        // handle support for lines and polygons
        } else if (smk.$viewer.map._layers[drawing]._latlngs && smk.$viewer.map._layers[drawing]._path ) {
            if ( smk.$viewer.map._layers[drawing]._path.attributes[6].nodeValue == "none") {
                // handle retriveing the latlangs needed for making a line, and give it the type of "line"
                ////console.log("This is a line!")
                ////console.log("_latlngs exists and is: ", smk.$viewer.map._layers[drawing]._latlngs)
                let latlngs = smk.$viewer.map._layers[drawing]._latlngs;
                //checking for _content which would be there if a tooltip had occured
                let content = this.checkForContent( smk.$viewer.map._layers[drawing] );
                
                let lineObj = { type: "line", latlngs, content };
                return lineObj;

                
            } else { //if nodeValue is not "none" then it's a polygon
                ////console.log("This is a polygon")
                ////console.log("_latlngs exists and is: ", smk.$viewer.map._layers[drawing]._latlngs)
                let latlngs = smk.$viewer.map._layers[drawing]._latlngs;
                //checking for _content which would be there if a tooltip had occured
                let content = this.checkForContent( smk.$viewer.map._layers[drawing] );
                
                
                let polygonObj = { type: "polygon", latlngs, content};
                return polygonObj;
                
            }
          
            // handle exporting of markers
        } else if (smk.$viewer.map._layers[drawing]._icon && smk.$viewer.map._layers[drawing]._latlng && smk.$viewer.map._layers[drawing]._shadow  ) {
            let latlng = smk.$viewer.map._layers[drawing]._latlng;
            //checking for _content which would be there if a tooltip had occured
            let content = this.checkForContent( smk.$viewer.map._layers[drawing] );
            let markerObj = { type: "marker", latlng, content  };
            return markerObj;
            

        }

    },



///////////////////////////////////////////////////////////////// END OF SMK SESSION EXPORT FUNCTIONALITY //////////////////////////////////////////////////////////////////////////////////






////////////////////////////////////////////////////////////////// SESSION IMPORT, importing drawings and GeoJSON FUNCTIONALITY//////////////////////////////////////////////////////////////////////




    ifDrawingContentExists: function ( drawing, drawingObj) {
        if (drawingObj.content != null) {
            drawing.bindTooltip(drawingObj.content, {
                permanent: true
            }).openTooltip();
        }
    },

    importLeafletDrawings: function( smk, drawing ) {
        let drawingOnMap;
        let latlng;
        let latlngs = [];
        switch( drawing.properties.name ){
            case "circle":
                latlng = L.GeoJSON.coordsToLatLng(drawing.geometry.coordinates);
                drawingOnMap = L.circle(latlng, {radius: drawing.properties.radius}).addTo(smk.$viewer.currentBasemap[0]._map);
                this.ifDrawingContentExists( drawingOnMap, drawing.properties);
                break;
            case "line":
                for (let coord in drawing.geometry.coordinates){
                    latlng = L.GeoJSON.coordsToLatLng(drawing.geometry.coordinates[coord]);
                    latlngs.push(latlng);
                }
                drawingOnMap = L.polyline(latlngs, {color: 'blue'}).addTo(smk.$viewer.currentBasemap[0]._map);
                this.ifDrawingContentExists( drawingOnMap, drawing.properties);
                break;
            case "polygon":
                for (let coord in drawing.geometry.coordinates){
                    latlng = L.GeoJSON.coordsToLatLng(drawing.geometry.coordinates[coord]);
                    latlngs.push(latlng);
                }
                drawingOnMap = L.polygon(latlngs, {color: 'blue'}).addTo(smk.$viewer.currentBasemap[0]._map);
                this.ifDrawingContentExists( drawingOnMap, drawing.properties);
                break;
            case "marker":
                latlng = L.GeoJSON.coordsToLatLng(drawing.geometry.coordinates);
                drawingOnMap = L.marker(latlng).addTo(smk.$viewer.currentBasemap[0]._map);
                this.ifDrawingContentExists( drawingOnMap, drawing.properties);
                break;
            default:
                console.log("Not a leaflet drawing");
        }
    },

    isSimpleLeafletDrawing: function( drawing ){
        let match = false;
        if (typeof drawing.properties != "undefined") {
            let drawingType = drawing.properties.name;
            if ( drawingType == "marker" || drawingType == "line" || drawingType == "circle" || drawingType == "polygon"){
                match = true;
            }
        }
        return match;
    },


    isStyledGeoJSON: function( geoJSON ){
        let match = false;
        if (geoJSON.type == "Feature" || geoJSON.type == "FeatureCollection"){
            match = true;
        }
        return match;
    },

    importStyledGeoJSON: function ( geoJSON ){
        let color;
        let stroke;
        let fill;
        let opacity;
        let strokeWidth;
        let lineCap;
        let lineJoin;
        let dashArray;
        let dashOffset;
        let fillColor;
        let fillOpacity;
        let fillRule;

        if ( geoJSON.type != "FeatureCollection") {
            color = geoJSON.properties.style.color;
            stroke = geoJSON.properties.style.stroke;
            fill = geoJSON.properties.style.fill;
            opacity = geoJSON.properties.style.opacity;
            strokeWidth = geoJSON.properties.style.strokeWidth;
            lineCap = geoJSON.properties.style.lineCap;
            lineJoin = geoJSON.properties.style.lineJoin;
            dashArray = geoJSON.properties.style.dashArray;
            dashOffset = geoJSON.properties.style.dashOffset;
            fillColor = geoJSON.properties.style.fillColor;
            fillOpacity = geoJSON.properties.style.fillOpacity;
            fillRule = geoJSON.properties.style.fillRule;
        } else {
            // check if the first element in the feature collection is a geometry collection, if so we need to go inside the geometry collection to check it's sub geometries for their style elements
            if ( typeof geoJSON.features[0].geometry.type != "undefined" && geoJSON.features[0].geometry.type == "GeometryCollection"){
                for (let geometry in geoJSON.features[0].geometry.geometries){
                    if (typeof geoJSON.features[0].geometry.geometries[geometry].properties != "undefined" && typeof geoJSON.features[0].geometry.geometries[geometry].properties.style != "undefined" ){
                        color = geoJSON.features[0].geometry.geometries[geometry].properties.style.color;
                        stroke = geoJSON.features[0].geometry.geometries[geometry].properties.style.stroke;
                        fill = geoJSON.features[0].geometry.geometries[geometry].properties.style.fill;
                        opacity = geoJSON.features[0].geometry.geometries[geometry].properties.style.opacity;
                        strokeWidth = geoJSON.features[0].geometry.geometries[geometry].properties.style.strokeWidth;
                        lineCap = geoJSON.features[0].geometry.geometries[geometry].properties.style.lineCap;
                        lineJoin = geoJSON.features[0].geometry.geometries[geometry].properties.style.lineJoin;
                        dashArray = geoJSON.features[0].geometry.geometries[geometry].properties.style.dashArray;
                        dashOffset = geoJSON.features[0].geometry.geometries[geometry].properties.style.dashOffset;
                        fillColor = geoJSON.features[0].geometry.geometries[geometry].properties.style.fillColor;
                        fillOpacity = geoJSON.features[0].geometry.geometries[geometry].properties.style.fillOpacity;
                        fillRule = geoJSON.features[0].geometry.geometries[geometry].properties.style.fillRule;
                        break;
                    }
                }
            } else {
                // just taking feature zero because all non-Geo Collection features in a collection are styled the same, if a change is requested to allow specfic feature styling this can be changed
                color = geoJSON.features[0].properties.style.color;
                stroke = geoJSON.features[0].properties.style.stroke;
                fill = geoJSON.features[0].properties.style.fill;
                opacity = geoJSON.features[0].properties.style.opacity;
                strokeWidth = geoJSON.features[0].properties.style.strokeWidth;
                lineCap = geoJSON.features[0].properties.style.lineCap;
                lineJoin = geoJSON.features[0].properties.style.lineJoin;
                dashArray = geoJSON.features[0].properties.style.dashArray;
                dashOffset = geoJSON.features[0].properties.style.dashOffset;
                fillColor = geoJSON.features[0].properties.style.fillColor;
                fillOpacity = geoJSON.features[0].properties.style.fillOpacity;
                fillRule = geoJSON.features[0].properties.style.fillRule;
            } 
        }
        geoJSON = JSON.stringify(geoJSON);
        this.addGeoJSONFileToMap( geoJSON, color, stroke, fill, opacity, strokeWidth, lineCap, lineJoin, dashArray, dashOffset, fillColor, fillOpacity, fillRule );
    },


    checkDrawings: function ( jsonOfSMKData) {
        //Here we need to loop through the drawings section looking for circle type layers to draw them to the map (can later handle all types of drawings)
        for (let drawing in jsonOfSMKData.drawings) {
            //first check if it's one of the simple leaflet drawing types (all lowercase names: marker, polygon, line, circle)
            if ( this.isSimpleLeafletDrawing(jsonOfSMKData.drawings[drawing])){
                this.importLeafletDrawings(SMK.MAP[1], jsonOfSMKData.drawings[drawing]);
            } else if ( this.isStyledGeoJSON( jsonOfSMKData.drawings[drawing]) ){
                this.importStyledGeoJSON(jsonOfSMKData.drawings[drawing]);
            }
        }  
    },


////////////////////////////////////////////////////////////////// END OF SMK SESSION IMPORT, importing drawings and GeoJSON FUNCTIONALITY//////////////////////////////////////////////////////////////////////

    } );

} );