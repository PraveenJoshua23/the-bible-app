'use client'
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Trash2,
  Download
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BIBLE_BOOKS } from '@/bible-import/utils/constants';
import { toast } from 'sonner';

const ImportProgress = () => {
  interface Progress {
    books: { [key: string]: { chapters: { [key: number]: boolean } } };
    completedChapters: number;
    totalVerses: number;
    lastUpdated: string;
  }

  const [progress, setProgress] = useState<Progress | null>(null);
  const [expandedBooks, setExpandedBooks] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportDetails, setExportDetails] = useState({
    name: "",
    abbreviation: "",
    copyright: "",
    info: ""
  });
  const [exporting, setExporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    book: '',
    chapter: 0
  });

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/bible-import/progress');
      if (!response.ok) throw new Error('Failed to fetch progress');
      const data = await response.json();
      setProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
      toast.error('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (book: string, chapter: number) => {
    try {
      const response = await fetch('/api/bible-import/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ book, chapter }),
      });

      if (!response.ok) throw new Error('Failed to delete chapter');
      
      toast.success('Chapter deleted successfully');
      fetchProgress(); // Refresh data
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete chapter');
    }
    setDeleteConfirm({ isOpen: false, book: '', chapter: 0 });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/bible-import/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportDetails)
      });

      if (!response.ok) throw new Error('Export failed');

      const data = await response.json();
      toast.success('Version exported successfully');
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export version');
    } finally {
      setExporting(false);
    }
  };

  const toggleBook = (bookId: string) => {
    setExpandedBooks(prev => ({
      ...prev,
      [bookId]: !prev[bookId]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Stats Card */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Import Progress</h2>
          <Button 
            onClick={() => setShowExportDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Version
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat 
            label="Books Started" 
            value={`${Object.keys(progress?.books || {}).length}/66`}
          />
          <Stat 
            label="Chapters Completed" 
            value={progress?.completedChapters || 0}
          />
          <Stat 
            label="Verses Imported" 
            value={progress?.totalVerses || 0}
          />
          <Stat 
            label="Last Updated" 
            value={progress?.lastUpdated ? new Date(progress.lastUpdated).toLocaleDateString() : 'Never'}
          />
        </div>
      </Card>

      <div className="space-y-2">
        {BIBLE_BOOKS.map((book) => {
          const bookProgress = progress?.books?.[book.abbr] || { chapters: {} };
          const completedChapters = Object.keys(bookProgress.chapters || {}).length;
          const isExpanded = expandedBooks[book.abbr];
          
          if (completedChapters === 0) return null;

          return (
            <Card key={book.abbr} className="overflow-hidden">
              {/* Book header remains the same */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleBook(book.abbr)}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 h-5 w-5" />
                  <div>
                    <h3 className="font-medium">{book.name}</h3>
                    <p className="text-sm text-gray-500">
                      {completedChapters} of {book.chapters} chapters completed
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {/* Chapters grid with fixed button nesting */}
              {isExpanded && (
                <div className="bg-gray-50 p-4 border-t">
                  <div className="grid grid-cols-8 gap-2">
                    {Array.from({ length: book.chapters }, (_, i) => i + 1).map((chapter) => {
                      const isCompleted = bookProgress.chapters?.[chapter];
                      if (!isCompleted) return null;
                      
                      return (
                        <div 
                          key={chapter}
                          className="relative group"
                        >
                          <div className="h-8 rounded-md border bg-green-100 border-green-500 flex items-center justify-center">
                            <span>{chapter}</span>
                          </div>
                          <div
                            onClick={() => {
                              setDeleteConfirm({
                                isOpen: true,
                                book: book.abbr,
                                chapter
                              });
                            }}
                            className="absolute inset-0 bg-red-500 text-white opacity-0 
                              group-hover:opacity-100 transition-opacity duration-200 
                              flex items-center justify-center rounded-md cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Export Bible Version</DialogTitle>
            <DialogDescription>
                Enter the details for your Bible version. This will create a JSON file that can be used in the Bible app.
            </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Version Name</Label>
                <Input
                id="name"
                placeholder="e.g., New American Standard Bible 1995"
                value={exportDetails.name}
                onChange={(e) => setExportDetails(prev => ({
                    ...prev,
                    name: e.target.value
                }))}
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="abbreviation">Abbreviation</Label>
                <Input
                id="abbreviation"
                placeholder="e.g., NASB1995"
                value={exportDetails.abbreviation}
                onChange={(e) => setExportDetails(prev => ({
                    ...prev,
                    abbreviation: e.target.value
                }))}
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="copyright">Copyright</Label>
                <Input
                id="copyright"
                placeholder="Copyright information"
                value={exportDetails.copyright}
                onChange={(e) => setExportDetails(prev => ({
                    ...prev,
                    copyright: e.target.value
                }))}
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="info">Additional Information</Label>
                <Textarea
                id="info"
                placeholder="Any additional information about this version"
                value={exportDetails.info}
                onChange={(e) => setExportDetails(prev => ({
                    ...prev,
                    info: e.target.value
                }))}
                />
            </div>
            </div>

            <DialogFooter>
            <Button 
                variant="outline" 
                onClick={() => setShowExportDialog(false)}
            >
                Cancel
            </Button>
            <Button 
                onClick={handleExport}
                disabled={exporting || !exportDetails.name || !exportDetails.abbreviation}
                className="bg-green-600 hover:bg-green-700"
            >
                {exporting ? 'Exporting...' : 'Export Version'}
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>

      <AlertDialog
        open={deleteConfirm.isOpen}
        onOpenChange={(open) => !open && setDeleteConfirm({ isOpen: false, book: '', chapter: 0 })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chapter? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteConfirm.book, deleteConfirm.chapter)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface StatProps {
  label: string;
  value: string | number;
}

const Stat = ({ label, value }: StatProps) => (
  <div className="text-center p-2">
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

export default ImportProgress;