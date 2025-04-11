import React, { useState } from 'react';
import { Attachment, attachmentsApi } from '@/lib/api';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Image, Music, File, Trash2, Eye } from 'lucide-react';

interface AttachmentListProps {
  attachments: Attachment[];
  onUpload: (file: File, description?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  title?: string;
  emptyMessage?: string;
}

export function AttachmentList({
  attachments,
  onUpload,
  onDelete,
  title = 'Pièces jointes',
  emptyMessage = 'Aucune pièce jointe disponible',
}: AttachmentListProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await onUpload(selectedFile, description || undefined);
      setSelectedFile(null);
      setDescription('');
      toast.success('Fichier téléchargé avec succès');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Échec du téléchargement du fichier');
    } finally {
      setUploading(false);
    }
  };

  // Handle file delete
  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await onDelete(id);
      toast.success('Fichier supprimé avec succès');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Échec de la suppression du fichier');
    } finally {
      setDeleting(null);
    }
  };

  // Get icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'AUDIO':
        return <Music className="h-5 w-5 text-purple-500" />;
      case 'IMAGE':
        return <Image className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>

      {/* File upload section */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-medium mb-3">Télécharger un nouveau fichier</h4>
        <div className="space-y-4">
          <FileUpload
            onFileSelect={(file) => setSelectedFile(file)}
            onFileRemove={() => setSelectedFile(null)}
            selectedFile={selectedFile}
            label="Sélectionner un fichier à télécharger"
          />
          
          {selectedFile && (
            <>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description (optionnel)
                </label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Entrez une description pour ce fichier"
                />
              </div>
              
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? 'Téléchargement...' : 'Télécharger le fichier'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Attachments list */}
      <div>
        <h4 className="text-sm font-medium mb-3">Fichiers téléchargés</h4>
        
        {attachments.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-gray-50">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(attachment.fileType)}
                  <div>
                    <p className="font-medium text-sm">{attachment.fileName}</p>
                    <div className="flex space-x-3 text-xs text-gray-500">
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      <span>
                        {new Date(attachment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {attachment.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {attachment.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Instead of trying to preview directly, offer a download
                      const downloadUrl = attachmentsApi.getDownloadUrl(attachment.id);
                      
                      // Create a temporary anchor element to trigger download
                      const a = document.createElement('a');
                      a.href = downloadUrl;
                      a.download = attachment.fileName; // Suggest filename to browser
                      a.style.display = 'none';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      
                      toast.success('Téléchargement du fichier en cours...');
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(attachment.id)}
                    disabled={deleting === attachment.id}
                  >
                    <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                    {deleting === attachment.id ? 'Suppression...' : 'Supprimer'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
