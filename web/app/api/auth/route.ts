import { validatePassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (validatePassword(password)) {
      return Response.json({ valid: true });
    }

    return Response.json({ valid: false }, { status: 401 });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
