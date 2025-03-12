import { Goal, PpString } from '../lib/coq-lsp/types';

export interface Oracle {
  query(goal: Goal<PpString>): Promise<string>
}