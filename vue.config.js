const SWPrecache = require('sw-precache-webpack-plugin');

module.exports = {
    configureWebpack: () => {
        if (process.env.NODE_ENV === 'production') {
            return {
                    plugins: [
                    new SWPrecache({
                        cacheId: 'CQ-APP',
                        filepath: 'dist/service-worker.js',
                        staticFileGlobs: [
                            'index.html',
                            'manifest.json',
                            'dist/*.{js,css}'
                        ],
                        stripPrefix: '/'
                    })
                ]
            }
        }
    }
}