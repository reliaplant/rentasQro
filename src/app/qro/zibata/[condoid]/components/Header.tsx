import Link from 'next/link';
import { BiMap } from 'react-icons/bi';
import Image from 'next/image';

interface HeaderProps {
    name: string;
    coverImage: string;
    description?: string;
    shortDescription?: string;
    logoUrl?: string | null;
    desarrolladoraName?: string;
    desarrolladoraDescripcion?: string;
    desarrolladoraLogoURL?: string;
}

export default function Header({ 
    name, 
    coverImage, 
    description, 
    shortDescription, 
    logoUrl, 
    desarrolladoraName,
    desarrolladoraDescripcion,
    desarrolladoraLogoURL 
}: HeaderProps) {
    return (
        <header>
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-gray-500 mb-6 max-w-6xl mx-auto">
                <BiMap aria-hidden="true" className="mr-2" />
                <Link href="/zonas" className="hover:text-gray-700">Zonas</Link>
                <span className="mx-2" aria-hidden="true">›</span>
                <Link href="/qro/zibata" className="hover:text-gray-700">Zibatá</Link>
            </nav>

            {/* Hero Banner */}
            <div className="container">
                {coverImage && (
                    <div className="relative max-w-6xl mx-auto h-[40vh] md:h-[50vh] mb-8 overflow-hidden mt-8">
                        {/* Logo */}
                        {logoUrl && (
                            <div className="absolute top-6 left-6 z-10 bg-white rounded border-2 border-gray-400/60 p-2">
                                <Image
                                    src={logoUrl}
                                    alt={`${name} logo`}
                                    width={120}
                                    height={120}
                                    className="object-contain"
                                    priority
                                    quality={90}
                                />
                            </div>
                        )}

                        {/* Cover Image */}
                        <Image
                            src={coverImage}
                            alt={`${name} - Portada`}
                            fill
                            priority
                            className="object-cover  rounded-lg"
                            quality={95}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/20 rounded-lg" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="py-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-semibold mb-4">{name}</h1>
                    
                    {shortDescription && (
                        <h2 className="text-lg text-gray-600 italic mb-6">{shortDescription}</h2>
                    )}
                    
                    {description && (
                        <section className="mb-8">
                            <p className="text-gray-700">{description}</p>
                        </section>
                    )}

                    {/* Desarrolladora section después de la descripción del condominio */}
                    {desarrolladoraName && (
                        <div className="mt-8 flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                            {desarrolladoraLogoURL && (
                                <div className="h-24 flex-shrink-0">
                                    <Image
                                        src={desarrolladoraLogoURL}
                                        alt={desarrolladoraName}
                                        width={96}
                                        height={96}
                                        className="object-contain h-full w-ful border border-gray-200 rounded"
                                    />
                                </div>
                            )}
                            <div>
                                <h3 className="text-xs font-medium text-gray-500">Desarrollado por</h3>
                                <h4 className="text-lg font-semibold text-gray-900">{desarrolladoraName}</h4>
                                {desarrolladoraDescripcion && (
                                    <p className="text-xs text-gray-600 mt-1">{desarrolladoraDescripcion}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
