import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL;

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${BACKEND}/posts/${params.id}/like`, {
    method: 'PUT',
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const res = await fetch(`${BACKEND}/posts/${params.id}`, { method: 'DELETE' });
  const data = await res.json();
  return NextResponse.json(data);
}