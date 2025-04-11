/* eslint-disable */
import React, { useCallback, useState } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, File, Image, Music } from 'lucide-react';

// Mock useDropzone since react-dropzone is not installed
  const useDropzone = ({ onDrop, accept, maxSize, multiple, onDropRejected }: any) => {
    // Create a ref for the file input
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onDrop(files);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onDrop(Array.from(e.target.files));
      }
    };
    
    // Function to open file dialog
    const openFileDialog = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    return {
      getRootProps: () => ({
        onDrop: handleDrop,
        onDragOver: (e: React.DragEvent<HTMLDivElement>) => e.preventDefault(),
        openFileDialog, // Include the function in the returned object
      }),
      getInputProps: () => ({
        ref: fileInputRef,
        onChange: handleChange,
        type: 'file',
        accept: Object.entries(accept || {})
          .map(([type, exts]) => (exts as string[]).join(','))
          .join(','),
        multiple,
        style: { display: 'none' }, // Hide the input
      }),
      isDragActive: false,
    };
  };

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
  label?: string;
  description?: string;
  error?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  accept = {
    'application/pdf': ['.pdf'],
    'audio/*': ['.mp3', '.wav', '.ogg'],
    'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  label = 'Télécharger un fichier',
  description = 'Glissez et déposez un fichier ici, ou cliquez pour sélectionner un fichier',
  error,
}: FileUploadProps) {
  const [fileError, setFileError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFileError(null);
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    onDropRejected: (rejections: any) => {
      if (rejections.length > 0) {
        const { code } = rejections[0].errors[0];
        if (code === 'file-too-large') {
          setFileError(`Le fichier est trop volumineux. La taille maximale est de ${maxSize / (1024 * 1024)}MB`);
        } else if (code === 'file-invalid-type') {
          setFileError('Type de fichier invalide. Veuillez télécharger un fichier PDF, audio ou image.');
        } else {
          setFileError('Erreur lors du téléchargement du fichier. Veuillez réessayer.');
        }
      }
    },
  });

  // Get file icon based on type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('application/pdf')) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    } else if (file.type.startsWith('audio/')) {
      return <Music className="h-8 w-8 text-purple-500" />;
    } else if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-green-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  // Format file size
  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} bytes`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <div className="text-sm font-medium">{label}</div>}
      
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary/50',
            error || fileError ? 'border-red-500 bg-red-50' : ''
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="text-sm font-medium">{description}</p>
            <p className="text-xs text-gray-500">
              Fichiers PDF, audio et image jusqu'à {maxSize / (1024 * 1024)}MB
            </p>
            <Button 
              type="button" 
              variant="secondary" 
              size="sm"
              onClick={() => {
                const rootProps = getRootProps();
                // Call the openFileDialog function directly from rootProps
                rootProps.openFileDialog();
              }}
            >
              Sélectionner un fichier
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(selectedFile)}
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {onFileRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onFileRemove}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
      
      {(error || fileError) && (
        <p className="text-sm text-red-500">{error || fileError}</p>
      )}
    </div>
  );
}
