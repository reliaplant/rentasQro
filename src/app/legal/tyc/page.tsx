import LegalHeader from '../components/legalHeader';

const sections = [
  { id: 'introduccion', title: '1. Introducción' },
  { id: 'definiciones', title: '2. Definiciones' },
  { id: 'descripcion', title: '3. Descripción del Servicio' },
  { id: 'informacion', title: '4. Información de Propiedades y Desarrolladoras' },
  { id: 'ubicacion', title: '5. Información Pública y Ubicación Aproximada' },
  { id: 'ia', title: '6. Uso de Inteligencia Artificial y Publicidad Digital' },
  { id: 'uso', title: '7. Uso de la Plataforma' },
  { id: 'responsabilidades', title: '8. Responsabilidades' },
  { id: 'propiedad', title: '9. Propiedad Intelectual' },
  { id: 'privacidad', title: '10. Privacidad y Protección de Datos' },
  { id: 'contacto', title: '11. Contacto' },
  { id: 'anticorrupcion', title: '12. Cláusula Anticorrupción y Compliance' },
  { id: 'generalidades', title: '13. Generalidades' },
  { id: 'ley', title: '14. Ley Aplicable y Jurisdicción' },
  { id: 'documentos', title: '15. Documentos Complementarios' }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <LegalHeader title="Términos y Condiciones" />
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <nav className="md:w-64 flex-shrink-0 border-r border-gray-100">
            <div className="sticky top-6 p-6">
              <p className="text-xs font-medium text-gray-400 mb-4">CONTENIDO</p>
              <ul className="space-y-3">
                {sections.map(section => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-sm text-gray-600 hover:text-violet-600 block py-1 transition-colors"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 max-w-3xl p-6 md:p-10">
            <div className="space-y-12">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-3">Términos y Condiciones de Uso</h1>
                <p className="text-sm text-gray-500">Última actualización: 21 de mayo de 2025</p>
              </div>
              
              <section id="introduccion">
                <h2 className="text-xl font-medium text-gray-900 mb-4">1. Introducción</h2>
                <p className="text-gray-600 leading-relaxed">
                  Estos Términos y Condiciones ("Términos") regulan el acceso y uso del sitio web, plataformas digitales, aplicaciones móviles, productos, contenidos y servicios (en conjunto, los "Servicios") ofrecidos por Grupo Pizo S. de R.L. de C.V., mejor conocido como "Pizo" ("la Empresa"), dedicada a la promoción y gestión de propiedades inmobiliarias.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Al acceder o utilizar los Servicios, usted ("Usuario") acepta expresamente estos Términos, estableciendo una relación contractual vinculante entre usted y Pizo. Si no está de acuerdo con estos Términos, no debe acceder ni utilizar nuestros Servicios.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Pizo se reserva el derecho a modificar estos Términos en cualquier momento. Dichas modificaciones entrarán en vigor inmediatamente después de su publicación en nuestro sitio web.
                </p>
              </section>
              
              <section id="definiciones">
                <h2 className="text-xl font-medium text-gray-900 mb-4">2. Definiciones</h2>
                <p className="text-gray-600 leading-relaxed">
                  <strong>Anuncio:</strong> Publicación digital que detalla características, precios y condiciones de propiedades disponibles.
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  <strong>Usuario:</strong> Toda persona que utiliza o accede a los Servicios.
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  <strong>Propietario:</strong> Persona física o moral titular o representante legal de un inmueble que desea promover en nuestra plataforma.
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  <strong>Lead:</strong> Prospecto interesado generado mediante nuestros Servicios.
                </p>
              </section>
              
              <section id="descripcion">
                <h2 className="text-xl font-medium text-gray-900 mb-4">3. Descripción del Servicio</h2>
                <p className="text-gray-600 leading-relaxed">
                  Pizo ofrece una plataforma digital que publica información sobre propiedades inmobiliarias de terceros (casas, departamentos, terrenos, locales, etc.) para compraventa o arrendamiento. Pizo administra directamente todas las solicitudes o "leads" generados.
                </p>
              </section>
              
              <section id="informacion">
                <h2 className="text-xl font-medium text-gray-900 mb-4">4. Información de Propiedades y Desarrolladoras</h2>
                <p className="text-gray-600 leading-relaxed">
                  La información publicada sobre propiedades es proporcionada por terceros (asesores inmobiliarios, propietarios o desarrolladoras), quienes han autorizado expresamente a Pizo para su uso. La Empresa no garantiza la precisión, completitud ni actualidad de dicha información, incluyendo la disponibilidad real de las propiedades. Intentamos verificar la información publicada, pero no podemos asegurar su exactitud permanente.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Asimismo, la información relacionada con desarrolladoras, nombres comerciales, logotipos, y otros detalles específicos, se publica con base en acuerdos de colaboración y autorización explícita de las mismas.
                </p>
              </section>
              
              <section id="ubicacion">
                <h2 className="text-xl font-medium text-gray-900 mb-4">5. Información Pública y Ubicación Aproximada</h2>
                <p className="text-gray-600 leading-relaxed">
                  La información relativa a zonas, condominios y reseñas proviene en muchas ocasiones de fuentes públicas disponibles (incluyendo Google). Las ubicaciones mostradas en mapas son aproximadas y referenciales, obtenidas también de información pública disponible.
                </p>
              </section>
              
              <section id="ia">
                <h2 className="text-xl font-medium text-gray-900 mb-4">6. Uso de Inteligencia Artificial y Publicidad Digital</h2>
                <p className="text-gray-600 leading-relaxed">
                  Pizo utiliza tecnologías avanzadas, incluyendo inteligencia artificial, para mejorar la gestión del marketing, análisis de leads y optimización de la experiencia del Usuario. Asimismo, Pizo realiza campañas publicitarias pagadas en diversas plataformas digitales para promover propiedades y servicios.
                </p>
              </section>
              
              <section id="uso">
                <h2 className="text-xl font-medium text-gray-900 mb-4">7. Uso de la Plataforma</h2>
                <p className="text-gray-600 leading-relaxed">
                  El Usuario se compromete a utilizar los Servicios con fines lícitos, aceptando no utilizar la plataforma para ningún fin ilegal, fraudulento o prohibido por estos Términos. Se prohíbe expresamente el uso de sistemas automáticos para extracción de información (web scraping, bots, etc.).
                </p>
              </section>
              
              <section id="responsabilidades">
                <h2 className="text-xl font-medium text-gray-900 mb-4">8. Responsabilidades</h2>
                <p className="text-gray-600 leading-relaxed">
                  Pizo no será responsable por:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600">
                  <li>Transacciones o acuerdos entre Usuarios, Propietarios o terceros.</li>
                  <li>Datos inexactos, incompletos o desactualizados proporcionados por terceros.</li>
                  <li>Problemas técnicos o interrupciones del Servicio.</li>
                  <li>Daños o pérdidas derivados del uso indebido o interpretación errónea de la información proporcionada en nuestra plataforma por terceros.</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Pizo tampoco se hace responsable por lo que terceros puedan hacer con la información publicada en su plataforma.
                </p>
              </section>
              
              <section id="propiedad">
                <h2 className="text-xl font-medium text-gray-900 mb-4">9. Propiedad Intelectual</h2>
                <p className="text-gray-600 leading-relaxed">
                  Todos los contenidos del sitio web y la plataforma (textos, gráficos, logotipos, software, bases de datos) son propiedad exclusiva de Pizo o se utilizan bajo autorización expresa, y están protegidos por leyes de propiedad intelectual nacionales e internacionales.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Queda prohibida la copia, modificación, reproducción o explotación comercial de los contenidos sin previa autorización escrita de Pizo.
                </p>
              </section>
              
              <section id="privacidad">
                <h2 className="text-xl font-medium text-gray-900 mb-4">10. Privacidad y Protección de Datos</h2>
                <p className="text-gray-600 leading-relaxed">
                  Pizo cumple con la Ley Federal de Protección de Datos Personales en Posesión de Particulares. Consulte nuestro <a href="/legal/privacidad" className="text-violet-600 hover:underline">Aviso de Privacidad</a> para más detalles sobre el tratamiento de datos personales. Para información sobre el uso de cookies en nuestro sitio, consulte nuestra <a href="/legal/politica-cookies" className="text-violet-600 hover:underline">Política de Cookies</a>.
                </p>
              </section>
              
              <section id="contacto">
                <h2 className="text-xl font-medium text-gray-900 mb-4">11. Contacto</h2>
                <p className="text-gray-600 leading-relaxed">
                  Pizo podrá contactar al Usuario por correo electrónico, teléfono o WhatsApp para proporcionar información sobre nuestros Servicios o promociones.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Cualquier consulta, aclaración o queja deberá dirigirse al correo electrónico info@pizo.mx.
                </p>
              </section>
              
              <section id="anticorrupcion">
                <h2 className="text-xl font-medium text-gray-900 mb-4">12. Cláusula Anticorrupción y Compliance</h2>
                <p className="text-gray-600 leading-relaxed">
                  Los Usuarios se comprometen a no utilizar la plataforma para actividades ilícitas, incluyendo lavado de dinero, financiamiento al terrorismo o cualquier forma de corrupción.
                </p>
              </section>
              
              <section id="generalidades">
                <h2 className="text-xl font-medium text-gray-900 mb-4">13. Generalidades</h2>
                <p className="text-gray-600 leading-relaxed">
                  Si alguna disposición de estos Términos fuera considerada inválida por alguna autoridad judicial, dicha invalidez no afectará la vigencia de las demás cláusulas.
                </p>
              </section>
              
              <section id="ley">
                <h2 className="text-xl font-medium text-gray-900 mb-4">14. Ley Aplicable y Jurisdicción</h2>
                <p className="text-gray-600 leading-relaxed">
                  Estos Términos se rigen por las leyes vigentes en México. Cualquier controversia será resuelta en los tribunales competentes del domicilio fiscal de Pizo.
                </p>
              </section>
              
              <section id="documentos">
                <h2 className="text-xl font-medium text-gray-900 mb-4">15. Documentos Complementarios</h2>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600">
                  <li><a href="/legal/privacidad" className="text-violet-600 hover:underline">Aviso de Privacidad</a></li>
                  <li><a href="/legal/politica-cookies" className="text-violet-600 hover:underline">Política de Cookies</a></li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}