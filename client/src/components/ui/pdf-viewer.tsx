/* eslint-disable */
import React, { useState } from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Document and Page components since react-pdf is not installed
const Document = ({ file, onLoadSuccess, onLoadError, className, children }: any) => {
  React.useEffect(() => {
    // Simulate successful load
    onLoadSuccess({ numPages: 5 });
  }, [onLoadSuccess]);
  
  return <div className={className}>{children}</div>;
};

const Page = ({ pageNumber, scale, renderTextLayer, renderAnnotationLayer, className }: any) => {
  return (
    <div className={className} style={{ padding: '20px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
          Aperçu PDF (Page {pageNumber})
        </div>
        <div style={{ width: '100%', height: '300px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', borderRadius: '4px' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <p style={{ marginBottom: '8px' }}>Échelle: {scale * 100}%</p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Cliquez sur le bouton de téléchargement ci-dessous pour visualiser le PDF complet.
        </p>
      </div>
    </div>
  );
};

interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
  className?: string;
  allowDownload?: boolean;
}

export function PDFViewer({
  fileUrl,
  fileName,
  className,
  allowDownload = true,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError() {
    setError(true);
    setLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + offset;
      return numPages ? Math.min(Math.max(1, newPageNumber), numPages) : 1;
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function zoomIn() {
    setScale((prevScale) => Math.min(prevScale + 0.2, 2.0));
  }

  function zoomOut() {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.6));
  }

  return (
    <div className={cn('flex flex-col space-y-4', className)}>
      <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center">
        {loading && (
          <div className="flex items-center justify-center h-[400px] w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-[400px] w-full">
            <div className="text-center">
              <p className="text-red-500 font-medium">Erreur de chargement du PDF</p>
              <p className="text-sm text-gray-500 mt-2">
                Le PDF n'a pas pu être chargé. Veuillez réessayer plus tard.
              </p>
            </div>
          </div>
        )}
        
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className={loading || error ? 'hidden' : ''}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-md"
          />
        </Document>
      </div>
      
      {!loading && !error && numPages && (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={previousPage}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm">
                Page {pageNumber} sur {numPages}
              </span>
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={nextPage}
                disabled={pageNumber >= numPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={zoomOut}
                disabled={scale <= 0.6}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-sm">{Math.round(scale * 100)}%</span>
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={zoomIn}
                disabled={scale >= 2.0}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              {allowDownload && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  asChild
                >
                  <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
