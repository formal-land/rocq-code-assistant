import {
  BasePromptElementProps,
  PrioritizedList,
  PromptElement,
  PromptSizing,
  UserMessage
} from '@vscode/prompt-tsx';
import { Goal, Hyp, PpString } from '../../lib/coq-lsp/types';
import { OracleParams } from '../types';
import { ChatResponsePart } from '@vscode/prompt-tsx/dist/base/vscodeTypes';
import { Progress, CancellationToken } from 'vscode';
import { Token } from '../../syntax/tokenizer';
import { Name } from '../../syntax/scope';

export interface PromptProps extends BasePromptElementProps {
  goal: Goal<PpString>,
  params?: OracleParams
}

export class Prompt extends PromptElement<PromptProps> {
  async render(state: void, sizing: PromptSizing, progress?: Progress<ChatResponsePart>, token?: CancellationToken) {    
    if (this.props.params?.errorHistory)
      return (
        <UserMessage>
          You are a Coq expert. <br />
          You will be provided with a description of a theorem and your task is to solve it. <br />
          Try to keep things as simple as possible. <br />
          Return a solution consisting of a sequence of valid Coq tactics to solve the goal. <br />
          Put the solution in a Markdown code block that begins with ```coq and ends with ```. <br /> <br />
          <GoalPrompt goal={this.props.goal} /> <br /> <br />
        </UserMessage>
      );
    else
      return (<></>)
  }
}

// <ErrorHistoryPrompt errorHistory={this.props.params.errorHistory}/>

export interface GoalPromptProps extends BasePromptElementProps {
  goal: Goal<PpString>
}

class GoalPrompt extends PromptElement<GoalPromptProps> {
  async render(state: void, sizing: PromptSizing, progress?: Progress<ChatResponsePart>, token?: CancellationToken) {
    return (
      <> 
        The goal you have to prove is: <br /> <br />
        { this.props.goal.ty } <br /> <br />
        <GoalHypotesisPrompt hypotheses={this.props.goal.hyps} />
      </>
    );
  }
}

export interface GoalHypothesesPromptProps extends BasePromptElementProps {
  hypotheses: Hyp<PpString>[]
}

class GoalHypotesisPrompt extends PromptElement<GoalHypothesesPromptProps> {
  async render(state: void, sizing: PromptSizing, progress?: Progress<ChatResponsePart>, token?: CancellationToken) {
    const hypothesesParts = [];
    const flatHypoteses = this.props.hypotheses.flatMap(
      hypotesis => hypotesis.names.map(name => ({ name: name, ty: hypotesis.ty })));

    for (const hypotesis of flatHypoteses) {
      hypothesesParts.push(
        <GoalHypothesisPartPrompt name={hypotesis.name} ty={hypotesis.ty}/>
      );
    }
 
    return (
      <>
        Under the following hypoteses: <br />
        {hypothesesParts}
      </>
    );
  }
}

export interface GoalHypothesisPartPromptProps extends BasePromptElementProps {
  name: PpString,
  ty: PpString
}

class GoalHypothesisPartPrompt extends PromptElement<GoalHypothesisPartPromptProps> {
  async render(state: void, sizing: PromptSizing, progress?: Progress<ChatResponsePart>, token?: CancellationToken) {
    return (<> * {this.props.name} : {this.props.ty} </>);
  }
}

export interface ErrorHistoryPromptProps extends BasePromptElementProps {
  errorHistory: { 
    tactics: Token[],
    at: number,
    message?: string }[]
}

class ErrorHistoryPrompt extends PromptElement<ErrorHistoryPromptProps> {
  async render(state: void, sizing: PromptSizing, progress?: Progress<ChatResponsePart>, token?: CancellationToken) {
    const errorHistoryParts = [];

    for (const [idx, errorHistoryEntry] of this.props.errorHistory.entries()) {
      errorHistoryParts.push(
        <UserMessage>
          <ErrorHistoryPartPrompt 
            tactics={errorHistoryEntry.tactics} 
            at={errorHistoryEntry.at} 
            idx={idx}
            message={errorHistoryEntry.message} />
        </UserMessage>)
    }

    return (
      <>
        <UserMessage>
          These solutions have already been tried and they do not work. <br /> 
          Please, avoid them. <br />
          For each of them, the tactic where it failed is put between triple angle brackets {'<<< >>>'} and a
          description of the error is provided. <br />
        </UserMessage>
        <PrioritizedList priority={0} descending={false}>
          {errorHistoryParts}
        </PrioritizedList>
      </>
    );
  }
}

export interface ErrorHistoryPartPromptProps extends BasePromptElementProps {
  tactics: Token[],
  at: number,
  idx: number,
  message?: string
}

class ErrorHistoryPartPrompt extends PromptElement<ErrorHistoryPartPromptProps> {
  async render(state: void, sizing: PromptSizing, progress?: Progress<ChatResponsePart>, token?: CancellationToken) {
    const errorMessage = this.props.message?.trim().replaceAll('\n', `\n\t${' '.repeat('- error: '.length)}`);
    const tactics = this.props.tactics.reduce((str, tactic, idx) =>
        str + 
        (idx === this.props.at ? `<<< ${tactic.value} >>>` : tactic.value) + 
        (tactic.scopes.includes(Name.FOCUSING_CONSTRUCT) ? ' ' : '\n\t\t'), '\n\t\t')

    return (
      <UserMessage>
        * Solution {this.props.idx + 1}: <br />
        {'\t'} - tactics: {tactics} <br />
        {'\t'} - error: {errorMessage}
      </UserMessage>
    );
  }
}