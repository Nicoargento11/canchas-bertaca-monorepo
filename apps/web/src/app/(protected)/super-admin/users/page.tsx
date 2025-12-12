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
        color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      },
      ORGANIZACION_ADMIN: {
        label: "Admin Org",
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      },
      COMPLEJO_ADMIN: {
        label: "Admin Complejo",
        color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      },
      RECEPCION: {
        label: "Recepción",
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      },
      USUARIO: {
        label: "Usuario",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
      },
    };
    return badges[role as keyof typeof badges] || badges.USUARIO;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Usuarios</h1>
          <p className="text-slate-400">Gestiona los usuarios del sistema</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary/50 transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl text-white placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all"
        >
          <option value="all">Todos los roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="ORGANIZACION_ADMIN">Admin Organización</option>
          <option value="COMPLEJO_ADMIN">Admin Complejo</option>
          <option value="RECEPCION">Recepción</option>
          <option value="USUARIO">Usuario</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-slate-700/50">
            <tr>
              <th className="text-left px-6 py-4 text-slate-300 font-semibold">Usuario</th>
              <th className="text-left px-6 py-4 text-slate-300 font-semibold">Email</th>
              <th className="text-left px-6 py-4 text-slate-300 font-semibold">Rol</th>
              <th className="text-left px-6 py-4 text-slate-300 font-semibold">Asignación</th>
              <th className="text-right px-6 py-4 text-slate-300 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const badge = getRoleBadge(user.role);
              return (
                <tr
                  key={user.id}
                  className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-all"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
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
                        <div className="flex items-center gap-1 text-sm text-slate-300">
                          <Shield className="w-3 h-3 text-blue-400" />
                          <span>Org: {user.Organization.name}</span>
                        </div>
                      )}
                      {user.Complex && (
                        <div className="flex items-center gap-1 text-sm text-slate-400">
                          <div className="w-3 h-3 rounded-full bg-green-500/50" />
                          <span>Complejo: {user.Complex.name}</span>
                        </div>
                      )}
                      {!user.Organization && !user.Complex && (
                        <span className="text-slate-500 text-xs italic">Sin asignación</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
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

    const result = user ? await updateUser(user.id, payload) : await createUser(payload);

    if (result.success) {
      toast.success(user ? "Usuario actualizado" : "Usuario creado");
      onSuccess();
    } else {
      toast.error(result.error || "Error al guardar usuario");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          {user ? "Editar Usuario" : "Nuevo Usuario"}
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
            <label className="text-white font-medium mb-2 block">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>

          <div>
            <label className="text-white font-medium mb-2 block">
              Contraseña {user && "(dejar vacío para no cambiar)"}
            </label>
            <input
              type="password"
              required={!user}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>

          <div>
            <label className="text-white font-medium mb-2 block">Rol</label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none"
            >
              <option value="USUARIO">Usuario</option>
              <option value="RECEPCION">Recepción</option>
              <option value="COMPLEJO_ADMIN">Admin Complejo</option>
              <option value="ORGANIZACION_ADMIN">Admin Organización</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="text-white font-medium mb-2 block">Organización (opcional)</label>
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
            <label className="text-white font-medium mb-2 block">Complejo (opcional)</label>
            <select
              value={formData.complexId}
              onChange={(e) => setFormData({ ...formData, complexId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none"
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
              className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary/50 transition-all font-semibold"
            >
              {user ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
