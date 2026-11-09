import { auth } from '@/lib/firebase/client';

/**
 * fetch() que anexa o Firebase ID token do usuário logado.
 * Use em todas as chamadas para /api/* que exigem login.
 */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const user = auth?.currentUser ?? null;
  const headers = new Headers(init.headers);
  if (user) {
    const token = await user.getIdToken();
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}
