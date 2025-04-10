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
            {/* Breadcrumb - Hidden on mobile, visible from md breakpoint */}
            <nav className="hidden md:flex items-center text-sm text-gray-500 max-w-6xl mx-auto">
            <BiMap aria-hidden="true" className="mr-2" />
            <Link href="/zonas" className="hover:text-gray-700">Zonas</Link>
            <span className="mx-2" aria-hidden="true">›</span>
            <Link href="/qro/zibata" className="hover:text-gray-700">Zibatá</Link>
            </nav>

            {/* Hero Banner */}
            <div className="container">
            {coverImage && (
                <div className="relative max-w-6xl mx-auto h-[40vh] md:h-[50vh] mb-0 md:mb-8 overflow-hidden mt-0 md:mt-4">
                {/* Logo */}
                {logoUrl && (
                    <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 bg-white rounded border-2 border-gray-400/60 p-2">
                    <Image
                        src={logoUrl}
                        alt={`${name} logo`}
                        width={80}
                        height={80}
                        className="object-contain md:w-[140px] md:h-[140px] w-[80px] h-[80px]"
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
                    className="object-cover rounded-none md:rounded-lg"
                    quality={95}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/20 rounded-none md:rounded-lg" />
                </div>
            )}
            </div>

            {/* Content */}
            <div className="py-4 md:py-8 bg-gray-100 p-4 md:p-8 rounded-none lg:rounded-lg">

            <div className="max-w-6xl">

            <nav className="flex md:hidden items-center text-sm text-gray-500 mb-6 max-w-6xl mx-auto">
                <BiMap aria-hidden="true" className="mr-2" />
                <Link href="/zonas" className="hover:text-gray-700">Zonas</Link>
                <span className="mx-2" aria-hidden="true">›</span>
                <Link href="/qro/zibata" className="hover:text-gray-700">Zibatá</Link>
            </nav>
                <h1 className="text-2xl md:text-4xl font-semibold mb-4">{name}</h1>
                
                {shortDescription && (
                <h2 className="text-lg text-gray-600 italic mb-6">{shortDescription}</h2>
                )}
                
                {description && (
                <section className="mb-8">
                    <p className="t</section>ext-gray-700">{description}</p>
                </section>
                )}

                {/* Desarrolladora section después de la descripción del condominio */}
                {desarrolladoraName && (
                <div className="mt-8 flex items-start gap-4 rounded-lg">
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
