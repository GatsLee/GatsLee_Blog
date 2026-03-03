"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Image as ImageIcon,
  Code2,
  Video,
  Tag,
  ChevronDown,
  ImagePlus,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Block {
  id: string;
  type: 'text' | 'h1' | 'h2' | 'h3' | 'bullet' | 'number' | 'todo' | 'quote' | 'image' | 'code' | 'video';
  content: string;
  checked?: boolean;
  language?: string;
}

import { uploadFile } from '@/lib/upload';

// ─── Markdown-to-blocks parser ─────────────────────────────────────────────
export function parseMarkdownToBlocks(md: string): Block[] {
  if (!md.trim()) return [{ id: Date.now().toString(), type: 'text', content: '' }];

  const lines = md.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      blocks.push({ id: `m${i}`, type: 'h1', content: line.slice(2) });
    } else if (line.startsWith('## ')) {
      blocks.push({ id: `m${i}`, type: 'h2', content: line.slice(3) });
    } else if (line.startsWith('### ')) {
      blocks.push({ id: `m${i}`, type: 'h3', content: line.slice(4) });
    } else if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
      blocks.push({ id: `m${i}`, type: 'todo', content: line.slice(6), checked: true });
    } else if (line.startsWith('- [ ] ')) {
      blocks.push({ id: `m${i}`, type: 'todo', content: line.slice(6), checked: false });
    } else if (line.startsWith('- ')) {
      blocks.push({ id: `m${i}`, type: 'bullet', content: line.slice(2) });
    } else if (/^\d+\. /.test(line)) {
      blocks.push({ id: `m${i}`, type: 'number', content: line.replace(/^\d+\. /, '') });
    } else if (line.startsWith('> ')) {
      blocks.push({ id: `m${i}`, type: 'quote', content: line.slice(2) });
    } else if (line.startsWith('```')) {
      const lang = line.slice(3).trim() || 'typescript';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ id: `m${i}`, type: 'code', content: codeLines.join('\n'), language: lang });
    } else if (/^!\[.*?\]\(.+?\)$/.test(line.trim())) {
      const match = line.match(/!\[.*?\]\((.+?)\)/);
      if (match) blocks.push({ id: `m${i}`, type: 'image', content: match[1] });
    } else if (line.trim() !== '') {
      blocks.push({ id: `m${i}`, type: 'text', content: line });
    }

    i++;
  }

  return blocks.length > 0
    ? blocks
    : [{ id: Date.now().toString(), type: 'text', content: '' }];
}

// ─── SlashMenu ─────────────────────────────────────────────────────────────
interface SlashMenuProps {
  position: { top: number; left: number } | null;
  onSelect: (type: string) => void;
  onClose: () => void;
  onImageSelect: () => void;
}

const SlashMenu: React.FC<SlashMenuProps> = ({ position, onSelect, onClose, onImageSelect }) => {
  const menuItems = [
    { type: 'text', label: 'Text', sub: 'Plain text', icon: <Type size={16} /> },
    { type: 'h1', label: 'Heading 1', sub: 'Section heading', icon: <Heading1 size={16} /> },
    { type: 'h2', label: 'Heading 2', sub: 'Medium heading', icon: <Heading2 size={16} /> },
    { type: 'h3', label: 'Heading 3', sub: 'Small heading', icon: <Heading3 size={16} /> },
    { type: 'bullet', label: 'Bullet List', sub: 'Simple list', icon: <List size={16} /> },
    { type: 'number', label: 'Numbered List', sub: 'Ordered list', icon: <ListOrdered size={16} /> },
    { type: 'todo', label: 'To-do', sub: 'Checkbox', icon: <CheckSquare size={16} /> },
    { type: 'quote', label: 'Quote', sub: 'Highlighted text', icon: <Quote size={16} /> },
    { type: 'code', label: 'Code', sub: 'Code with syntax', icon: <Code2 size={16} /> },
    { type: 'video', label: 'Video', sub: 'YouTube / Vimeo', icon: <Video size={16} /> },
    { type: 'image', label: 'Image', sub: 'Upload an image', icon: <ImageIcon size={16} /> },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.slash-menu')) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!position) return null;

  return (
    <div
      className="slash-menu fixed bg-surface shadow-xl card-border rounded-lg w-64 z-[60] overflow-hidden text-sm"
      style={{ top: position.top + 24, left: position.left }}
    >
      <div className="p-2 text-xs text-muted font-medium border-b border-border uppercase tracking-wider">
        Basic Blocks
      </div>
      <div className="max-h-60 overflow-y-auto p-1">
        {menuItems.map((item) => (
          <button
            key={item.type}
            onClick={() => item.type === 'image' ? onImageSelect() : onSelect(item.type)}
            className="w-full flex items-center gap-3 p-2 hover:bg-hover rounded-md text-left transition-colors group"
          >
            <div className="w-9 h-9 flex items-center justify-center bg-background card-border rounded text-muted group-hover:border-accent group-hover:text-accent shrink-0">
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

// ─── BlockComponent ────────────────────────────────────────────────────────
interface BlockProps {
  block: Block;
  index: number;
  updateBlock: (id: string, data: Partial<Block>) => void;
  addBlock: (index: number) => void;
  deleteBlock: (index: number) => void;
  splitBlock: (index: number, cursorPos: number) => void;
  mergeWithPrev: (index: number) => void;
  focusBlock: (index: number) => void;
  activeId: string | null;
  setMenuOpen: (data: { blockId: string; top: number; left: number } | null) => void;
  pendingCursorPosRef: React.MutableRefObject<{ blockId: string; pos: number } | null>;
  isDragOver: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: (index: number) => void;
  onDragEnd: () => void;
}

const BlockComponent: React.FC<BlockProps> = ({
  block, index, updateBlock, addBlock, deleteBlock, splitBlock, mergeWithPrev,
  focusBlock, activeId, setMenuOpen, pendingCursorPosRef,
  isDragOver, onDragStart, onDragOver, onDrop, onDragEnd,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isDraggable, setIsDraggable] = useState(false);

  useEffect(() => {
    if (activeId === block.id && inputRef.current) {
      inputRef.current.focus();
      const pending = pendingCursorPosRef.current;
      if (pending && pending.blockId === block.id) {
        inputRef.current.setSelectionRange(pending.pos, pending.pos);
        pendingCursorPosRef.current = null;
      }
    }
  }, [activeId, block.id]);

  // Auto-resize textarea height whenever content changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [block.content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const pos = (e.target as HTMLTextAreaElement).selectionStart ?? 0;
    if (e.key === 'Enter' && !e.shiftKey && block.type !== 'code') {
      e.preventDefault();
      splitBlock(index, pos);
    }
    if (e.key === 'Backspace') {
      if (block.content === '' && index !== 0) {
        e.preventDefault();
        deleteBlock(index);
      } else if (pos === 0 && index !== 0) {
        e.preventDefault();
        mergeWithPrev(index);
      }
    }
    if (e.key === 'ArrowUp' && block.type !== 'image') { e.preventDefault(); focusBlock(index - 1); }
    if (e.key === 'ArrowDown' && block.type !== 'image') { e.preventDefault(); focusBlock(index + 1); }
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
        if (rect) setMenuOpen({ blockId: block.id, top: rect.top + window.scrollY, left: rect.left + window.scrollX });
      } else {
        setMenuOpen(null);
      }
    }
  };

  const getStyles = () => {
    switch (block.type) {
      case 'h1': return 'text-3xl font-bold mt-6 mb-2 text-foreground placeholder-muted/50';
      case 'h2': return 'text-2xl font-semibold mt-5 mb-2 text-foreground placeholder-muted/50';
      case 'h3': return 'text-xl font-medium mt-3 mb-1 text-foreground placeholder-muted/50';
      case 'quote': return 'border-l-4 border-accent pl-4 py-1 text-lg italic text-secondary bg-hover/50';
      default: return 'text-base text-foreground placeholder-muted/50';
    }
  };

  const getPrefix = () => {
    if (block.type === 'bullet') return <div className="mr-2 text-xl leading-6 select-none text-accent">•</div>;
    if (block.type === 'number') return <div className="mr-2 font-medium select-none text-muted w-5 text-right">1.</div>;
    if (block.type === 'todo') return (
      <div className="mr-2 mt-1 select-none cursor-pointer text-muted hover:text-accent"
        onClick={() => updateBlock(block.id, { checked: !block.checked })}>
        <CheckSquare size={18} className={block.checked ? 'text-accent' : ''} />
      </div>
    );
    return null;
  };

  const getPlaceholder = () => {
    if (block.type === 'h1') return 'Heading 1';
    if (block.type === 'h2') return 'Heading 2';
    if (block.type === 'h3') return 'Heading 3';
    if (block.type === 'quote') return 'Quote...';
    return block.content === '' ? "Type '/' for commands" : '';
  };

  if (block.type === 'image') {
    return (
      <div
        draggable={isDraggable}
        onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(index); }}
        onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
        onDrop={(e) => { e.preventDefault(); onDrop(index); }}
        onDragEnd={() => { setIsDraggable(false); onDragEnd(); }}
        className={`group flex items-start -ml-8 py-2 relative ${isDragOver ? 'border-t-2 border-accent' : ''}`}
      >
        <div className="absolute -left-12 top-1.5 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-muted transition-opacity">
          <Plus size={16} className="cursor-pointer hover:text-accent" onClick={() => addBlock(index)} />
          <GripVertical size={16} className="cursor-grab hover:text-accent"
            onMouseDown={() => setIsDraggable(true)} onMouseUp={() => setIsDraggable(false)} />
        </div>
        <img src={block.content} alt="Uploaded" className="max-w-full rounded-lg card-border" />
      </div>
    );
  }

  if (block.type === 'code') {
    return (
      <div
        draggable={isDraggable}
        onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(index); }}
        onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
        onDrop={(e) => { e.preventDefault(); onDrop(index); }}
        onDragEnd={() => { setIsDraggable(false); onDragEnd(); }}
        className={`group flex items-start -ml-8 py-2 relative ${isDragOver ? 'border-t-2 border-accent' : ''}`}
      >
        <div className="absolute -left-12 top-1.5 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-muted transition-opacity">
          <Plus size={16} className="cursor-pointer hover:text-accent" onClick={() => addBlock(index)} />
          <GripVertical size={16} className="cursor-grab hover:text-accent"
            onMouseDown={() => setIsDraggable(true)} onMouseUp={() => setIsDraggable(false)} />
        </div>
        <div className="w-full rounded-lg card-border overflow-hidden bg-[#0d1117]">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161b22] border-b border-[#30363d]">
            <Code2 size={12} className="text-muted" />
            <select
              value={block.language ?? 'typescript'}
              onChange={(e) => updateBlock(block.id, { language: e.target.value })}
              className="bg-transparent text-xs text-muted focus:outline-none cursor-pointer"
            >
              {['typescript', 'javascript', 'python', 'bash', 'json', 'sql', 'go', 'rust', 'css', 'html', 'markdown', 'yaml'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <textarea
            ref={inputRef}
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const { selectionStart, selectionEnd } = e.currentTarget;
                updateBlock(block.id, { content: block.content.slice(0, selectionStart) + '  ' + block.content.slice(selectionEnd) });
              }
              if (e.key === 'Backspace' && block.content === '') { e.preventDefault(); deleteBlock(index); }
            }}
            className="w-full bg-transparent px-4 py-3 font-mono text-sm text-[#e6edf3] outline-none resize-none min-h-[120px]"
            placeholder="// code here..."
            spellCheck={false}
          />
        </div>
      </div>
    );
  }

  if (block.type === 'video') {
    return (
      <div
        draggable={isDraggable}
        onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(index); }}
        onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
        onDrop={(e) => { e.preventDefault(); onDrop(index); }}
        onDragEnd={() => { setIsDraggable(false); onDragEnd(); }}
        className={`group flex items-start -ml-8 py-2 relative ${isDragOver ? 'border-t-2 border-accent' : ''}`}
      >
        <div className="absolute -left-12 top-1.5 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-muted transition-opacity">
          <Plus size={16} className="cursor-pointer hover:text-accent" onClick={() => addBlock(index)} />
          <GripVertical size={16} className="cursor-grab hover:text-accent"
            onMouseDown={() => setIsDraggable(true)} onMouseUp={() => setIsDraggable(false)} />
        </div>
        <div className="w-full">
          <textarea
            ref={inputRef}
            rows={1}
            style={{ resize: 'none' }}
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Paste YouTube or Vimeo URL…"
            className="w-full bg-hover card-border rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-accent font-mono"
          />
          {block.content && <div className="mt-1 text-xs text-muted font-mono">↳ embeds on publish</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(index); }}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={(e) => { e.preventDefault(); onDrop(index); }}
      onDragEnd={() => { setIsDraggable(false); onDragEnd(); }}
      className={`group flex items-start -ml-8 py-1 relative ${isDragOver ? 'border-t-2 border-accent' : ''}`}
    >
      <div className="absolute -left-12 top-1.5 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-muted transition-opacity">
        <Plus size={16} className="cursor-pointer hover:text-accent" onClick={() => addBlock(index)} />
        <GripVertical size={16} className="cursor-grab hover:text-accent"
          onMouseDown={() => setIsDraggable(true)} onMouseUp={() => setIsDraggable(false)} />
      </div>
      {getPrefix()}
      <textarea
        ref={inputRef}
        rows={1}
        className={`w-full bg-transparent outline-none resize-none overflow-hidden leading-relaxed ${getStyles()}`}
        value={block.content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder()}
        autoComplete="off"
      />
    </div>
  );
};

// ─── NotionEditor ──────────────────────────────────────────────────────────
interface NotionEditorProps {
  initialTitle?: string;
  initialCategory?: string;
  initialBlocks?: Block[];
  initialSlug?: string;
  initialCoverImage?: string;
  initialDescription?: string;
  initialLocale?: string;
  initialPublished?: boolean;
  onSave: (data: {
    title: string;
    category: string;
    content: string;
    slug?: string;
    coverImage?: string;
    description?: string;
    locale?: string;
    published?: boolean;
  }) => void;
  saving?: boolean;
}

const CATEGORIES = [
  { value: 'devlog', label: 'Development' },
  { value: 'troubleshooting', label: 'Troubleshooting' },
];

export default function NotionEditor({
  initialTitle = '',
  initialCategory = 'devlog',
  initialBlocks,
  initialSlug = '',
  initialCoverImage = '',
  initialDescription = '',
  initialLocale = 'ko',
  initialPublished = true,
  onSave,
  saving = false,
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
  const [locale, setLocale] = useState(initialLocale);
  const [published, setPublished] = useState(initialPublished);

  const [slug, setSlug] = useState(initialSlug);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialSlug);
  const [coverImage, setCoverImage] = useState(initialCoverImage);
  const [description, setDescription] = useState(initialDescription);
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [currentImageBlockId, setCurrentImageBlockId] = useState<string | null>(null);

  // Always-fresh ref to blocks (avoids stale closures in callbacks)
  const blocksRef = useRef(blocks);
  useEffect(() => { blocksRef.current = blocks; }, [blocks]);

  // Cursor position to restore after split/merge
  const pendingCursorPosRef = useRef<{ blockId: string; pos: number } | null>(null);

  // Drag & Drop
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const draggingIndexRef = useRef<number | null>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (slugManuallyEdited) return;
    const title = blocks[0]?.content || '';
    const auto = title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '');
    setSlug(auto);
  }, [blocks, slugManuallyEdited]);

  // Live stats
  const allText = blocks.map(b => b.content).join(' ');
  const wordCount = allText.trim() ? allText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = allText.replace(/\s/g, '').length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // TOC
  const tocItems = blocks.filter(b => ['h1', 'h2', 'h3'].includes(b.type) && b.content.trim());

  const updateBlock = useCallback((id: string, newData: Partial<Block>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...newData } : b));
    if (newData.type && newData.type !== 'text') setMenuOpen(null);
  }, []);

  const addBlock = useCallback((currentIndex: number) => {
    const newBlock: Block = { id: Date.now().toString(), type: 'text', content: '' };
    setBlocks(prev => {
      const next = [...prev];
      next.splice(currentIndex + 1, 0, newBlock);
      return next;
    });
    setActiveBlockId(newBlock.id);
  }, []);

  const deleteBlock = useCallback((currentIndex: number) => {
    setBlocks(prev => {
      if (prev.length <= 1) return prev;
      const prevBlock = prev[currentIndex - 1];
      const next = prev.filter((_, i) => i !== currentIndex);
      if (prevBlock) setActiveBlockId(prevBlock.id);
      return next;
    });
  }, []);

  const focusBlock = useCallback((index: number) => {
    setBlocks(prev => {
      if (prev[index]) setActiveBlockId(prev[index].id);
      return prev;
    });
  }, []);

  // Split block at cursor position (Enter key)
  const splitBlock = useCallback((index: number, cursorPos: number) => {
    const current = blocksRef.current[index];
    if (!current) return;
    const before = current.content.slice(0, cursorPos);
    const after = current.content.slice(cursorPos);
    const newId = Date.now().toString();
    setBlocks(prev => {
      const next = [...prev];
      next[index] = { ...next[index], content: before };
      next.splice(index + 1, 0, { id: newId, type: 'text', content: after });
      return next;
    });
    pendingCursorPosRef.current = { blockId: newId, pos: 0 };
    setActiveBlockId(newId);
  }, []);

  // Merge block into previous (Backspace at start of block)
  const mergeWithPrev = useCallback((index: number) => {
    const current = blocksRef.current;
    if (index <= 0 || index >= current.length) return;
    const prevBlock = current[index - 1];
    const currBlock = current[index];
    const mergedContent = prevBlock.content + currBlock.content;
    const cursorPos = prevBlock.content.length;
    setBlocks(prev => {
      if (index <= 0 || index >= prev.length) return prev;
      const next = [...prev];
      next[index - 1] = { ...next[index - 1], content: mergedContent };
      return next.filter((_, i) => i !== index);
    });
    pendingCursorPosRef.current = { blockId: prevBlock.id, pos: cursorPos };
    setActiveBlockId(prevBlock.id);
  }, []);

  // Drag & Drop callbacks
  const handleDragStart = useCallback((index: number) => {
    draggingIndexRef.current = index;
    setDraggingIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number) => {
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((dropIndex: number) => {
    const di = draggingIndexRef.current;
    if (di === null) return;
    if (di !== dropIndex) {
      setBlocks(prev => {
        const next = [...prev];
        const [moved] = next.splice(di, 1);
        const insertAt = dropIndex > di ? dropIndex - 1 : dropIndex;
        next.splice(insertAt, 0, moved);
        return next;
      });
    }
    draggingIndexRef.current = null;
    setDraggingIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    draggingIndexRef.current = null;
    setDraggingIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleMenuSelect = (type: string) => {
    if (menuOpen) {
      updateBlock(menuOpen.blockId, { type: type as Block['type'], content: '', language: type === 'code' ? 'typescript' : undefined });
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
    setUploading(true);
    try {
      const url = await uploadFile(file);
      updateBlock(currentImageBlockId, { type: 'image', content: url });
    } catch { alert('Image upload failed.'); }
    finally {
      setUploading(false);
      setCurrentImageBlockId(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const url = await uploadFile(file);
      setCoverImage(url);
    } catch { alert('Cover upload failed.'); }
    finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
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
        case 'code': return `\`\`\`${block.language ?? 'typescript'}\n${block.content}\n\`\`\``;
        case 'video': return block.content;
        default: return block.content;
      }
    }).join('\n\n');
  };

  const handleSave = () => {
    const title = blocks[0]?.content || 'Untitled';
    const content = convertToMarkdown();
    onSave({ title, category, content, slug, coverImage, description, locale, published });
  };

  const isUploading = uploading || coverUploading;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background text-foreground">

      {/* ── Editor toolbar ──────────────────────────────────────────────── */}
      <div className="h-10 border-b border-border flex items-center justify-between px-6 bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-muted tracking-widest uppercase">
            POST <span className="mx-1 font-light opacity-40">/</span> EDITOR
          </span>
          {isUploading && (
            <span className="text-[11px] text-accent font-mono animate-pulse">Uploading…</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted font-mono mr-1">
            {saving ? 'Saving...' : published ? 'Public' : 'Draft'}
          </span>
          <button
            onClick={() => setLocale(l => l === 'ko' ? 'en' : 'ko')}
            className="px-2 h-7 text-[11px] font-medium font-mono text-muted hover:text-foreground hover:bg-hover rounded transition-colors"
            title="Post language">
            {locale === 'ko' ? '한' : 'EN'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || isUploading}
            className="ml-1 bg-foreground hover:bg-foreground/90 text-background font-bold h-7 px-4 text-[11px] uppercase tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Saving...' : 'COMMIT'}
          </button>
        </div>
      </div>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Content row */}
        <div className="flex-1 flex overflow-hidden">

          {/* Editor center */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-16 pt-12 pb-8">

              {/* Title (blocks[0] — always treated as page title) */}
              <input
                className="w-full bg-transparent outline-none text-4xl md:text-[2.75rem] font-bold text-foreground tracking-tight mb-6 placeholder-muted/25"
                style={{ fontFamily: 'Archivo, sans-serif' }}
                value={blocks[0]?.content || ''}
                onChange={(e) => updateBlock(blocks[0].id, { content: e.target.value })}
                placeholder="New Page"
                autoComplete="off"
              />

              {/* Metadata badges */}
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1.5 card-border rounded-md hover:bg-hover transition-colors">
                  <Tag size={13} className="text-muted" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-transparent text-sm text-foreground focus:outline-none cursor-pointer appearance-none"
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <ChevronDown size={13} className="text-muted pointer-events-none" />
                </div>

                <button
                  onClick={() => setPublished(p => !p)}
                  className="flex items-center gap-2 px-3 py-1.5 card-border rounded-md text-sm hover:bg-hover transition-colors">
                  <div className={`w-2 h-2 rounded-full ${published ? 'bg-accent' : 'bg-muted/40'}`} />
                  <span className="text-foreground text-xs font-medium">{published ? 'Public' : 'Draft'}</span>
                </button>
              </div>

              <div className="w-full h-px bg-border mb-8" />

              {/* Content blocks (skip index 0 — rendered as title above) */}
              <div className="flex flex-col gap-1 pl-8">
                {blocks.slice(1).map((block, idx) => (
                  <BlockComponent
                    key={block.id}
                    block={block}
                    index={idx + 1}
                    updateBlock={updateBlock}
                    addBlock={addBlock}
                    deleteBlock={deleteBlock}
                    splitBlock={splitBlock}
                    mergeWithPrev={mergeWithPrev}
                    focusBlock={focusBlock}
                    activeId={activeBlockId}
                    setMenuOpen={setMenuOpen}
                    pendingCursorPosRef={pendingCursorPosRef}
                    isDragOver={dragOverIndex === idx + 1}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>

              {/* Click-to-add area */}
              <div
                className="h-32 pl-8 cursor-text"
                onClick={() => {
                  const last = blocks[blocks.length - 1];
                  if (last?.content !== '') addBlock(blocks.length - 1);
                  else focusBlock(blocks.length - 1);
                }}
              />
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="w-[300px] border-l border-border bg-surface/50 flex flex-col overflow-y-auto shrink-0">
            <div className="p-5">
              <h3 className="text-[10px] font-bold text-muted tracking-widest mb-5 uppercase">
                Page Settings
              </h3>

              {/* Cover image */}
              <div className="mb-5">
                <label className="block text-xs text-muted mb-2">Cover Image</label>
                {coverImage ? (
                  <div className="relative group">
                    <img src={coverImage} alt="Cover" className="w-full h-24 object-cover rounded-lg card-border" />
                    <button
                      onClick={() => setCoverImage('')}
                      className="absolute top-1 right-1 bg-background/80 text-muted hover:text-foreground rounded px-1.5 py-0.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    disabled={coverUploading}
                    className="w-full h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted hover:bg-hover hover:border-accent/40 transition-colors bg-background gap-1 text-xs">
                    <ImagePlus size={18} />
                    <span>{coverUploading ? 'Uploading…' : 'Add Cover'}</span>
                  </button>
                )}
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className="block text-xs text-muted mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for search engines…"
                  rows={3}
                  className="w-full px-3 py-2 bg-background card-border rounded text-xs text-muted resize-none focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40"
                />
              </div>
            </div>

            <div className="h-px bg-border mx-5 mb-5" />

            {/* TOC */}
            <div className="px-5 pb-5">
              <h3 className="text-[10px] font-bold text-muted tracking-widest mb-3 uppercase">
                Table of Contents
              </h3>
              {tocItems.length > 0 ? (
                <ul className="space-y-2">
                  {tocItems.map((b) => (
                    <li key={b.id}
                      className={`text-xs text-muted hover:text-foreground cursor-pointer transition-colors truncate leading-relaxed ${
                        b.type === 'h2' ? 'pl-3' : b.type === 'h3' ? 'pl-5' : ''
                      }`}>
                      {b.type === 'h1' && <span className="text-accent mr-1 font-mono">#</span>}
                      {b.type === 'h2' && <span className="text-muted/50 mr-1 font-mono">##</span>}
                      {b.type === 'h3' && <span className="text-muted/30 mr-1 font-mono">###</span>}
                      {b.content}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-muted/40 font-mono">Add headings to see TOC</p>
              )}
            </div>
          </aside>
        </div>

        {/* Bottom status bar */}
        <div className="h-9 border-t border-border flex items-center justify-between px-6 bg-surface shrink-0">
          <div className="flex items-center gap-4 text-[11px] text-muted font-mono">
            <span>Words: {wordCount}</span>
            <span className="opacity-30">•</span>
            <span>Chars: {charCount}</span>
            <span className="opacity-30">•</span>
            <span>Reading: ~{readingTime} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>Live Sync</span>
          </div>
        </div>
      </main>

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={handleImageUpload} />
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

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
