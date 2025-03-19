import { PromptElement, BasePromptElementProps, UserMessage, AssistantMessage, SystemMessage, PromptPiece, PrioritizedList } from '@vscode/prompt-tsx';
import { Goal, PpString } from '../../lib/coq-lsp/types';
import { OracleParams } from '../types';
import { Token } from '../../syntax/tokenizer';

interface PromptProps extends BasePromptElementProps {
	goal: Goal<PpString>
	params?: OracleParams
}

export class Prompt extends PromptElement<PromptProps> {
	render() {
		return (
			<>
				<UserMessage priority={100}>
					You are a Coq expert. <br />
					You will be provided with a description of a theorem and your task is to solve it. <br />
					Return a sequence of valid Coq tactics to solve the goal. Put the tactics in a Markdown 
					code block that begins with ```coq and ends with ```. <br />
				</UserMessage>
				<GoalMessage goal={this.props.goal} priority={100} />
				{ this.props.params?.errorHistory && this.props.params.errorHistory.length > 0 ? 
				  <ErroryHistoryMessage errorHistory={this.props.params.errorHistory} /> : <></> }
			</>
		);
	}
}

interface ErrorHistoryMessagePrompt extends BasePromptElementProps {
	errorHistory: { tactics: Token[], message?: string }[];
}

class ErroryHistoryMessage extends PromptElement<ErrorHistoryMessagePrompt> {
	render() {
		const errorHistory: UserMessage[] = [];
		for (const [idx, { tactics, message }] of this.props.errorHistory.entries()) {
			errorHistory.push(
				<UserMessage>
					* Solution { idx + 1 }: <br/>
					{'\t'}- tactics: { <AssistantMessage> { tactics.map(tactic => tactic.value).join(' ') } </AssistantMessage> } <br/>
					{'\t'}- error: { message?.trim().replaceAll('\n', `\n\t${' '.repeat('- error: '.length)}`) } <br/> 
				</UserMessage>
			)
		}

		return(
			<>
				<UserMessage priority={90}>
					These solutions have already been tried and they do not work. Please, avoid them. For each of them, a description
					of the corresponding error is provided. <br/>
				</UserMessage>
				<PrioritizedList priority={0} descending={false}>
					{errorHistory}
				</PrioritizedList>
			</>
		)
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
					You can use the following hypotesis: <br/>
					{ 
						this.props.goal.hyps.flatMap(block => block.names.map(name => 
							<>
								* {name} : {block.ty} <br/> 
							</>
						))
					}
				</>
		}
		
		return (
      <UserMessage>
        The goal you have to prove is: <br/> <br/>
        {this.props.goal.ty} <br/> <br/>
        {hypotesis}
      </UserMessage>
		);
	}
}