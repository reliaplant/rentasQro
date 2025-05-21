import LegalHeader from '../components/legalHeader';

const sections = [
  { id: 'responsable', title: '1. Responsable' },
  { id: 'finalidades', title: '2. Finalidades del Tratamiento' },
  { id: 'datos', title: '3. Datos Personales' },
  { id: 'datos-sensibles', title: '4. Datos Personales Sensibles' },
  { id: 'transferencia', title: '5. Transferencia de Datos' },
  { id: 'derechos', title: '6. Derechos ARCO' },
  { id: 'revocacion', title: '7. Revocación del Consentimiento' },
  { id: 'cookies', title: '8. Uso de Cookies' },
  { id: 'modificaciones', title: '9. Modificaciones al Aviso' },
  { id: 'consentimiento', title: '10. Consentimiento' },
  { id: 'contacto', title: '11. Contacto' },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <LegalHeader title="Aviso de Privacidad" />
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
                <h1 className="text-2xl font-semibold text-gray-900 mb-3">Aviso de Privacidad Integral</h1>
                <p className="text-sm text-gray-500">Última actualización: 21 de mayo de 2025</p>
              </div>
              
              <section id="responsable">
                <h2 className="text-xl font-medium text-gray-900 mb-4">1. Responsable</h2>
                <p className="text-gray-600 mb-4">
                  Grupo Pizo, S. de R.L. de C.V. ("Pizo"), con domicilio en [colocar domicilio fiscal completo], es responsable del tratamiento de los datos personales que usted proporcione, los cuales serán protegidos conforme a lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de Particulares y demás normatividad aplicable.
                </p>
              </section>

              <section id="finalidades">
                <h2 className="text-xl font-medium text-gray-900 mb-4">2. Finalidades del Tratamiento de sus Datos Personales</h2>
                <p className="text-gray-600 mb-4">
                  Los datos personales que recabamos de usted los utilizaremos para las siguientes finalidades:
                </p>
                
                <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Finalidades primarias:</h3>
                <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-1">
                  <li>Identificación y contacto.</li>
                  <li>Administración de la relación comercial con propietarios, usuarios y clientes potenciales.</li>
                  <li>Promoción, publicidad, gestión e intermediación en compra, venta o arrendamiento de inmuebles.</li>
                  <li>Validar y confirmar la información proporcionada por usted o terceros.</li>
                  <li>Proveer información sobre inmuebles y desarrollos inmobiliarios.</li>
                  <li>Generación, seguimiento y gestión de prospectos ("leads").</li>
                  <li>Atención y seguimiento a solicitudes y consultas sobre nuestros servicios.</li>
                  <li>Emisión de contratos y documentos relacionados con los servicios inmobiliarios prestados.</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Finalidades secundarias:</h3>
                <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-1">
                  <li>Mercadotecnia, publicidad y prospección comercial.</li>
                  <li>Realizar estudios de mercado y estadísticas mediante herramientas de inteligencia artificial.</li>
                  <li>Comunicación de promociones y ofertas especiales mediante medios electrónicos, telefónicos o físicos.</li>
                  <li>Evaluación y mejora continua de nuestros servicios.</li>
                </ul>
                
                <p className="text-gray-600 mb-4">
                  En caso de que no desee que sus datos personales sean tratados para las finalidades secundarias antes mencionadas, usted puede enviar un correo electrónico a info@pizo.mx indicando dicha negativa.
                </p>
              </section>

              <section id="datos">
                <h2 className="text-xl font-medium text-gray-900 mb-4">3. Datos Personales que se Recaban</h2>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-1">
                  <li>Nombre completo</li>
                  <li>Correo electrónico</li>
                  <li>Número telefónico</li>
                  <li>Dirección</li>
                  <li>Información financiera (en caso de ser necesaria para la contratación)</li>
                  <li>Datos fiscales</li>
                  <li>Información relacionada con inmuebles</li>
                </ul>
              </section>

              <section id="datos-sensibles">
                <h2 className="text-xl font-medium text-gray-900 mb-4">4. Datos Personales Sensibles</h2>
                <p className="text-gray-600 mb-4">
                  Le informamos que no recabamos datos personales sensibles.
                </p>
              </section>

              <section id="transferencia">
                <h2 className="text-xl font-medium text-gray-900 mb-4">5. Transferencia de Datos Personales</h2>
                <p className="text-gray-600 mb-4">
                  Sus datos personales pueden ser transferidos y tratados dentro y fuera del país, por personas distintas a esta empresa, únicamente en los siguientes casos:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-1">
                  <li>A terceros involucrados en transacciones inmobiliarias, como notarios, instituciones financieras, desarrolladoras inmobiliarias y asesores inmobiliarios externos, siempre que sea necesario para la realización del servicio contratado.</li>
                  <li>A autoridades competentes en cumplimiento con disposiciones legales aplicables.</li>
                </ul>
                <p className="text-gray-600 mb-4">
                  Salvo estos casos específicos, sus datos personales no serán transferidos sin su consentimiento expreso.
                </p>
              </section>

              <section id="derechos">
                <h2 className="text-xl font-medium text-gray-900 mb-4">6. Derechos ARCO</h2>
                <p className="text-gray-600 mb-4">
                  Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición). Estos derechos se conocen como derechos ARCO.
                </p>
                <p className="text-gray-600 mb-4">
                  Para ejercer cualquiera de los derechos ARCO, usted deberá presentar la solicitud correspondiente mediante correo electrónico a info@pizo.mx, proporcionando la siguiente información:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-1">
                  <li>Nombre completo y datos de contacto.</li>
                  <li>Documento que acredite su identidad.</li>
                  <li>Descripción clara y precisa del derecho que desea ejercer y los datos personales involucrados.</li>
                </ul>
                <p className="text-gray-600 mb-4">
                  Su solicitud será respondida dentro de los 20 días hábiles siguientes a la recepción.
                </p>
              </section>

              <section id="revocacion">
                <h2 className="text-xl font-medium text-gray-900 mb-4">7. Revocación del Consentimiento</h2>
                <p className="text-gray-600 mb-4">
                  En cualquier momento, usted podrá revocar el consentimiento otorgado para el tratamiento de sus datos personales mediante solicitud enviada al correo electrónico info@pizo.mx.
                </p>
              </section>

              <section id="cookies">
                <h2 className="text-xl font-medium text-gray-900 mb-4">8. Uso de Cookies</h2>
                <p className="text-gray-600 mb-4">
                  Le informamos que nuestro sitio web utiliza cookies para mejorar la experiencia del usuario. Puede configurar su navegador para rechazarlas; sin embargo, esto podría limitar la funcionalidad del sitio web. Para obtener información más detallada sobre cómo utilizamos las cookies, consulte nuestra <a href="/legal/politica-cookies" className="text-violet-600 hover:underline">Política de Cookies</a>.
                </p>
              </section>

              <section id="modificaciones">
                <h2 className="text-xl font-medium text-gray-900 mb-4">9. Modificaciones al Aviso de Privacidad</h2>
                <p className="text-gray-600 mb-4">
                  Este aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales; cambios en nuestras prácticas de privacidad; o por otras causas. Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el presente aviso a través de nuestro sitio web https://pizo.mx.
                </p>
              </section>

              <section id="consentimiento">
                <h2 className="text-xl font-medium text-gray-900 mb-4">10. Consentimiento</h2>
                <p className="text-gray-600 mb-4">
                  Al proporcionar sus datos personales, usted confirma que ha leído y acepta los términos y condiciones del presente Aviso de Privacidad y de los <a href="/legal/tyc" className="text-violet-600 hover:underline">Términos y Condiciones</a> de nuestra plataforma.
                </p>
              </section>

              <section id="contacto">
                <h2 className="text-xl font-medium text-gray-900 mb-4">11. Contacto</h2>
                <p className="text-gray-600 mb-4">
                  Para cualquier duda o aclaración respecto al presente Aviso de Privacidad, puede dirigirse a info@pizo.mx.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
