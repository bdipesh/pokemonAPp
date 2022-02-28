export async function onRequest(context) {
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;
  const token = await env.KV.get("token");
  if (paramsToken === token) {
    return new Response("Success", token);
  } else {
    return new Response("failled", token);
  }
}
