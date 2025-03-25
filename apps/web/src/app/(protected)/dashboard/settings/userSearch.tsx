"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendDataUser, User } from "@/services/users/users"; // Asegúrate de tener la interfaz User definida
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Importa componentes de diálogo/modal

interface UserSearchProps {
  users: User[]; // Lista de usuarios existentes
  onSelectUser: (user: User) => void; // Callback al seleccionar un usuario
  onCreateUser: (user: SendDataUser) => void; // Callback al crear un nuevo usuario
}

const UserSearch = ({ users, onSelectUser, onCreateUser }: UserSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Estado para controlar el diálogo
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });

  // Filtrar usuarios según el término de búsqueda
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  };

  // Seleccionar un usuario de la lista
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    onSelectUser(user);
    setSearchTerm(""); // Limpiar el campo de búsqueda
    setFilteredUsers([]); // Ocultar la lista de usuarios filtrados
  };

  // Crear un nuevo usuario
  const handleCreateUser = () => {
    if (newUser.name && newUser.email && newUser.password) {
      onCreateUser(newUser);
      setNewUser({ name: "", email: "", password: "" });
      setSearchTerm(""); // Limpiar el campo de búsqueda
      setIsDialogOpen(false); // Cerrar el diálogo
    }
  };

  return (
    <div className="space-y-4">
      {/* Campo de búsqueda */}
      <Input
        placeholder="Buscar usuario por nombre"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* Lista de usuarios filtrados */}
      {filteredUsers.length > 0 && (
        <div className="border border-blue-200 rounded-lg p-1 max-h-40 overflow-y-auto shadow-md bg-white">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="p-3 hover:bg-blue-50 cursor-pointer rounded-lg transition-all duration-200 ease-in-out border-b border-blue-100 last:border-b-0"
              onClick={() => handleSelectUser(user)}
            >
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-blue-900">
                  {user.name}
                </span>
                <span className="text-xs text-blue-600">{user.email}</span>
              </div>
            </div>
          ))}
          {/* Estilos personalizados para la barra de desplazamiento */}
          <style>
            {`
      .scrollbar-custom::-webkit-scrollbar {
        width: 6px;
      }
      .scrollbar-custom::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }
      .scrollbar-custom::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      .scrollbar-custom::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `}
          </style>
        </div>
      )}

      {/* Mensaje si no se encuentran usuarios */}
      {searchTerm && filteredUsers.length === 0 && (
        <div className="text-gray-500">No se encontraron usuarios.</div>
      )}

      {/* Badge del usuario seleccionado */}
      {selectedUser && (
        <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg border border-blue-200">
          <span className="text-sm text-blue-800">
            Usuario seleccionado:{" "}
            <span className="font-semibold">{selectedUser.name}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedUser(null)}
            className="text-red-500 hover:text-red-600"
          >
            Eliminar
          </Button>
        </div>
      )}

      {/* Botón para crear un nuevo usuario (siempre visible) */}
      {!selectedUser && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-Complementary hover:bg-Accent-1 w-full"
            >
              Agregar usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nuevo usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nombre del usuario"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
              />
              <Input
                placeholder="Email del usuario"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
              <Input
                type="password"
                placeholder="Contraseña"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateUser}
                  className="bg-Complementary hover:bg-Accent-1"
                >
                  Guardar usuario
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserSearch;
