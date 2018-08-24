include.module( 'tool-location-leaflet', [ 'leaflet', 'tool-location' ], function ( inc ) {
    "use strict";

    var base = include.option( 'baseUrl' ) + '/images/tool/location'

    var blueIcon = new L.Icon( {
        iconUrl:        base + '/marker-icon-blue.png',
        shadowUrl:      base + '/marker-shadow.png',
        iconSize:       [ 25, 41 ],
        iconAnchor:     [ 12, 41 ],
        popupAnchor:    [ 1, -34 ],
        shadowSize:     [ 41, 41 ]
    } )

    SMK.TYPE.LocationTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        self.changedActive( function () {
            self.visible = self.active
        } )

        this.locationMarker = L.marker( null, { icon: blueIcon } )

        if ( !this.showPanel ) {
            this.popup = L.popup( {
                maxWidth: 100,
                closeButton: false,
            } )
            .setContent( function () { return self.vm.$el } )

            this.locationMarker
                .bindPopup( this.popup )
        }

        self.changedVisible( function () {
            if ( self.visible ) {
                self.locationMarker
                    .setLatLng( [ self.location.map.latitude, self.location.map.longitude ] )
                    .addTo( smk.$viewer.map )

                if ( !self.showPanel )
                    self.locationMarker.openPopup()
            }
            else {
                if ( !self.showPanel )
                    self.popup.remove()
                self.locationMarker.remove()
            }
        } )
    } )


} )
