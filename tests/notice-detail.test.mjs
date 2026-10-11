import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(path, imports) {
  const code = ts.transpileModule(fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText;
  const context = { exports: {}, console, React: imports.react, alert() {}, window: { confirm: () => true },
    require(name) { if (name.endsWith('.css')) return {}; if (!(name in imports)) throw Error(name); return imports[name]; } };
  vm.runInNewContext(code, context);
  return context.exports;
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('detail modal renders loading, error and server detail without fetching', () => {
  const react = { createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
    useRef: () => ({ current: null }), useEffect() {} };
  const Modal = load('src/components/common/NoticeDetailModal.tsx', { react }).default;
  const nodes = node => Array.isArray(node) ? node.flatMap(nodes) : node && typeof node === 'object' ? [node, ...node.children.flatMap(nodes)] : [];
  const loading = nodes(Modal({ notice: null, isOpen: true, loading: true, onClose() {} }));
  assert.ok(loading.some(n => n.props.role === 'status')); assert.ok(loading.some(n => n.props['aria-busy'] === true));
  const failure = nodes(Modal({ notice: null, isOpen: true, error: 'Fixture failure', onClose() {} }));
  assert.equal(failure.find(n => n.props.role === 'alert').children[0], 'Fixture failure');
  const detail = nodes(Modal({ notice: { id: 1, title: 'Server title', content: 'Server body', viewCount: 47 }, isOpen: true, onClose() {} }));
  assert.equal(detail.find(n => n.props.className === 'modal-body-content').children[0], 'Server body');
  assert.ok(detail.some(n => n.children.includes(47)));
  assert.equal(Modal({ notice: null, isOpen: false, onClose() {} }), null);
});
function harness() {
  const slots = []; let cursor = 0; let cleanup;
  const calls = [], results = [], requests = [];
  const react = {
    useState(value) { const index = cursor++; if (!(index in slots)) slots[index] = value;
      return [slots[index], next => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; }]; },
    useRef(value) { const index = cursor++; return slots[index] ??= { current: value }; },
    useCallback(fn) { return fn; },
    useEffect(fn) { cleanup ??= fn(); },
  };
  const { useNoticeDetail } = load('src/hooks/useNoticeDetail.ts', {
    react, '../api/noticeService': { getNoticeById(id) { calls.push(id); const task = deferred(); requests.push(task); return task.promise; } },
  });
  const render = () => { cursor = 0; return useNoticeDetail(value => results.push(value)); };
  return { render, calls, results, requests, unmount: () => cleanup() };
}

test('one explicit click fetches detail; response count is authoritative; renders do not fetch', async () => {
  const h = harness(); const task = h.render().open(1);
  assert.equal(h.render().loading, true); assert.equal(h.render().notice, null);
  await h.render().open(1); assert.deepEqual(h.calls, [1]);
  h.requests[0].resolve({ id: 1, content: 'server detail', viewCount: 47 }); await task;
  assert.equal(h.render().notice.viewCount, 47); assert.equal(h.results[0].content, 'server detail');
  h.render(); await h.render().open(1); assert.deepEqual(h.calls, [1]);
});

test('failure shows error without publishing a count; reopening permits retry', async () => {
  const h = harness(); const task = h.render().open(1); h.requests[0].reject(Error('failure')); await task;
  assert.ok(h.render().error); assert.equal(h.render().loading, false); assert.equal(h.results.length, 0);
  h.render().close(); const retry = h.render().open(1); h.requests[1].resolve({ id: 1, viewCount: 2 }); await retry;
  assert.deepEqual(h.calls, [1, 1]); assert.equal(h.render().notice.viewCount, 2);
});

test('switching notices ignores old response and close ignores late response', async () => {
  const h = harness(); const first = h.render().open(1); const second = h.render().open(2);
  h.requests[1].resolve({ id: 2, viewCount: 8 }); await second;
  h.requests[0].resolve({ id: 1, viewCount: 3 }); await first;
  assert.equal(h.render().notice.id, 2); assert.deepEqual(h.results.map(n => n.id), [2]);
  const third = h.render().open(3); h.render().close(); h.requests[2].resolve({ id: 3 }); await third;
  assert.equal(h.render().isOpen, false); assert.equal(h.render().notice, null); assert.equal(h.results.length, 1);
});

test('A-B-A and reopening pending request reuse one request per ID; unmount invalidates response', async () => {
  const h = harness(); const a = h.render().open(1); const b = h.render().open(2); const back = h.render().open(1);
  assert.deepEqual(h.calls, [1, 2]); h.requests[0].resolve({ id: 1, viewCount: 9 }); await Promise.all([a, back]);
  assert.equal(h.results.length, 1); h.render().close(); h.requests[1].resolve({ id: 2 }); await b;
  const pending = h.render().open(3); h.render().close(); const reopened = h.render().open(3);
  assert.deepEqual(h.calls, [1, 2, 3]); h.unmount(); h.requests[2].resolve({ id: 3 }); await Promise.all([pending, reopened]);
  assert.equal(h.results.length, 1);
});

for (const page of ['notice/NoticeListPage', 'home/HomePage']) {
  test(`${page} connects click, server response, modal and deletion without incrementing locally`, async () => {
    const original = { id: 1, title: 'Fixture', content: 'old', date: '2026-10-11', viewCount: 0 };
    const slots = []; let cursor = 0; let onLoaded; const opened = []; let closed = 0; const deleted = [];
    const detail = { notice: { ...original, content: 'new', viewCount: 20 }, selectedId: 1, isOpen: true, loading: false, error: null,
      open: async id => opened.push(id), close: () => closed++ };
    const react = {
      createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
      useState(value) { const index = cursor++; if (!(index in slots)) slots[index] = value;
        return [slots[index], next => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; }]; },
      useEffect() {},
    };
    const Modal = 'DetailModal'; const Create = 'CreateModal';
    const exports = load(`src/pages/${page}.tsx`, {
      react, 'react-router-dom': { Link: 'Link', useLocation: () => ({}) },
      '../../api/noticeService': { getNotices: async () => [original], deleteNotice: async id => deleted.push(id) },
      '../../hooks/useNoticeDetail': { useNoticeDetail: callback => { onLoaded = callback; return detail; } },
      '../../hooks/useAuthRole': { useAuthRole: () => ({}) },
      '../../components/common/NoticeDetailModal': { default: Modal, __esModule: true },
      '../../components/common/PermissionGate': { default: 'Gate', __esModule: true },
      './NoticeCreateModal': { default: Create, __esModule: true },
      ...Object.fromEntries(['SemiconductorHero', 'HomeEvents', 'HomeGallery'].map(name => [`../../components/home/${name}`, { default: name, __esModule: true }])),
    });
    slots[0] = [original]; slots[1] = page.startsWith('home') ? 'ready' : false;
    const render = () => { cursor = 0; return exports.default(); };
    const flatten = node => Array.isArray(node) ? node.flatMap(flatten) : node && typeof node === 'object' ? [node, ...node.children.flatMap(flatten)] : [];
    let nodes = flatten(render());
    const row = nodes.find(n => n.props.className?.includes(page.startsWith('home') ? 'interactive-notice-row' : 'notice-row'));
    await row.props.onClick(); assert.deepEqual(opened, [1]);
    onLoaded(detail.notice); nodes = flatten(render());
    assert.equal(slots[0][0].viewCount, 20); assert.equal(slots[0][0].content, 'new');
    assert.equal(nodes.find(n => n.type === Modal).props.notice.viewCount, 20);
    if (!page.startsWith('home')) {
      let stopped = false;
      await nodes.find(n => n.props.className === 'btn-delete-item').props.onClick({ stopPropagation() { stopped = true; } });
      assert.equal(stopped, true); assert.deepEqual(deleted, [1]); assert.equal(slots[0].length, 0); assert.equal(closed, 1);
      assert.deepEqual(opened, [1]); assert.equal(typeof nodes.find(n => n.type === Create).props.onSuccess, 'function');
    }
  });
}
