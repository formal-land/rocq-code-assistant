import * as assert from 'assert';
import * as utils from '../../../utils';
import * as prompt2 from '../../../oracles/natural-language-description/prompt2';

suite('Prompt2 Test Suite', () => {
  test('Complete', () => {
    const { messages } = prompt2.render([]);

    assert.fail('\n' + utils.languageModelChatMessagesToString(messages));
  });
});