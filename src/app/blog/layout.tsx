export const metadata = {
  title: 'Blog - Pizo',
  description: 'Artículos y noticias sobre bienes raíces, propiedades y más.',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
