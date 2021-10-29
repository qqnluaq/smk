include.module( 'component-menu-button', [
    'component',
    'component-command-button',
    'component-menu-button.component-menu-button-html'
], function ( inc ) {
    "use strict";

    Vue.component( 'menu-button', {
        template: inc[ 'component-menu-button.component-menu-button-html' ],
        props: {
            title:      { type: String },
            disabled:   { type: Boolean, default: false },
            icon:       { type: String },
            menuItems:  { type: Array }
        },
        data: function () {
            return {
                menuVisible: false
            }
        },
        methods: {
            onToggleMenu: function ( ev ) {
                // this.$refs.menu
                this.menuVisible = !this.menuVisible
            },

            onClick: function ( ev ) {
                if ( this.disabled ) return
                this.$emit( 'click', ev )
            }
        }
    } )
} )