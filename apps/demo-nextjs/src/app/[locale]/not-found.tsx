import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createUrl } from '@/libs/Utils';

export default async function Custom404(/*props: { params: Promise<{ locale: string }> }*/) {
  const locale = await getLocale();
  return redirect(createUrl(locale, '/errors/404'));
}
