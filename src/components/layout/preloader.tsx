import Image from 'next/image';

/**
 * Brand intro made only of CSS, so it needs no JavaScript and cannot hang: it fades itself
 * out after about a second. It is decorative (aria-hidden) and never blocks scrolling.
 * Fireflies are the shop's name (Jugnu) in motion.
 */
export function Preloader({ logo }: { logo: { src: string; alt: string } }) {
  return (
    <div className="preloader" aria-hidden="true">
      <div className="preloader__mark">
        <span className="preloader__glow" />
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`preloader__fly preloader__fly--${n}`} />
        ))}
        <Image
          src={logo.src}
          alt=""
          width={132}
          height={132}
          priority
          className="preloader__logo"
        />
      </div>
      <span className="preloader__bar" />
    </div>
  );
}
