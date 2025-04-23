import { MainComponent } from '@/components/MainComponent';
import { Metadata } from 'next';
import { createLdJson } from '@/app/_utils/utils';
import Script from 'next/script';
import { Env } from '@/libs/Env';
import { getMetadata } from '@/app/_utils/metadata-utils';

type ParamsProps = { locale: string };
type PropParams = {
  params: Promise<ParamsProps>;
};

export async function generateMetadata(props: PropParams /*, parent: ResolvingMetadata*/): Promise<Metadata> {
  const { locale } = await props.params;
  return getMetadata(locale).then((x) => x || {});
}

export default async function Index(props: PropParams) {
  const params = await props.params;
  const githubUrl = Env.GITHUB_URL || '/';
  const documentationUrl = Env.DOCS_URL || '/';
  return (
    <>
      <Script
        strategy="beforeInteractive"
        type="application/ld+json"
        id="customScript"
        dangerouslySetInnerHTML={{
          __html: await createLdJson(params.locale, {}),
        }}
      />
      <MainComponent githubUrl={githubUrl} documentationUrl={documentationUrl}></MainComponent>
    </>
  );
}
