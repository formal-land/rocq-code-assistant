import { PromptElement, BasePromptElementProps, UserMessage, AssistantMessage } from '@vscode/prompt-tsx';
import { Goal, PpString } from '../../lib/coq-lsp/types';

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
					You will be provided with a description of a theorem and your task is to solve it.
					<br />
					Return a sequence of valid Coq tactics to solve the goal. Put the tactics in a Markdown 
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
		let hypotesis;

		if (this.props.goal.hyps.length > 0) {
			hypotesis =
				<>
					You can use the following hypotesis: <br /> <br />
					{ 
						this.props.goal.hyps.flatMap(block => 
							block.names.map(name => 
								<> 
									- {block.ty}: {name} <br /> 
								</>
							))
					}
				</>
		}
		
		return (
      <UserMessage>
        The goal you have to prove is: <br /> <br />
        {this.props.goal.ty} <br /> <br />
        {hypotesis}
      </UserMessage>
		);
	}
}