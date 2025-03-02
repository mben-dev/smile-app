import { Button } from "components/ui/button";
import { Label } from "components/ui/label";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useState } from "react";

interface FileData {
  files: Record<string, File[] | null>;
}

interface FileUploadProps {
  data: FileData;
  setData: (data: Partial<FileData>) => void;
}

export function FileUpload({ data, setData }: FileUploadProps) {
  const [filePreview, setFilePreview] = useState<Record<string, string[]>>({});

  const fileTypes = [
    {
      id: "radiography",
      label: "Radiographies (orthopantomogramme et clichés cephalomatriques)",
      required: false,
    },
    {
      id: "photos",
      label: "Photos (exobuccale et entrabuccal)",
      required: false,
    },
    {
      id: "scan",
      label: "Scan",
      required: true,
    },
  ];

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    fileType: string
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to array
    const fileArray = Array.from(files);

    // Update the files in the data
    setData({
      ...data,
      files: {
        ...data.files,
        [fileType]: fileArray,
      },
    });

    // Create preview URLs for the files
    const previewUrls = fileArray.map((file) => URL.createObjectURL(file));
    setFilePreview((prev) => ({
      ...prev,
      [fileType]: previewUrls,
    }));
  };

  const removeFile = (fileType: string, index: number) => {
    const currentFiles = data.files[fileType];
    if (!currentFiles) return;

    // Remove the file from data
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);

    setData({
      ...data,
      files: {
        ...data.files,
        [fileType]: newFiles.length > 0 ? newFiles : null,
      },
    });

    // Remove the preview
    if (filePreview[fileType] && filePreview[fileType][index]) {
      URL.revokeObjectURL(filePreview[fileType][index]);
      const newPreviews = [...filePreview[fileType]];
      newPreviews.splice(index, 1);

      setFilePreview((prev) => ({
        ...prev,
        [fileType]: newPreviews.length > 0 ? newPreviews : [],
      }));
    }
  };

  const renderFilePreview = (fileType: string) => {
    const files = data.files[fileType];
    const previews = filePreview[fileType];

    if (!files || !previews || files.length === 0) return null;

    return (
      <div className="mt-2 space-y-2">
        {files.map((file, index) => {
          const preview = previews[index];
          if (!preview) return null;

          // For images
          if (file.type.startsWith("image/")) {
            return (
              <div
                key={index}
                className="relative rounded-md overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="relative max-h-40 overflow-hidden">
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
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeFile(fileType, index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <p className="text-xs text-gray-500 mt-1 p-2">{file.name}</p>
              </div>
            );
          }

          // For other files
          return (
            <div
              key={index}
              className="flex items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
            >
              <div className="flex-1 truncate">{file.name}</div>
              <Button
                variant="destructive"
                size="icon"
                className="h-6 w-6 ml-2"
                onClick={() => removeFile(fileType, index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Veuillez télécharger les fichiers nécessaires pour la production des
        STL. Les formats acceptés sont: JPG, JPEG, PNG, PDF, STL et ZIP.
        <br />
        <span className="font-medium text-primary">
          Note: Seul le scan est obligatoire. Les radiographies et photos sont
          recommandées mais facultatives.
        </span>
      </p>

      {fileTypes.map((type) => (
        <div key={type.id} className="space-y-2">
          <Label htmlFor={type.id}>
            {type.label}{" "}
            {type.required && <span className="text-red-500">*</span>}
          </Label>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 text-center">
            <label
              htmlFor={type.id}
              className="flex flex-col items-center cursor-pointer"
            >
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">
                Cliquez pour sélectionner un ou plusieurs fichiers
              </span>
              <input
                id={type.id}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf,.stl,.zip"
                onChange={(e) => handleFileChange(e, type.id)}
                multiple
              />
            </label>
          </div>

          {renderFilePreview(type.id)}
        </div>
      ))}
    </div>
  );
}
