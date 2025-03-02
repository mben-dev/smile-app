"use client";

import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { Label } from "components/ui/label";
import api from "lib/api";
import { CheckCircle, Download, MoveLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

interface RequestFile {
  id: number;
  fileName: string;
  fileType: string;
  url: string;
  createdAt: string;
}

interface Request {
  id: number;
  patientName: string;
  patientAge: number;
  patientGender: string;
  treatmentType: string;
  status: string;
  notes: string | null;
  termsAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  files: RequestFile[];
  userName?: string;
  userEmail?: string;
}

function RequestDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        // Fetch request details
        const response = await api.get(`/requests/${id}`);
        setRequest(response.data);

        // Check if user is admin
        const userResponse = await api.get("auth/me");
        setIsAdmin(userResponse.data.isAdmin);
      } catch (error) {
        console.error("Error fetching request details:", error);
        toast.error("Erreur lors du chargement des détails de la demande");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier l'extension du fichier
    const fileName = file.name;
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

    if (!fileExtension || !["stl", "zip"].includes(fileExtension)) {
      toast.error("Format de fichier non valide. Formats acceptés: STL, ZIP");
      return;
    }

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("stl", file);

    try {
      await api.post(`/requests/${id}/final-stl`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Fichier STL téléchargé avec succès");
      // Refresh request data
      const updatedResponse = await api.get(`/requests/${id}`);
      setRequest(updatedResponse.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erreur lors du téléchargement du fichier");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmitFeedback = async (approved: boolean) => {
    if (!feedback && !approved) {
      toast.error("Veuillez fournir un retour pour demander des modifications");
      return;
    }

    setSubmittingFeedback(true);
    try {
      await api.post(`/requests/${id}/feedback`, {
        feedback,
        approved,
      });

      toast.success(
        approved
          ? "STL approuvé avec succès"
          : "Demande de modifications envoyée avec succès"
      );

      // Refresh request data
      const updatedResponse = await api.get(`/requests/${id}`);
      setRequest(updatedResponse.data);
      setFeedback("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Erreur lors de l'envoi du retour");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleDownloadStl = async () => {
    try {
      const response = await api.get(`/requests/${id}/stl`);
      // Open the download URL in a new tab
      window.open(response.data.url, "_blank");
    } catch (error) {
      console.error("Error downloading STL:", error);
      toast.error("Erreur lors du téléchargement du STL");
    }
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

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "male":
        return "Homme";
      case "female":
        return "Femme";
      case "other":
        return "Autre";
      default:
        return gender;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Demande non trouvée</h2>
          <p className="mb-4">La demande que vous recherchez n'existe pas.</p>
          <Link href="/requests">
            <Button>Retour à la liste des demandes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <div>
        <Link href="/requests">
          <Button variant="ghost">
            <MoveLeft /> Retour
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Demande #{request.id} - {request.patientName}
        </h1>
        <div>{getStatusBadge(request.status)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Informations du patient */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du patient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom du patient</Label>
              <div className="font-medium">{request.patientName}</div>
            </div>
            <div>
              <Label>Âge</Label>
              <div className="font-medium">{request.patientAge} ans</div>
            </div>
            <div>
              <Label>Sexe</Label>
              <div className="font-medium">
                {getGenderLabel(request.patientGender)}
              </div>
            </div>
            <div>
              <Label>Type de traitement</Label>
              <div className="font-medium">{request.treatmentType}</div>
            </div>
            {request.notes && (
              <div>
                <Label>Notes</Label>
                <div className="font-medium whitespace-pre-wrap">
                  {request.notes}
                </div>
              </div>
            )}
            {isAdmin && request.userName && (
              <div>
                <Label>Créé par</Label>
                <div className="font-medium">
                  {request.userName} ({request.userEmail})
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fichiers */}
        <Card>
          <CardHeader>
            <CardTitle>Fichiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {request.files.length === 0 ? (
                <div className="text-muted-foreground">
                  Aucun fichier disponible
                </div>
              ) : (
                request.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {file.fileType === "radiography" && "Radiographie"}
                        {file.fileType === "photos" && "Photos"}
                        {file.fileType === "scan" && "Scan"}
                        {file.fileType === "stl" && "STL"}
                        {file.fileType === "final" && "STL Final"}
                      </div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {file.fileName}
                      </div>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" /> Voir
                      </Button>
                    </a>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Admin - Upload STL */}
      {isAdmin && request.status === "in_progress" && (
        <Card>
          <CardHeader>
            <CardTitle>Télécharger le STL final</CardTitle>
            <CardDescription>
              Téléchargez le fichier STL final pour que le client puisse le
              valider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 text-center">
              <label
                htmlFor="stl-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">
                  Cliquez pour sélectionner un fichier STL
                </span>
                <input
                  id="stl-upload"
                  type="file"
                  className="hidden"
                  accept=".stl,.zip"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                />
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Formats acceptés: STL, ZIP. Taille maximale: 50MB
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Section Client - Validation STL */}
      {!isAdmin && request.status === "to_validate" && (
        <Card>
          <CardHeader>
            <CardTitle>Validation du STL</CardTitle>
            <CardDescription>
              Veuillez examiner le STL et fournir votre retour
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="feedback">Commentaires</Label>
              <textarea
                id="feedback"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Vos commentaires ou demandes de modifications..."
                value={feedback}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setFeedback(e.target.value)
                }
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => handleSubmitFeedback(false)}
              disabled={submittingFeedback}
            >
              <X className="h-4 w-4 mr-1" /> Demander des modifications
            </Button>
            <Button
              onClick={() => handleSubmitFeedback(true)}
              disabled={submittingFeedback}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Approuver
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Section Client - Téléchargement STL final */}
      {request.status === "done" && (
        <Card>
          <CardHeader>
            <CardTitle>Télécharger le STL final</CardTitle>
            <CardDescription>
              Votre STL est prêt à être téléchargé
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleDownloadStl} size="lg">
              <Download className="h-5 w-5 mr-2" /> Télécharger le STL
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function RequestDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          Chargement...
        </div>
      }
    >
      <RequestDetail />
    </Suspense>
  );
}
