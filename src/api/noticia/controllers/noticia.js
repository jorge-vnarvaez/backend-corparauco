'use strict';

/**
 *  noticia controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::noticia.noticia', ({ strapi }) => ({

    async findOne(ctx) {
        const { slug } = ctx.params;

        const query = {
            filters: { slug },
            ...ctx.query
        };
        const entity = await strapi.entityService.findMany('api::noticia.noticia', query);

        const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

        return this.transformResponse(sanitizedEntity[0]);
    }

}));
