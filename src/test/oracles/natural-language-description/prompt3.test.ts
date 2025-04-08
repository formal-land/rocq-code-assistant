import * as assert from 'assert';
import * as utils from '../../../utils';
import * as prompt3 from '../../../oracles/natural-language-description/prompt3';

suite('Prompt3 Test Suite', () => {
  test('Complete', () => {
    const { messages } = prompt3.render([]);
   
    assert.fail('\n' + utils.languageModelChatMessagesToString(messages));
  });
});