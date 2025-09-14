import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useDesignerStore } from '@/stores/designerStore';
import { useTemplateStore } from '@/stores/templateStore';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Save, 
  Undo, 
  Redo, 
  Eye, 
  Download,
  Copy,
  Trash2,
  Grid3X3,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

const ToolbarActions = () => {
  const { toast } = useToast();
  const {
    currentTemplate,
    selectedElements,
    canvasSettings,
    isDirty,
    undo,
    redo,
    history,
    historyIndex,
    duplicateElement,
    deleteSelectedElements,
    updateCanvasSettings
  } = useDesignerStore();

  const { createTemplate, updateTemplate } = useTemplateStore();

  const handleSave = async () => {
    if (!currentTemplate) return;

    try {
      const templateData = {
        name: 'My Template',
        description: 'Created with CloudLabel Designer',
        layoutJson: JSON.stringify(currentTemplate),
        width: currentTemplate.width,
        height: currentTemplate.height,
        requiredFields: ['ProductName', 'Price'],
        category: 'Custom',
        isPublic: false
      };

      await createTemplate(templateData);
      
      toast({
        title: "Template saved",
        description: "Your template has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleZoomChange = (zoom: number) => {
    updateCanvasSettings({ zoom: Math.max(0.25, Math.min(4, zoom)) });
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left Section - Navigation */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/templates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Link>
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <div className="text-sm">
          <div className="font-medium">Untitled Template</div>
          <div className="text-muted-foreground text-xs">
            {isDirty ? 'Unsaved changes' : 'All changes saved'}
          </div>
        </div>
      </div>

      {/* Center Section - Main Actions */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {selectedElements.length > 0 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectedElements.forEach(id => duplicateElement(id))}
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteSelectedElements}
              title="Delete"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />
          </>
        )}

        {/* Zoom Controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleZoomChange(canvasSettings.zoom - 0.25)}
          disabled={canvasSettings.zoom <= 0.25}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <div className="text-sm font-medium min-w-[60px] text-center">
          {Math.round(canvasSettings.zoom * 100)}%
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleZoomChange(canvasSettings.zoom + 0.25)}
          disabled={canvasSettings.zoom >= 4}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          variant={canvasSettings.showGrid ? "secondary" : "ghost"}
          size="sm"
          onClick={() => updateCanvasSettings({ showGrid: !canvasSettings.showGrid })}
          title="Toggle Grid"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Section - Save & Preview */}
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button 
          size="sm" 
          onClick={handleSave}
          disabled={!currentTemplate}
          className="bg-gradient-primary hover:opacity-90 border-0"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
      </div>
    </div>
  );
};

export default ToolbarActions;