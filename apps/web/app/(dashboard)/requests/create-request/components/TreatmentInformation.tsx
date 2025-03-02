import { Label } from "components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { Textarea } from "components/ui/textarea";
import { FormEvent } from "react";

interface TreatmentData {
  treatmentType: string;
  notes: string;
}

interface TreatmentInformationProps {
  data: TreatmentData;
  setData: (data: Partial<TreatmentData>) => void;
}

export function TreatmentInformation({
  data,
  setData,
}: TreatmentInformationProps) {
  const handleChange = (e: FormEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.currentTarget;
    setData({ ...data, [name]: value });
  };

  const handleTreatmentTypeChange = (value: string) => {
    setData({ ...data, treatmentType: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="treatmentType">Type de traitement</Label>
        <Select
          value={data.treatmentType}
          onValueChange={handleTreatmentTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un type de traitement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expansion">Expansion</SelectItem>
            <SelectItem value="extraction">Extraction</SelectItem>
            <SelectItem value="CI 1">CI 1</SelectItem>
            <SelectItem value="CI 2">CI 2</SelectItem>
            <SelectItem value="CI 3">CI 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes ou particularités</Label>
        <Textarea
          id="notes"
          name="notes"
          value={data.notes || ""}
          onChange={handleChange}
          placeholder="Entrez toute information supplémentaire pertinente pour le traitement"
          rows={5}
        />
      </div>
    </div>
  );
}
