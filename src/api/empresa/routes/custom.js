module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/empresas/:slug',
            handler: 'empresa.findOne',
            config: {
                auth: false,
            }
        }
    ]
}