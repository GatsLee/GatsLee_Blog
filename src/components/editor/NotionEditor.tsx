"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  GripVertical,
  Plus,
  Tag,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';

interface Block {
  id: string;
  type: 'text' | 'h1' | 'h2' | 'h3' | 'bullet' | 'number' | 'todo' | 'quote' | 'image';
  content: string;
  checked?: boolean;
}

interface SlashMenuProps {
  position: { top: number; left: number } | null;
  onSelect: (type: string) => void;
  onClose: () => void;
  onImageSelect: () => void;
}

// Helper function to compress image
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// Slash Menu Component
const SlashMenu: React.FC<SlashMenuProps> = ({ position, onSelect, onClose, onImageSelect }) => {
  const menuItems = [
    { type: 'text', label: 'Text', sub: 'Plain text', icon: <Type size={16} /> },
    { type: 'h1', label: 'Heading 1', sub: 'Section heading', icon: <Heading1 size={16} /> },
    { type: 'h2', label: 'Heading 2', sub: 'Medium heading', icon: <Heading2 size={16} /> },
    { type: 'h3', label: 'Heading 3', sub: 'Small heading', icon: <Heading3 size={16} /> },
    { type: 'bullet', label: 'Bullet List', sub: 'Simple list', icon: <List size={16} /> },
    { type: 'number', label: 'Numbered List', sub: 'Ordered list', icon: <ListOrdered size={16} /> },
    { type: 'todo', label: 'To-do List', sub: 'Checkbox', icon: <CheckSquare size={16} /> },
    { type: 'quote', label: 'Quote', sub: 'Highlighted text', icon: <Quote size={16} /> },
    { type: 'image', label: 'Image', sub: 'Upload an image', icon: <ImageIcon size={16} /> },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.slash-menu')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!position) return null;

  return (
    <div
      className="slash-menu fixed bg-surface shadow-xl border border-border rounded-lg w-72 z-50 overflow-hidden text-sm"
      style={{ top: position.top + 24, left: position.left }}
    >
      <div className="p-2 text-xs text-muted font-medium border-b border-border uppercase tracking-wider">
        Basic Blocks
      </div>
      <div className="max-h-64 overflow-y-auto p-1">
        {menuItems.map((item) => (
          <button
            key={item.type}
            onClick={() => {
              if (item.type === 'image') {
                onImageSelect();
              } else {
                onSelect(item.type);
              }
            }}
            className="w-full flex items-center gap-3 p-2 hover:bg-hover rounded-md text-left transition-colors group"
          >
            <div className="w-10 h-10 flex items-center justify-center bg-background border border-border rounded text-muted group-hover:border-accent group-hover:text-accent">
              {item.icon}
            </div>
            <div>
              <div className="text-foreground font-medium">{item.label}</div>
              <div className="text-secondary text-xs">{item.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

interface BlockProps {
  block: Block;
  index: number;
  updateBlock: (id: string, data: Partial<Block>) => void;
  addBlock: (index: number) => void;
  deleteBlock: (index: number) => void;
  focusBlock: (index: number) => void;
  activeId: string | null;
  setMenuOpen: (data: { blockId: string; top: number; left: number } | null) => void;
}

// Block Component
const BlockComponent: React.FC<BlockProps> = ({
  block,
  index,
  updateBlock,
  addBlock,
  deleteBlock,
  focusBlock,
  activeId,
  setMenuOpen
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeId === block.id && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeId, block.id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock(index);
    }

    // Prevent deletion of the title block (index 0)
    if (e.key === 'Backspace' && block.content === '' && index !== 0) {
      e.preventDefault();
      deleteBlock(index);
    }

    if (e.key === 'ArrowUp' && block.type !== 'image') {
      e.preventDefault();
      focusBlock(index - 1);
    }

    if (e.key === 'ArrowDown' && block.type !== 'image') {
      e.preventDefault();
      focusBlock(index + 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;

    let newType = block.type;
    let newContent = val;
    let handled = false;

    if (block.type === 'text') {
      if (val === '# ') { newType = 'h1'; newContent = ''; handled = true; }
      else if (val === '## ') { newType = 'h2'; newContent = ''; handled = true; }
      else if (val === '### ') { newType = 'h3'; newContent = ''; handled = true; }
      else if (val === '- ') { newType = 'bullet'; newContent = ''; handled = true; }
      else if (val === '1. ') { newType = 'number'; newContent = ''; handled = true; }
      else if (val === '[] ' || val === '[]') { newType = 'todo'; newContent = ''; handled = true; }
      else if (val === '> ') { newType = 'quote'; newContent = ''; handled = true; }
    }

    if (handled) {
      updateBlock(block.id, { type: newType, content: newContent });
    } else {
      updateBlock(block.id, { content: val });

      if (val === '/') {
        const rect = inputRef.current?.getBoundingClientRect();
        if (rect) {
          setMenuOpen({
            blockId: block.id,
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX
          });
        }
      } else {
        setMenuOpen(null);
      }
    }
  };

  const getStyles = () => {
    switch (block.type) {
      case 'h1': return 'text-4xl font-bold mt-6 mb-2 text-foreground placeholder-muted/50';
      case 'h2': return 'text-2xl font-semibold mt-5 mb-2 text-foreground placeholder-muted/50';
      case 'h3': return 'text-xl font-medium mt-3 mb-1 text-foreground placeholder-muted/50';
      case 'quote': return 'border-l-4 border-accent pl-4 py-1 text-lg italic text-secondary bg-hover/50';
      case 'bullet': return 'text-base';
      case 'number': return 'text-base';
      case 'todo': return 'text-base';
      default: return 'text-base text-foreground placeholder-muted/50';
    }
  };

  const getPrefix = () => {
    switch (block.type) {
      case 'bullet': return <div className="mr-2 text-xl leading-6 select-none text-accent">•</div>;
      case 'number': return <div className="mr-2 font-medium select-none text-muted w-5 text-right">1.</div>;
      case 'todo': return (
        <div
          className="mr-2 mt-1 select-none cursor-pointer text-muted hover:text-accent"
          onClick={() => updateBlock(block.id, { checked: !block.checked })}
        >
          <CheckSquare size={18} className={block.checked ? 'text-accent' : ''} />
        </div>
      );
      default: return null;
    }
  };

  const getPlaceholder = () => {
    if (block.type === 'h1') return 'Heading 1';
    if (block.type === 'h2') return 'Heading 2';
    if (block.type === 'h3') return 'Heading 3';
    if (block.type === 'quote') return 'Quote...';
    if (block.content === '') return "Type '/' for commands";
    return '';
  };

  // For image blocks, render an img tag
  if (block.type === 'image') {
    return (
      <div className="group flex items-start -ml-8 py-2 relative">
        <div className="absolute -left-12 top-1.5 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-muted transition-opacity">
          <Plus size={16} className="cursor-pointer hover:text-accent" onClick={() => addBlock(index)} />
          <GripVertical size={16} className="cursor-pointer hover:text-accent cursor-grab" />
        </div>
        <div className="w-full">
          <img src={block.content} alt="Uploaded" className="max-w-full rounded-lg border border-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start -ml-8 py-1 relative">
      <div className="absolute -left-12 top-1.5 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-muted transition-opacity">
        <Plus size={16} className="cursor-pointer hover:text-accent" onClick={() => addBlock(index)} />
        <GripVertical size={16} className="cursor-pointer hover:text-accent cursor-grab" />
      </div>

      {getPrefix()}

      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        className={`w-full bg-transparent outline-none resize-none overflow-hidden ${getStyles()}`}
        value={block.content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder()}
        autoComplete="off"
      />
    </div>
  );
};

interface PagePropertiesProps {
  category: string;
  onCategoryChange: (category: string) => void;
}

// Properties Section - Removed comment and status sections
const PageProperties: React.FC<PagePropertiesProps> = ({ category, onCategoryChange }) => {
  return (
    <div className="mb-8 text-sm text-muted border-b border-border pb-6">
      <div className="flex items-center gap-4 py-1.5 group">
        <div className="w-24 flex items-center gap-2 text-muted">
          <Tag size={14} />
          <span>Category</span>
        </div>
        <div className="flex-1">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-background border border-border rounded px-3 py-1 text-foreground text-sm focus:border-accent focus:outline-none cursor-pointer"
          >
            <option value="devlog">Development</option>
            <option value="troubleshooting">Troubleshooting</option>
            <option value="progress">Progress</option>
          </select>
        </div>
      </div>
    </div>
  );
};

interface NotionEditorProps {
  initialTitle?: string;
  initialCategory?: string;
  initialBlocks?: Block[];
  onSave: (data: { title: string; category: string; content: string }) => void;
  saving?: boolean;
}

// Main Editor Component
export default function NotionEditor({
  initialTitle = 'New Page',
  initialCategory = 'devlog',
  initialBlocks,
  onSave,
  saving = false
}: NotionEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks || [
      { id: '1', type: 'h1', content: initialTitle },
      { id: '2', type: 'text', content: '' },
    ]
  );
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<{ blockId: string; top: number; left: number } | null>(null);
  const [category, setCategory] = useState(initialCategory);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [currentImageBlockId, setCurrentImageBlockId] = useState<string | null>(null);

  const updateBlock = (id: string, newData: Partial<Block>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...newData } : b));
    if (newData.type && newData.type !== 'text') {
      setMenuOpen(null);
    }
  };

  const addBlock = (currentIndex: number) => {
    const newBlock: Block = { id: Date.now().toString(), type: 'text', content: '' };
    const newBlocks = [...blocks];
    newBlocks.splice(currentIndex + 1, 0, newBlock);
    setBlocks(newBlocks);
    setActiveBlockId(newBlock.id);
  };

  const deleteBlock = (currentIndex: number) => {
    if (blocks.length <= 1) return;
    const prevBlock = blocks[currentIndex - 1];
    const newBlocks = blocks.filter((_, i) => i !== currentIndex);
    setBlocks(newBlocks);
    if (prevBlock) setActiveBlockId(prevBlock.id);
  };

  const focusBlock = (index: number) => {
    if (blocks[index]) {
      setActiveBlockId(blocks[index].id);
    }
  };

  const handleMenuSelect = (type: string) => {
    if (menuOpen) {
      updateBlock(menuOpen.blockId, { type: type as Block['type'], content: '' });
      setMenuOpen(null);
    }
  };

  const handleImageSelect = () => {
    if (menuOpen) {
      setCurrentImageBlockId(menuOpen.blockId);
      imageInputRef.current?.click();
      setMenuOpen(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentImageBlockId) return;

    try {
      const compressed = await compressImage(file);
      updateBlock(currentImageBlockId, { type: 'image', content: compressed });
      setCurrentImageBlockId(null);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }

    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const convertToMarkdown = () => {
    return blocks.map(block => {
      switch (block.type) {
        case 'h1': return `# ${block.content}`;
        case 'h2': return `## ${block.content}`;
        case 'h3': return `### ${block.content}`;
        case 'bullet': return `- ${block.content}`;
        case 'number': return `1. ${block.content}`;
        case 'todo': return `- [${block.checked ? 'x' : ' '}] ${block.content}`;
        case 'quote': return `> ${block.content}`;
        case 'image': return `![Image](${block.content})`;
        default: return block.content;
      }
    }).join('\n\n');
  };

  const handleSave = () => {
    const title = blocks[0]?.content || 'Untitled';
    const content = convertToMarkdown();
    onSave({ title, category, content });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navbar - Non-sticky, scrolls with page */}
      <div className="h-14 flex items-center justify-between px-6 bg-surface z-40">
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="font-mono uppercase tracking-wider text-xs">Protocol Editor</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted font-mono">
            {saving ? 'Saving...' : 'Draft'}
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-foreground hover:bg-primary text-background font-bold py-2 px-6 text-xs transition-colors flex items-center uppercase tracking-wider rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Commit'}
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="max-w-3xl mx-auto px-12 pb-32 pt-12">
        {/* Render Blocks */}
        <div className="flex flex-col gap-1">
          {blocks.map((block, index) => (
            <React.Fragment key={block.id}>
              <BlockComponent
                block={block}
                index={index}
                updateBlock={updateBlock}
                addBlock={addBlock}
                deleteBlock={deleteBlock}
                focusBlock={focusBlock}
                activeId={activeBlockId}
                setMenuOpen={setMenuOpen}
              />
              {index === 0 && <PageProperties category={category} onCategoryChange={setCategory} />}
            </React.Fragment>
          ))}
        </div>

        {/* Bottom spacer */}
        <div
          className="h-32 -ml-8 pl-8 cursor-text"
          onClick={() => {
            if (blocks[blocks.length - 1].content !== "") {
              addBlock(blocks.length - 1);
            } else {
              focusBlock(blocks.length - 1);
            }
          }}
        ></div>
      </div>

      {/* Hidden file input for images */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Slash Menu */}
      {menuOpen && (
        <SlashMenu
          position={menuOpen}
          onSelect={handleMenuSelect}
          onImageSelect={handleImageSelect}
          onClose={() => setMenuOpen(null)}
        />
      )}
    </div>
  );
}
