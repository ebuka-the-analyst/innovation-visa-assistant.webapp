import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Type, 
  Plus, 
  Trash2, 
  Move, 
  Bold, 
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  Layers,
  Image,
  Upload
} from "lucide-react";

export interface TextElement {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
}

export interface LogoElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CoverPageEditorProps {
  backgroundImage: string;
  textElements: TextElement[];
  onTextElementsChange: (elements: TextElement[]) => void;
  logoElement: LogoElement | null;
  onLogoElementChange: (logo: LogoElement | null) => void;
  width?: number;
  height?: number;
  paletteColors?: string[];
}

const AVAILABLE_FONTS = [
  { id: 'Inter', name: 'Inter' },
  { id: 'Playfair Display', name: 'Playfair Display' },
  { id: 'Montserrat', name: 'Montserrat' },
  { id: 'Roboto', name: 'Roboto' },
  { id: 'Open Sans', name: 'Open Sans' },
  { id: 'Lato', name: 'Lato' },
  { id: 'Poppins', name: 'Poppins' },
  { id: 'Raleway', name: 'Raleway' },
];

const PRESET_COLORS = [
  '#000000', '#ffffff', '#1e293b', '#334155', '#64748b',
  '#dc2626', '#ea580c', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#005EB8', '#1e3a5f',
];

export function CoverPageEditor({
  backgroundImage,
  textElements,
  onTextElementsChange,
  logoElement,
  onLogoElementChange,
  width = 520,
  height = 740,
  paletteColors,
}: CoverPageEditorProps) {
  const activeColors = paletteColors && paletteColors.length > 0 
    ? [...paletteColors, ...PRESET_COLORS.slice(0, 12)] 
    : PRESET_COLORS;
  const containerRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'text' | 'logo' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedElement = textElements.find(el => el.id === selectedId);
  const isLogoSelected = selectedType === 'logo' && logoElement;

  const generateId = () => `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const generateLogoId = () => `logo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addTextElement = () => {
    const newElement: TextElement = {
      id: generateId(),
      content: 'Double-click to edit',
      x: 50,
      y: 100 + textElements.length * 60,
      fontSize: 32,
      fontFamily: 'Inter',
      color: '#1e293b',
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'left',
    };
    onTextElementsChange([...textElements, newElement]);
    setSelectedId(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<TextElement>) => {
    onTextElementsChange(
      textElements.map(el => el.id === id ? { ...el, ...updates } : el)
    );
  };

  const deleteElement = (id: string) => {
    onTextElementsChange(textElements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateElement = (id: string) => {
    const element = textElements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: generateId(),
        x: element.x + 20,
        y: element.y + 20,
      };
      onTextElementsChange([...textElements, newElement]);
      setSelectedId(newElement.id);
      setSelectedType('text');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const maxSize = 120;
        let logoWidth = img.width;
        let logoHeight = img.height;
        
        if (logoWidth > maxSize || logoHeight > maxSize) {
          const scale = Math.min(maxSize / logoWidth, maxSize / logoHeight);
          logoWidth = Math.round(logoWidth * scale);
          logoHeight = Math.round(logoHeight * scale);
        }

        const newLogo: LogoElement = {
          id: generateLogoId(),
          src: event.target?.result as string,
          x: 40,
          y: 40,
          width: logoWidth,
          height: logoHeight,
        };
        onLogoElementChange(newLogo);
        setSelectedId(newLogo.id);
        setSelectedType('logo');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const updateLogo = (updates: Partial<LogoElement>) => {
    if (logoElement) {
      onLogoElementChange({ ...logoElement, ...updates });
    }
  };

  const deleteLogo = () => {
    onLogoElementChange(null);
    setSelectedId(null);
    setSelectedType(null);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string, type: 'text' | 'logo') => {
    e.preventDefault();
    
    if (type === 'text') {
      const element = textElements.find(el => el.id === id);
      if (!element || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      
      setSelectedId(id);
      setSelectedType('text');
      setIsDragging(true);
      setDragOffset({
        x: (e.clientX - rect.left) * scaleX - element.x,
        y: (e.clientY - rect.top) * scaleY - element.y,
      });
    } else if (type === 'logo' && logoElement) {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      
      setSelectedId(logoElement.id);
      setSelectedType('logo');
      setIsDragging(true);
      setDragOffset({
        x: (e.clientX - rect.left) * scaleX - logoElement.x,
        y: (e.clientY - rect.top) * scaleY - logoElement.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    
    if (selectedType === 'text' && selectedId) {
      const newX = Math.max(0, Math.min(width - 50, (e.clientX - rect.left) * scaleX - dragOffset.x));
      const newY = Math.max(0, Math.min(height - 30, (e.clientY - rect.top) * scaleY - dragOffset.y));
      updateElement(selectedId, { x: Math.round(newX), y: Math.round(newY) });
    } else if (selectedType === 'logo' && logoElement) {
      const newX = Math.max(0, Math.min(width - logoElement.width, (e.clientX - rect.left) * scaleX - dragOffset.x));
      const newY = Math.max(0, Math.min(height - logoElement.height, (e.clientY - rect.top) * scaleY - dragOffset.y));
      updateLogo({ x: Math.round(newX), y: Math.round(newY) });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = (id: string) => {
    setEditingId(id);
  };

  const handleTextChange = (id: string, content: string) => {
    updateElement(id, { content });
  };

  const handleBlur = () => {
    setEditingId(null);
  };

  return (
    <div className="flex gap-6">
      <div 
        ref={containerRef}
        className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden cursor-crosshair bg-white"
        style={{ 
          width: '100%',
          maxWidth: '400px',
          aspectRatio: `${width}/${height}`,
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => { setSelectedId(null); setSelectedType(null); }}
      >
        <img 
          src={backgroundImage}
          alt="Cover background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {logoElement && (
          <div
            className={`absolute cursor-move select-none transition-shadow ${
              isLogoSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
            }`}
            style={{
              left: `${(logoElement.x / width) * 100}%`,
              top: `${(logoElement.y / height) * 100}%`,
              width: `${(logoElement.width / width) * 100}%`,
              height: `${(logoElement.height / height) * 100}%`,
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown(e, logoElement.id, 'logo');
            }}
            onClick={(e) => e.stopPropagation()}
            data-testid="logo-element"
          >
            <img 
              src={logoElement.src} 
              alt="Logo" 
              className="w-full h-full object-contain pointer-events-none"
              draggable={false}
            />
          </div>
        )}
        
        {textElements.map((element) => {
          const isSelected = selectedId === element.id;
          const isEditing = editingId === element.id;
          const scaleFactor = containerRef.current 
            ? containerRef.current.clientWidth / width 
            : 0.77;

          return (
            <div
              key={element.id}
              className={`absolute cursor-move select-none transition-shadow ${
                isSelected ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
              }`}
              style={{
                left: `${(element.x / width) * 100}%`,
                top: `${(element.y / height) * 100}%`,
                fontSize: `${element.fontSize * scaleFactor}px`,
                fontFamily: element.fontFamily,
                color: element.color,
                fontWeight: element.fontWeight,
                fontStyle: element.fontStyle,
                textAlign: element.textAlign,
                textShadow: element.color === '#ffffff' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, element.id, 'text');
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleDoubleClick(element.id);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={element.content}
                  onChange={(e) => handleTextChange(element.id, e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                  autoFocus
                  className="bg-white/90 border border-emerald-500 rounded px-2 py-1 outline-none min-w-[100px]"
                  style={{
                    fontSize: 'inherit',
                    fontFamily: 'inherit',
                    color: '#000',
                    fontWeight: 'inherit',
                  }}
                  data-testid={`input-text-${element.id}`}
                />
              ) : (
                <span className="whitespace-nowrap">{element.content}</span>
              )}
            </div>
          );
        })}

        <div className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/50 px-2 py-1 rounded">
          Click to select • Drag to move • Double-click to edit
        </div>
      </div>

      <Card className="flex-1 p-4 max-w-xs overflow-y-auto max-h-[600px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Elements
            </h3>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={addTextElement}
                data-testid="button-add-text"
              >
                <Plus className="w-4 h-4" />
                Add Text
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => logoInputRef.current?.click()}
                disabled={!!logoElement}
                data-testid="button-upload-logo"
              >
                <Upload className="w-4 h-4" />
                {logoElement ? 'Logo Added' : 'Add Logo'}
              </Button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                data-testid="input-logo-upload"
              />
            </div>
          </div>

          {logoElement && (
            <div 
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isLogoSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-border hover:border-muted-foreground/50'
              }`}
              onClick={() => { setSelectedId(logoElement.id); setSelectedType('logo'); }}
              data-testid="layer-logo"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Logo</span>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLogo();
                  }}
                  data-testid="button-delete-logo"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {textElements.length === 0 && !logoElement && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No elements yet. Add text or upload your logo.
            </p>
          )}

          {textElements.map((element, index) => (
            <div 
              key={element.id}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                selectedId === element.id && selectedType === 'text'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                  : 'border-border hover:border-muted-foreground/50'
              }`}
              onClick={() => { setSelectedId(element.id); setSelectedType('text'); }}
              data-testid={`layer-${element.id}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm truncate flex-1" style={{ fontFamily: element.fontFamily }}>
                  {element.content.substring(0, 20)}{element.content.length > 20 ? '...' : ''}
                </span>
                <div className="flex gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateElement(element.id);
                    }}
                    data-testid={`button-duplicate-${element.id}`}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    data-testid={`button-delete-${element.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {selectedElement && (
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Type className="w-4 h-4" />
                Text Properties
              </h4>

              <div>
                <Label className="text-xs">Text Content</Label>
                <Input
                  value={selectedElement.content}
                  onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                  className="mt-1"
                  data-testid="input-text-content"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Font</Label>
                  <Select
                    value={selectedElement.fontFamily}
                    onValueChange={(val) => updateElement(selectedElement.id, { fontFamily: val })}
                  >
                    <SelectTrigger className="mt-1" data-testid="select-font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_FONTS.map(font => (
                        <SelectItem key={font.id} value={font.id} style={{ fontFamily: font.id }}>
                          {font.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Size</Label>
                  <Input
                    type="number"
                    value={selectedElement.fontSize}
                    onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 16 })}
                    className="mt-1"
                    min={8}
                    max={120}
                    data-testid="input-font-size"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">X Position</Label>
                  <Input
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                    min={0}
                    max={width}
                    data-testid="input-x-position"
                  />
                </div>
                <div>
                  <Label className="text-xs">Y Position</Label>
                  <Input
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                    min={0}
                    max={height}
                    data-testid="input-y-position"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Text Color {paletteColors ? '(Theme Palette)' : ''}</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeColors.map((color, idx) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded border-2 transition-all ${
                        selectedElement.color === color 
                          ? 'border-foreground scale-110' 
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateElement(selectedElement.id, { color })}
                      data-testid={`button-color-${color.replace('#', '')}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={selectedElement.fontWeight === 'bold' ? 'default' : 'outline'}
                  className={selectedElement.fontWeight === 'bold' ? 'bg-emerald-500' : ''}
                  onClick={() => updateElement(selectedElement.id, { 
                    fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' 
                  })}
                  data-testid="button-bold"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedElement.fontStyle === 'italic' ? 'default' : 'outline'}
                  className={selectedElement.fontStyle === 'italic' ? 'bg-emerald-500' : ''}
                  onClick={() => updateElement(selectedElement.id, { 
                    fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
                  })}
                  data-testid="button-italic"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <div className="border-l mx-1" />
                <Button
                  size="sm"
                  variant={selectedElement.textAlign === 'left' ? 'default' : 'outline'}
                  className={selectedElement.textAlign === 'left' ? 'bg-emerald-500' : ''}
                  onClick={() => updateElement(selectedElement.id, { textAlign: 'left' })}
                  data-testid="button-align-left"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedElement.textAlign === 'center' ? 'default' : 'outline'}
                  className={selectedElement.textAlign === 'center' ? 'bg-emerald-500' : ''}
                  onClick={() => updateElement(selectedElement.id, { textAlign: 'center' })}
                  data-testid="button-align-center"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedElement.textAlign === 'right' ? 'default' : 'outline'}
                  className={selectedElement.textAlign === 'right' ? 'bg-emerald-500' : ''}
                  onClick={() => updateElement(selectedElement.id, { textAlign: 'right' })}
                  data-testid="button-align-right"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {isLogoSelected && logoElement && (
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Image className="w-4 h-4 text-blue-500" />
                Logo Properties
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Width</Label>
                  <Input
                    type="number"
                    value={logoElement.width}
                    onChange={(e) => {
                      const newWidth = parseInt(e.target.value) || 50;
                      updateLogo({ width: Math.min(300, Math.max(20, newWidth)) });
                    }}
                    className="mt-1"
                    min={20}
                    max={300}
                    data-testid="input-logo-width"
                  />
                </div>
                <div>
                  <Label className="text-xs">Height</Label>
                  <Input
                    type="number"
                    value={logoElement.height}
                    onChange={(e) => {
                      const newHeight = parseInt(e.target.value) || 50;
                      updateLogo({ height: Math.min(300, Math.max(20, newHeight)) });
                    }}
                    className="mt-1"
                    min={20}
                    max={300}
                    data-testid="input-logo-height"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">X Position</Label>
                  <Input
                    type="number"
                    value={logoElement.x}
                    onChange={(e) => updateLogo({ x: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                    min={0}
                    max={width - logoElement.width}
                    data-testid="input-logo-x"
                  />
                </div>
                <div>
                  <Label className="text-xs">Y Position</Label>
                  <Input
                    type="number"
                    value={logoElement.y}
                    onChange={(e) => updateLogo({ y: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                    min={0}
                    max={height - logoElement.height}
                    data-testid="input-logo-y"
                  />
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full gap-2"
                onClick={() => logoInputRef.current?.click()}
                data-testid="button-replace-logo"
              >
                <Upload className="w-4 h-4" />
                Replace Logo
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
