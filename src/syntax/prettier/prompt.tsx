import {
  PromptElement,
  BasePromptElementProps,
  UserMessage,
  AssistantMessage,
} from '@vscode/prompt-tsx';

interface PromptProps extends BasePromptElementProps {
  text: string;
}

export class Prompt extends PromptElement<PromptProps> {
  render() {
    return (
      <>
        <AssistantMessage priority={100}>
          Pretty print the following Coq code. Put the code in a Markdown 
          code block that begins with ```coq and ends with ```.
          <br /> <br />
        </AssistantMessage>
        <UserMessage>
          {this.props.text}
        </UserMessage>
      </>
    );
  }
}