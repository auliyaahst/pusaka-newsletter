// This route has been moved to /api/admin/editions/[id]/route.ts
// Keeping this file empty to avoid 404 errors during transition
export async function PATCH() {
  return new Response('Moved to /api/admin/editions/[id]', { status: 404 })
}
