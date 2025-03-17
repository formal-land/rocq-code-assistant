import { PromptElement, BasePromptElementProps, UserMessage, AssistantMessage } from '@vscode/prompt-tsx';
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
				<AssistantMessage priority={100}>
					You are a Coq expert. 
					<br />
					You will be provided with a description of a theorem and your task is to solve it.
					<br />
					Return a sequence of valid Coq tactics to solve the goal. Put the tactics in a Markdown 
					code block that begins with ```coq and ends with ```.
					<br />
				</AssistantMessage>
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
		return(
			<>
				<AssistantMessage priority={90}>
					These solutions have already been tried and they do not work. Please, avoid them. For each of them, a description
					of the corresponding error is provided. <br/>
					{
						this.props.errorHistory.map((error, idx) => 
							<>
								* Solution { idx }: <br/>
								{'\t'} - tactics: { error.tactics.map(tactic => tactic.value).join(' ') } <br/>
								{ 
									error.message ? 
									<> 
										{'\t'} - error: { error.message.trim().replaceAll('\n', ', ') } <br/> 
									</> : 
									<></> 
								}
							</>
						)
					}
				</AssistantMessage>
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
								* {block.ty}: {name} <br/> 
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