import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL;

export async function GET(_: NextRequest, { params }: { params: { userId: string } }) {
  const res = await fetch(`${BACKEND}/reviews/user/${params.userId}`);
  const data = await res.json();
  return NextResponse.json(data);
}