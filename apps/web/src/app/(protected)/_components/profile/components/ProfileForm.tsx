"use client";

import { User } from "@/services/user/user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, User as UserIcon, Camera, Save } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z
    .string()
    .regex(/^[0-9+\s-()]+$/, "Teléfono inválido")
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .optional()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User;
  onUpdate?: (data: ProfileFormData) => Promise<void>;
}

export const ProfileForm = ({ user, onUpdate }: ProfileFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      if (onUpdate) {
        await onUpdate(data);
        toast.success("Perfil actualizado correctamente");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-Primary" />
            Mi Perfil
          </h3>
          {!isEditing && (
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              className="bg-Primary/20 hover:bg-Primary/30 text-Primary-light border border-Primary/30"
            >
              Editar
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          {/* Profile Picture */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-white/10">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-Primary to-Primary-dark rounded-full flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              {isEditing && (
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-Primary hover:bg-Primary-dark text-white p-2 rounded-full shadow-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-lg font-bold text-white">{user.name}</h4>
              <p className="text-sm text-white/70">Jugador</p>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white font-semibold flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-Primary" />
              Nombre completo
            </Label>
            <Input
              id="name"
              {...register("name")}
              disabled={!isEditing}
              className={`bg-white/10 border-white/10 text-white placeholder:text-white/30 
                ${!isEditing ? "cursor-not-allowed opacity-70" : ""}
                ${errors.name ? "border-red-500" : ""}`}
              placeholder="Tu nombre completo"
            />
            {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4 text-Primary" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              disabled={!isEditing}
              className={`bg-white/10 border-white/10 text-white placeholder:text-white/30 
                ${!isEditing ? "cursor-not-allowed opacity-70" : ""}
                ${errors.email ? "border-Error" : ""}`}
              placeholder="tu@email.com"
            />
            {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white font-semibold flex items-center gap-2">
              <Phone className="w-4 h-4 text-Primary" />
              Teléfono
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              disabled={!isEditing}
              className={`bg-white/10 border-white/10 text-white placeholder:text-white/30 
                ${!isEditing ? "cursor-not-allowed opacity-70" : ""}
                ${errors.phone ? "border-Error" : ""}`}
              placeholder="+54 9 11 1234-5678"
            />
            {errors.phone && <p className="text-sm text-Error">{errors.phone.message}</p>}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full sm:flex-1 bg-white/10 hover:bg-white/20 text-white border-white/10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isDirty || isLoading}
                className="w-full sm:flex-1 bg-gradient-to-r from-Primary to-Primary-dark hover:from-Primary-dark hover:to-Primary-darker text-white font-bold"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </Card>
  );
};
