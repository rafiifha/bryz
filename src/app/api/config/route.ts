import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getConfig, saveConfig } from '@/lib/data';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  const config = await getConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  if (!verifyAuth(request)) return unauthorizedResponse();

  try {
    const body = await request.json();
    const currentConfig = await getConfig();
    const updatedConfig = { ...currentConfig, ...body };
    await saveConfig(updatedConfig);

    revalidatePath('/');
    return NextResponse.json(updatedConfig);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
