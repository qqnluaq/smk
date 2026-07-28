// SMK v1.0.16001
if ( !window.include ) { ( function () {
    "use strict";

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    var TAG = {}
    var OPTION = {
        baseUrl: document.location,
        timeout: 60 * 1000
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function includeTag( tag, attr ) {
        if ( !attr ) {
            if ( !TAG[ tag ] ) throw new Error( 'tag "' + tag + '" not defined' )

            return TAG[ tag ]
        }

        if ( tag in TAG )
            throw new Error( 'tag "' + tag + '" already defined' )

        TAG[ tag ] = attr
        return attr
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function option( option ) {
        if ( typeof option == 'string' ) return OPTION[ option ]
        Object.assign( OPTION, option )
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    var loader = {}

    loader.$resolveUrl = function ( url ) {
        if ( /^[.][/]/.test( url ) ) return url

        return ( new URL( url, OPTION.baseUrl ) ).toString()
    }

    loader.tags = function ( inc ) {
        return this.template( inc )
            .then( function ( data ) {
                var tagData = JSON.parse( data )
                var tags = Object.keys( tagData )
                tags.forEach( function ( t ) {
                    includeTag( t, tagData[ t ] )
                } )
                return tagData
            } )
    }

    loader.script = function ( inc ) {
        var self = this

        if ( inc.load ) {
            return new Promise( function ( res, rej ) {
                res( inc.load.call( window ) )
            } )
        }
        else if ( inc.url ) {
            return new Promise( function ( res, rej ) {
                var script = document.createElement( 'script' )

                if ( inc.integrity ) {
                    script.setAttribute( 'integrity', inc.integrity )
                    script.setAttribute( 'crossorigin', '' )
                }

                script.addEventListener( 'load', function( ev ) {
                    res( script )
                } )

                script.addEventListener( 'error', function( ev ) {
                    rej( new Error( 'failed to load script from ' + script.src ) )
                } )

                script.setAttribute( 'src', self.$resolveUrl( inc.url ) )

                document.getElementsByTagName( 'head' )[ 0 ].appendChild( script );
            } )
        }
        else throw new Error( 'Can\'t load script' )
    }

    loader.style = function ( inc ) {
        var self = this

        return new Promise( function ( res, rej ) {
            var style
            if ( inc.load ) {
                style = document.createElement( 'style' )
                style.textContent = inc.load
                res( style )
            }
            else {
                style = document.createElement( 'link' )

                style.setAttribute( 'rel', 'stylesheet' )

                if ( inc.integrity ) {
                    style.setAttribute( 'integrity', inc.integrity )
                    style.setAttribute( 'crossorigin', '' )
                }

                style.addEventListener( 'load', function( ev ) {
                    res( style )
                } )

                style.addEventListener( 'error', function( ev ) {
                    rej( new Error( 'failed to load stylesheet from ' + style.href ) )
                } )

                if ( inc.url ) {
                    style.setAttribute( 'href', self.$resolveUrl( inc.url ) )
                }
                else {
                    rej( new Error( 'Can\'t load style' ) )
                }
            }

            document.getElementsByTagName( 'head' )[ 0 ].appendChild( style );
        } )
    }

    loader.template = function ( inc ) {
        var self = this

        if ( inc.load ) {
            return new Promise( function ( res, rej ) {
                res( inc.data = inc.load )
            } )
        }
        else if ( inc.url ) {
            return new Promise( function ( res, rej ) {
                var req = new XMLHttpRequest()
                var url = self.$resolveUrl( inc.url )

                req.addEventListener( 'load', function () {
                    if ( this.status != 200 ) rej( new Error( 'status ' + this.status + ' trying to load template from ' + url ) )
                    res( inc.data = this.responseText )
                } )

                req.addEventListener( 'error', function ( ev ) {
                    rej( new Error( 'failed to load template from ' + url ) )
                } )

                req.open( 'GET', url )
                req.send()
            } )
        }
        else throw new Error( 'Can\'t load template' )
    }

    loader.sequence = function ( inc, tag, warnRedefinition ) {
        inc.tags.forEach( function ( t, i, a ) {
            a[ i ] = _assignAnonTag( t, tag, warnRedefinition )
        } )

        // console.group( tag, 'sequence', JSON.stringify( inc.tags ) )

        var promise = Promise.resolve()
        var res = {}

        inc.tags.forEach( function ( t ) {
            promise = promise.then( function () {
                return _include( t )
            } )
            .then( function ( r ) {
                res[ t ] = r
            } )
        } )

        return promise.then( function () {
            // console.groupEnd()
            return res
        } )
    }

    loader.group = function ( inc, tag ) {
        inc.tags.forEach( function ( t, i, a ) {
            a[ i ] = _assignAnonTag( t, tag )
        } )

        // console.group( tag, 'group', JSON.stringify( inc.tags ) )

        var promises = inc.tags.map( function ( t ) {
            return Promise.resolve().then( function () { return _include( t ) } )
        } )

        return Promise.all( promises )
            .then( function ( ress ) {
                // console.groupEnd()
                var res = {}
                inc.tags.forEach( function ( t, i ) {
                    res[ t ] = ress[ i ]
                } )
                return res
            } )
    }

    loader.asset = function ( inc ) {
        return Promise.resolve( this.$resolveUrl( inc.url ) )
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function include( tags, base ) {
        switch ( type( tags ) ) {
            case 'object': tags = [ tags ]; break
            case 'array': break;
            case 'string': tags = [].slice.call( arguments ); base = null; break
            default: throw new Error( 'unable to include tags: ' + JSON.stringify( tags ) )
        }

        return loader.sequence( { tags: tags }, base, false )
    }

    var extLoader = {
        js: 'script',
        css: 'style',
        html: 'template'
    }

    function _assignAnonTag( tag, base, warnRedefinition ) {
        if ( typeof tag == 'string' ) return tag

        var anon = tag
        var newTag
        if ( base && tag.url && !tag.external && !/[/][/]/.test( tag.url ) ) {
            var m = tag.url.match( /(^|[/])([^/]+)$/ )
            newTag = base + '.' +  m[ 2 ].replace( /[.]/g, '-' ).toLowerCase()
        }
        else {
            newTag = 'anon-' + hash( anon )
        }

        try {
            var inc = includeTag( newTag )
            if ( warnRedefinition !== false )
                console.warn( 'tag "' + newTag + '" already defined as', inc, ', will be used instead of', tag )
        }
        catch ( e ) {
            includeTag( newTag, anon )
        }

        return newTag
    }

    function _include( tag ) {
        var inc = includeTag( _assignAnonTag( tag ) )

        if ( inc.include ) return inc.include

        if ( !inc.loader ) {
            var ext = inc.url.match( /[.]([^.]+)$/ )
            if ( ext ) inc.loader = extLoader[ ext[ 1 ] ]
        }

        if ( !inc.loader ) throw new Error( 'tag "' + tag + '" has no loader for "' + inc.url + '"' )
        if ( !loader[ inc.loader ] ) throw new Error( 'tag "' + tag + '" has unknown loader "' + inc.loader + '"' )

        return ( inc.include = new Promise( function ( res, rej ) {
                loader[ inc.loader ].call( loader, inc, tag )
                    .then( function ( r ) {
                        inc.loaded = r

                        if ( !inc.module ) return r

                        return inc.module
                    } )
                    .then( res, rej )

                setTimeout( function () {
                    rej( new Error( 'timeout' ) )
                }, OPTION.timeout )
            } )
            .then( function ( res ) {
                console.debug( 'included ' + inc.loader + ' "' + tag + '"', inc.url || inc.tags )
                return res
            } )
            .catch( function ( e ) {
                e.message += ', for tag "' + tag + '"'
                console.warn(e)

                throw e
            } ) )
    }

    function module( tag, incs, mod ) {
        var inc
        try {
            inc = includeTag( tag )
        }
        catch ( e ) {
            console.warn( 'tag "' + tag + '" for module not defined, creating' )
            inc = includeTag( tag, {} )
        }

        if ( inc.module )
            console.warn( 'tag "' + tag + '" for module already defined, overwriting' )

        var deps
        if ( incs )
            deps = include( incs )
        else
            deps = Promise.resolve()

        return ( inc.module = deps
            .then( function ( res ) {
                if ( typeof mod == 'function' )
                    return mod.call( inc, res )

                return mod
            } )
            .then( function ( exp ) {
                console.debug( 'module "' + tag + '"' )
                inc.exported = exp
                return exp
            } ) )
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /**
     * Modified from http://stackoverflow.com/a/22429679
     *
     * Calculate a 32 bit FNV-1a hash
     * Found here: https://gist.github.com/vaiorabbit/5657561
     * Ref.: http://isthe.com/chongo/tech/comp/fnv/
     *
     * @param {any} val the input value
     * @returns {string}
     */
    var typeCode = {
        undefined:  '\x00',
        null:       '\x01',
        boolean:    '\x02',
        number:     '\x03',
        string:     '\x04',
        function:   '\x05',
        array:      '\x06',
        object:     '\x0a'
    };

    function type( val ) {
        var t = typeof val
        if ( t != 'object' ) return t
        if ( Array.isArray( val ) ) return 'array'
        if ( val === null ) return 'null'
        return 'object'
    }

    function hash( val ) {
        /* jshint bitwise: false */

        var h = 0x811c9dc5;

        walk( val );

        return ( "0000000" + ( h >>> 0 ).toString( 16 ) ).substr( -8 );

        function walk( val ) {
            var t = type( val );

            switch ( t ) {
            case 'string':
                return addBits( val );

            case 'array':
                addBits( typeCode[ t ] );

                for ( var j1 in val )
                    walk( val[ j1 ] )

                return;

            case 'object':
                addBits( typeCode[ t ] );

                var keys = Object.keys( val ).sort();
                for ( var j2 in keys ) {
                    var key = keys[ j2 ];
                    addBits( key );
                    walk( val[ key ] );
                }
                return;

            case 'undefined':
            case 'null':
                return addBits( typeCode[ t ] )

            default:
                return addBits( typeCode[ t ] + String( val ) )
            }
        }

        function addBits( str ) {
            for ( var i = 0, l = str.length; i < l; i += 1 ) {
                h ^= str.charCodeAt(i);
                h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
            }
        }
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    window.include = include
    window.include.module = module
    window.include.tag = includeTag
    window.include.hash = hash
    window.include.option = option

} )() }


( function ( skip ) {
"use strict";
if ( skip ) return;

    include.tag( "api",
        { loader: "group", tags: [
            { loader: "script", url: "smk/api/geocoder.js" },
            { loader: "script", url: "smk/api/route-planner.js" }
        ] }
    );
    include.tag( "component",
        { loader: "group", tags: [
            { loader: "style", url: "smk/component/component.css" },
            { loader: "script", url: "smk/component/component.js" },
            { loader: "template", url: "smk/component/format-link.html" },
            { loader: "template", url: "smk/component/tool-widget.html" }
        ] }
    );
    include.tag( "component-activate-tool",
        { loader: "group", tags: [
            { loader: "style", url: "smk/component/activate-tool/component-activate-tool.css" },
            { loader: "template", url: "smk/component/activate-tool/component-activate-tool.html" },
            { loader: "script", url: "smk/component/activate-tool/component-activate-tool.js" }
        ] }
    );
    include.tag( "component-address-search",
        { loader: "group", tags: [
            { loader: "style", url: "smk/component/address-search/component-address-search.css" },
            { loader: "template", url: "smk/component/address-search/component-address-search.html" },
            { loader: "script", url: "smk/component/address-search/component-address-search.js" }
        ] }
    );
    include.tag( "component-command-button",
        { loader: "group", tags: [
            { loader: "style", url: "smk/component/command-button/component-command-button.css" },
            { loader: "template", url: "smk/component/command-button/component-command-button.html" },
            { loader: "script", url: "smk/component/command-button/component-command-button.js" }
        ] }
    );
    include.tag( "component-enter-input",
        { loader: "group", tags: [
            { loader: "style", url: "smk/component/enter-input/component-enter-input.css" },
            { loader: "template", url: "smk/component/enter-input/component-enter-input.html" },
            { loader: "script", url: "smk/component/enter-input/component-enter-input.js" }
        ] }
    );
    include.tag( "component-feature-attribute",
        { loader: "group", tags: [
            { loader: "template", url: "smk/component/feature-attribute/component-feature-attribute.html" },
            { loader: "script", url: "smk/component/feature-attribute/component-feature-attribute.js" }
        ] }
    );
    include.tag( "component-feature-attributes",
        { loader: "group", tags: [
            { loader: "template", url: "smk/component/feature-attributes/component-feature-attributes.html" },
            { loader: "script", url: "smk/component/feature-attributes/component-feature-attributes.js" }
        ] }
    );
    include.tag( "component-feature-description",
        { loader: "group", tags: [
            { loader: "template", url: "smk/component/feature-description/component-feature-description.html" },
            { loader: "script", url: "smk/component/feature-description/component-feature-description.js" }
        ] }
    );
    include.tag( "component-feature-list",
        { loader: "group", tags: [
            { loader: "style", url: "smk/component/feature-list/component-feature-list.css" },
            { loader: "template", url: "smk/component/feature-list/component-feature-list.html" },
            { loader: "script", url: "smk/component/feature-list/component-feature-list.js" }
        ] }
    );
    include.tag( "component-feature-properties",
        { loader: "group", tags: [
            { loader: "template", url: "smk/component/feature-properties/component-feature-properties.html" },
            { loader: "script", url: "smk/component/feature-properties/component-feature-properties.js" }
        ] }
    );
    include.tag( "component-parameter",
        { loader: "group", tags: [
            { loader: "template", url: "smk/component/parameter/component-parameter-constant.html" },
            { loader: "template", url: "smk/component/parameter/component-parameter-input.html" },
            { loader: "template", url: "smk/component/parameter/component-parameter-select.html" },
            { loader: "script", url: "smk/component/parameter/component-parameter.js" },
            { loader: "style", url: "smk/component/parameter/tool-query.css" }
        ] }
    );
    include.tag( "component-select-dropdown",
        { loader: "group", tags: [
            { loader: "style", url: "smk/component/select-dropdown/component-select-dropdown.css" },
            { loader: "template", url: "smk/component/select-dropdown/component-select-dropdown.html" },
            { loader: "script", url: "smk/component/select-dropdown/component-select-dropdown.js" }
        ] }
    );
    include.tag( "component-select-option",
        { loader: "group", tags: [
            { loader: "style", url: "smk/component/select-option/component-select-option.css" },
            { loader: "template", url: "smk/component/select-option/component-select-option.html" },
            { loader: "script", url: "smk/component/select-option/component-select-option.js" }
        ] }
    );
    include.tag( "component-toggle-button",
        { loader: "group", tags: [
            { loader: "style", url: "smk/component/toggle-button/component-toggle-button.css" },
            { loader: "template", url: "smk/component/toggle-button/component-toggle-button.html" },
            { loader: "script", url: "smk/component/toggle-button/component-toggle-button.js" }
        ] }
    );
    include.tag( "component-tool-panel",
        { loader: "group", tags: [
            { loader: "template", url: "smk/component/tool-panel/component-tool-panel.html" },
            { loader: "script", url: "smk/component/tool-panel/component-tool-panel.js" }
        ] }
    );
    include.tag( "component-tool-panel-feature",
        { loader: "group", tags: [
            { loader: "style", url: "smk/component/tool-panel-feature/component-tool-panel-feature.css" },
            { loader: "template", url: "smk/component/tool-panel-feature/component-tool-panel-feature.html" },
            { loader: "script", url: "smk/component/tool-panel-feature/component-tool-panel-feature.js" }
        ] }
    );
    include.tag( "default-config",
        { loader: "group", tags: [
            "tool-about-config",
            "tool-actionbar-config",
            "tool-baseMaps-config",
            "tool-bespoke-config",
            "tool-coordinate-config",
            "tool-current-location-config",
            "tool-directions-config",
            "tool-dropdown-config",
            "tool-identify-config",
            "tool-layers-config",
            "tool-legend-config",
            "tool-list-menu-config",
            "tool-location-config",
            "tool-markup-config",
            "tool-measure-config",
            "tool-menu-config",
            "tool-minimap-config",
            "tool-pan-config",
            "tool-query-place-config",
            "tool-query-config",
            "tool-reset-view-config",
            "tool-scale-config",
            "tool-search-config",
            "tool-select-config",
            "tool-shortcut-menu-config",
            "tool-toolbar-config",
            "tool-version-config",
            "tool-zoom-config",
            "tool-base-config",
            "tool-feature-list-config",
            "tool-internal-layers-config",
            "tool-panel-config",
            "tool-panel-feature-config",
            "tool-widget-config"
        ] }
    );
    include.tag( "document-ready",
        { loader: "script", url: "smk/document-ready.js" }
    );
    include.tag( "esri3d",
        { loader: "sequence", tags: [
            "leaflet",
            "projections",
            { loader: "style", url: "https://js.arcgis.com/4.18/esri/css/main.css" },
            { loader: "script", url: "https://js.arcgis.com/4.18/" }
        ] }
    );
    include.tag( "event",
        { loader: "script", url: "smk/event.js" }
    );
    include.tag( "feature-set",
        { loader: "script", url: "smk/feature-set.js" }
    );
    include.tag( "flare-cluster-layer",
        { loader: "script", url: "lib/esri3d/FlareClusterLayer_v4.js" }
    );
    include.tag( "jquery",
        { loader: "script", url: "lib/jquery-3.3.1.min.js" }
    );
    include.tag( "layer",
        { loader: "group", tags: [
            { loader: "script", url: "smk/layer/layer-cluster.js" },
            { loader: "script", url: "smk/layer/layer-esri-dynamic.js" },
            { loader: "script", url: "smk/layer/layer-esri-feature.js" },
            { loader: "script", url: "smk/layer/layer-esri-tiled.js" },
            { loader: "script", url: "smk/layer/layer-vector.js" },
            { loader: "script", url: "smk/layer/layer-wms.js" },
            { loader: "script", url: "smk/layer/layer.js" }
        ] }
    );
    include.tag( "layer-display",
        { loader: "script", url: "smk/layer-display.js" }
    );
    include.tag( "layer-esri3d",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-esri3d/layer/layer-cluster-esri3d.js" },
            { loader: "script", url: "smk/viewer-esri3d/layer/layer-esri-dynamic-esri3d.js" },
            { loader: "script", url: "smk/viewer-esri3d/layer/layer-vector-esri3d.js" },
            { loader: "script", url: "smk/viewer-esri3d/layer/layer-wms-esri3d.js" }
        ] }
    );
    include.tag( "layer-leaflet",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-leaflet/layer/layer-esri-dynamic-leaflet.js" },
            { loader: "script", url: "smk/viewer-leaflet/layer/layer-esri-feature-leaflet.js" },
            { loader: "script", url: "smk/viewer-leaflet/layer/layer-esri-tiled-leaflet.js" },
            { loader: "script", url: "smk/viewer-leaflet/layer/layer-vector-leaflet.js" },
            { loader: "script", url: "smk/viewer-leaflet/layer/layer-wms-leaflet.js" },
            { loader: "style", url: "lib/leaflet/marker-cluster-1.0.6.css" },
            { loader: "script", url: "lib/leaflet/marker-cluster-1.0.6.js" },
            { loader: "style", url: "lib/leaflet/marker-cluster-default-1.0.6.css" },
            { loader: "script", url: "lib/leaflet/NonTiledLayer-src.js" },
            { loader: "script", url: "lib/leaflet/leaflet-heat.js" }
        ] }
    );
    include.tag( "leaflet",
        { loader: "sequence", tags: [
            { loader: "script", url: "lib/leaflet/leaflet-1.6.0.js" },
            { loader: "style", url: "lib/leaflet/leaflet-1.6.0.css" },
            { loader: "script", url: "lib/leaflet/esri-leaflet-3.0.8.js" },
            { loader: "script", url: "lib/leaflet/esri-leaflet-renderers-2.1.2.js" },
            { loader: "script", url: "lib/leaflet/esri-leaflet-legend-compat-src-2.0.1.js" },
            { loader: "asset", url: "lib/leaflet/images/layers-2x.png" },
            { loader: "asset", url: "lib/leaflet/images/layers.png" },
            { loader: "asset", url: "lib/leaflet/images/marker-icon-2x.png" },
            { loader: "asset", url: "lib/leaflet/images/marker-icon.png" },
            { loader: "asset", url: "lib/leaflet/images/marker-shadow.png" }
        ] }
    );
    include.tag( "libs",
        { loader: "script", url: "smk/libs.js" }
    );
    include.tag( "material-icons",
        { loader: "group", tags: [
            { loader: "style", url: "../node_modules/material-design-icons-iconfont/dist/material-design-icons.css" },
            { loader: "asset", url: "../node_modules/material-design-icons-iconfont/dist/fonts/MaterialIcons-Regular.ttf" },
            { loader: "asset", url: "../node_modules/material-design-icons-iconfont/dist/fonts/MaterialIcons-Regular.woff" },
            { loader: "asset", url: "../node_modules/material-design-icons-iconfont/dist/fonts/MaterialIcons-Regular.woff2" }
        ] }
    );
    include.tag( "merge-config",
        { loader: "script", url: "smk/merge-config.js" }
    );
    include.tag( "proj4",
        { loader: "script", url: "lib/proj4-2.4.4.min.js" }
    );
    include.tag( "projections",
        { loader: "script", url: "smk/projections.js" }
    );
    include.tag( "query",
        { loader: "group", tags: [
            { loader: "script", url: "smk/query/query-esri-dynamic.js" },
            { loader: "script", url: "smk/query/query-esri-feature.js" },
            { loader: "script", url: "smk/query/query-place.js" },
            { loader: "script", url: "smk/query/query-vector.js" },
            { loader: "script", url: "smk/query/query-wms.js" },
            { loader: "script", url: "smk/query/query.js" }
        ] }
    );
    include.tag( "sidepanel",
        { loader: "group", tags: [
            { loader: "style", url: "smk/sidepanel/sidepanel.css" },
            { loader: "template", url: "smk/sidepanel/sidepanel.html" },
            { loader: "script", url: "smk/sidepanel/sidepanel.js" }
        ] }
    );
    include.tag( "smk-map",
        { loader: "script", url: "smk/smk-map.js" }
    );
    include.tag( "status-message",
        { loader: "group", tags: [
            { loader: "style", url: "smk/status-message/status-message.css" },
            { loader: "template", url: "smk/status-message/status-message.html" },
            { loader: "script", url: "smk/status-message/status-message.js" }
        ] }
    );
    include.tag( "terraformer",
        { loader: "sequence", tags: [
            { loader: "script", url: "lib/terraformer/terraformer-1.0.7.js" },
            { loader: "script", url: "lib/terraformer/terraformer-arcgis-parser-1.0.5.js" }
        ] }
    );
    include.tag( "theme-alpha",
        { loader: "group", tags: [
            { loader: "style", url: "theme/alpha/alpha.css" }
        ] }
    );
    include.tag( "theme-base",
        { loader: "group", tags: [
            { loader: "style", url: "theme/_base/command.css" },
            { loader: "style", url: "theme/_base/elastic.css" },
            { loader: "style", url: "theme/_base/map-frame.css" },
            { loader: "style", url: "theme/_base/resets.css" },
            { loader: "style", url: "theme/_base/variables.css" },
            "material-icons"
        ] }
    );
    include.tag( "theme-beta",
        { loader: "group", tags: [
            { loader: "style", url: "theme/beta/beta.css" }
        ] }
    );
    include.tag( "theme-delta",
        { loader: "group", tags: [
            { loader: "style", url: "theme/delta/delta.css" }
        ] }
    );
    include.tag( "theme-gamma",
        { loader: "group", tags: [
            { loader: "style", url: "theme/gamma/gamma.css" }
        ] }
    );
    include.tag( "theme-wf",
        { loader: "group", tags: [
            { loader: "style", url: "theme/wf/wf.css" }
        ] }
    );
    include.tag( "tool",
        { loader: "script", url: "smk/tool.js" }
    );
    include.tag( "tool-about",
        { loader: "group", tags: [
            { loader: "template", url: "smk/tool/about/panel-about.html" },
            { loader: "style", url: "smk/tool/about/tool-about.css" },
            { loader: "script", url: "smk/tool/about/tool-about.js" }
        ] }
    );
    include.tag( "tool-about-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/about/config/tool-about-config.js" }
        ] }
    );
    include.tag( "tool-actionbar",
        { loader: "group", tags: [
            { loader: "template", url: "smk/tool/actionbar/actionbar.html" },
            { loader: "style", url: "smk/tool/actionbar/tool-actionbar.css" },
            { loader: "script", url: "smk/tool/actionbar/tool-actionbar.js" }
        ] }
    );
    include.tag( "tool-actionbar-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/actionbar/config/tool-actionbar-config.js" }
        ] }
    );
    include.tag( "tool-base",
        { loader: "group", tags: [
            { loader: "script", url: "smk/mixin/tool-base/tool-base.js" }
        ] }
    );
    include.tag( "tool-base-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/mixin/tool-base/config/tool-base-config.js" }
        ] }
    );
    include.tag( "tool-baseMaps",
        { loader: "group", tags: [
            { loader: "template", url: "smk/tool/baseMaps/panel-base-maps.html" },
            { loader: "style", url: "smk/tool/baseMaps/tool-base-maps.css" },
            { loader: "script", url: "smk/tool/baseMaps/tool-baseMaps.js" }
        ] }
    );
    include.tag( "tool-baseMaps-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/baseMaps/config/tool-baseMaps-config.js" }
        ] }
    );
    include.tag( "tool-bespoke",
        { loader: "group", tags: [
            { loader: "template", url: "smk/tool/bespoke/panel-bespoke.html" },
            { loader: "style", url: "smk/tool/bespoke/tool-bespoke.css" },
            { loader: "script", url: "smk/tool/bespoke/tool-bespoke.js" }
        ] }
    );
    include.tag( "tool-bespoke-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/bespoke/config/tool-bespoke-config.js" }
        ] }
    );
    include.tag( "tool-coordinate",
        { loader: "group", tags: [
            { loader: "template", url: "smk/tool/coordinate/coordinate.html" },
            { loader: "style", url: "smk/tool/coordinate/tool-coordinate.css" },
            { loader: "script", url: "smk/tool/coordinate/tool-coordinate.js" }
        ] }
    );
    include.tag( "tool-coordinate-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/coordinate/config/tool-coordinate-config.js" }
        ] }
    );
    include.tag( "tool-coordinate-esri3d",
        { loader: "group", tags: [

        ] }
    );
    include.tag( "tool-coordinate-leaflet",
        { loader: "group", tags: [

        ] }
    );
    include.tag( "tool-current-location",
        { loader: "group", tags: [
            { loader: "style", url: "smk/tool/current-location/tool-current-location.css" },
            { loader: "script", url: "smk/tool/current-location/tool-current-location.js" },
            { loader: "template", url: "smk/tool/current-location/widget-current-location.html" }
        ] }
    );
    include.tag( "tool-current-location-config",
        { loader: "group", tags: [
            { loader: "asset", url: "smk/tool/current-location/config/my-location.png" },
            { loader: "script", url: "smk/tool/current-location/config/tool-current-location-config.js" }
        ] }
    );
    include.tag( "tool-directions",
        { loader: "group", tags: [
            "tool-directions-libs",
            { loader: "asset", url: "smk/tool/directions/marker-icon-hole.png" },
            { loader: "template", url: "smk/tool/directions/panel-directions-options.html" },
            { loader: "template", url: "smk/tool/directions/panel-directions-route.html" },
            { loader: "template", url: "smk/tool/directions/panel-directions.html" },
            { loader: "style", url: "smk/tool/directions/tool-directions-options.css" },
            { loader: "script", url: "smk/tool/directions/tool-directions-options.js" },
            { loader: "style", url: "smk/tool/directions/tool-directions-route.css" },
            { loader: "script", url: "smk/tool/directions/tool-directions-route.js" },
            { loader: "script", url: "smk/tool/directions/tool-directions-waypoints.js" },
            { loader: "style", url: "smk/tool/directions/tool-directions.css" },
            { loader: "script", url: "smk/tool/directions/tool-directions.js" }
        ] }
    );
    include.tag( "tool-directions-config",
        { loader: "group", tags: [
            { loader: "asset", url: "smk/tool/directions/config/marker-icon-blue.png" },
            { loader: "asset", url: "smk/tool/directions/config/marker-icon-green.png" },
            { loader: "asset", url: "smk/tool/directions/config/marker-icon-red.png" },
            { loader: "asset", url: "smk/tool/directions/config/marker-shadow.png" },
            { loader: "script", url: "smk/tool/directions/config/tool-directions-config.js" }
        ] }
    );
    include.tag( "tool-directions-esri3d",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-esri3d/tool/directions/tool-directions-esri3d.js" }
        ] }
    );
    include.tag( "tool-directions-leaflet",
        { loader: "group", tags: [
            { loader: "style", url: "smk/viewer-leaflet/tool/directions/tool-directions-leaflet.css" },
            { loader: "script", url: "smk/viewer-leaflet/tool/directions/tool-directions-leaflet.js" }
        ] }
    );
    include.tag( "tool-directions-libs",
        { loader: "sequence", tags: [
            { loader: "script", url: "smk/tool/directions/lib/sortable-1.7.0.min.js" },
            { loader: "script", url: "smk/tool/directions/lib/vuedraggable-2.16.0.min.js" }
        ] }
    );
    include.tag( "tool-dropdown-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/dropdown/config/tool-dropdown-config.js" }
        ] }
    );
    include.tag( "tool-feature-list",
        { loader: "group", tags: [
            { loader: "script", url: "smk/mixin/tool-feature-list/tool-feature-list.js" }
        ] }
    );
    include.tag( "tool-feature-list-config",
        { loader: "group", tags: [
            { loader: "asset", url: "smk/mixin/tool-feature-list/config/marker-icon-white.png" },
            { loader: "asset", url: "smk/mixin/tool-feature-list/config/marker-shadow.png" },
            { loader: "script", url: "smk/mixin/tool-feature-list/config/tool-feature-list-config.js" }
        ] }
    );
    include.tag( "tool-identify",
        { loader: "group", tags: [
            { loader: "template", url: "smk/tool/identify/panel-identify.html" },
            { loader: "script", url: "smk/tool/identify/tool-identify-feature.js" },
            { loader: "script", url: "smk/tool/identify/tool-identify-list.js" },
            { loader: "style", url: "smk/tool/identify/tool-identify.css" },
            { loader: "script", url: "smk/tool/identify/tool-identify.js" }
        ] }
    );
    include.tag( "tool-identify-config",
        { loader: "group", tags: [
            { loader: "asset", url: "smk/tool/identify/config/crosshair.png" },
            { loader: "script", url: "smk/tool/identify/config/tool-identify-config.js" }
        ] }
    );
    include.tag( "tool-identify-esri3d",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-esri3d/tool/identify/tool-identify-esri3d.js" }
        ] }
    );
    include.tag( "tool-identify-leaflet",
        { loader: "group", tags: [
            { loader: "style", url: "smk/viewer-leaflet/tool/identify/tool-identify-leaflet.css" },
            { loader: "script", url: "smk/viewer-leaflet/tool/identify/tool-identify-leaflet.js" }
        ] }
    );
    include.tag( "tool-internal-layers",
        { loader: "group", tags: [
            { loader: "script", url: "smk/mixin/tool-internal-layers/tool-internal-layers.js" }
        ] }
    );
    include.tag( "tool-internal-layers-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/mixin/tool-internal-layers/config/tool-internal-layers-config.js" }
        ] }
    );
    include.tag( "tool-layers",
        { loader: "group", tags: [
            { loader: "template", url: "smk/tool/layers/layer-display.html" },
            { loader: "template", url: "smk/tool/layers/panel-layers.html" },
            { loader: "style", url: "smk/tool/layers/tool-layers.css" },
            { loader: "script", url: "smk/tool/layers/tool-layers.js" }
        ] }
    );
    include.tag( "tool-layers-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/layers/config/tool-layers-config.js" }
        ] }
    );
    include.tag( "tool-leaflet",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-leaflet/tool/tool-feature-list-clustering-leaflet.js" }
        ] }
    );
    include.tag( "tool-legend",
        { loader: "group", tags: [
            { loader: "template", url: "smk/tool/legend/legend-display.html" },
            { loader: "template", url: "smk/tool/legend/legend.html" },
            { loader: "style", url: "smk/tool/legend/tool-legend.css" },
            { loader: "script", url: "smk/tool/legend/tool-legend.js" }
        ] }
    );
    include.tag( "tool-legend-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/legend/config/tool-legend-config.js" }
        ] }
    );
    include.tag( "tool-legend-leaflet",
        { loader: "group", tags: [

        ] }
    );
    include.tag( "tool-list-menu",
        { loader: "group", tags: [
            { loader: "style", url: "smk/tool/list-menu/list-menu.css" },
            { loader: "template", url: "smk/tool/list-menu/panel-list-menu.html" },
            { loader: "script", url: "smk/tool/list-menu/tool-list-menu.js" }
        ] }
    );
    include.tag( "tool-list-menu-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/list-menu/config/tool-list-menu-config.js" }
        ] }
    );
    include.tag( "tool-location",
        { loader: "group", tags: [
            { loader: "template", url: "smk/tool/location/panel-location.html" },
            { loader: "template", url: "smk/tool/location/popup-location.html" },
            { loader: "style", url: "smk/tool/location/tool-location.css" },
            { loader: "script", url: "smk/tool/location/tool-location.js" }
        ] }
    );
    include.tag( "tool-location-config",
        { loader: "group", tags: [
            { loader: "asset", url: "smk/tool/location/config/marker-icon-blue.png" },
            { loader: "asset", url: "smk/tool/location/config/marker-shadow.png" },
            { loader: "script", url: "smk/tool/location/config/tool-location-config.js" }
        ] }
    );
    include.tag( "tool-location-esri3d",
        { loader: "group", tags: [

        ] }
    );
    include.tag( "tool-location-leaflet",
        { loader: "group", tags: [

        ] }
    );
    include.tag( "tool-markup",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/markup/tool-markup.js" }
        ] }
    );
    include.tag( "tool-markup-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/markup/config/tool-markup-config.js" }
        ] }
    );
    include.tag( "tool-markup-esri3d",
        { loader: "group", tags: [

        ] }
    );
    include.tag( "tool-markup-leaflet",
        { loader: "sequence", tags: [
            { loader: "style", url: "smk/viewer-leaflet/tool/markup/lib/leaflet-pm-0.17.3.css" },
            { loader: "script", url: "smk/viewer-leaflet/tool/markup/lib/leaflet-pm-0.17.3.min.js" },
            { loader: "script", url: "smk/viewer-leaflet/tool/markup/tool-markup-leaflet.js" }
        ] }
    );
    include.tag( "tool-measure",
        { loader: "group", tags: [
            { loader: "template", url: "smk/tool/measure/panel-measure.html" },
            { loader: "style", url: "smk/tool/measure/tool-measure.css" },
            { loader: "script", url: "smk/tool/measure/tool-measure.js" }
        ] }
    );
    include.tag( "tool-measure-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/measure/config/tool-measure-config.js" }
        ] }
    );
    include.tag( "tool-measure-esri3d",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-esri3d/tool/measure/tool-measure-esri3d.js" }
        ] }
    );
    include.tag( "tool-measure-leaflet",
        { loader: "group", tags: [
            { loader: "asset", url: "smk/viewer-leaflet/tool/measure/lib/cancel_@2X.png" },
            { loader: "asset", url: "smk/viewer-leaflet/tool/measure/lib/cancel.png" },
            { loader: "asset", url: "smk/viewer-leaflet/tool/measure/lib/check_@2X.png" },
            { loader: "asset", url: "smk/viewer-leaflet/tool/measure/lib/check.png" },
            { loader: "asset", url: "smk/viewer-leaflet/tool/measure/lib/focus_@2X.png" },
            { loader: "asset", url: "smk/viewer-leaflet/tool/measure/lib/focus.png" },
            { loader: "style", url: "smk/viewer-leaflet/tool/measure/lib/leaflet-measure.css" },
            { loader: "script", url: "smk/viewer-leaflet/tool/measure/lib/leaflet-measure.min.js" },
            { loader: "asset", url: "smk/viewer-leaflet/tool/measure/lib/rulers_@2X.png" },
            { loader: "asset", url: "smk/viewer-leaflet/tool/measure/lib/rulers.png" },
            { loader: "asset", url: "smk/viewer-leaflet/tool/measure/lib/start_@2X.png" },
            { loader: "asset", url: "smk/viewer-leaflet/tool/measure/lib/start.png" },
            { loader: "asset", url: "smk/viewer-leaflet/tool/measure/lib/toggle.png" },
            { loader: "asset", url: "smk/viewer-leaflet/tool/measure/lib/toggle.svg" },
            { loader: "asset", url: "smk/viewer-leaflet/tool/measure/lib/trash_@2X.png" },
            { loader: "asset", url: "smk/viewer-leaflet/tool/measure/lib/trash.png" },
            { loader: "style", url: "smk/viewer-leaflet/tool/measure/tool-measure-leaflet.css" },
            { loader: "script", url: "smk/viewer-leaflet/tool/measure/tool-measure-leaflet.js" }
        ] }
    );
    include.tag( "tool-menu",
        { loader: "group", tags: [
            { loader: "style", url: "smk/tool/menu/menu.css" },
            { loader: "template", url: "smk/tool/menu/panel-menu.html" },
            { loader: "script", url: "smk/tool/menu/tool-menu.js" }
        ] }
    );
    include.tag( "tool-menu-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/menu/config/tool-menu-config.js" }
        ] }
    );
    include.tag( "tool-minimap",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/minimap/tool-minimap.js" }
        ] }
    );
    include.tag( "tool-minimap-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/minimap/config/tool-minimap-config.js" }
        ] }
    );
    include.tag( "tool-minimap-esri3d",
        { loader: "group", tags: [

        ] }
    );
    include.tag( "tool-minimap-leaflet",
        { loader: "group", tags: [
            { loader: "style", url: "smk/viewer-leaflet/tool/minimap/lib/Control.MiniMap.min.css" },
            { loader: "script", url: "smk/viewer-leaflet/tool/minimap/lib/Control.MiniMap.min.js" },
            { loader: "script", url: "smk/viewer-leaflet/tool/minimap/tool-minimap-leaflet.js" }
        ] }
    );
    include.tag( "tool-pan",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/pan/tool-pan.js" },
            { loader: "template", url: "smk/tool/pan/widget-pan.html" }
        ] }
    );
    include.tag( "tool-pan-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/pan/config/tool-pan-config.js" }
        ] }
    );
    include.tag( "tool-pan-esri3d",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-esri3d/tool/pan/tool-pan-esri3d.js" }
        ] }
    );
    include.tag( "tool-pan-leaflet",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-leaflet/tool/pan/tool-pan-leaflet.js" }
        ] }
    );
    include.tag( "tool-panel",
        { loader: "group", tags: [
            { loader: "script", url: "smk/mixin/tool-panel/tool-panel.js" }
        ] }
    );
    include.tag( "tool-panel-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/mixin/tool-panel/config/tool-panel-config.js" }
        ] }
    );
    include.tag( "tool-panel-feature",
        { loader: "group", tags: [
            { loader: "script", url: "smk/mixin/tool-panel-feature/tool-panel-feature.js" }
        ] }
    );
    include.tag( "tool-panel-feature-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/mixin/tool-panel-feature/config/tool-panel-feature-config.js" }
        ] }
    );
    include.tag( "tool-query",
        { loader: "group", tags: [
            { loader: "template", url: "smk/tool/query/panel-query-results.html" },
            { loader: "template", url: "smk/tool/query/panel-query.html" },
            { loader: "script", url: "smk/tool/query/tool-query-feature.js" },
            { loader: "script", url: "smk/tool/query/tool-query-parameters.js" },
            { loader: "script", url: "smk/tool/query/tool-query-results.js" },
            { loader: "style", url: "smk/tool/query/tool-query.css" },
            { loader: "script", url: "smk/tool/query/tool-query.js" }
        ] }
    );
    include.tag( "tool-query-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/query/config/tool-query-config.js" }
        ] }
    );
    include.tag( "tool-query-esri3d",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-esri3d/tool/query/tool-query-esri3d.js" }
        ] }
    );
    include.tag( "tool-query-leaflet",
        { loader: "group", tags: [
            { loader: "style", url: "smk/viewer-leaflet/tool/query/tool-query-leaflet.css" },
            { loader: "script", url: "smk/viewer-leaflet/tool/query/tool-query-leaflet.js" }
        ] }
    );
    include.tag( "tool-query-place-config",
        { loader: "group", tags: [

        ] }
    );
    include.tag( "tool-reset-view",
        { loader: "group", tags: [
            { loader: "style", url: "smk/tool/reset-view/tool-reset-view.css" },
            { loader: "script", url: "smk/tool/reset-view/tool-reset-view.js" },
            { loader: "template", url: "smk/tool/reset-view/widget-reset-view.html" }
        ] }
    );
    include.tag( "tool-reset-view-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/reset-view/config/tool-reset-view-config.js" }
        ] }
    );
    include.tag( "tool-scale",
        { loader: "group", tags: [
            { loader: "template", url: "smk/tool/scale/scale.html" },
            { loader: "style", url: "smk/tool/scale/tool-scale.css" },
            { loader: "script", url: "smk/tool/scale/tool-scale.js" }
        ] }
    );
    include.tag( "tool-scale-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/scale/config/tool-scale-config.js" }
        ] }
    );
    include.tag( "tool-scale-esri3d",
        { loader: "group", tags: [

        ] }
    );
    include.tag( "tool-scale-leaflet",
        { loader: "group", tags: [

        ] }
    );
    include.tag( "tool-search",
        { loader: "group", tags: [
            { loader: "template", url: "smk/tool/search/location-address.html" },
            { loader: "template", url: "smk/tool/search/location-title.html" },
            { loader: "template", url: "smk/tool/search/panel-search-location.html" },
            { loader: "template", url: "smk/tool/search/panel-search.html" },
            { loader: "template", url: "smk/tool/search/popup-search.html" },
            { loader: "script", url: "smk/tool/search/tool-search-list.js" },
            { loader: "script", url: "smk/tool/search/tool-search-location.js" },
            { loader: "style", url: "smk/tool/search/tool-search.css" },
            { loader: "script", url: "smk/tool/search/tool-search.js" },
            { loader: "template", url: "smk/tool/search/widget-search.html" }
        ] }
    );
    include.tag( "tool-search-config",
        { loader: "group", tags: [
            { loader: "asset", url: "smk/tool/search/config/marker-icon-yellow.png" },
            { loader: "asset", url: "smk/tool/search/config/marker-shadow.png" },
            { loader: "asset", url: "smk/tool/search/config/star-icon-yellow.png" },
            { loader: "script", url: "smk/tool/search/config/tool-search-config.js" }
        ] }
    );
    include.tag( "tool-search-esri3d",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-esri3d/tool/search/tool-search-esri3d.js" }
        ] }
    );
    include.tag( "tool-search-leaflet",
        { loader: "group", tags: [

        ] }
    );
    include.tag( "tool-select",
        { loader: "group", tags: [
            { loader: "template", url: "smk/tool/select/panel-select.html" },
            { loader: "script", url: "smk/tool/select/tool-select-feature.js" },
            { loader: "script", url: "smk/tool/select/tool-select-list.js" },
            { loader: "script", url: "smk/tool/select/tool-select.js" }
        ] }
    );
    include.tag( "tool-select-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/select/config/tool-select-config.js" }
        ] }
    );
    include.tag( "tool-select-esri3d",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-esri3d/tool/select/tool-select-esri3d.js" }
        ] }
    );
    include.tag( "tool-select-leaflet",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-leaflet/tool/select/tool-select-leaflet.js" }
        ] }
    );
    include.tag( "tool-shortcut-menu",
        { loader: "group", tags: [
            { loader: "style", url: "smk/tool/shortcut-menu/shortcut-menu.css" },
            { loader: "template", url: "smk/tool/shortcut-menu/shortcut-menu.html" },
            { loader: "script", url: "smk/tool/shortcut-menu/tool-shortcut-menu.js" }
        ] }
    );
    include.tag( "tool-shortcut-menu-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/shortcut-menu/config/tool-shortcut-menu-config.js" }
        ] }
    );
    include.tag( "tool-toolbar",
        { loader: "group", tags: [
            { loader: "style", url: "smk/tool/toolbar/tool-toolbar.css" },
            { loader: "script", url: "smk/tool/toolbar/tool-toolbar.js" },
            { loader: "template", url: "smk/tool/toolbar/toolbar.html" }
        ] }
    );
    include.tag( "tool-toolbar-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/toolbar/config/tool-toolbar-config.js" }
        ] }
    );
    include.tag( "tool-version",
        { loader: "group", tags: [
            { loader: "template", url: "smk/tool/version/panel-version.html" },
            { loader: "style", url: "smk/tool/version/tool-version.css" },
            { loader: "script", url: "smk/tool/version/tool-version.js" }
        ] }
    );
    include.tag( "tool-version-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/version/config/tool-version-config.js" }
        ] }
    );
    include.tag( "tool-widget",
        { loader: "group", tags: [
            { loader: "script", url: "smk/mixin/tool-widget/tool-widget.js" }
        ] }
    );
    include.tag( "tool-widget-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/mixin/tool-widget/config/tool-widget-config.js" }
        ] }
    );
    include.tag( "tool-zoom",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/zoom/tool-zoom.js" },
            { loader: "template", url: "smk/tool/zoom/widget-zoom.html" }
        ] }
    );
    include.tag( "tool-zoom-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/tool/zoom/config/tool-zoom-config.js" }
        ] }
    );
    include.tag( "tool-zoom-esri3d",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-esri3d/tool/zoom/tool-zoom-esri3d.js" }
        ] }
    );
    include.tag( "tool-zoom-leaflet",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-leaflet/tool/zoom/tool-zoom-leaflet.js" }
        ] }
    );
    include.tag( "turf",
        { loader: "script", url: "lib/turf-5.1.6.min.js" }
    );
    include.tag( "types-esri3d",
        { loader: "script", url: "smk/viewer-esri3d/types-esri3d.js" }
    );
    include.tag( "util",
        { loader: "script", url: "smk/util.js" }
    );
    include.tag( "util-esri3d",
        { loader: "script", url: "smk/viewer-esri3d/util-esri3d.js" }
    );
    include.tag( "viewer",
        { loader: "script", url: "smk/viewer.js" }
    );
    include.tag( "viewer-esri3d",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-esri3d/viewer-esri3d.js" },
            { loader: "style", url: "smk/viewer-esri3d/viewer-esri3d.css" }
        ] }
    );
    include.tag( "viewer-leaflet",
        { loader: "group", tags: [
            { loader: "script", url: "smk/viewer-leaflet/viewer-leaflet.js" },
            { loader: "style", url: "smk/viewer-leaflet/viewer-leaflet.css" }
        ] }
    );
    include.tag( "vue",
        { loader: "script", url: "lib/vue-2.5.11.min.js" }
    );
    include.tag( "vue-config",
        { loader: "group", tags: [
            { loader: "script", url: "smk/vue-config.js" },
            { loader: "asset", url: "smk/spinner.gif" }
        ] }
    );
window.include.SMK = true
} )( window.include.SMK );

( function () {
    "use strict";

    if ( !window.SMK ) window.SMK = {}

    if ( !window.SMK.ON_FAILURE )
        window.SMK.ON_FAILURE = function ( err, el ) {
            if ( err.parseSource )
               err.message += ', while parsing ' + err.parseSource

            console.error( err )

            var message = document.createElement( 'div' )
            message.classList.add( 'smk-failure' )

            message.innerHTML =
                '<h1>Simple Map Kit</h1>' +
                '<h2>Initialization of SMK failed</h2>' +
                '<p>' + err + '</p>'

            if ( !el )
                el = document.querySelector( 'body' )

            el.appendChild( message )

            if ( !document.getElementById( window.SMK.ON_FAILURE.STYLE_ID ) ) {
                var style = document.createElement( 'style' )
                style.id = window.SMK.ON_FAILURE.STYLE_ID
                style.textContent = window.SMK.ON_FAILURE.STYLE
                document.getElementsByTagName( 'head' )[ 0 ].appendChild( style )
            }
        }

    if ( !window.SMK.ON_FAILURE.STYLE_ID )
        window.SMK.ON_FAILURE.STYLE_ID = 'smk-on-failure-style'

    if ( !window.SMK.ON_FAILURE.STYLE )
        window.SMK.ON_FAILURE.STYLE = [
            '.smk-failure {',
                'box-shadow: inset 0px 0px 25px -1px #cc0000;',
                'background-color: white;',
                'font-family: sans-serif;',
                'position: absolute;',
                'top: 0;',
                'left: 0;',
                'right: 0;',
                'bottom: 0;',
                'padding: 20px;',
                'display: flex;',
                'flex-direction: column;',
                'align-items: stretch;',
                'justify-content: center;',
            '}',
            '.smk-failure h1 { margin: 0; }',
            '.smk-failure h2 { margin: 0; font-size: 1.2em; }',
            '.smk-failure p { font-size: 1.1em; }'
        ].join( '' )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    if ( navigator.userAgent.indexOf( "MSIE " ) > -1 || navigator.userAgent.indexOf( "Trident/" ) > -1 ) {
        var err = new Error( 'SMK will not function in Internet Explorer 11.' )

        var scripts = document.getElementsByTagName( 'script' )
        var script

        var stack
        try {
            /* jshint -W030 */ // Expected an assignment or function call and instead saw an expression.
            /* jshint -W117 */ // omgwtf is not defined
            omgwtf
        } catch( e ) {
            stack = e.stack
        }

        if ( stack ) {
            var entries = stack.split( /\s+at\s+/ )
            var last = entries[ entries.length - 1 ]
            var m = last.match( /[(](.+?)(?:[:]\d+)+[)]/ )
            if ( m )
                for ( var i = 0; i < scripts.length; i += 1 ) {
                    if ( scripts[ i ].src != m[ 1 ] ) continue

                    script = scripts[ i ]
                    break
                }
        }

        window.SMK.INIT = function ( option ) {
            var containerSelector = option[ 'containerSel' ] || option[ 'smk-container-sel' ]

            setTimeout( function () {
                window.SMK.ON_FAILURE( err, document.querySelector( containerSelector ) )
            }, 2000 )
        }

        if ( script && script.attributes && script.attributes[ 'smk-container-sel' ] )
            window.SMK.INIT( { containerSel: script.attributes[ 'smk-container-sel' ].value } )

        window.SMK.FAILURE = err
        throw err
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    try {
        setupGlobalSMK()

        // for esri3d
        window.dojoConfig = {
            packages: [ {
                name: "fcl",
            } ],
            has: {
                "esri-promise-compatibility": 1
            }
        }

        var scriptEl = document.currentScript
        if ( !SMK.BASE_URL ) {
            var path = scriptEl.src.replace( /([/]?)[^/?]+([?].+)?$/, function ( m, a ) { return a } )
            SMK.BASE_URL = ( new URL( path, document.location ) ).toString()
            console.debug( 'Default base path from', scriptEl.src, 'is', SMK.BASE_URL )
        }

        if ( scriptEl &&
            scriptEl.attributes &&
            scriptEl.attributes[ 'smk-container-sel' ] ) {
                var sel = scriptEl.attributes[ 'smk-container-sel' ].value

                SMK.INIT = function () {
                    SMK.BOOT = ( SMK.BOOT || Promise.resolve() )
                        .then( function () {
                            var e = Error( 'Cannot call SMK.INIT if map initialized from <script> element' )
                            SMK.ON_FAILURE( e, document.querySelector( sel ) )
                            throw e
                        } )

                    return SMK.BOOT
                }

                SmkInit( null, scriptEl )
        }
    }
    catch ( e ) {
        SMK.FAILURE = e
        throw e
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function SmkInit( option, scriptEl ) {
        if ( SMK.FAILURE ) throw SMK.FAILURE

        var attr = {}

        function defineAttr( name, attrName, defaultFn, filterFn ) {
            if ( !defaultFn ) defaultFn = function () {}
            if ( !filterFn ) filterFn = function ( val ) { return val }
            var scriptVal = scriptEl && scriptEl.attributes[ attrName ] && scriptEl.attributes[ attrName ].value
            var optionVal = option && ( option[ attrName ] || option[ name ] )
            var valFn = function () {
                if ( optionVal ) {
                    console.debug( 'attr', name, 'from INIT arguments:', optionVal )
                    return optionVal
                }

                if ( scriptVal ) {
                    console.debug( 'attr', name, 'from script element attribute:', scriptVal )
                    return scriptVal
                }

                var d = defaultFn()
                console.debug( 'attr', name, 'from default:', d )
                return d
            }
            var val
            Object.defineProperty( attr, name, {
                get: function () {
                    if ( valFn ) val = filterFn( valFn() )
                    valFn = null
                    return val
                }
            } )
        }

        defineAttr( 'id', 'smk-id', function () {
            return Object.keys( SMK.MAP ).length + 1
        } )

        defineAttr( 'containerSel', 'smk-container-sel' )

        defineAttr( 'config', 'smk-config', function () { return '?smk-' }, function ( val ) {
            if ( typeof val == 'string' ) 
                return val.split( /\s*[|]\s*/ ).filter( function ( i ) { return !!i } )

            return val
        } )

        defineAttr( 'baseUrl', 'smk-base-url', function () {
            return SMK.BASE_URL
        } )

        var timer = 'SMK "' + attr.id + '" initialize'
        console.time( timer )
        console.groupCollapsed( timer )

        SMK.BOOT = ( SMK.BOOT || Promise.resolve() )
            .then( function () {
                return attr.config
            } )
            .then( function ( config ) {
                return parseConfig( config )
            } )
            .then( function ( parsedConfig ) {
                attr.parsedConfig = parsedConfig
                return initializeSmkMap( attr )
            } )
            .catch( function ( e ) {
                try {
                    SMK.ON_FAILURE( e, document.querySelector( attr.containerSel ) )
                }
                catch ( ee ) {
                    console.error( 'failure showing failure:', ee )
                }
                throw e
            } )
            .finally( function () {
                console.groupEnd()
                console.timeEnd( timer )
            } )

        return SMK.BOOT
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function parseConfig( config ) {
        return config.reduce( function ( acc, c, i ) {
            var addParse = function ( source, getParse ) {
                source += ' in config[' + i + ']'

                try {
                    var parse = getParse()
                    if ( !parse ) return true

                    parse.$source = source
                    acc.push( parse )

                    return true
                }
                catch ( e ) {
                    if ( !e.parseSource)
                        e.parseSource = source

                    throw e
                }
            }

            if ( parseObject( c, addParse ) ) return acc
            if ( parseDocumentArguments( c, addParse ) ) return acc
            if ( parseLiteralJson( c, addParse ) ) return acc
            if ( parseOption( c, addParse ) ) return acc
            if ( parseUrl( c, addParse ) ) return acc

            return acc
        }, [] )
    }

    function parseObject( config, addParse ) {
        if ( typeof config != 'object' || Array.isArray( config ) || config === null ) return

        return addParse( 'object', function () {
            return { obj: config }
        } )
    }

    function parseDocumentArguments( config, addParse ) {
        if ( !/^[?]/.test( config ) ) return

        var paramPattern = new RegExp( '^' + config.substr( 1 ) + '(.+)$', 'i' )

        var params = location.search.substr( 1 ).split( '&' )

        params.forEach( function ( p, i ) {
            var addParamParse = function ( source, getParse ) {
                return addParse( source + ' in arg[' + config + ',' + i + ']', getParse )
            }

            var m
            try {
                var d = decodeURIComponent( p )
                m = d.match( paramPattern )
            }
            catch ( e ) {
                return
            }
            if ( !m ) return

            parseOption( m[ 1 ], addParamParse )
        } )

        return true
    }

    function parseLiteralJson( config, addParse ) {
        if ( !/^[{].+[}]$/.test( config ) ) return

        return addParse( 'json', function () {
            return { obj: JSON.parse( config ) }
        } )
    }

    function parseOption( config, addParse ) {
        var m = config.match( /^(.+?)([=](.+))?$/ )
        if ( !m ) return

        var option = m[ 1 ].toLowerCase()
        if ( !( option in optionHandler ) ) return

        return addParse( 'option[' + option + ']', function () {
            var res = optionHandler[ option ]( m[ 3 ], function ( source, getParse ) {
                return addParse( source + ' in option[' + option + ']', getParse )
            } )
            if ( res ) return { obj: res }
        } )
    }

    function parseUrl( config, addParse ) {
        return addParse( 'url[' + config + ']', function () {
            return { url: config }
        } )
    }

    var optionHandler = {
        'config': function ( arg, addParse ) {
            // return
            if ( parseLiteralJson( arg, addParse ) ) return
            if ( parseUrl( arg, addParse ) ) return
        },

        'theme': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length != 1 ) throw new Error( '-theme needs at least 1 argument' )
            return {
                viewer: {
                    themes: args
                }
            }
        },

        'device': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length != 1 ) throw new Error( '-device needs 1 argument' )
            return {
                viewer: {
                    device: args[ 0 ]
                }
            }
        },

        'extent': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length != 4 ) throw new Error( '-extent needs 4 arguments' )
            return {
                viewer: {
                    location: {
                        extent: args,
                        center: null,
                        zoom: null,
                    }
                }
            }
        },

        'center': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length < 2 || args.length > 3 ) throw new Error( '-center needs 2 or 3 arguments' )

            var loc = {
                center: [ args[ 0 ], args[ 1 ] ],
            }

            if ( args[ 2 ] )
                loc.zoom = args[ 2 ]

            return {
                viewer: {
                    location: loc
                }
            }
        },

        'viewer': function ( arg ) {
            return {
                viewer: {
                    type: arg
                }
            }
        },

        'active-tool': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length != 1 && args.length != 2 ) throw new Error( '-active-tool needs 1 or 2 arguments' )

            var toolId = args[ 0 ]
            if ( args[ 1 ] )
                toolId += '--' + args[ 1 ]

            return {
                viewer: {
                    activeTool: toolId
                }
            }
        },

        'query': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length < 3 && args.length != 1 ) throw new Error( '-query needs at least 3 arguments, or exactly 1' )

            var queryId = 'makeshift'

            var layerId = args[ 0 ]
            if ( args.length == 1 )
                return {
                    viewer: {
                        activeTool: 'QueryParametersTool--' + layerId + '--' + queryId,
                    },
                    tools: [
                        {
                            type: 'query',
                            instance: layerId + '--' + queryId,
                            enabled: true,
                            position: 'toolbar',
                            command: { attributeMode: true },
                            onActivate: 'execute'
                        },
                        {
                            type: 'toolbar',
                            enabled: true,
                        }
                    ],
                    layers: [ {
                        id: layerId,
                        queries: [ {
                            id: queryId,
                            title: 'Querying ' + layerId,
                            description: 'Created using: ' + arg,
                            parameters: [ { id: 'p1', type: 'constant', value: 1 } ],
                            predicate: {
                                operator: 'equals',
                                arguments: [ { operand: 'parameter', id: 'p1' }, { operand: 'parameter', id: 'p1' } ]
                            }
                        } ]
                    } ]
                }

            var conj = args[ 1 ].trim().toLowerCase()
            if ( conj != 'and' && conj != 'or' ) throw new Error( '-query conjunction must be one of: AND, OR' )

            var parameters = []
            var opName = {
                '~':  ' contains',
                '^~': ' starts with',
                '$~': ' ends with',
                '=':  ' is equal to',
                '>':  ' is greater than',
                '<':  ' is less than',
                '>=': ' is greater than or equal to',
                '<=': ' is less than or equal to',
            }
            function parameter( value, op, field ) {
                var id = 'p' + ( parameters.length + 1 )
                if ( value == '?' ) {
                    parameters.push( {
                        id: id,
                        type: 'input',
                        title: field + opName[ op ]
                    } )
                }
                else if ( value == '@' ) {
                    parameters.push( {
                        id: id,
                        type: 'select-unique',
                        title: field + opName[ op ],
                        uniqueAttribute: field
                    } )
                }
                else {
                    parameters.push( {
                        id: id,
                        type: 'constant',
                        value: JSON.parse( value )
                    } )
                }

                return id
            }

            var clauses = args.slice( 2 ).map( function ( p ) {
                var m = p.trim().match( /^(\w+)\s*([$^]?~|=|<=?|>=?)\s*(.+?)$/ )
                if ( !m ) throw new Error( '-query expression is invalid' )

                var args = [
                    { operand: 'attribute', name: m[ 1 ] },
                    { operand: 'parameter', id: parameter( m[ 3 ], m[ 2 ], m[ 1 ] ) }
                ]

                switch ( m[ 2 ].toLowerCase() ) {
                    case '~':  return { operator: 'contains', arguments: args }
                    case '^~': return { operator: 'starts-with', arguments: args }
                    case '$~': return { operator: 'ends-with', arguments: args }
                    case '=':  return { operator: 'equals', arguments: args }
                    case '>':  return { operator: 'greater-than', arguments: args }
                    case '<':  return { operator: 'less-than', arguments: args }
                    case '>=': return { operator: 'not', arguments: [ { operator: 'less-than', arguments: args } ] }
                    case '<=': return { operator: 'not', arguments: [ { operator: 'greater-than', arguments: args } ] }
                }
            } )

            return {
                viewer: {
                    activeTool: 'QueryParametersTool--' + layerId + '--' + queryId
                },
                tools: [
                    {
                        type: 'query',
                        instance: layerId + '--' + queryId,
                        enabled: true,
                        position: 'toolbar',
                        command: { attributeMode: true },
                        onActivate: 'execute'
                    },
                    {
                        type: 'toolbar',
                        enabled: true,
                    }
                ],
                layers: [ {
                    id: layerId,
                    queries: [ {
                        id: queryId,
                        title: 'Querying ' + layerId,
                        description: 'Created using: ' + arg,
                        parameters: parameters,
                        predicate: {
                            operator: conj,
                            arguments: clauses
                        }
                    } ]
                } ]
            }
        },

        'layer': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length < 2 ) throw new Error( '-layer needs at least 2 arguments' )

            var layerId = 'layer-' + arg.replace( /[^a-z0-9]+/ig, '-' ).replace( /(^[-]+)|([-]+$)/g, '' ).toLowerCase()

            var type = args[ 0 ].trim().toLowerCase()
            switch ( type ) {
                case 'esri-dynamic':
                    if ( args.length < 3 ) throw new Error( '-layer=esri-dynamic needs at least 3 arguments' )
                    return {
                        layers: [ {
                            id:         layerId,
                            type:       'esri-dynamic',
                            isVisible:  true,
                            serviceUrl: args[ 1 ],
                            mpcmId:     args[ 2 ],
                            title:      args[ 3 ] || ( 'ESRI Dynamic ' + args[ 2 ] ),
                        } ]
                }

                case 'wms':
                    if ( args.length < 3 ) throw new Error( '-layer=wms needs at least 3 arguments' )
                    return {
                        layers: [ {
                            id:         layerId,
                            type:       'wms',
                            isVisible:  true,
                            serviceUrl: args[ 1 ],
                            layerName:  args[ 2 ],
                            styleName:  args[ 3 ],
                            title:      args[ 4 ] || ( 'WMS ' + args[ 2 ] ),
                        } ]
                }

                case 'vector':
                    return {
                        layers: [ {
                            id:         layerId,
                            type:       'vector',
                            isVisible:  true,
                            dataUrl:    args[ 1 ],
                            title:      args[ 2 ] || ( 'Vector ' + args[ 1 ] ),
                        } ]
                    }

                default: throw new Error( 'unknown layer type: ' + type )
            }
        },

        'show-tool': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length < 1 ) throw new Error( '-show-tool needs at least 1 argument' )

            return {
                tools: args.map( function ( type ) {
                    if ( type == 'all' ) type = '*'
                    return {
                        type: type,
                        enabled: true
                    }
                } )
            }
        },

        'hide-tool': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length < 1 ) throw new Error( '-hide-tool needs at least 1 argument' )

            return {
                tools: args.map( function ( type ) {
                    if ( type == 'all' ) type = '*'
                    return {
                        type: type,
                        enabled: false
                    }
                } )
            }
        },

        'show-layer': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length < 1 ) throw new Error( '-show-layer needs at least 1 argument' )

            return {
                layers: args.map( function ( id ) {
                    if ( id == 'all' ) id = '**'
                    return {
                        id: id,
                        isVisible: true
                    }
                } )
            }
        },

        'hide-layer': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length < 1 ) throw new Error( '-hide-layer needs at least 1 argument' )

            return {
                layers: args.map( function ( id ) {
                    if ( id.toLowerCase() == 'all' ) id = '**'
                    return {
                        id: id,
                        isVisible: false
                    }
                } )
            }
        },

        'storage': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length < 1 ) throw new Error( '-storage needs at least 1 argument' )

            return args.map( function ( key ) {
                return JSON.parse( window.sessionStorage.getItem( key ) )
            } )
        },

        // Options below are for backward compatibility with DMF

        'll': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length != 2 ) throw new Error( '-ll needs 2 arguments' )

            return {
                viewer: {
                    location: {
                        center: [ args[ 0 ], args[ 1 ] ]
                    }
                }
            }
        },

        'z': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length != 1 ) throw new Error( '-z needs 1 argument' )

            return {
                viewer: {
                    location: {
                        zoom: args[ 0 ]
                    }
                }
            }
        },

    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function initializeSmkMap( attr ) {
        include.option( { baseUrl: attr.baseUrl + 'assets/src/' } )

        if ( attr.id in SMK.MAP )
            throw new Error( 'An SMK map with smk-id "' + attr.id + '" already exists' )

        return include( 'smk-map' ).then( function () {
            console.log( 'Creating map "' + attr.id + '":', JSON.parse( JSON.stringify( attr ) ) )

            var map = SMK.MAP[ attr.id ] = new SMK.TYPE.SmkMap( attr )
            return map.initialize()
        } )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function setupGlobalSMK() {
        return ( window.SMK = Object.assign( {
            INIT: SmkInit,
            MAP: {},
            VIEWER: {},
            TYPE: {},
            UTIL: {},
            COMPONENT: {},

            CONFIG: {
                name: 'SMK Default Map',
                viewer: {
                    type: "leaflet",
                    device: "auto",
                    deviceAutoBreakpoint: 500,
                    themes: [],
                    location: {
                        extent: [ -139.1782, 47.6039, -110.3533, 60.5939 ],
                    },
                    baseMap: 'Topographic',
                    clusterOption: {
                        showCoverageOnHover: false
                    },
                    zoomSnap: 1
                },
                tools: []
            },

            BOOT: Promise.resolve(),
            TAGS_DEFINED: false,

            BUILD: {
                commit:     '87df89a0822a701da2cf67a953fbbcdd8ddf71c8',
                branch:     'release/v1.0.16001',
                lastCommit: '2024-07-09 16:03:16 -0700',
                origin:     'https://github.com/qqnluaq/smk.git',
                version:    '1.0.16001',
            },

            HANDLER: {
                handler: {},
                set: function ( id, method, handler ) {
                    if ( !this.handler[ id ] ) this.handler[ id ] = {}
                    this.handler[ id ][ method ] = handler
                },
                get: function ( id, method ) {
                    if ( this.handler[ id ] && this.handler[ id ][ method ] ) return this.handler[ id ][ method ]

                    return function () {
                        console.warn( 'handler ' + id + '.' + method + ' invoked' )
                    }
                },
                has: function ( id, method ) {
                    return !!( this.handler[ id ] && this.handler[ id ][ method ] )
                }
            },

            PROJECTIONS: [
                {
                    name: 'urn:ogc:def:crs:EPSG::3005',
                    def: '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs'
                },
                {
                    name: 'bc-albers',
                    alias: 'urn:ogc:def:crs:EPSG::3005',
                }
            ]

        }, window.SMK ) )
    }

} )();

