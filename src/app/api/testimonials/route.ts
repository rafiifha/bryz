import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getTestimonials, addTestimonial, updateTestimonial, deleteTestimonial } from '@/lib/data';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { isValidMonth } from '@/lib/testimonialMonth';

export async function GET() {
  const testimonials = await getTestimonials();
  return NextResponse.json(testimonials);
}

export async function POST(request: Request) {
  if (!verifyAuth(request)) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { name, imageUrl, rating, month } = body;

    if (!name || !imageUrl) {
      return NextResponse.json({ error: 'Nama dan screenshot testimoni wajib diisi' }, { status: 400 });
    }
    if (!isValidMonth(month)) {
      return NextResponse.json({ error: 'Bulan testimoni wajib diisi (format YYYY-MM)' }, { status: 400 });
    }

    const testimonial = await addTestimonial({
      name,
      imageUrl,
      rating: rating || 5,
      month,
    });

    revalidatePath('/');
    return NextResponse.json(testimonial, { status: 201 });
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
      return NextResponse.json({ error: 'Testimonial ID wajib disertakan' }, { status: 400 });
    }
    if (updates.month && !isValidMonth(updates.month)) {
      return NextResponse.json({ error: 'Bulan testimoni tidak valid (format YYYY-MM)' }, { status: 400 });
    }

    const testimonial = await updateTestimonial(id, updates);
    if (!testimonial) {
      return NextResponse.json({ error: 'Testimoni tidak ditemukan' }, { status: 404 });
    }

    revalidatePath('/');
    return NextResponse.json(testimonial);
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
      return NextResponse.json({ error: 'Testimonial ID wajib disertakan' }, { status: 400 });
    }

    const deleted = await deleteTestimonial(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Testimoni tidak ditemukan' }, { status: 404 });
    }

    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
