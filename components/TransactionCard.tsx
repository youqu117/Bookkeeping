import React, { useState } from 'react';
import { Transaction, Tag, Account } from '../types';

interface TransactionCardProps {
  transaction: Transaction;
  allTags: Tag[];
  accounts: Account[];
  themeStyles: any;
  text: any;
  onEdit: () => void;
  onDelete: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ 
  transaction, allTags, accounts, themeStyles: T, text, onEdit, onDelete 
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const isExpense = transaction.type === 'expense';
  const isTransfer = transaction.type === 'transfer';
  
  // Account names
  const accountName = accounts.find(a => a.id === transaction.accountId)?.name || 'Unknown';
  const toAccountName = isTransfer ? accounts.find(a => a.id === transaction.toAccountId)?.name : null;

  const displayTags = transaction.tags.map(tagId => 
    allTags.find(t => t.id === tagId)
  ).filter(Boolean) as Tag[];

  return (
    <div 
      className={`rounded-2xl p-4 transition-all duration-200 ${T.card} ${expanded ? 'shadow-lg my-3 border-opacity-100' : 'shadow-sm active:scale-[0.99] border-opacity-60'}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-center">
        
        {/* Left: Icon & Details */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
             isTransfer ? 'bg-slate-100 text-slate-500' : 
             isExpense ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
          }`}>
             <span className="text-lg font-bold">
               {isTransfer ? '→' : isExpense ? '−' : '+'}
             </span>
          </div>

          <div className="min-w-0 flex flex-col">
             <div className="flex items-center gap-2 flex-wrap">
                {isTransfer ? (
                   <span className={`text-xs font-bold ${T.text}`}>
                      {text.transfer}: {accountName} → {toAccountName}
                   </span>
                ) : (
                   displayTags.length > 0 ? (
                      displayTags.map(tag => {
                          const sub = transaction.subTags?.[tag.id];
                          // If sub-tag exists, show ONLY sub-tag. Else show Main tag.
                          const label = sub || tag.name;
                          return (
                            <span key={tag.id} className={`text-xs font-bold px-2 py-0.5 rounded-md border ${tag.color}`}>
                                {label}
                            </span>
                          );
                      })
                   ) : (
                      <span className={`text-xs font-bold ${T.text}`}>{text.unsorted}</span>
                   )
                )}
             </div>
             <span className="text-[10px] opacity-40 font-bold mt-1">
                {new Date(transaction.date).toLocaleDateString()} {transaction.note ? `• ${transaction.note}` : ''}
             </span>
          </div>
        </div>

        {/* Right: Amount */}
        <div className="text-right">
           <div className={`font-black text-base ${isTransfer ? T.text : isExpense ? T.text : 'text-emerald-500'}`}>
              {transaction.amount.toLocaleString()}
           </div>
           {transaction.isConfirmed && (
             <div className="text-[8px] font-bold uppercase text-emerald-500 opacity-80">{text.confirm}</div>
           )}
        </div>
      </div>

      {/* Expanded Actions */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex gap-2 animate-in fade-in">
           <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">{text.edit}</button>
           <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="flex-1 py-2 rounded-lg bg-red-50 text-red-500 text-xs font-bold">{text.delete}</button>
        </div>
      )}
    </div>
  );
};