// Shared types for the application

export interface Attachment {
  readonly id: string;
  readonly uri: string;
  readonly name: string;
  readonly type: 'image' | 'pdf' | 'document';
  readonly size?: number;
  readonly mimeType?: string;
}

export interface Transaction {
  readonly id: string;
  readonly description: string;
  readonly amount: number; // Amount in cents for precision
  readonly date: string;
  readonly category: string;
  readonly attachments?: Attachment[];
}

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly color: string;
}

export type TransactionType = 'income' | 'expense';
export type TransactionMode = 'add' | 'edit';
export type AttachmentType = 'image' | 'pdf' | 'document';

export interface TransactionFormProps {
  type: TransactionType;
  mode: TransactionMode;
}
