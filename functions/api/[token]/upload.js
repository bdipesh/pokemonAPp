export async function onRequest({ env, params }) {
  const token = await env.KV.get("token");
  if (params.token === token) {
    return new Response("Success", token);
  } else {
    return new Response("failled", token);
  }
}
