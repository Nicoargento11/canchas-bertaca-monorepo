"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";

interface MercadoPagoConfigProps {
  complexId: string;
  initialConfig?: {
    mpPublicKey?: string;
    mpIntegratorId?: string;
    hasAccessToken?: boolean;
  };
}

export default function MercadoPagoConfig({ complexId, initialConfig }: MercadoPagoConfigProps) {
  const [loading, setLoading] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    mpAccessToken: "",
    mpPublicKey: initialConfig?.mpPublicKey || "",
    mpIntegratorId: initialConfig?.mpIntegratorId || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/complexes/${complexId}/mercadopago-config`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar la configuración");
      }

      toast({
        title: "Configuración actualizada",
        description: "Los tokens de MercadoPago se han guardado correctamente",
        variant: "default",
      });

      // Limpiar el campo de access token por seguridad
      setFormData((prev) => ({ ...prev, mpAccessToken: "" }));
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración de MercadoPago",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Configuración de MercadoPago</CardTitle>
        <CardDescription>
          Configura las credenciales de MercadoPago para este complejo. Cada complejo puede tener su
          propia cuenta de MercadoPago.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Access Token */}
          <div className="space-y-2">
            <Label htmlFor="mpAccessToken">
              Access Token <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="mpAccessToken"
                type={showAccessToken ? "text" : "password"}
                placeholder={
                  initialConfig?.hasAccessToken
                    ? "••••••••••••••••••••••••••"
                    : "APP_USR-1234567890-123456-..."
                }
                value={formData.mpAccessToken}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mpAccessToken: e.target.value }))
                }
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowAccessToken(!showAccessToken)}
              >
                {showAccessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Token de acceso de MercadoPago. Lo encuentras en tu{" "}
              <a
                href="https://www.mercadopago.com.ar/developers/panel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Panel de Desarrolladores
              </a>
            </p>
            {initialConfig?.hasAccessToken && (
              <p className="text-sm text-green-600">
                ✓ Ya hay un Access Token configurado. Déjalo en blanco para mantenerlo.
              </p>
            )}
          </div>

          {/* Public Key */}
          <div className="space-y-2">
            <Label htmlFor="mpPublicKey">Public Key</Label>
            <div className="relative">
              <Input
                id="mpPublicKey"
                type={showPublicKey ? "text" : "password"}
                placeholder="APP_USR-1234567890-123456-..."
                value={formData.mpPublicKey}
                onChange={(e) => setFormData((prev) => ({ ...prev, mpPublicKey: e.target.value }))}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPublicKey(!showPublicKey)}
              >
                {showPublicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-gray-500">Public Key para pagos del frontend (opcional)</p>
          </div>

          {/* Integrator ID */}
          <div className="space-y-2">
            <Label htmlFor="mpIntegratorId">Integrator ID</Label>
            <Input
              id="mpIntegratorId"
              type="text"
              placeholder="dev_24c65fb163bf11ea96500242ac130004"
              value={formData.mpIntegratorId}
              onChange={(e) => setFormData((prev) => ({ ...prev, mpIntegratorId: e.target.value }))}
            />
            <p className="text-sm text-gray-500">
              ID del integrador (opcional). Solo si eres partner de MercadoPago.
            </p>
          </div>

          {/* Botón de Guardar */}
          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={loading} className="min-w-32">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>

          {/* Información de seguridad */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">
              ⚠️ Información de Seguridad
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Nunca compartas tus credenciales de MercadoPago</li>
              <li>Los tokens se almacenan de forma segura en la base de datos</li>
              <li>Solo usuarios administradores pueden ver y modificar esta configuración</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
