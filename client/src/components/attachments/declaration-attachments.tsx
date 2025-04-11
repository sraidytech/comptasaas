import React, { useState, useEffect } from 'react';
import { Attachment, attachmentsApi } from '@/lib/api';
import { AttachmentList } from './attachment-list';
import { useAsync } from '@/lib/hooks';
import { AlertCircle } from 'lucide-react';

interface DeclarationAttachmentsProps {
  declarationId: string;
}

export function DeclarationAttachments({ declarationId }: DeclarationAttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { execute: fetchAttachments, loading, error } = useAsync<Attachment[]>(
    () => attachmentsApi.getDeclarationAttachments(declarationId)
  );

  // Use a ref to track if we're currently fetching
  const isFetchingRef = React.useRef(false);

  useEffect(() => {
    // Fetch attachments whenever declarationId changes or component mounts
    // But only if we're not already fetching
    if (declarationId && !isFetchingRef.current) {
      isFetchingRef.current = true;
      fetchAttachments().then((data) => {
        if (data) {
          setAttachments(data);
        }
      }).catch((err) => {
        console.error('Error fetching attachments:', err);
        // Set empty attachments array to show empty state
        setAttachments([]);
      }).finally(() => {
        isFetchingRef.current = false;
      });
    }
  }, [declarationId]);

  // Handle file upload
  const handleUpload = async (file: File, description?: string) => {
    try {
      const newAttachment = await attachmentsApi.uploadAttachment({
        file,
        description,
        declarationId,
      });
      
      // Add the new attachment to the list
      setAttachments((prev) => [...prev, newAttachment]);
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error; // Re-throw to be handled by the AttachmentList component
    }
  };

  // Handle attachment deletion
  const handleDelete = async (id: string) => {
    try {
      await attachmentsApi.deleteAttachment(id);
      
      // Remove the deleted attachment from the list
      setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error; // Re-throw to be handled by the AttachmentList component
    }
  };

  // Show a more user-friendly error message
  if (error) {
    return (
      <div className="p-6 border rounded-lg bg-amber-50">
        <div className="flex items-center gap-2 text-amber-600 mb-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-medium">Fonctionnalité en cours de développement</h3>
        </div>
        <p className="text-amber-700">
          La gestion des pièces jointes est actuellement en cours d&apos;implémentation. 
          Cette fonctionnalité sera disponible prochainement.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <AttachmentList
          attachments={attachments}
          onUpload={handleUpload}
          onDelete={handleDelete}
          title="Pièces jointes de la déclaration"
          emptyMessage="Aucune pièce jointe n'a été téléchargée pour cette déclaration"
        />
      )}
    </div>
  );
}
