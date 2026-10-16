module.exports = function( grunt ) {

    grunt.registerTask( 'build-src', [
        'jshint:scripts',
        'copy:scripts',
        'copy:styles',
        'copy:templates',
        'copy:assets',
        'copy:attachments',
    ] )

    grunt.config.merge( {

        jshint: {
            'scripts': {
                expand: true,
                cwd: '<%= srcPath %>',
                src: [ '<%= tagRef.scripts %>', '<%= tagRef.dist_scripts %>', '!**/lib/**', '!**/node_modules/**' ]
            },
        },              

        copy: {
            'scripts': {
                expand: true,
                cwd: '<%= srcPath %>',
                src: [ '<%= tagRef.scripts %>', '<%= tagRef.dist_scripts %>' ],
                dest: '<%= distPath %>/assets/src'
            },

            'styles': {
                expand: true,
                cwd: '<%= srcPath %>',
                src: [ '<%= tagRef.styles %>', '<%= tagRef.dist_styles %>' ],
                dest: '<%= distPath %>/assets/src'
            },

            'templates': {
                expand: true,
                cwd: '<%= srcPath %>',
                src: '<%= tagRef.templates %>',
                dest: '<%= distPath %>/assets/src'
            },

            'assets': {
                expand: true,
                cwd: '<%= srcPath %>',
                src: [ '<%= tagRef.assets %>', 'debug/data/**' ],
                dest: '<%= distPath %>/assets/src'
            },

            'attachments': {
                expand: true,
                cwd: 'debug/data',
                src: [ '**' ],
                dest: '<%= distPath %>/assets/src/attachments'
            }
        }

    } )

    grunt.log.ok( 'Task mode-develop/build-src' )
}