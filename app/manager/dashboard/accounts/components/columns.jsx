"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Mail,
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Check,
  X,
  Store
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Function to get role badge class
function getRoleBadgeClass(role) {
  switch (role) {
    case 'ADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'MANAGER': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'SUPPORT': return 'bg-green-100 text-green-800 border-green-200';
    case 'SELLER': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'CUSTOMER': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Function to get status badge class
function getStatusBadgeClass(status) {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'SUSPENDED': return 'bg-red-100 text-red-800 border-red-200';
    case 'INACTIVE': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Function to get status icon
function getStatusIcon(status) {
  switch (status) {
    case 'ACTIVE': return <Check className="h-4 w-4 mr-1" />;
    case 'PENDING': return <Calendar className="h-4 w-4 mr-1" />;
    case 'SUSPENDED': return <ShieldAlert className="h-4 w-4 mr-1" />;
    case 'INACTIVE': return <X className="h-4 w-4 mr-1" />;
    default: return null;
  }
}

// Function to get role label
function getRoleLabel(role) {
  switch (role) {
    case 'ADMIN': return 'Administrateur';
    case 'MANAGER': return 'Manager';
    case 'SUPPORT': return 'Support';
    case 'SELLER': return 'Vendeur';
    case 'CUSTOMER': return 'Client';
    default: return role;
  }
}

// Function to get status label
function getStatusLabel(status) {
  switch (status) {
    case 'ACTIVE': return 'Actif';
    case 'PENDING': return 'En attente';
    case 'SUSPENDED': return 'Suspendu';
    case 'INACTIVE': return 'Inactif';
    default: return status;
  }
}

// Factory function to create columns with action handlers
export function createColumns({ onView, onActivate, onSuspend, onSendEmail }) {
  return [
    {
      accessorKey: "name",
      header: "Utilisateur",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="bg-orange-100 text-orange-800">
                {user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Rôle",
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <Badge className={getRoleBadgeClass(role)}>
            {getRoleLabel(role)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={getStatusBadgeClass(status)}>
            <div className="flex items-center">
              {getStatusIcon(status)}
              {getStatusLabel(status)}
            </div>
          </Badge>
        );
      },
    },
    {
      accessorKey: "store",
      header: "Magasin",
      cell: ({ row }) => {
        const store = row.original.store;
        if (!store) return <span className="text-gray-500">-</span>;
        
        return (
          <div className="flex items-center">
            <Store className="h-4 w-4 mr-2 text-orange-500" />
            <span>{store.name}</span>
            {store.isApproved ? (
              <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">Approuvé</Badge>
            ) : (
              <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date de création",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('fr-FR'),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        const isActive = user.status === 'ACTIVE';
        
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-500 hover:text-blue-700"
              onClick={() => onView?.(user.id)}
              title="Voir les détails"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-indigo-500 hover:text-indigo-700"
              onClick={() => onSendEmail?.(user.id, user.email)}
              title="Envoyer un email"
            >
              <Mail className="h-4 w-4" />
            </Button>
            
            {isActive ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700"
                onClick={() => onSuspend?.(user.id)}
                title="Suspendre l'utilisateur"
              >
                <UserX className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-green-500 hover:text-green-700"
                onClick={() => onActivate?.(user.id)}
                title="Activer l'utilisateur"
              >
                <UserCheck className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];
} 