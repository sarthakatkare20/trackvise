import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('trackvise_token');
  response.cookies.delete('rf_token');
  return response;
}
