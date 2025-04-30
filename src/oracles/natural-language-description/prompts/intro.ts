import { LanguageModelChatMessage } from 'vscode';
import { Goal, PpString } from '../../../lib/coq-lsp/types';

export function render(goal: Goal<PpString>) {
  const messages: LanguageModelChatMessage[] = [];

  const rolePart = LanguageModelChatMessage.User('You are an expert in math and Coq theorem proving.');
  
  const introPart = LanguageModelChatMessage.User(`\
You will be given a goal statement written in Coq, and your task is to provide a natural language \
translation of the statement.

**Instructions:**
- Produce a clear and schematic description of:
  + the types of the variables (if any).
  + the hypoteses (if any).
  + the goal.
- The description should be formatted so that is can be easly understood by another LLM.
- Produce the goal description only, without any introduction.`);

  const hypotesisPart = goal.hyps
    .flatMap(block => 
      block.names.map(name => `- ${name} : ${block.ty}`))
    .join('\n');

  const goalPart = LanguageModelChatMessage.User(`\
The goal you have to describle is:

${goal.ty} ${hypotesisPart.length > 0 ? `

Under the following hypotesis: 

${hypotesisPart}` : ''}`);

  messages.push(rolePart, introPart, goalPart);
  
  return messages;
}