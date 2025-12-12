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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Complejos</h1>
          <p className="text-slate-400">Gestiona los complejos deportivos</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary/50 transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Nuevo Complejo
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar complejos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl text-white placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all"
        />
      </div>

      {/* Complexes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComplexes.map((complex) => (
          <div
            key={complex.id}
            className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{complex.name}</h3>
                  <p className="text-slate-400 text-sm">{complex.address}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400 text-sm">
                {complex.organization?.name || "Sin organización"}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                Administradores
              </p>
              <div className="flex flex-wrap gap-2">
                {complex.managers && complex.managers.length > 0 ? (
                  complex.managers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700/50"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-[10px] text-green-400 font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-xs text-slate-300">{user.name}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-600 italic">
                    Sin administradores asignados
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
              <span className="text-slate-500 text-xs">{complex._count?.courts || 0} canchas</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(complex)}
                  className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(complex.id)}
                  className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          {complex ? "Editar Complejo" : "Nuevo Complejo"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white font-medium mb-2 block">Nombre</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">Dirección</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">
                Email <span className="text-slate-500 text-sm">(opcional)</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contacto@complejo.com"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">
                Slug{" "}
                <span className="text-slate-500 text-sm">
                  (opcional, se genera automáticamente)
                </span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="complejo-deportivo-central"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-white font-medium mb-2 block">
              Organización <span className="text-slate-500 text-sm">(opcional)</span>
            </label>
            <select
              value={formData.organizationId}
              onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none"
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
            <label className="text-white font-medium mb-2 block">
              Servicios <span className="text-slate-500 text-sm">(separados por coma)</span>
            </label>
            <input
              type="text"
              value={formData.services}
              onChange={(e) => setFormData({ ...formData, services: e.target.value })}
              placeholder="vestuarios, cafetería, estacionamiento, quincho, parrilla, wifi"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary/50 transition-all font-semibold"
            >
              {complex ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
