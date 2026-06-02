import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL;

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const res = await fetch(`${BACKEND}/reviews/user/${userId}`);
  const data = await res.json();
  return NextResponse.json(data);
}