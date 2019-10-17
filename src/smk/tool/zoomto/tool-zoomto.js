include.module( 'tool-zoomto', [ 'tool', 'widgets', 'tool-zoomto.panel-zoomto-html', 'togeojson', 'proj4' ], function ( inc ) {
    "use strict";


    Vue.component( 'zoomto-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'zoomto-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-zoomto.panel-zoomto-html' ],
        props: [ 'content' ],
        data: function() {
            return {
                items: '',
                selected: 'DD',

                //zoom level for the map
                zoomLevel: 5,

                //Coordinate Values DMS
                latitudeDegree: 48,
                latitudeMinute: 25,
                latitudeSecond: 48,
                longitudeDegree: -123,
                longitudeMinute: -23,
                longitudeSecond: 48,

                //Coordinate Values DD
                longitude: -123.36,
                latitude: 48.42,

                //UTM Values
                easting: 469799,
                northing: 5365500,
                zone: "10",
                
                //albers values
                albersEasting: 1149647.07,
                albersNorthing: 333772.03,
            }
          },
          methods: {

            selectType: function( event ){
                this.selected = event.srcElement.value;
            },
            

            //Decimal Degrees = degrees + (minutes/60) + (seconds/3600)
            submit: function(){
                let latitude;
                let longitude;
                let convertedLatLong;
                let map = SMK.MAP[1].$viewer.map;
                let zoom = parseInt(this.zoomLevel);
                let longlat = "+proj=longlat +datum=WGS84 +no_defs";

                switch(this.selected){
                    case "DD":
                        latitude = parseFloat(this.latitude) ;
                        longitude = parseFloat(this.longitude) ;
                        map.setView([latitude, longitude], zoom);
                        break;
                    case "DMS ":
                        latitude = (parseFloat(this.latitudeDegree) + (parseFloat(this.latitudeMinute)/60) + (parseFloat(this.latitudeSecond)/3600) );
                        longitude = (parseFloat(this.longitudeDegree) + (parseFloat(this.longitudeMinute)/60) + (parseFloat(this.longitudeSecond)/3600) );
                        map.setView([latitude, longitude], zoom);
                        break;
                    case "DDM":
                        latitude = (parseFloat(this.latitudeDegree) + (parseFloat(this.latitudeMinute)/60) );
                        longitude = (parseFloat(this.longitudeDegree) + (parseFloat(this.longitudeMinute)/60) );
                        map.setView([latitude, longitude], zoom);
                        break;
                    case "UTM":
                        let utm = ("+proj=utm +zone=" + this.zone);
                        convertedLatLong = (proj4(utm,longlat,[parseFloat(this.easting), parseFloat(this.northing)]));
                        map.setView([convertedLatLong[1], convertedLatLong[0]], zoom);
                        break;
                    case"Albers":
                        let albers = ("+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
                        convertedLatLong = (proj4(albers,longlat,[parseFloat(this.albersEasting), parseFloat(this.albersNorthing)]));
                        console.log(convertedLatLong)
                        map.setView([convertedLatLong[1], convertedLatLong[0]], zoom);
                        break;

                    default:
                        console.log("I'm not sure how the selection broke, but it did, and it may be your fault.")
                }
                
               
            },

 
          }
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function zoomtoTool( option ) {
        
        this.makePropWidget( 'icon', null ) //'help' )

        this.makePropPanel( 'content', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            widgetComponent:'zoomto-widget',
            panelComponent: 'zoomto-panel',
            // title:          'zoomto SMK',
            // position:       'menu'
            content:        null
            
        }, option ) )

    }
    

    SMK.TYPE.zoomtoTool = zoomtoTool

    $.extend( zoomtoTool.prototype, SMK.TYPE.Tool.prototype )
    zoomtoTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    zoomtoTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this
        
        smk.on( this.id, {
            'activate': function () {
          
                if ( !self.enabled ) return
        
                self.active = !self.active
                
            }

        } )

    } )

    return zoomtoTool
} )
