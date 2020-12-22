var pageExampleId = document.location.hash.substr( 1 )

var examples = []
var defaultExampleId

var m = document.currentScript.src.match( /^(.+[/])/ )
var templateUrl = ( new URL( 'examples.html', m[ 0 ] ) ).toString()

var searchParam = { environment: 'dev', enable: 'ALL', zoom: '100', maxjobs: '2', expected: '0' };
var search = '?'

if ( location.search ) {
    search = location.search + '&'

    location.search.substr( 1 ).split( '&' ).forEach( function ( p ) {
        var m = p.match( /(.+?)=(.*)/ )
        if ( !m ) return

        searchParam[ m[ 1 ] ] = m[ 2 ]
    } )
}

var vmInit = fetch( templateUrl )
    .then( function ( resp ) {
        if ( !resp.ok ) throw new Error( 'fetching ' + templateUrl + ' failed' )
        return resp.text()
    } )
    .then( function ( out ) {
        return new Vue( {
            el: '#app',
            template: out,
            data: {
                selectedExample: null,
                examples: examples,
                configViewer: searchParam.viewer || '',
            },
            watch: {
                configViewer: function ( val ) {
                }
            },
            methods: {
                selectExample: function ( example ) {
                    this.selectedExample = example
                    document.location.hash = example.id 

                    this.$nextTick( function () {
                        document.getElementById( 'sourceFocus' ).scrollIntoView( true )
                    } )
                },
                updateParameters: function () {
                    var config = [
                        [ 'viewer', this.configViewer ]
                    ]
                    document.location.search = '?' + config.map( function ( c ) {
                        if ( !c[ 1 ] ) return null
                        return c[ 0 ] + '=' + encodeURIComponent( c[ 1 ] )
                    } ).filter( function ( p ) { return p != null } ).join( '&' )
                }
            },
            computed: {
                title: {
                    get: function () {
                        return document.getElementsByTagName( 'title' )[ 0 ].innerText
                    }
                },
                selectedExampleURL: {
                    get: function () {
                        if ( !this.selectedExample ) return
                        if ( this.selectedExample.parameters )
                            return this.selectedExample.url + search + this.selectedExample.parameters
                        if ( search != '?' )
                            return this.selectedExample.url + search
                        return this.selectedExample.url
                    }
                }
            }
        } )
    } )    

function addExample ( exampleId, parameters ) {
    var ex = {
        id:         exampleId,
        url:        exampleId + '.html',
        parameters: parameters,
        title:      null,
        doc:        null
    }
    examples.push( ex )
    if ( !defaultExampleId ) defaultExampleId = exampleId

    fetch( ex.url )
        .then( function ( resp ) {
            if ( !resp.ok ) throw new Error( 'fetching ' + ex.url + ' failed' )
            return resp.text()
        } )
        .then( function ( out ) {
            var m = out.match( /title[>](.+)[<][/]title/ )
            if ( m ) ex.title = m[ 1 ]

            ex.doc = out
                .replace( /[<]/g, '&lt;' )
                .replace( /[>]/g, '&gt;' )
                .replace( /[&]lt[;][!][-][-][*]{3,}[^\0]+[*]{3,}[-][-][&]gt[;]/, function ( m ) {
                    return '<b id="sourceFocus">' + m + '</b>'
                } )

            return vmInit.then( function ( vm ) {
                if ( ex.id == ( pageExampleId || defaultExampleId ) )
                    vm.selectExample( ex )
            } )            
        } )
        .catch( function ( err ) {
            ex.doc = 'Unable to load: ' + err
            ex.title = exampleId
        } )
}
