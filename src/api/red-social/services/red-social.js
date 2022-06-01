'use strict';

/**
 * red-social service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::red-social.red-social');
