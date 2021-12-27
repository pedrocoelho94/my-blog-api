const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

  async create(ctx) {
    // o post é criado de acordo com o usuário logado
    const { id } = ctx.state.user;
    // const { title, excerpt } = ctx.request.body;
    // const post = { title, excerpt, user: id };

    // const entity = await strapi.services.guestreview.create(post);
    // return sanitizeEntity(entity, { model: strapi.models.guestreview });

    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.guestreview.create(
        {
          ...data,
          user: id,
        },
        { files }
      );
    } else {
      entity = await strapi.services.guestreview.create({
        ...ctx.request.body,
        user: id,
      });
    }

    return sanitizeEntity(entity, { model: strapi.models.guestreview });
  },

  async find(ctx) {
    let entities;

    if (ctx.state.user) {
      //retorna apenas os posts do usuário logado
      const query = { ...ctx.query, user: ctx.state.user.id };

      if (ctx.query._q) {
        entities = await strapi.services.guestreview.search(query);
      } else {
        entities = await strapi.services.guestreview.find(query);
      }

      return entities.map((entity) =>
        sanitizeEntity(entity, { model: strapi.models.guestreview })
      );
    }

    // retorna todos os resultados quando acessado /guestreviews/all
    entities = await strapi.services.guestreview.find(ctx.query);
    return entities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models.guestreview })
    );
  },

  async update(ctx) {
    const { id } = ctx.params;
    let entity;

    const post = await strapi.services.guestreview.find({
      id,
      user: ctx.state.user.id,
    });

    if (!post || !post.length) {
      return ctx.unauthorized("You cannot update this post");
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.guestreview.update(
        { id },
        { ...data, user: ctx.state.user.id },
        {
          files,
        }
      );
    } else {
      entity = await strapi.services.guestreview.update(
        { id },
        { ...ctx.request.body, user: ctx.state.user.id }
      );
    }

    return sanitizeEntity(entity, { model: strapi.models.guestreview });
  },

  async delete(ctx) {
    const { id } = ctx.params;

    const post = await strapi.services.guestreview.find({
      id,
      user: ctx.state.user.id,
    });

    if (!post || !post.length) {
      return ctx.unauthorized("You cannot delete this post");
    }

    const entity = await strapi.services.guestreview.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.guestreview });
  },
};
