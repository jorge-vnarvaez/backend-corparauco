module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/noticias/:slug',
            handler: 'noticia.findOne',
            config: {
                auth: false,
            }
        }
    ]
}