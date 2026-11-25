import Image from "next/image";

type BrandImageProps = {
  variant: "name" | "icon";
  alt: string;
  className?: string;
};

export function BrandImage({ variant, alt, className }: BrandImageProps) {
  const isName = variant === "name";
  // Intrinsic dimensions reserve the PNG's real ratio; CSS controls its display size.
  return <Image src={`/assets/img/${isName ? "gavions-nome" : "gavions-mascote-branco-ofc"}.png`} alt={alt} className={className} width={isName ? 720 : 360} height={isName ? 116 : 250} unoptimized loading="eager" />;
}
