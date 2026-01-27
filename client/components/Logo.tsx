interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <picture className={sizeClasses[size]}>
      <source srcSet='/logo.avif' type='image/avif' />
      <source srcSet='/logo.webp' type='image/webp' />
      <img
        src='/logo.jpg'
        alt='Themistoklis Baltzakis Logo'
        width='40'
        height='40'
        sizes='(max-width: 768px) 32px, 40px'
        loading='eager'
        decoding='async'
        className={`w-full h-full object-cover ${className || ""}`}
      />
    </picture>
  );
}

export default Logo;
