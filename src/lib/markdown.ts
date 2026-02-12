/**
 * Simple markdown to HTML converter
 * Supports: Headers, Bold, Italic, Code blocks, Inline code, Images, Links
 */
export function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers (must be before other replacements)
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-[#d4d4dc] mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-[#d4d4dc] mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-[#d4d4dc] mt-8 mb-4">$1</h1>')
    // Code blocks (triple backticks)
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-[#1a1a2e] p-4 rounded my-2 overflow-x-auto border border-[#2e2e4a]"><code class="text-[#5ab896] text-xs font-mono">$1</code></pre>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#d4d4dc] font-bold">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="text-[#d4a054] italic">$1</em>')
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-[#1a1a2e] px-2 py-1 rounded text-[#5ab896] text-xs font-mono">$1</code>')
    // Images - must be before links
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded my-4 border border-[#2e2e4a]" />')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-[#d4a054] underline hover:text-[#c49544] transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
    // Unordered lists
    .replace(/^\* (.*$)/gim, '<li class="ml-4 text-[#b0b0bc]">• $1</li>')
    // Ordered lists
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 text-[#b0b0bc] list-decimal">$1</li>')
    // Horizontal rule
    .replace(/^---$/gim, '<hr class="border-[#2e2e4a] my-4" />')
    // Line breaks
    .replace(/\n/g, '<br />');

  return html;
}
