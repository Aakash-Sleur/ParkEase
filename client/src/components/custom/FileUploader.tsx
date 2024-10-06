import { useCallback, useState } from "react"
import { FileWithPath, useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { UploadIcon } from "lucide-react"

type FileUploadProps = {
    fieldChange: (files: File[]) => void;
    mediaUrl: string;
    setIsFileUploaded: (value: boolean) => void;
}

const FileUploader = ({ fieldChange, mediaUrl, setIsFileUploaded }: FileUploadProps) => {
    const [file, setFile] = useState<File[]>([])
    const [fileUrl, setFileUrl] = useState<string>(mediaUrl)
    const convertFileToUrl = (file: File) => URL.createObjectURL(file);

    const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => {
            setFile(acceptedFiles);
            fieldChange(acceptedFiles);
            setFileUrl(convertFileToUrl(acceptedFiles[0]));
            setIsFileUploaded(true);
        }, [file]
    );

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpeg", ".jpg", ".webp"]
        }
    })

    return (
        <div
            {...getRootProps()}
            className="flex flex-col items-center justify-center w-full transition-colors duration-200 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
            <input {...getInputProps()} className="hidden" />
            {
                fileUrl ? (
                    <div className="w-full p-4">
                        <img
                            src={fileUrl}
                            alt="Uploaded image"
                            className="object-cover w-full h-64 rounded-md shadow-md"
                        />
                        <p className="mt-4 text-sm text-center text-gray-500">
                            Click or drag photo to replace
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <UploadIcon className="w-12 h-12 mb-4 text-gray-400" />
                        <h3 className="mb-2 text-lg font-semibold text-gray-700">
                            Drag photo here
                        </h3>
                        <p className="mb-4 text-sm text-gray-500">
                            SVG, PNG, JPG (max. 800x400px)
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-2"
                        >
                            Select from computer
                        </Button>
                    </div>
                )
            }
        </div>
    )
}

export default FileUploader