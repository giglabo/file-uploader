import { createUrl } from '@/libs/Utils';
import Error404ContentComponent from '@/components/Error404ContentComponent';
import { Env } from '@/libs/Env';
import { getLocale } from 'next-intl/server';

export default async function Custom404(/*props: { params: Promise<{ locale: string }> }*/) {
  const locale = await getLocale();
  const homeUrl = createUrl(locale, '/');
  const documentationUrl = Env.DOCS_URL || '/';
  return <Error404ContentComponent homeUrl={homeUrl} documentationUrl={documentationUrl}></Error404ContentComponent>;
}
