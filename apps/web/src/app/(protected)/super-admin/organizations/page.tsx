"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Building2 } from "lucide-react";
import {
  getOrganizations,
  deleteOrganization,
  createOrganization,
  updateOrganization,
  type Organization,
} from "@/services/organization/organization-service";
import { toast } from "sonner";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    const result = await getOrganizations();
    if (result.success && result.data) {
      setOrganizations(result.data);
    } else {
      toast.error(result.error || "Error al cargar organizaciones");
    }
  };

  const handleCreate = () => {
    setEditingOrg(null);
    setShowModal(true);
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta organización?")) return;

    const result = await deleteOrganization(id);
    if (result.success) {
      toast.success("Organización eliminada");
      fetchOrganizations();
    } else {
      toast.error(result.error || "Error al eliminar organización");
    }
  };

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Organizaciones</h1>
          <p className="text-sm text-muted-foreground">Gestiona las organizaciones del sistema</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Nueva Organización
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar organizaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        />
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map((org) => (
          <div
            key={org.id}
            className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{org.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {org._count?.complexes || 0} complejos
                  </p>
                </div>
              </div>
            </div>

            {org.description && (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{org.description}</p>
            )}

            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Administradores
              </p>
              <div className="flex flex-wrap gap-2">
                {org.users &&
                org.users.filter((u) => u.role === "ORGANIZACION_ADMIN").length > 0 ? (
                  org.users
                    .filter((u) => u.role === "ORGANIZACION_ADMIN")
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200"
                      >
                        <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-[10px] text-blue-700 font-bold border border-blue-200">
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
                {org._count?.users || 0} usuarios
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(org)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(org.id)}
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
        <OrganizationModal
          organization={editingOrg}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchOrganizations();
          }}
        />
      )}
    </div>
  );
}

function OrganizationModal({
  organization,
  onClose,
  onSuccess,
}: {
  organization: Organization | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    description: organization?.description || "",
    type: organization?.type || "CLUB",
    logo: organization?.logo || "",
    website: organization?.website || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = organization
      ? await updateOrganization(organization.id, formData)
      : await createOrganization(formData);

    if (result.success) {
      toast.success(organization ? "Organización actualizada" : "Organización creada");
      onSuccess();
    } else {
      toast.error(result.error || "Error al guardar organización");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-start sm:items-center justify-center p-4 sm:p-6">
        <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {organization ? "Editar Organización" : "Nueva Organización"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="text-gray-900 font-medium mb-2 block">
                Descripción <span className="text-muted-foreground text-sm">(opcional)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe tu organización..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-900 font-medium mb-2 block">Tipo</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  <option value="CLUB">Club</option>
                  <option value="EMPRESA">Empresa</option>
                  <option value="MUNICIPALIDAD">Municipalidad</option>
                  <option value="PARTICULAR">Particular</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              <div>
                <label className="text-gray-900 font-medium mb-2 block">
                  Logo <span className="text-muted-foreground text-sm">(URL, opcional)</span>
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://ejemplo.com/logo.png"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-900 font-medium mb-2 block">
                  Sitio Web <span className="text-muted-foreground text-sm">(opcional)</span>
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.tuorganizacion.com"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
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
                {organization ? "Guardar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
