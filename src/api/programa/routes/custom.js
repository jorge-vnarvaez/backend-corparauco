module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/programas/:slug',
            handler: 'programa.findOne',
            config: {
                auth: false,
            }
        }
    ]
}