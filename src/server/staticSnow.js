const proxy = require('http-proxy-middleware').createProxyMiddleware
const express = require('express')
const { blue, yellow, red } = require('kleur')

module.exports = function(
    app,
    options={}
) {
    const { snowpackUrl = 'http://localhost:3000', buildDir = './build' } = options;
    if (app.get('env') === 'development') {
        console.info(blue('started in development mode'))
        return proxy({
            ws: true,
            changeOrigin: true,
            target: snowpackUrl,
            onError: function(err, req, res) {
                if (err.code === 'ECONNREFUSED') {
                    console.error(
                        red(
                            `NODE_ENV is set to development, but no snowpack server was found at ${snowpackUrl}`
                        )
                    )
                    console.error(yellow('You should either:'))
                    console.log(
                        yellow(
                            '  - set NODE_ENV to production to serve the built version of the app'
                        )
                    )
                    console.log(
                        yellow(
                            '  - pass the correct protocol/domain/port of the webpack dev server to the StaticSnow middleware'
                        )
                    )
                    console.log(
                        yellow(
                            '  - run a snowpack dev server. Have you tried "npm start"?'
                        )
                    )
                }
            },
        })
    } else {
        console.info(blue('StaticSnow started in production mode'))
        app.use(express.static(buildDir))
        return function(req, res, next) {
            res.sendFile(path.resolve(path.join(buildDir, 'index.html')))
        }
    }
}
