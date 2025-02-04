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
					You are a Coq expert. <br/>
					Your task is to help the user write Coq code to solve their theorems. <br />
					Return the Coq code only. <br />
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
		const flatHyp = this.props.goal.hyps.flatMap(
			block => block.names.map(name => ({ ty: block.ty, name: name }))
		);
		
		return (
			<>
				<UserMessage>
					The goal you have to prove is: <br />
					{this.props.goal.ty} <br />
					Under the following hypotesis: <br />
					{flatHyp.map(({ty, name}) => <>{ty}: {name}<br /></>)}
				</UserMessage>
			</>
		);
	}
}