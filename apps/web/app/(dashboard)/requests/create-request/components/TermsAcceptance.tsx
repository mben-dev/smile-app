import { Alert, AlertDescription, AlertTitle } from "components/ui/alert";
import { Checkbox } from "components/ui/checkbox";
import { Label } from "components/ui/label";
import { InfoIcon } from "lucide-react";

interface TermsData {
  termsAccepted: boolean;
}

interface TermsAcceptanceProps {
  data: TermsData;
  setData: (data: Partial<TermsData>) => void;
}

export function TermsAcceptance({ data, setData }: TermsAcceptanceProps) {
  const handleChange = (checked: boolean) => {
    setData({ ...data, termsAccepted: checked });
  };

  return (
    <div className="space-y-6">
      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Informations importantes</AlertTitle>
        <AlertDescription className="text-sm mt-2">
          <p className="mb-2">
            Pour optimiser la précision et l&apos;efficacité de votre plan de
            traitement, vous avez la possibilité de fournir des fichiers
            complémentaires (radiographies dentaires, photos intra-orales et
            faciales) ainsi que d&apos;indiquer vos préférences concernant le
            type de plan de traitement souhaité et toute prescription
            spécifique.
          </p>
          <p className="mb-2">
            Bien que facultatives, ces informations sont vivement recommandées.
            Les fichiers complémentaires permettent d&apos;affiner
            l&apos;analyse de votre situation dentaire, réduisant ainsi les
            imprécisions potentielles des scans numériques. De même, une
            prescription détaillée facilite l&apos;adaptation du traitement à
            vos attentes et besoins cliniques.
          </p>
          <p className="mb-2">
            En l&apos;absence de ces éléments, le plan de traitement sera
            élaboré uniquement sur la base des données disponibles. Le
            technicien se réserve alors le droit de définir le traitement selon
            son expertise et son évaluation professionnelle.
          </p>
          <p>
            En validant votre demande sans fournir ces informations, vous
            acceptez que le technicien prenne les décisions nécessaires pour
            optimiser votre traitement.
          </p>
        </AlertDescription>
      </Alert>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p className="mb-4">
          En acceptant ces conditions, vous reconnaissez que :
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-6">
          <li>
            Les STL produits sont basés sur les informations que vous fournissez
            et peuvent nécessiter des ajustements.
          </li>
          <li>
            Vous êtes responsable de vérifier l&apos;adéquation des STL fournis
            avant leur utilisation clinique.
          </li>
          <li>
            Les délais de production peuvent varier en fonction de la complexité
            du cas et du volume de demandes.
          </li>
          <li>
            Toutes les données patients transmises sont traitées conformément
            aux réglementations en vigueur sur la protection des données.
          </li>
          <li>
            Les fichiers STL fournis sont destinés à un usage unique pour le
            patient spécifié dans la demande.
          </li>
        </ul>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="termsAccepted"
          checked={data.termsAccepted}
          onCheckedChange={handleChange}
        />
        <Label
          htmlFor="termsAccepted"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          J&apos;accepte les conditions d&apos;utilisation et de traitement des
          données
        </Label>
      </div>
    </div>
  );
}
