import { MainComponent } from '@/components/MainComponent';
import { Metadata, ResolvingMetadata } from 'next';
import { createLdJson, createMetadata } from '@/app/_utils/utils';
import Script from 'next/script';
import { Env } from '@/libs/Env';
import { getMetadata } from '@/app/_utils/metadata-utils';
import { urlJoin } from '@giglabo/upload-shared';

type ParamsProps = { locale: string };
type PropParams = {
  params: Promise<ParamsProps>;
};

export async function generateMetadata(props: PropParams /*, parent: ResolvingMetadata*/): Promise<Metadata> {
  // console.log('Generating metadata', parent);
  // return createMetadata({}, parent);
  const { locale } = await props.params;
  return getMetadata(locale).then((x) => x || {});
}

export default async function Index(props: PropParams) {
  const params = await props.params;
  const githubUrl = Env.GITHUB_URL || '/';
  const documentationUrl = Env.DOCS_URL || '/';
  const exampleOneUrl = urlJoin(Env.NEXT_PUBLIC_APP_URL, 'example-one');
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
      <MainComponent githubUrl={githubUrl} documentationUrl={documentationUrl} exampleOneUrl={exampleOneUrl}></MainComponent>
    </>
  );
}
