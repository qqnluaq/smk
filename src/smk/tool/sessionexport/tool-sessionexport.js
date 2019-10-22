include.module( 'tool-sessionexport', [ 'tool', 'widgets', 'tool-sessionexport.panel-sessionexport-html' ], function ( inc ) {
    "use strict";

    /* jshint -W040 */

    var jsonDownloadValue = "Normal"

    Vue.component( 'sessionexport-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'sessionexport-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-sessionexport.panel-sessionexport-html' ],
        props: [ 'content' ],
        
        data: function() {
            return {
              

            }
          }
        
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function sessionexportTool( option ) {
        
        this.makePropWidget( 'icon', null ) //'help' )

        this.makePropPanel( 'content', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            widgetComponent:'sessionexport-widget',
            panelComponent: 'sessionexport-panel',
            // title:          'sessionexport SMK',
            // position:       'menu'
            content:        null
            
        }, option ) )

    }

      // Gets JSON Layer information from smk and then assigns that to an object which can be downloaded
    // Going to build an entire JSON object structured after map-config.json
    // first need to build the map-config.json equivalent object, then can start copying data into it, then it can be provided as a
    // downloadable object
    function createJsonLink ( smk ) {
        let blob = new Blob([JSON.stringify(SMK.UTIL.copyIntoJSONObject( smk ), null, 2)], {type : 'application/json'});
        
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = 'map-config.json';
        a.innerHTML = 'download JSON';
        
        a.dispatchEvent(new MouseEvent(`click`, {bubbles: true, cancelable: true, view: window}));
    }

    SMK.TYPE.sessionexportTool = sessionexportTool

    $.extend( sessionexportTool.prototype, SMK.TYPE.Tool.prototype )
    sessionexportTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    sessionexportTool.prototype.afterInitialize.push( function ( smk ) {

        var self = this;

        smk.on( this.id, {
            'activate': function () {

            if ( !self.enabled ) return
        
            self.active = !self.active
            
            //This is creating an update to date link of the JSON file to download
            createJsonLink( SMK.MAP[1] );

            if ( !self.enabled ) return

            self.active = !self.active
            }
        } )

    } )

    return sessionexportTool
} )
