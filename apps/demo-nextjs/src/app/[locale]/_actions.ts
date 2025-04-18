'use server';

import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function create() {
  const cookieStore = await cookies();

  if (!cookieStore.get('rootUserUid')) {
    cookieStore.set({
      name: 'rootUserUid',
      value: uuidv4(),
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }
}
