import Link from "next/link";

export const Logo = () => {
  //   const router = useRouter();
  return (
    <div>
      <Link href={"/"} className="flex items-center gap-2">
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
