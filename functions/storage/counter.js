export async function onRequest({ env }) {
  const task = await env.TodoList.get("Task:123");
  return new Response(task);
}
