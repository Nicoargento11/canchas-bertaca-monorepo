"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, MapPin, Building2 } from "lucide-react";
import {
  getComplexes,
  createComplex,
  updateComplex,
  deleteComplex,
  type Complex,
} from "@/services/complex/complex-service";
import { getOrganizations, type Organization } from "@/services/organization/organization-service";
import { toast } from "sonner";

export default function ComplexesPage() {
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingComplex, setEditingComplex] = useState<Complex | null>(null);

  useEffect(() => {
    fetchComplexes();
    fetchOrganizations();
  }, []);

  const fetchComplexes = async () => {
    const result = await getComplexes();
    if (result.success && result.data) {
      setComplexes(result.data);
    } else {
      toast.error(result.error || "Error al cargar complejos");
    }
  };

  const fetchOrganizations = async () => {
    const result = await getOrganizations();
    if (result.success && result.data) {
      setOrganizations(result.data);
    } else {
      toast.error(result.error || "Error al cargar organizaciones");
    }
  };

  const handleCreate = () => {
    setEditingComplex(null);
    setShowModal(true);
  };

  const handleEdit = (complex: Complex) => {
    setEditingComplex(complex);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este complejo?")) return;

    const result = await deleteComplex(id);
    if (result.success) {
      toast.success("Complejo eliminado");
      fetchComplexes();
    } else {
      toast.error(result.error || "Error al eliminar complejo");
    }
  };

  const filteredComplexes = complexes.filter((complex) =>
    complex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Complejos</h1>
          <p className="text-sm text-muted-foreground">Gestiona los complejos deportivos</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Nuevo Complejo
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar complejos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        />
      </div>

      {/* Complexes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComplexes.map((complex) => (
          <div
            key={complex.id}
            className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{complex.name}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-1">{complex.address}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-muted-foreground text-sm">
                {complex.organization?.name || "Sin organización"}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Administradores
              </p>
              <div className="flex flex-wrap gap-2">
                {complex.managers && complex.managers.length > 0 ? (
                  complex.managers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-[10px] text-green-700 font-bold border border-green-200">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-700">{user.name}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    Sin administradores asignados
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-muted-foreground text-xs">
                {complex._count?.courts || 0} canchas
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(complex)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(complex.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <ComplexModal
          complex={editingComplex}
          organizations={organizations}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchComplexes();
          }}
        />
      )}
    </div>
  );
}

function ComplexModal({
  complex,
  organizations,
  onClose,
  onSuccess,
}: {
  complex: Complex | null;
  organizations: Organization[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: complex?.name || "",
    address: complex?.address || "",
    organizationId: complex?.organizationId || "",
    email: complex?.email || "",
    slug: complex?.slug || "",
    services: complex?.services?.join(", ") || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Transformar services de string a array y limpiar organizationId si está vacío
    const dataToSend: any = {
      ...formData,
      services: formData.services
        ? formData.services
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : [],
    };

    // Si organizationId está vacío, no lo enviamos
    if (!dataToSend.organizationId) {
      delete dataToSend.organizationId;
    }

    const result = complex
      ? await updateComplex(complex.id, dataToSend)
      : await createComplex(dataToSend);

    if (result.success) {
      toast.success(complex ? "Complejo actualizado" : "Complejo creado");
      onSuccess();
    } else {
      toast.error(result.error || "Error al guardar complejo");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-start sm:items-center justify-center p-4 sm:p-6">
        <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {complex ? "Editar Complejo" : "Nuevo Complejo"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-900 font-medium mb-2 block">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-900 font-medium mb-2 block">Dirección</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-900 font-medium mb-2 block">
                  Email <span className="text-muted-foreground text-sm">(opcional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contacto@complejo.com"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-900 font-medium mb-2 block">
                  Slug{" "}
                  <span className="text-muted-foreground text-sm">
                    (opcional, se genera automáticamente)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="complejo-deportivo-central"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-900 font-medium mb-2 block">
                Organización <span className="text-muted-foreground text-sm">(opcional)</span>
              </label>
              <select
                value={formData.organizationId}
                onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="">Sin organización</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-900 font-medium mb-2 block">
                Servicios{" "}
                <span className="text-muted-foreground text-sm">(separados por coma)</span>
              </label>
              <input
                type="text"
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                placeholder="vestuarios, cafetería, estacionamiento, quincho, parrilla, wifi"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold"
              >
                {complex ? "Guardar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
