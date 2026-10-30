import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServices, addService, updateService, deleteService } from '@/lib/data';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  const services = await getServices();
  return NextResponse.json(services);
}

export async function POST(request: Request) {
  if (!verifyAuth(request)) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { name, description, price, icon, imageUrl } = body;

    if (!name || !description) {
      return NextResponse.json({ error: 'Nama dan deskripsi wajib diisi' }, { status: 400 });
    }

    const service = await addService({
      name,
      description,
      price: price || 'Hubungi Admin',
      icon: icon || '📄',
      imageUrl: imageUrl || null,
    });

    revalidatePath('/');
    return NextResponse.json(service, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!verifyAuth(request)) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Service ID wajib disertakan' }, { status: 400 });
    }

    const service = await updateService(id, updates);
    if (!service) {
      return NextResponse.json({ error: 'Layanan tidak ditemukan' }, { status: 404 });
    }

    revalidatePath('/');
    return NextResponse.json(service);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!verifyAuth(request)) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Service ID wajib disertakan' }, { status: 400 });
    }

    const deleted = await deleteService(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Layanan tidak ditemukan' }, { status: 404 });
    }

    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
