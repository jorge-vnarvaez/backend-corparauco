const _ = require("lodash");
const {
  validateCallbackBody,
} = require("@strapi/plugin-users-permissions/server/controllers/validation/auth");
const utils = require("@strapi/utils");
const { getService } = require("@strapi/plugin-users-permissions/server/utils");

const { sanitize } = utils;
const { ApplicationError, ValidationError } = utils.errors;

const populate = ["role", "foto_perfil", "programas"];

const emailRegExp =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel("plugin::users-permissions.user");

  return sanitize.contentAPI.output(user, userSchema, { auth });
};

/**
 * Overwriting user-permission controllers because they don't populate fields and population in request don't work for plugins
 */
module.exports = (plugin) => {
  plugin.controllers.auth.callback = async (ctx) => {
    const provider = ctx.params.provider || "local";
    const params = ctx.request.body;

    const store = await strapi.store({
      type: "plugin",
      name: "users-permissions",
    });

    if (provider === "local") {
      if (!_.get(await store.get({ key: "grant" }), "email.enabled")) {
        throw new ApplicationError("This provider is disabled");
      }

      await validateCallbackBody(params);

      // Check if the provided identifier is an email or not.
      const isEmail = emailRegExp.test(params.identifier);

      const filter = { $and: [{ provider: provider }] };

      if (isEmail) {
        // query.email = params.identifier.toLowerCase();
        filter.$and.push({ email: params.identifier.toLowerCase() });
      } else {
        filter.$and.push({ email: params.identifier });
      }

      // Check if the user exists.
      const users = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: filter,
          populate: populate,
        }
      );

      if (!users || users.length <= 0) {
        throw new ValidationError("Invalid identifier or password");
      }

      const user = users[0];

      if (
        _.get(await store.get({ key: "advanced" }), "email_confirmation") &&
        user.confirmed !== true
      ) {
        throw new ApplicationError("Your account email is not confirmed");
      }

      if (user.blocked === true) {
        throw new ApplicationError(
          "Your account has been blocked by an administrator"
        );
      }

      // The user never authenticated with the `local` provider.
      if (!user.password) {
        throw new ApplicationError(
          "This user never set a local password, please login with the provider used during account creation"
        );
      }

      const validPassword = await getService("user").validatePassword(
        params.password,
        user.password
      );

      if (!validPassword) {
        throw new ValidationError("Invalid identifier or password");
      } else {
        ctx.send({
          jwt: getService("jwt").issue({
            id: user.id,
          }),
          user: {
            ...(await sanitizeUser(user, ctx)),
            role: user.role,
            foto_perfil: user.foto_perfil,
            programas: user.programas,
          },
        });
      }
    } else {
      if (!_.get(await store.get({ key: "grant" }), [provider, "enabled"])) {
        throw new ApplicationError("This provider is disabled");
      }

      // Connect the user with the third-party provider.
      let user;
      let error;
      try {
        [user, error] = await getService("providers").connect(
          provider,
          ctx.query
        );
      } catch ([user, error]) {
        throw new ApplicationError(error.message);
      }

      if (!user) {
        throw new ApplicationError(error.message);
      }

      ctx.send({
        jwt: getService("jwt").issue({ id: user.id }),
        user: {
          ...(await sanitizeUser(user, ctx)),
          role: user.role,
          foto_perfil: user.foto_perfil,
        },
      });
    }
  };

  const sanitizeOutput = (user) => {

    if(user) {
      const {
        password,
        resetPasswordToken,
        confirmationToken,
        ...sanitizedUser
      } = user;
       return sanitizedUser;
    }
    // be careful, you need to omit other private attributes yourself
  };

  plugin.controllers.user.findOne = async (ctx) => {
    const { id } = ctx.params;

    const user = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      id,
      {
        ...ctx.params,
        populate:
          ctx.request.query.populate == "*"
            ? "*"
            : [
                ctx.request.query.populate == undefined
                  ? ""
                  : ctx.request.query.populate,
              ],
      }
    );

    ctx.body = sanitizeOutput(user);
  };

  return plugin;
};
