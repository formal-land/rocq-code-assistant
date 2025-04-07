import { LanguageModelChatMessage } from 'vscode';
import { Goal, PpString } from '../../lib/coq-lsp/types';

export function render(goal: Goal<PpString>, goalNLDescription: string) {
  const messages: LanguageModelChatMessage[] = [];

  const introPart = LanguageModelChatMessage.User(`\
You are an expert in math and Coq theorem proving.
You will be given a goal statement, both in Coq code and in natural language and your task is to \
solve the problem providing a complete description of the proof in natural language.

**Instructions:** 
- The description must be precise, complete and describe any non trivial step of the proof
- It must be presented across multiple successive points
- Produce the proof description only, without any introduction.
`);

  const hypotesisPart = goal.hyps
    .flatMap(block => 
      block.names.map(name => `* ${name} : ${block.ty}`))
    .join('\n');

  const goalPart = LanguageModelChatMessage.User(`\
The goal you have to prove is:

${goal.ty} ${hypotesisPart.length > 0 ? `
  
You can use the following hypotesis: 

${hypotesisPart}` : ''}`);
  
  const nlPart = LanguageModelChatMessage.User(`\
This is a complete description of the goal in natural language:

${goalNLDescription}`);  

  messages.push(introPart);
  messages.push(goalPart);
  messages.push(nlPart);

  return messages;
}