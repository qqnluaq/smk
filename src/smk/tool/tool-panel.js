include.module( 'tool.tool-panel-js', [ 'tool.tool-widget-js', 'tool.tool-panel-html' ], function ( inc ) {
    "use strict";

    SMK.COMPONENT.ToolPanel = { 
        extends: SMK.COMPONENT.Tool,
        props: {
            showTitle:      Boolean,
            icon:           String,

            showPanel:      Boolean,
            showHeader:     Boolean,
            showSwipe:      Boolean,
            busy:           Boolean,
            message:        String,
            expand:         Number,
            hasPrevious:    Boolean,
        },
        computed: {
            classes: function () {
                var c = this.baseClasses
                return c
            }
        },
        methods: {}
    }

    var propProjection = SMK.UTIL.projection.apply( null, Object.keys( ( new ( Vue.extend( SMK.COMPONENT.ToolPanel ) )() )._props ) )

    SMK.COMPONENT.ToolPanel.methods.$$panelProps = function () { 
        return propProjection( this.$props )
    }

    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Vue.component( 'tool-panel', {
        extends: SMK.COMPONENT.ToolPanel,
        template: inc[ 'tool.tool-panel-html' ],
        data: function () {
            return {
                canScrollUp: false,
                canScrollDown: false
            }
        },
        methods: {
            startSwipe: function ( ev ) {
                // console.log('startSwipe',ev)
                this.xDown = ev.touches[0].clientX;                                      
                this.yDown = ev.touches[0].clientY;                             
            },
            moveSwipe: function ( ev ) {
                // console.log('moveSwipe',ev,this.xDown,this.yDown)
                if ( !this.xDown || !this.yDown )
                    return
            
                var xDiff = this.xDown - ev.touches[0].clientX
                var yDiff = this.yDown - ev.touches[0].clientY
            
                if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
                    if ( xDiff > 0 ) {
                        this.$emit( 'swipe-left' )
                    } 
                    else {
                        this.$emit( 'swipe-right' )
                    }                       
                } 
                else {
                    if ( yDiff > 0 ) {
                        this.$emit( 'swipe-up' )
                    } 
                    else { 
                        this.$emit( 'swipe-down' )
                    }                                                                 
                }

                this.xDown = null;
                this.yDown = null;                                                             
            },
            scrollBody: function ( ev ) {
                this.updateScroll()
            },            
            updateScroll: function () {
                var el = this.$refs.body
                this.canScrollUp = el.scrollTop > 0
                this.canScrollDown = ( el.scrollTop + el.clientHeight ) < el.scrollHeight
            }
        },
        mounted: function () {
            // console.log('mounted')
            this.$nextTick( this.updateScroll )
        },
        updated: function () {
            // console.log('updated')
            this.$nextTick( this.updateScroll )
        }
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function ToolPanel( panel, widget ) {
        this.panel = { 
            component: panel,
            prop: {} 
        }

        SMK.TYPE.ToolWidget.prototype.constructor.call( this, widget )

        this.toolProp( 'showPanel', { 
            initial: true,
            forWidget: false 
        } )
        this.toolProp( 'showHeader', { 
            initial: true,
            forWidget: false 
        } )
        this.toolProp( 'showSwipe', { 
            initial: false,
            forWidget: false 
        } )
        this.toolProp( 'busy', { 
            initial: false, 
            forWidget: false 
        } )
        this.toolProp( 'message', { 
            forWidget: false 
        } )
        this.toolProp( 'expand', { 
            initial: 0, 
            forWidget: false 
        } )
        this.toolProp( 'hasProvious', { 
            initial: false, 
            forWidget: false 
        } )
    }

    SMK.TYPE.ToolPanel = ToolPanel

    Object.assign( ToolPanel.prototype, SMK.TYPE.ToolWidget.prototype )

    ToolPanel.prototype._setProp = function ( name, val, opt ) {
        SMK.TYPE.ToolWidget.prototype._setProp.call( this, name, val, opt )
        if ( opt.forPanel !== false ) this.panel.prop[ name ] = val
    }
} )
