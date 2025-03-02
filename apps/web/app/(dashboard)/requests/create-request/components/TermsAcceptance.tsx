import { Checkbox } from "components/ui/checkbox";
import { Label } from "components/ui/label";

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
