'use strict';

/**
 *  empresa controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::empresa.empresa', ({ strapi }) => ({

    async findOne(ctx) {
        const { slug } = ctx.params;

        const query = {
            filters: { slug },
            ...ctx.query
        };
        const entity = await strapi.entityService.findMany('api::empresa.empresa', query);

        const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

        return this.transformResponse(sanitizedEntity[0]);
    }

}));
