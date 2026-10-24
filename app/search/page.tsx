import SearchInterface from "./SearchInterface";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  return <SearchInterface key={q} initialQuery={q} />;
}
