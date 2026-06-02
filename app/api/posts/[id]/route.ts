import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL;

export async function PUT(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${BACKEND}/posts/${id}/like`, {
    method: 'PUT',
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${BACKEND}/posts/${id}`, { method: 'DELETE' });
  const data = await res.json();
  return NextResponse.json(data);
}