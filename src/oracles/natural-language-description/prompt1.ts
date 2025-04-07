import { LanguageModelChatMessage } from 'vscode';
import { Goal, PpString } from '../../lib/coq-lsp/types';
import { OracleParams } from '../types';

export function render(goal: Goal<PpString>) {
  const messages: LanguageModelChatMessage[] = [];

  const introPart = LanguageModelChatMessage.User(`
You are an expert in math and Coq theorem proving.
You will be given a goal statement written in Coq, and your task is to provide a natural language translation of the statement.
Produce a clear and schematic description of:
- the types of the variables (if any)
- the hypoteses (if any)
- the goal

**Instructions:**
- The description should be understood by another LLM.
- Produce the goal description only, without any introduction.
`);

  const hypotesisPart = goal.hyps
    .flatMap(block => 
      block.names.map(name => `* ${name} : ${block.ty}`))
    .join('\n');

  const goalPart = LanguageModelChatMessage.User(`The goal you have to describle is:

${goal.ty} ${hypotesisPart.length > 0 ? `

Under the following hypotesis: 
${hypotesisPart}` : ''}`);

  messages.push(introPart);
  messages.push(goalPart);
  return messages;
}