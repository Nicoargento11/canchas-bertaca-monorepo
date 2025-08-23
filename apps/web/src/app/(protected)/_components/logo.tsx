import Link from "next/link";

interface LogoProps {
  slug: string;
}
export const Logo = ({ slug }: LogoProps) => {
  //   const router = useRouter();
  return (
    <div>
      <Link href={`/${slug}`} className="flex items-center gap-2">
        Logo
      </Link>
      {/* <Image
        src={LogoSarmiento}
        alt="Logo"
        width={30}
        height={30}
        className="hover:cursor-pointer"
        onClick={() => router.push("/")}
      /> */}
    </div>
  );
};
