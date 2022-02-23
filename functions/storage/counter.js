export const onRequest = () => {
  const views = await KV.get('views')
  return new Response(new Date().toISOString() + views);
};
