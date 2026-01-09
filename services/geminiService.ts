import { GoogleGenAI } from "@google/genai";
import { Transaction, Tag, Account } from "../types";

export interface AIResponse {
  action: 'create' | 'analysis' | 'chat';
  text?: string;
  data?: any;
}

export const processWithGemini = async (
  apiKey: string,
  userInput: string,
  context: { tags: Tag[], accounts: Account[], recentTransactions: Transaction[] }
): Promise<AIResponse> => {
  if (!apiKey) {
      return { action: 'chat', text: 'Please set your Google Gemini API Key in Settings first.' };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Format context for the AI
  const tagContext = context.tags.map(t => 
    `Tag: "${t.name}" (ID: ${t.id})${t.subTags.length > 0 ? `, SubTags: [${t.subTags.join(', ')}]` : ''}`
  ).join('\n');
  
  const accountContext = context.accounts.map(a => 
    `Account: "${a.name}" (ID: ${a.id})`
  ).join('\n');

  const txContext = JSON.stringify(context.recentTransactions.slice(0, 10).map(t => ({
      date: new Date(t.date).toLocaleDateString(),
      amount: t.amount,
      type: t.type,
      note: t.note
  })));

  const systemPrompt = `
    You are an intelligent financial assistant for a bookkeeping app.
    
    Current Context:
    - Date: ${new Date().toLocaleDateString()}
    - Available Accounts:
    ${accountContext}
    - Available Tags (Categories):
    ${tagContext}
    - Recent Transactions (for analysis):
    ${txContext}

    USER INPUT: "${userInput}"

    Your Goal: Determine the user's intent and return a JSON object.

    SCENARIO 1: RECORD A TRANSACTION
    If the user wants to add/record/log a spending or income (e.g., "Lunch 20", "Taxi to airport 50", "Salary 5000"):
    - Extract: amount (number), type ('expense' | 'income' | 'transfer'), accountId (pick most logical or default to first one), tags (array of ONE tag ID that matches best), subTags (map { tagId: subTagName } if a sub-tag matches).
    - If transfer, try to infer toAccountId.
    - Return JSON:
      {
        "action": "create",
        "data": {
           "amount": 100,
           "type": "expense",
           "accountId": "...",
           "tags": ["..."],
           "subTags": { "...": "..." },
           "note": "..."
        },
        "text": "I've prepared this transaction for you."
      }

    SCENARIO 2: ANALYSIS
    If the user asks for a summary, total, or insight (e.g., "How much did I spend on food?", "Weekly summary"):
    - Analyze the provided recent transactions.
    - Return JSON:
      {
        "action": "analysis",
        "text": "Your analysis here..."
      }

    SCENARIO 3: CHAT
    If the input is greeting or unclear:
    - Return JSON:
      {
        "action": "chat",
        "text": "Hello! I can help you record transactions or analyze your spending."
      }

    IMPORTANT: OUTPUT MUST BE RAW JSON ONLY. NO MARKDOWN BLOCK.
  `;

  try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: systemPrompt }] }],
        config: { responseMimeType: 'application/json' }
      });
      
      const responseText = response.text;
      if (!responseText) throw new Error("Empty response from AI");
      
      return JSON.parse(responseText);
  } catch (error) {
      console.error("Gemini Error:", error);
      return { action: 'chat', text: "Sorry, I encountered an error processing your request." };
  }
};