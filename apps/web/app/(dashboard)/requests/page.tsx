"use client";

import { useAuth } from "app/providers/auth-provider";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import api from "lib/api";
import { Filter, Plus, Search, SortAsc, SortDesc, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Request {
  id: number;
  patientName: string;
  patientAge: number;
  patientGender: string;
  treatmentType: string;
  status: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
  userId?: number;
}

interface User {
  id: number;
  fullName: string;
  email: string;
}

function RequestsList() {
  const router = useRouter();
  const { authState, logout } = useAuth();
  const { user, isAuthenticated, isLoading } = authState;
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // États pour les filtres et le tri
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Charger les utilisateurs (pour les admins)
  useEffect(() => {
    const fetchUsers = async () => {
      if (isAdmin) {
        try {
          const response = await api.get("/users");
          // S'assurer que users est un tableau
          if (response.data.data && Array.isArray(response.data.data)) {
            setUsers(response.data.data);
          } else {
            console.error(
              "La réponse de l'API users n'est pas un tableau:",
              response.data
            );
            setUsers([]);
          }
        } catch (error) {
          console.error("Error fetching users:", error);
          setUsers([]);
        }
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Fonction pour charger les demandes avec filtres et tri
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      // Construire les paramètres de requête
      const params = new URLSearchParams();

      if (searchTerm) {
        params.append("patientName", searchTerm);
      }

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (isAdmin && userFilter && userFilter !== "all") {
        params.append("userId", userFilter);
      }

      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const response = await api.get(`/requests?${params.toString()}`);
      setRequests(response.data);

      // Vérifier si l'utilisateur est admin
      if (!isAdmin) {
        const userResponse = await api.get("auth/me");
        setIsAdmin(userResponse.data.isAdmin);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, userFilter, sortBy, sortOrder, isAdmin]);

  // Charger les demandes au chargement et quand les filtres changent
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Fonction pour effectuer la recherche
  const handleSearch = () => {
    fetchRequests();
  };

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setUserFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    fetchRequests();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "await_information":
        return <Badge variant="outline">En attente d&apos;informations</Badge>;
      case "in_progress":
        return <Badge variant="secondary">En cours</Badge>;
      case "to_validate":
        return <Badge className="bg-yellow-500">À valider</Badge>;
      case "ask_change":
        return <Badge variant="destructive">Modifications demandées</Badge>;
      case "done":
        return <Badge className="bg-green-500">Terminé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Fonction pour changer le tri
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Icône de tri pour les en-têtes de colonnes
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <SortAsc className="h-4 w-4 ml-1" />
    ) : (
      <SortDesc className="h-4 w-4 ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Demandes de traitement</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
          </Button>
          <Link href="/requests/create-request">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nouvelle demande
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Filtres et recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recherche par nom de patient */}
              <div className="space-y-2">
                <Label htmlFor="search">Recherche par nom/numéro patient</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher..."
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Filtre par statut */}
              <div className="space-y-2">
                <Label htmlFor="status">Filtrer par statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="await_information">
                      En attente d&apos;informations
                    </SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="to_validate">À valider</SelectItem>
                    <SelectItem value="ask_change">
                      Modifications demandées
                    </SelectItem>
                    <SelectItem value="done">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre par utilisateur (admin uniquement) */}
              {isAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="user">Filtrer par utilisateur</Label>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger id="user">
                      <SelectValue placeholder="Tous les utilisateurs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les utilisateurs</SelectItem>
                      {Array.isArray(users) &&
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex items-center"
              >
                <X className="h-4 w-4 mr-1" /> Réinitialiser les filtres
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Vos demandes</CardTitle>
          <CardDescription>
            {isAdmin
              ? "Liste de toutes les demandes de traitement"
              : "Liste de vos demandes de traitement"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">Chargement...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune demande trouvée.{" "}
              <Link href="/requests/create-request" className="underline">
                Créer une nouvelle demande
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => toggleSort("patientName")}
                  >
                    <div className="flex items-center">
                      Patient {getSortIcon("patientName")}
                    </div>
                  </TableHead>
                  {isAdmin && <TableHead>Créé par</TableHead>}
                  <TableHead>Type de traitement</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center">
                      Statut {getSortIcon("status")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => toggleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Date de création {getSortIcon("createdAt")}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.id}</TableCell>
                    <TableCell>
                      {request.patientName} ({request.patientAge} ans)
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {request.userName || "Utilisateur inconnu"}
                      </TableCell>
                    )}
                    <TableCell>{request.treatmentType}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/requests/${request.id}`}>
                        <Button variant="outline" size="sm">
                          Voir
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          Chargement...
        </div>
      }
    >
      <RequestsList />
    </Suspense>
  );
}
