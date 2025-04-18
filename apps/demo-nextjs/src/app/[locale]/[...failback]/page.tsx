import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createUrl } from '@/libs/Utils';
import { urlJoin } from '@giglabo/shared';
import { Env } from '@/libs/Env';

export default async function Failback(/*props: { params: Promise<{ locale: string }> }*/) {
  const locale = await getLocale();
  const redirectUrl = urlJoin('/', locale, '/errors/404');
  return redirect(redirectUrl);
}
