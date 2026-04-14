import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Watchlist stored in Clerk user unsafeMetadata (no DB needed)
// Max ~4KB per user — plenty for ticker list

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ tickers: [] });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const tickers = (user.unsafeMetadata?.watchlist as string[]) || [];

  return NextResponse.json({ tickers });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { ticker } = await request.json();
  if (!ticker || typeof ticker !== 'string') {
    return NextResponse.json({ error: 'Ticker invalido' }, { status: 400 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const current = (user.unsafeMetadata?.watchlist as string[]) || [];
  const upper = ticker.toUpperCase();

  if (current.includes(upper)) {
    return NextResponse.json({ tickers: current });
  }

  const updated = [...current, upper];
  await client.users.updateUserMetadata(userId, {
    unsafeMetadata: { ...user.unsafeMetadata, watchlist: updated },
  });

  return NextResponse.json({ tickers: updated });
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { ticker } = await request.json();
  if (!ticker || typeof ticker !== 'string') {
    return NextResponse.json({ error: 'Ticker invalido' }, { status: 400 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const current = (user.unsafeMetadata?.watchlist as string[]) || [];
  const upper = ticker.toUpperCase();
  const updated = current.filter((t: string) => t !== upper);

  await client.users.updateUserMetadata(userId, {
    unsafeMetadata: { ...user.unsafeMetadata, watchlist: updated },
  });

  return NextResponse.json({ tickers: updated });
}
