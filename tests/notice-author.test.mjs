import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('notice modal submits content without selecting an author', async () => {
  const states = ['일반', 'Fixture title', 'Fixture content', false, false];
  const submitted = [];
  let refreshed = 0;
  const react = {
    useState: () => [states.shift(), () => {}],
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
  };
  const code = ts.transpileModule(fs.readFileSync(new URL('../src/pages/notice/NoticeCreateModal.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText;
  const sandbox = {
    exports: {}, console, alert: () => {},
    require: name => {
      if (name === 'react') return react;
      if (name === '../../api/noticeService') return { createNotice: async payload => submitted.push(JSON.parse(JSON.stringify(payload))) };
      throw new Error(`Unexpected import: ${name}`);
    },
  };
  vm.runInNewContext(code, sandbox);
  const tree = sandbox.exports.default({ isOpen: true, onClose() {}, onSuccess() { refreshed++; } });
  const findForm = node => node?.type === 'form' ? node : node?.children?.map(findForm).find(Boolean);
  await findForm(tree).props.onSubmit({ preventDefault() {} });
  assert.deepEqual(submitted, [{ category: '일반', title: 'Fixture title', content: 'Fixture content', isPinned: false }]);
  assert.equal(refreshed, 1);
});
