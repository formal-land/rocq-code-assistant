import { LanguageModelChatMessage } from 'vscode';
import { Goal, PpString } from '../../lib/coq-lsp/types';

export function render(goal: Goal<PpString>, proofNLDescription: string) {
  const messages: LanguageModelChatMessage[] = [];

  const introPart = LanguageModelChatMessage.User(`\
You are an expert in math and Coq theorem proving.
You will be given a goal definition written in Coq code and a complete description of proof for \
that goal in natural language.

Your task is to translate the proof in Coq code.

**Instructions:**  
- Keep the translated proof as simple and direct as possible.  
- Output only the sequence of valid Coq tactics required to solve the goal.  
- Do not include explanations, comments, imports, theorem definitions or any additional text.  
- Ensure no steps are omitted and the proof is complete in every part.  
- The output must be directly executable by Coq without any modifications and must correctly reference \
  all the variables and hypotheses names used in the Coq goal definition.
- Format the solution in a Markdown code block that starts with \`\`\`coq and ends with \`\`\`.`);

  const hypotesisPart = goal.hyps
    .flatMap(block => 
      block.names.map(name => `* ${name} : ${block.ty}`))
    .join('\n');

  const goalPart = LanguageModelChatMessage.User(`\
The goal the proof refers to is:

${goal.ty} ${hypotesisPart.length > 0 ? `

You can use the following hypotesis: 

${hypotesisPart}` : ''}`);

  const proofNLPart = LanguageModelChatMessage.User(`\
This is a complete description of the proof in natural language:

${proofNLDescription}`);

  messages.push(introPart);
  messages.push(goalPart);
  messages.push(proofNLPart);

  return messages;
}