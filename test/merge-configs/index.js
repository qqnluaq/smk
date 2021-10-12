QUnit.module('SMK.merge-configs', {
    before: function () {
        var self = this

        var include = window[ 'include' ]
        include.option( { baseUrl: document.location.origin + document.location.pathname + '../../dist/assets/src/' } )
        include.tag( 'base', { loader: 'template', url: './merge-configs/base.json' } )
        include.tag( 'wfim', { loader: 'template', url: './merge-configs/wfim.json' } )

        return include( 'merge-config', 'base', 'wfim' ).then( function ( inc ) {
            self.mergeConfigs = inc[ 'merge-config' ]
            self.baseConfig = JSON.parse( inc[ 'base' ] )
            self.wfimConfig = JSON.parse( inc[ 'wfim' ] )
        } )
    }
} );

QUnit.test( 'MergeConfigs', function ( assert ) {
    var merge = this.mergeConfigs.merge

    function testMerge( base, source, assertions ) {
        var b = ref( base ),
            s = ref( source )
            // desc = fmt( base ) + ' + ' + fmt( source ) + ' == ' + fmt( expected )
        merge( b, s, '' )
        console.log( 'merged config', JSON.parse( JSON.stringify( deref( b ) ) ) )
        assertions( deref( b ) )
        // assert.deepEqual( deref( b ), expected, desc )    
    }

    function failMerge( base, source ) {
        var b = ref( base ),
            s = ref( source ),
            desc = fmt( base ) + ' + ' + fmt( source )
        assert.throws( function () {
            arrayOfObjectMerge( 'id' )( b, s, '' )
        } )
    }

    testMerge( 
        this.baseConfig,
        { tools: [
            {
                type: 'bespoke',
                instance: 'foo'
            }
        ] },
        function ( result, expected, desc ) {
            assert.deepEqual( result.tools.find( function ( t ) { return t.type == 'bespoke' && t.instance == 'foo' } ), {
                type: 'bespoke',
                instance: 'foo'
            } )    
            // assert.deepEqual( deref( b ), expected, desc )    
        }
    )

    testMerge( 
        this.baseConfig,
        this.wfimConfig,
        function ( result, expected, desc ) {
            assert.deepEqual( result.tools.find( function ( t ) { return t.type == 'bespoke' && t.instance == 'full-extent' } ), {
                type: 'bespoke',
                instance: 'full-extent'
            } )    
            // assert.deepEqual( deref( b ), expected, desc )    
        }
    )

    testMerge( 
        this.wfimConfig,
        { tools: [
            {
                type: 'location',
                enabled: true
            }
        ] },
        function ( result, expected, desc ) {
            assert.deepEqual( result.tools.find( function ( t ) { return t.type == 'bespoke' && t.instance == 'full-extent' } ), {
                type: 'bespoke',
                instance: 'full-extent'
            } )    
            // assert.deepEqual( deref( b ), expected, desc )    
        }
    )


} )

function ref( obj ) {
    return [ { '$': obj }, '$' ]
}

function deref( ref ) {
    return ref[ 0 ][ ref[ 1 ] ]
}

function fmt( obj ) {
    return JSON.stringify( obj )
}
