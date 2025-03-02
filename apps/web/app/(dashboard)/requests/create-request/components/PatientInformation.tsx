import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { FormEvent } from "react";

interface PatientData {
  patientName: string;
  patientAge: number | string;
  patientGender: string;
}

interface PatientInformationProps {
  data: PatientData;
  setData: (data: Partial<PatientData>) => void;
}

export function PatientInformation({ data, setData }: PatientInformationProps) {
  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setData({ ...data, [name]: value });
  };

  const handleGenderChange = (value: string) => {
    setData({ ...data, patientGender: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="patientName">Nom/Numéro du patient</Label>
        <Input
          id="patientName"
          name="patientName"
          value={data.patientName}
          onChange={handleChange}
          placeholder="Entrez le nom ou numéro du patient"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="patientAge">Âge du patient</Label>
        <Input
          id="patientAge"
          name="patientAge"
          type="number"
          value={data.patientAge}
          onChange={handleChange}
          placeholder="Entrez l'âge du patient"
          min={0}
          max={120}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Sexe du patient</Label>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="male"
              name="patientGender"
              value="male"
              checked={data.patientGender === "male"}
              onChange={() => handleGenderChange("male")}
            />
            <Label htmlFor="male">Homme</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="female"
              name="patientGender"
              value="female"
              checked={data.patientGender === "female"}
              onChange={() => handleGenderChange("female")}
            />
            <Label htmlFor="female">Femme</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="other"
              name="patientGender"
              value="other"
              checked={data.patientGender === "other"}
              onChange={() => handleGenderChange("other")}
            />
            <Label htmlFor="other">Autre</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
