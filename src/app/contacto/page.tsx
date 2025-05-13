import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp } from 'react-icons/fa';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Left Column - Headers and Titles */}
            <div className="md:w-64 flex-shrink-0">
              <div className="space-y-8">
                {/* Header section */}
                <div className="space-y-6 pb-8 border-b border-gray-100">
                  <h1 className="text-xl font-semibold text-gray-900">Contáctanos</h1>
                  <p className="text-gray-600">
                    Estamos aquí para ayudarte a encontrar tu próxima propiedad
                  </p>
                </div>

                {/* Section titles */}
                <div>
                  <h2 className="text-sm font-medium text-gray-400 uppercase">Líneas directas</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Comunícate directamente con nuestro equipo
                  </p>
                </div>
                
                <div>
                  <h2 className="text-sm font-medium text-gray-400 uppercase">Ubicación</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Visita nuestras oficinas
                  </p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-400 uppercase">Horarios</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Disponibilidad de atención
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="flex-1">
              <div className="grid gap-6">
                {/* Líneas directas group */}
                <div className="space-y-4">
                  <a 
                    href="tel:+524428549775" 
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-violet-100 hover:bg-violet-50/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-200">
                      <FaPhone className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Teléfono</p>
                      <p className="text-gray-600">(442) 854 9775</p>
                    </div>
                  </a>

                  <a 
                    href="https://wa.me/524428549775" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-violet-100 hover:bg-violet-50/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-200">
                      <FaWhatsapp className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">WhatsApp</p>
                      <p className="text-gray-600">+52 (442) 854 9775</p>
                    </div>
                  </a>

                  <a 
                    href="mailto:info@pizo.mx"
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-violet-100 hover:bg-violet-50/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-200">
                      <FaEnvelope className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">info@pizo.mx</p>
                    </div>
                  </a>
                </div>

                {/* Ubicación group */}
                <div>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                      <FaMapMarkerAlt className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Dirección</p>
                      <p className="text-gray-600">Blvd. Bernardo Quintana 555, Querétaro, Qro.</p>
                    </div>
                  </div>
                </div>

                {/* Horarios group */}
                <div>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                      <FaClock className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Horario de atención</p>
                      <p className="text-gray-600">Lun-Vie: 9:00-18:00</p>
                      <p className="text-gray-600">Sáb: 9:00-13:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
