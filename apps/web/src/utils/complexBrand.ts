export function getComplexBrand(complex: { name: string }) {
  const isSeven = complex.name.toLowerCase().includes("seven");
  return {
    isSeven,
    color: isSeven ? "text-green-400" : "text-blue-400",
    bg: isSeven ? "bg-green-500/10" : "bg-blue-500/10",
    border: isSeven ? "border-green-500/20" : "border-blue-500/20",
    logoSrc: `/images/${isSeven ? "seven" : "bertaca"}_logo.png`,
  };
}
