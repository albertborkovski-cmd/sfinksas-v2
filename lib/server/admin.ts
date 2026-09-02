import { getChatGPTUser } from '@/app/chatgpt-auth';
import { claimOrVerifyAdmin } from '@/lib/server/store';

export async function getAdminUser() {
  const user = await getChatGPTUser();
  if (!user) return null;
  const isAdmin = await claimOrVerifyAdmin(user.userId);
  return isAdmin ? user : null;
}

export function unauthorized() {
  return Response.json(
    { error: 'Administratoriaus prisijungimas būtinas.' },
    { status: 401 },
  );
}
