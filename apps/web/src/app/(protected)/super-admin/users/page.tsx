"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, User as UserIcon, Shield, Mail } from "lucide-react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type User,
  type Role,
} from "@/services/user/user";
import { getOrganizations, type Organization } from "@/services/organization/organization-service";
import { getComplexes, type Complex } from "@/services/complex/complex-service";
import { toast } from "sonner";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchOrganizations();
    fetchComplexes();
  }, []);

  const fetchUsers = async () => {
    const result = await getUsers();
    if (result.success && result.data) {
      setUsers(result.data);
    } else {
      toast.error(result.error || "Error al cargar usuarios");
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

  const fetchComplexes = async () => {
    const result = await getComplexes();
    if (result.success && result.data) {
      setComplexes(result.data);
    } else {
      toast.error(result.error || "Error al cargar complejos");
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    const result = await deleteUser(id);
    if (result.success) {
      toast.success("Usuario eliminado");
      fetchUsers();
    } else {
      toast.error(result.error || "Error al eliminar usuario");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const badges = {
      SUPER_ADMIN: {
        label: "Super Admin",
        color: "bg-purple-50 text-purple-700 border-purple-200",
      },
      ORGANIZACION_ADMIN: {
        label: "Admin Org",
        color: "bg-blue-50 text-blue-700 border-blue-200",
      },
      COMPLEJO_ADMIN: {
        label: "Admin Complejo",
        color: "bg-cyan-50 text-cyan-700 border-cyan-200",
      },
      RECEPCION: {
        label: "Recepción",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      },
      COMMUNITY_MANAGER: {
        label: "Community Manager",
        color: "bg-pink-50 text-pink-700 border-pink-200",
      },
      USUARIO: {
        label: "Usuario",
        color: "bg-green-50 text-green-700 border-green-200",
      },
    };
    return badges[role as keyof typeof badges] || badges.USUARIO;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        >
          <option value="all">Todos los roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="ORGANIZACION_ADMIN">Admin Organización</option>
          <option value="COMPLEJO_ADMIN">Admin Complejo</option>
          <option value="COMMUNITY_MANAGER">Community Manager</option>
          <option value="RECEPCION">Recepción</option>
          <option value="USUARIO">Usuario</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-gray-600 font-semibold">Usuario</th>
                <th className="text-left px-6 py-4 text-gray-600 font-semibold">Email</th>
                <th className="text-left px-6 py-4 text-gray-600 font-semibold">Rol</th>
                <th className="text-left px-6 py-4 text-gray-600 font-semibold">Asignación</th>
                <th className="text-right px-6 py-4 text-gray-600 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const badge = getRoleBadge(user.role);
                return (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-gray-700" />
                        </div>
                        <span className="text-gray-900 font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="whitespace-nowrap">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {user.Organization && (
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            <Shield className="w-3 h-3 text-gray-400" />
                            <span className="truncate">Org: {user.Organization.name}</span>
                          </div>
                        )}
                        {user.Complex && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            <span className="truncate">Complejo: {user.Complex.name}</span>
                          </div>
                        )}
                        {!user.Organization && !user.Complex && (
                          <span className="text-muted-foreground text-xs italic">
                            Sin asignación
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <UserModal
          user={editingUser}
          organizations={organizations}
          complexes={complexes}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

function UserModal({
  user,
  organizations,
  complexes,
  onClose,
  onSuccess,
}: {
  user: User | null;
  organizations: Organization[];
  complexes: Complex[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "USUARIO",
    organizationId: user?.organizationId || "",
    complexId: user?.complexId || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = user ? { ...formData, password: formData.password || undefined } : formData;

    // Check if role is changing
    const roleChanged = user && formData.role !== user.role;

    const result = user ? await updateUser(user.id, payload) : await createUser(payload);

    if (result.success) {
      const successMessage = user ? "Usuario actualizado" : "Usuario creado";
      toast.success(successMessage);

      // Show refresh prompt if role changed
      if (roleChanged) {
        toast.info("El cambio de rol requiere recargar la página", {
          duration: 6000,
          action: {
            label: "Recargar ahora",
            onClick: () => window.location.reload(),
          },
        });
      }

      onSuccess();
    } else {
      toast.error(result.error || "Error al guardar usuario");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-start sm:items-center justify-center p-4 sm:p-6">
        <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-lg max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {user ? "Editar Usuario" : "Nuevo Usuario"}
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
              <label className="text-gray-900 font-medium mb-2 block">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>

            <div>
              <label className="text-gray-900 font-medium mb-2 block">
                Contraseña {user && "(dejar vacío para no cambiar)"}
              </label>
              <input
                type="password"
                required={!user}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>

            <div>
              <label className="text-gray-900 font-medium mb-2 block">Rol</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="USUARIO">Usuario</option>
                <option value="RECEPCION">Recepción</option>
                <option value="COMMUNITY_MANAGER">Community Manager</option>
                <option value="COMPLEJO_ADMIN">Admin Complejo</option>
                <option value="ORGANIZACION_ADMIN">Admin Organización</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="text-gray-900 font-medium mb-2 block">
                Organización (opcional)
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
              <label className="text-gray-900 font-medium mb-2 block">Complejo (opcional)</label>
              <select
                value={formData.complexId}
                onChange={(e) => setFormData({ ...formData, complexId: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="">Sin complejo</option>
                {complexes.map((complex) => (
                  <option key={complex.id} value={complex.id}>
                    {complex.name}
                  </option>
                ))}
              </select>
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
                {user ? "Guardar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
