import { Button } from "components/ui/button";
import { Label } from "components/ui/label";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useState } from "react";

interface FileData {
  files: Record<string, File | null>;
}

interface FileUploadProps {
  data: FileData;
  setData: (data: Partial<FileData>) => void;
}

export function FileUpload({ data, setData }: FileUploadProps) {
  const [filePreview, setFilePreview] = useState<Record<string, string>>({});

  const fileTypes = [
    {
      id: "radiography",
      label: "Radiographies (orthopantomogramme et clichés cephalomatriques)",
    },
    { id: "photos", label: "Photos (exobuccale et entrabuccal)" },
    { id: "scan", label: "Scan" },
  ];

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    fileType: string
  ) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      // Update the files in the data
      setData({
        ...data,
        files: {
          ...data.files,
          [fileType]: file,
        },
      });

      // Create a preview URL for the file
      const previewUrl = URL.createObjectURL(file);
      setFilePreview((prev) => ({
        ...prev,
        [fileType]: previewUrl,
      }));
    }
  };

  const removeFile = (fileType: string) => {
    // Remove the file from data
    const newFiles = { ...data.files };
    newFiles[fileType] = null;
    setData({
      ...data,
      files: newFiles,
    });

    // Remove the preview
    if (filePreview[fileType]) {
      URL.revokeObjectURL(filePreview[fileType]);
      const newPreviews = { ...filePreview };
      delete newPreviews[fileType];
      setFilePreview(newPreviews);
    }
  };

  const renderFilePreview = (fileType: string) => {
    const file = data.files[fileType];
    const preview = filePreview[fileType];

    if (!file || !preview) return null;

    // For images
    if (file.type.startsWith("image/")) {
      return (
        <div className="relative mt-2">
          <div className="relative max-h-40 rounded-md overflow-hidden">
            <Image
              src={preview}
              alt={file.name}
              width={200}
              height={150}
              className="object-contain"
              style={{ maxHeight: "160px" }}
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-0 right-0 h-6 w-6"
            onClick={() => removeFile(fileType)}
          >
            <X className="h-4 w-4" />
          </Button>
          <p className="text-xs text-gray-500 mt-1">{file.name}</p>
        </div>
      );
    }

    // For other files
    return (
      <div className="flex items-center mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
        <div className="flex-1 truncate">{file.name}</div>
        <Button
          variant="destructive"
          size="icon"
          className="h-6 w-6 ml-2"
          onClick={() => removeFile(fileType)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Veuillez télécharger les fichiers nécessaires pour la production des
        STL. Les formats acceptés sont: JPG, JPEG, PNG, PDF, STL et ZIP.
      </p>

      {fileTypes.map((type) => (
        <div key={type.id} className="space-y-2">
          <Label htmlFor={type.id}>{type.label}</Label>

          {!data.files[type.id] ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 text-center">
              <label
                htmlFor={type.id}
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">
                  Cliquez pour sélectionner un fichier
                </span>
                <input
                  id={type.id}
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf,.stl,.zip"
                  onChange={(e) => handleFileChange(e, type.id)}
                />
              </label>
            </div>
          ) : (
            renderFilePreview(type.id)
          )}
        </div>
      ))}
    </div>
  );
}
