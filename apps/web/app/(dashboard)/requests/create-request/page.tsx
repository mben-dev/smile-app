"use client";
import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { Progress } from "components/ui/progress";
import api from "lib/api";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { FileUpload } from "./components/FileUpload";
import { PatientInformation } from "./components/PatientInformation";
import { TermsAcceptance } from "./components/TermsAcceptance";
import { TreatmentInformation } from "./components/TreatmentInformation";

// Composant qui utilise useSearchParams
function RequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const requestIdParam = searchParams.get("id");

  const [data, setData] = useState({
    patientName: "",
    patientAge: "" as string | number,
    patientGender: "",
    treatmentType: "",
    notes: "",
    termsAccepted: false,
    files: {} as Record<string, File | null>,
  });
  const [step, setStep] = useState(stepParam ? parseInt(stepParam) : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState<number | null>(
    requestIdParam ? parseInt(requestIdParam) : null
  );
  const [isLoading, setIsLoading] = useState(!!requestIdParam);

  // Fonctions de mise à jour spécifiques pour chaque type de composant
  const updatePatientData = (
    partialData: Partial<{
      patientName: string;
      patientAge: number | string;
      patientGender: string;
    }>
  ) => {
    setData((prevData) => ({
      ...prevData,
      ...partialData,
    }));
  };

  const updateTreatmentData = (
    partialData: Partial<{
      treatmentType: string;
      notes: string;
    }>
  ) => {
    setData((prevData) => ({
      ...prevData,
      ...partialData,
    }));
  };

  const updateFileData = (
    partialData: Partial<{
      files: Record<string, File | null>;
    }>
  ) => {
    setData((prevData) => ({
      ...prevData,
      ...partialData,
    }));
  };

  const updateTermsData = (
    partialData: Partial<{
      termsAccepted: boolean;
    }>
  ) => {
    setData((prevData) => ({
      ...prevData,
      ...partialData,
    }));
  };

  const steps = [
    {
      title: "Information du patient",
      component: PatientInformation,
      updateFn: updatePatientData,
    },
    {
      title: "Informations du traitement",
      component: TreatmentInformation,
      updateFn: updateTreatmentData,
    },
    {
      title: "Envoi des fichiers",
      component: FileUpload,
      updateFn: updateFileData,
    },
    {
      title: "Acceptation des clauses",
      component: TermsAcceptance,
      updateFn: updateTermsData,
    },
  ];

  // Charger les données de la demande si un ID est fourni
  useEffect(() => {
    if (requestId) {
      const fetchRequestData = async () => {
        setIsLoading(true);
        try {
          const response = await api.get(`/requests/${requestId}`);
          const requestData = response.data;

          // Mettre à jour les données du formulaire
          setData({
            patientName: requestData.patientName || "",
            patientAge: requestData.patientAge?.toString() || "",
            patientGender: requestData.patientGender || "",
            treatmentType: requestData.treatmentType || "",
            notes: requestData.notes || "",
            termsAccepted: requestData.termsAccepted || false,
            files: {} as Record<string, File | null>,
          });

          // Si des fichiers sont déjà présents, les marquer comme téléchargés
          if (requestData.files && requestData.files.length > 0) {
            const filesMap = {} as Record<string, File | null>;
            requestData.files.forEach((file: any) => {
              // Marquer le type de fichier comme "déjà téléchargé"
              // Nous ne pouvons pas récupérer le File original, mais nous pouvons marquer qu'il existe
              filesMap[file.fileType] = null;
            });
            setData((prev) => ({ ...prev, files: filesMap }));
          }
        } catch (error) {
          console.error("Error fetching request data:", error);
          toast.error("Erreur lors du chargement des données de la demande");
        } finally {
          setIsLoading(false);
        }
      };

      fetchRequestData();
    }
  }, [requestId]);

  // Mettre à jour l'URL lorsque l'étape ou l'ID change
  useEffect(() => {
    if (requestId) {
      const url = `/requests/create-request?id=${requestId}&step=${step}`;
      window.history.replaceState({}, "", url);
    }
  }, [step, requestId]);

  // Créer une demande initiale ou mettre à jour une demande existante
  const saveCurrentStep = async () => {
    setIsSubmitting(true);
    try {
      // Préparer les données à envoyer
      const requestData = {
        patientName: data.patientName,
        patientAge: Number(data.patientAge),
        patientGender: data.patientGender,
        treatmentType: data.treatmentType,
        notes: data.notes,
        termsAccepted: data.termsAccepted,
      };

      if (requestId) {
        // Mettre à jour la demande existante
        await api.put(`/requests/${requestId}`, requestData);
        toast.success("Étape sauvegardée avec succès");
      } else {
        // Créer une nouvelle demande
        const response = await api.post("/requests", requestData);
        const newRequestId = response.data.id;
        setRequestId(newRequestId);

        // Rediriger vers l'URL avec l'ID de la demande
        router.replace(
          `/requests/create-request?id=${newRequestId}&step=${step + 1}`
        );
        toast.success("Demande créée avec succès");
      }
    } catch (error) {
      console.error("Error saving request:", error);
      toast.error("Une erreur est survenue lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    // Validation pour chaque étape
    if (step === 0) {
      if (!data.patientName) {
        toast.error("Veuillez entrer le nom du patient");
        return;
      }
      if (!data.patientAge) {
        toast.error("Veuillez entrer l'âge du patient");
        return;
      }
      if (!data.patientGender) {
        toast.error("Veuillez sélectionner le sexe du patient");
        return;
      }

      // Sauvegarder la première étape et créer la demande
      await saveCurrentStep();
    } else if (step === 1) {
      if (!data.treatmentType) {
        toast.error("Veuillez sélectionner un type de traitement");
        return;
      }

      // Sauvegarder l'étape du traitement
      await saveCurrentStep();

      // Mettre à jour l'URL pour l'étape suivante
      if (requestId) {
        router.replace(
          `/requests/create-request?id=${requestId}&step=${step + 1}`
        );
      }
    } else if (step === 2) {
      // Validation des fichiers
      const requiredFileTypes = ["radiography", "photos", "scan"];
      const missingFiles = requiredFileTypes.filter(
        (type) => !data.files[type]
      );

      if (missingFiles.length > 0) {
        toast.error(
          `Veuillez télécharger tous les fichiers requis: ${missingFiles.join(", ")}`
        );
        return;
      }

      // Upload des fichiers
      if (requestId) {
        setIsSubmitting(true);
        try {
          const formData = new FormData();
          Object.entries(data.files).forEach(([key, file]) => {
            if (file) {
              formData.append(key, file);
            }
          });

          await api.post(`/requests/${requestId}/files`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          toast.success("Fichiers téléchargés avec succès");

          // Mettre à jour l'URL pour l'étape suivante
          router.replace(
            `/requests/create-request?id=${requestId}&step=${step + 1}`
          );
        } catch (error) {
          console.error("Error uploading files:", error);
          toast.error(
            "Une erreur est survenue lors du téléchargement des fichiers"
          );
          return;
        } finally {
          setIsSubmitting(false);
        }
      }
    } else if (step === 3) {
      if (!data.termsAccepted) {
        toast.error("Veuillez accepter les conditions d'utilisation");
        return;
      }

      // Finaliser la demande
      await saveCurrentStep();
      toast.success("Demande complétée avec succès");
      router.push(`/requests/${requestId}`);
      return;
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);

      // Mettre à jour l'URL pour l'étape précédente
      if (requestId) {
        router.replace(
          `/requests/create-request?id=${requestId}&step=${step - 1}`
        );
      }
    }
  };

  // Assurer que nous avons un composant valide pour l'étape actuelle
  const CurrentStepComponent = steps[step]?.component || PatientInformation;
  const currentUpdateFn = steps[step]?.updateFn || updatePatientData;
  const progressPercentage = ((step + 1) / steps.length) * 100;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <div>
        <Link href={requestId ? `/requests/${requestId}` : "/requests"}>
          <Button variant="ghost">
            <MoveLeft /> Retour
          </Button>
        </Link>
      </div>
      <div className="text-xl">
        {requestId
          ? "Modifier la demande #" + requestId
          : "Créer une demande de traitement"}
      </div>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {steps[step]?.title || "Information du patient"}
          </CardTitle>
          <Progress value={progressPercentage} className="w-full" />
          <div className="text-sm text-muted-foreground mt-2">
            Étape {step + 1} sur {steps.length}
          </div>
        </CardHeader>
        <CardContent>
          <CurrentStepComponent data={data} setData={currentUpdateFn} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={step === 0 || isSubmitting}
          >
            Précédent
          </Button>
          <Button onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting
              ? "Traitement en cours..."
              : step === steps.length - 1
                ? "Terminer"
                : "Suivant"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Composant principal qui enveloppe le formulaire avec Suspense
export default function CreateRequest() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          Chargement...
        </div>
      }
    >
      <RequestForm />
    </Suspense>
  );
}
