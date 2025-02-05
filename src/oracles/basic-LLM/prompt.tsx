import {
	PromptElement,
	BasePromptElementProps,
	UserMessage,
	AssistantMessage,
} from '@vscode/prompt-tsx';
import { 
  Goal, 
  PpString 
} from '../../lib/coq-lsp/types';

interface PromptProps extends BasePromptElementProps {
	goal: Goal<PpString>
}

export class Prompt extends PromptElement<PromptProps> {
	render() {
		return (
			<>
				<AssistantMessage priority={100}>
					You are a Coq expert. 
					<br />
					Your task is to help the user to prove his theorems.
					<br />
					Return one or more valid Coq tactics to solve the goal. Put the tactics in a Markdown 
					code block that begins with ```coq and ends with ```.
					<br />
				</AssistantMessage>
				<GoalMessage goal={this.props.goal} />
			</>
		);
	}
}

interface GoalMessagePrompt extends BasePromptElementProps {
	goal: Goal<PpString>
}

class GoalMessage extends PromptElement<GoalMessagePrompt> {
	render() {
		const hypotesis = this.props.goal.hyps.flatMap(
			block => block.names.map(name => 
				<>
					{block.ty}: {name}
					<br />
				</>
			)
		);
		
		return (
      <UserMessage>
        The goal you have to prove is: <br />
        {this.props.goal.ty} <br />
        You can use the following hypotesis: <br />
        {hypotesis}
      </UserMessage>
		);
	}
}