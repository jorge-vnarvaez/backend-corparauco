module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/eventos/:slug',
            handler: 'evento.findOne',
            config: {
                auth: false,
            }
        }
    ]
}