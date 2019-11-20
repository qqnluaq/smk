include.module( 'widgets', [ 
    'vue', 
    'widgets.tool-button-html', 
    'widgets.command-button-html',
    'widgets.toggle-button-html', 
    'widgets.select-option-html', 
    'widgets.enter-input-html' 
], function ( inc ) {
    "use strict";

    var emit = {
        methods: {
            $$emit: function ( event, arg ) {
                this.$root.trigger( this.id, event, arg )
            }
        }
    }

    Vue.component( 'command-button', {
        template: inc[ 'widgets.command-button-html' ],
        props: { 
            title:      { type: String },
            disabled:   { type: Boolean, default: false },
            icon:       { type: String }
        },
        methods: {
            clickButton: function () {
                if ( this.disabled ) return
                this.$emit( 'click' )
            }
        }
    } )

    Vue.component( 'toggle-button', {
        template: inc[ 'widgets.toggle-button-html' ],
        props: { 
            value:      { type: Boolean, default: false },
            iconOff:    { type: String, default: 'toggle_off' },
            iconOn:     { type: String, default: 'toggle_on' },
            titleOff:   { type: String, default: 'Off. Click to turn on' },
            titleOn:    { type: String, default: 'On. Click to turn off' },
        },
        model: {
            prop: 'value',
            event: 'change'
        },
        methods: {
            clickToggle: function () {
                this.$emit( 'change', !this.value )
            }
        }
    } )

    Vue.component( 'select-option', {
        template: inc[ 'widgets.select-option-html' ],
        props: { 
            options: { type: Array, default: [] },
            value:   {},
        },
        model: {
            prop: 'value',
            event: 'change'
        },
        methods: {
            clickOption: function ( option, index ) {
                this.$emit( 'change', option.value )
            }
        }
    } )

    Vue.component( 'enter-input', {
        template: inc[ 'widgets.enter-input-html' ],
        props: { 
            value: { type: String, default: '' },
            type: { type: String, default: 'text' },
        },
        data: function () {
            return {
                input: this.value
            }
        },
        watch: {
            input: function () {
                this.$emit( 'change', this.input )
            }
        },
        // model: {
        //     prop: 'value',
        //     event: 'change'
        // },
        methods: {
            clickReset: function () {
                this.input = this.value
            }
        }
    } )

    return {
        emit: emit,

        toolButton: Vue.extend( {
            mixins: [ emit ],
            template: inc[ 'widgets.tool-button-html' ],
            props: { 'id': String, 'type': String, 'title': String, 'visible': Boolean, 'enabled': Boolean, 'active': Boolean, 'icon': String, 'showTitle': Boolean },
            computed: {
                classes: function () {
                    var c = {
                        'smk-tool': true,
                        'smk-tool-active': this.active,
                        'smk-tool-visible': this.visible,
                        'smk-tool-enabled': this.enabled,
                        'smk-tool-title': this.showTitle
                    }
                    c[ 'smk-' + this.type + '-tool' ] = true
                    return c
                }
            },
        } ),

        toolPanel: Vue.extend( {
            mixins: [ emit ],
            props: [ 'id', 'title', 'visible', 'enabled', 'active', 'busy', 'message', 'status', 'expand', 'hasPrevious' ],
        } )

    }

} )