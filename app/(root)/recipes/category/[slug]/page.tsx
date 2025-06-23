import { Metadata } from "next";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetaData({ params }: Props): Promise<Metadata> {
  return {
    title: `Category: ${params.slug}`,
    description: `All recipes in the "${params.slug}" category`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  return (
    <main>
      <h1>{slug}</h1>
    </main>
  );
}
