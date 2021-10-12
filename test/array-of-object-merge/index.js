QUnit.module('SMK.array-of-object-merge', {
    before: function () {
        var self = this
        window[ 'include' ].option( { baseUrl: document.location + '../../dist/assets/src/' } )

        return window[ 'include' ]( 'merge-config' ).then( function ( inc ) {
            self.mergeConfig = inc[ 'merge-config' ]
        } )
    }
} );

QUnit.test( 'arrayOfObjectMerge', function ( assert ) {
    var arrayOfObjectMerge = this.mergeConfig.arrayOfObjectMerge

    function testArrayOfObjectMerge( base, source, expected ) {
        var b = ref( base ),
            s = ref( source ),
            desc = fmt( base ) + ' + ' + fmt( source ) + ' == ' + fmt( expected )
        arrayOfObjectMerge( 'id' )( b, s, '' )
        assert.deepEqual( deref( b ), expected, desc )    
    }

    function failArrayOfObjectMerge( base, source ) {
        var b = ref( base ),
            s = ref( source ),
            desc = fmt( base ) + ' + ' + fmt( source )
        assert.throws( function () {
            arrayOfObjectMerge( 'id' )( b, s, '' )
        } )
    }

    testArrayOfObjectMerge( 
        [ { id: 'a', foo: 1 }, { id: 'a', foo: 2 } ], 
        [], 
        [ { id: 'a', foo: 2 } ] 
    )

    testArrayOfObjectMerge( 
        [ { id: 'a', foo: 1 }, { id: 'b', foo: 3 }, { id: 'a', foo: 2 } ], 
        [], 
        [ { id: 'a', foo: 2 }, { id: 'b', foo: 3 } ] 
    )

    testArrayOfObjectMerge( 
        [ { id: 'a', foo: 1 }, { id: 'b', foo: 3 }, { id: 'a', foo: 2 }, { id: 'b', foo: 4 } ], 
        [], 
        [ { id: 'a', foo: 2 }, { id: 'b', foo: 4 } ] 
    )

    testArrayOfObjectMerge( 
        [ { id: 'a', foo: 1 }, { id: 'b', foo: 3 }, { id: 'a', foo: 2 }, { id: 'b', foo: 4 } ], 
        [ { id: 'b', foo: 5 } ], 
        [ { id: 'a', foo: 2 }, { id: 'b', foo: 5 } ] 
    )

    testArrayOfObjectMerge( 
        [ { id: 'a', foo: 1 }, { id: 'a', foo: 2 } ], 
        [ { id: 'b', foo: 3 } ], 
        [ { id: 'a', foo: 2 }, { id: 'b', foo: 3 } ] 
    )

    testArrayOfObjectMerge( 
        [ { id: 'a', foo: 1 }, { id: 'a', foo: 2 } ], 
        [ { id: 'a', foo: 3 } ], 
        [ { id: 'a', foo: 3 } ] 
    )

    testArrayOfObjectMerge( 
        [ ], 
        [ { id: 'a', foo: 3 } ], 
        [ { id: 'a', foo: 3 } ] 
    )

    testArrayOfObjectMerge( 
        [ { id: 'a', foo: 1 }, { id: 'a', foo: 2 } ], 
        [ { id: 'a', foo: 3 }, { id: 'a', foo: 4 } ], 
        [ { id: 'a', foo: 4 } ] 
    )

    testArrayOfObjectMerge( 
        null, 
        [ { id: 'a', foo: 3 }, { id: 'a', foo: 4 } ], 
        [ { id: 'a', foo: 4 } ] 
    )

    testArrayOfObjectMerge( 
        [ { id: 'a', foo: 3 }, { id: 'a', foo: 4 } ], 
        null, 
        undefined
    )

    testArrayOfObjectMerge( 
        [ { id: 'a', foo: 3 }, { id: 'a', foo: 4 } ], 
        [ { id: '*', foo: 9 } ], 
        [ { id: 'a', foo: 9 } ]
    )

    testArrayOfObjectMerge( 
        [ { id: 'a', foo: 3 }, { id: 'b', foo: 5 }, { id: 'a', foo: 4 } ], 
        [ { id: '*', foo: 9, bar: 1 } ], 
        [ { id: 'a', foo: 9, bar: 1 }, { id: 'b', foo: 9, bar: 1 } ]
    )

    testArrayOfObjectMerge( 
        [], 
        [ { id: '*', foo: 9, bar: 1 } ], 
        []
    )

    failArrayOfObjectMerge( 
        [ { id: 'a', foo: 3 }, { foo: 5 }, { id: 'a', foo: 4 } ], 
        [ { id: '*', foo: 9, bar: 1 } ], 
    )

    failArrayOfObjectMerge( 
        [ { id: 'a', foo: 3 }, { id: 'a', foo: 4 } ], 
        [ { foo: 9 } ], 
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