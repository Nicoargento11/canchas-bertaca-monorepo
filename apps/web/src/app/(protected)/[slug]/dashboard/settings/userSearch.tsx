"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendDataUser, User } from "@/services/user/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface UserSearchProps {
  users: User[];
  onSelectUser: (user: User) => void;
  onCreateUser: (user: SendDataUser) => Promise<void>;
  isLoading?: boolean;
}

const UserSearch = ({ users, onSelectUser, onCreateUser, isLoading }: UserSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(term.toLowerCase()) ||
          user.email.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    onSelectUser(user);
    setSearchTerm("");
    setFilteredUsers([]);
  };

  const validateUser = (): boolean => {
    if (!newUser.name.trim()) {
      toast.error("El nombre es requerido");
      return false;
    }

    if (!newUser.email.trim()) {
      toast.error("El email es requerido");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      toast.error("Ingrese un email válido");
      return false;
    }

    if (!newUser.password || newUser.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (users.some((u) => u.email === newUser.email)) {
      toast.error("Ya existe un usuario con este email");
      return false;
    }

    return true;
  };

  const handleCreateUser = async () => {
    if (!validateUser()) return;

    setIsCreatingUser(true);
    try {
      await onCreateUser(newUser);
      setNewUser({ name: "", email: "", password: "" });
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Error al crear el usuario");
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          placeholder="Buscar usuario por nombre o email"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={!!selectedUser || isLoading}
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          </div>
        )}
      </div>

      {filteredUsers.length > 0 && (
        <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto shadow-sm bg-white scrollbar-custom">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
              onClick={() => handleSelectUser(user)}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">{user.name}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchTerm && filteredUsers.length === 0 && (
        <div className="text-gray-500 text-sm py-2">No se encontraron usuarios</div>
      )}

      {selectedUser ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-3 rounded-md border border-gray-200 gap-2">
          <div>
            <p className="text-sm font-medium text-gray-800">{selectedUser.name}</p>
            <p className="text-xs text-gray-500 break-all">{selectedUser.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedUser(null);
              onSelectUser(null as unknown as User);
            }}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto flex items-center justify-center gap-1 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Deseleccionar
          </Button>
        </div>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50"
              disabled={isLoading}
            >
              Crear nuevo usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-gray-800">Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  placeholder="Ej: Juan Pérez"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ej: usuario@ejemplo.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={isCreatingUser}
                className="bg-gray-800 hover:bg-gray-700"
              >
                {isCreatingUser ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Usuario"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <style jsx>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 4px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 4px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default UserSearch;
