import Link from "next/link";

interface FormErrorProps {
  message?: string;
  link?: string;
}

export const FormError = ({ message, link }: FormErrorProps) => {
  if (!message) return null;

  return (
    <div className="bg-destructive/15 p-3 rounded-md flex flex-col w-full gap-x-2 text-sm text-destructive items-center">
      <div className="flex items-center gap-x-2">
        {/* <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" /> */}
        <p>{message}</p>
      </div>
      {link && (
        <p>
          Dirígete a{" "}
          <Link className="underline decoration-2 font-semibold" href={link}>
            Mi perfil
          </Link>{" "}
          para terminar la reserva o cancelarla
        </p>
      )}
    </div>
  );
};
