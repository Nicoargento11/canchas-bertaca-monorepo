import { CheckCircle2 } from "lucide-react";

interface FormSuccesProps {
  message?: string;
}

export const FormSucces = ({ message }: FormSuccesProps) => {
  if (!message) return null;

  return (
    <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500">
      <CheckCircle2 className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};
