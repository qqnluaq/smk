function mapConfig( ...config ) {
    return [
        './../../config/victoria.json',
        {
            "tools": [
                {
                    "type": "zoom",
                    "enabled": true
                },
                {
                    "type": "pan",
                    "enabled": true
                },
                {
                    "type": "search",
                    "enabled": false
                },
                {
                    "type": "scale",
                    "enabled": true,
                    "showZoom": true
                },
                {
                    "type": "toolbar",
                    "enabled": true
                },
                {
                    "type": "baseMaps",
                    "enabled": true,
                }
            ]
        },
        ...config,
        '?'
    ]
}
