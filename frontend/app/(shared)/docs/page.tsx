import { getMarkdownData } from '@/lib/getMarkdownData';

interface PrivacyPolicyProps {
  contentHtml: string;
}

const DocksPage: React.FC<PrivacyPolicyProps> = async() => {
  const contentHtml = await getMarkdownData('public/README.md');
    
  return (
    <div className="p-8 bg-gray-100 container">
      <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </div>
  );
};


export default DocksPage;