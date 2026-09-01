import Link from 'next/link';

export default function WhatsAppButton() {
  const phoneNumber = '917306610349';
  const defaultMessage = encodeURIComponent(
    'Hello Tabassum Attar, I would like to inquire about your luxury artisanal fragrances.'
  );

  return (
    <Link
      href={`https://wa.me/${phoneNumber}?text=${defaultMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group font-sans"
    >
      <svg
        className="w-6 h-6 fill-current"
        viewBox="0 0 24 24"
      >
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.813 2.796.814 3.179 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.055-2.029-.496-1.579-.655-2.58-2.26-2.659-2.366-.079-.105-.648-.864-.648-1.648 0-.784.409-1.17.554-1.328.145-.159.316-.198.421-.198.106 0 .211.001.303.006.098.005.228-.037.357.273.132.316.449 1.095.488 1.174.04.079.066.171.013.277-.053.105-.079.171-.158.264-.079.092-.167.206-.238.277-.08.079-.163.165-.07.324.092.159.412.679.883 1.098.607.541 1.119.708 1.277.787.159.079.251.066.344-.04.092-.105.396-.462.502-.62.105-.159.211-.132.356-.079.145.053.923.435 1.082.514.159.079.264.119.303.185.04.066.04.383-.104.788z" />
      </svg>
      <span className="text-xs font-bold tracking-wide hidden md:inline">
        WhatsApp Us
      </span>
    </Link>
  );
}