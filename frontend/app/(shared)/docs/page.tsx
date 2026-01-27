import { getMarkdownData } from "@/lib/getMarkdownData";

export default async function DocsPage() {
  const contentHtml = await getMarkdownData("public/README.md");

  return (
    <div className="container p-8 bg-gray-100">
      <div
        className="prose prose-lg"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}
