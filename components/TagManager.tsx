import React, { useState, useRef, useEffect } from 'react';
import { Tag, TAG_COLORS } from '../types';
import { X, Plus, Trash2, Check } from 'lucide-react';

interface TagManagerProps {
  tags: Tag[];
  initialTagId: string | null;
  onUpdateTags: (tags: Tag[]) => void;
  onClose: () => void;
  text: any;
  themeStyles: any;
}

export const TagManager: React.FC<TagManagerProps> = ({ tags, initialTagId, onUpdateTags, onClose, text, themeStyles: T }) => {
  const [localTags, setLocalTags] = useState<Tag[]>(tags);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(initialTagId || (tags[0]?.id || null));
  const [newSubTag, setNewSubTag] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const selectedTag = localTags.find(t => t.id === selectedTagId);
  const isDark = T.bg === 'bg-slate-900';

  useEffect(() => {
    // Scroll selected tag into view
    if (selectedTagId && scrollRef.current) {
        // Simple logic to ensure visibility if needed
    }
  }, [selectedTagId]);

  const handleUpdateTag = (id: string, updates: Partial<Tag>) => {
    setLocalTags(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleAddSubTag = () => {
    if (!selectedTag || !newSubTag.trim()) return;
    handleUpdateTag(selectedTag.id, {
      subTags: [...(selectedTag.subTags || []), newSubTag.trim()]
    });
    setNewSubTag('');
  };

  const handleRemoveSubTag = (sub: string) => {
    if (!selectedTag) return;
    handleUpdateTag(selectedTag.id, {
      subTags: selectedTag.subTags.filter(s => s !== sub)
    });
  };

  const handleDeleteTag = () => {
      if (!selectedTag) return;
      if (confirm(`Delete tag "${selectedTag.name}"?`)) {
          const newTags = localTags.filter(t => t.id !== selectedTag.id);
          setLocalTags(newTags);
          if (newTags.length > 0) setSelectedTagId(newTags[0].id);
          else setSelectedTagId(null);
      }
  };

  const handleSave = () => {
    onUpdateTags(localTags);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[700px] overflow-hidden ${T.bg} ${T.text}`}>
        
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-black/5">
             <h3 className="font-black text-lg">{text.edit}</h3>
             <button onClick={onClose} className="p-2 bg-black/5 rounded-full"><X size={20}/></button>
        </div>

        {/* 1. Top Bar: Tag Selector (Mobile Friendly Horizontal Scroll) */}
        <div className={`py-4 border-b border-black/5 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <div 
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto px-4 no-scrollbar"
            >
                {localTags.map(tag => (
                    <button
                        key={tag.id}
                        onClick={() => setSelectedTagId(tag.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${
                            selectedTagId === tag.id 
                            ? `${tag.color} border-current ring-2 ring-current ring-offset-2 ring-offset-transparent transform scale-105` 
                            : `${isDark ? 'bg-slate-800' : 'bg-white'} border-transparent opacity-60 hover:opacity-100`
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${tag.color.split(' ')[0]} bg-current`} />
                        {tag.name}
                    </button>
                ))}
                
                {/* Add New Tag Placeholder in List */}
                 <button 
                    onClick={() => {
                        const newId = crypto.randomUUID();
                        const newTag: Tag = { id: newId, name: 'New Tag', color: TAG_COLORS[0], type: 'expense', subTags: [] };
                        setLocalTags([...localTags, newTag]);
                        setSelectedTagId(newId);
                    }}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border border-dashed flex items-center gap-1 opacity-50 hover:opacity-100 ${T.text} border-current`}
                >
                    <Plus size={12} /> New
                </button>
            </div>
        </div>

        {/* 2. Main Content: Edit Form */}
        <div className="flex-1 overflow-y-auto p-6">
            {selectedTag ? (
                <div className="space-y-8 pb-10">
                    
                    {/* Name & Budget */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase opacity-40">Name</label>
                            <input 
                                value={selectedTag.name}
                                onChange={e => handleUpdateTag(selectedTag.id, { name: e.target.value })}
                                className={`w-full p-3 rounded-xl border-2 font-bold text-base outline-none bg-transparent ${isDark ? 'border-slate-700 focus:border-indigo-500' : 'border-slate-200 focus:border-indigo-500'}`}
                            />
                        </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase opacity-40">Monthly Budget</label>
                            <input 
                                type="number"
                                value={selectedTag.budgetLimit || ''}
                                onChange={e => handleUpdateTag(selectedTag.id, { budgetLimit: parseFloat(e.target.value) || 0 })}
                                placeholder="None"
                                className={`w-full p-3 rounded-xl border-2 font-bold text-base outline-none bg-transparent ${isDark ? 'border-slate-700 focus:border-indigo-500' : 'border-slate-200 focus:border-indigo-500'}`}
                            />
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-40">Color Theme</label>
                        <div className="flex flex-wrap gap-3">
                            {TAG_COLORS.map(c => {
                                const isSelected = selectedTag.color === c;
                                return (
                                    <button 
                                        key={c} 
                                        onClick={() => handleUpdateTag(selectedTag.id, { color: c })} 
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${c.split(' ')[0]} ${isSelected ? 'ring-4 ring-offset-2 ring-slate-400 scale-110' : 'opacity-80 hover:opacity-100'}`} 
                                    >
                                        {isSelected && <Check size={16} className="text-current" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sub Tags */}
                    <div className="space-y-2">
                         <div className="flex justify-between items-end">
                            <label className="text-[10px] font-black uppercase opacity-40">Sub Tags</label>
                            <span className="text-[10px] font-bold opacity-30">{selectedTag.subTags?.length || 0} items</span>
                         </div>
                         
                         <div className="flex gap-2">
                             <input 
                                value={newSubTag}
                                onChange={e => setNewSubTag(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddSubTag()}
                                placeholder="Add sub tag..."
                                className={`flex-1 p-3 rounded-xl border-2 bg-transparent text-sm font-bold outline-none ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
                             />
                             <button onClick={handleAddSubTag} className={`p-3 rounded-xl bg-black/5 hover:bg-black/10 transition-colors ${T.text}`}><Plus size={20} /></button>
                         </div>

                         <div className="flex flex-wrap gap-2 pt-2">
                             {selectedTag.subTags?.map((sub, i) => (
                                 <div key={i} className={`pl-3 pr-2 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-bold ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <span>{sub}</span>
                                    <button onClick={() => handleRemoveSubTag(sub)} className="opacity-40 hover:text-red-500"><X size={14}/></button>
                                 </div>
                             ))}
                             {(!selectedTag.subTags || selectedTag.subTags.length === 0) && (
                                <div className="text-xs opacity-30 italic p-2">No sub-tags.</div>
                             )}
                         </div>
                    </div>

                </div>
            ) : (
                <div className="h-full flex items-center justify-center opacity-30">No tag selected</div>
            )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <button 
                 onClick={handleDeleteTag}
                 className="flex items-center gap-2 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-xs font-bold"
            >
               <Trash2 size={16} /> Delete
            </button>
            <button 
                onClick={handleSave} 
                className={`px-10 py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all ${T.accent}`}
            >
                {text.save}
            </button>
        </div>

      </div>
    </div>
  );
};