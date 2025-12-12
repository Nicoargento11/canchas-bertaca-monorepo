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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Organizaciones</h1>
          <p className="text-slate-400">Gestiona las organizaciones del sistema</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary/50 transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Nueva Organización
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar organizaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl text-white placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all"
        />
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map((org) => (
          <div
            key={org.id}
            className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{org.name}</h3>
                  <p className="text-slate-400 text-sm">{org._count?.complexes || 0} complejos</p>
                </div>
              </div>
            </div>

            {org.description && (
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{org.description}</p>
            )}

            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
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
                        className="flex items-center gap-2 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700/50"
                      >
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 font-bold">
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
              <span className="text-slate-500 text-xs">{org._count?.users || 0} usuarios</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(org)}
                  className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(org.id)}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          {organization ? "Editar Organización" : "Nueva Organización"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="text-white font-medium mb-2 block">
              Descripción <span className="text-slate-500 text-sm">(opcional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Describe tu organización..."
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white font-medium mb-2 block">Tipo</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none"
              >
                <option value="CLUB">Club</option>
                <option value="EMPRESA">Empresa</option>
                <option value="MUNICIPALIDAD">Municipalidad</option>
                <option value="PARTICULAR">Particular</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">
                Logo <span className="text-slate-500 text-sm">(URL, opcional)</span>
              </label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">
                Sitio Web <span className="text-slate-500 text-sm">(opcional)</span>
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.tuorganizacion.com"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
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
              {organization ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
