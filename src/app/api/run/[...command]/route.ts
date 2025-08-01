import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { command: string[] } }
) {
  const command = params.command.join('/');
  
  return NextResponse.json({
    command,
    method: 'GET',
    timestamp: new Date().toISOString(),
    status: command
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { command: string[] } }
) {
  const command = params.command.join('/');
  const body = await request.json().catch(() => ({}));
  
  return NextResponse.json({
    command,
    method: 'POST',
    body,
    timestamp: new Date().toISOString(),
    status: 'stub implementation'
  });
}