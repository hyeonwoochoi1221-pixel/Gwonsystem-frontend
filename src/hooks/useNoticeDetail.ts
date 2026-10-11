import { useCallback, useEffect, useRef, useState } from 'react';
import { getNoticeById } from '../api/noticeService';
import { Notice } from '../types';

export function useNoticeDetail(onLoaded: (notice: Notice) => void) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const version = useRef(0);
  const selected = useRef<number | null>(null);
  const pending = useRef(new Map<number, Promise<Notice>>());
  const callback = useRef(onLoaded);
  callback.current = onLoaded;

  useEffect(() => () => { version.current++; selected.current = null; }, []);

  const close = useCallback(() => {
    version.current++;
    selected.current = null;
    setIsOpen(false);
    setNotice(null);
    setLoading(false);
    setError(null);
  }, []);

  const open = useCallback(async (id: number) => {
    if (selected.current === id) return;
    selected.current = id;
    const requestVersion = ++version.current;
    setIsOpen(true);
    setNotice(null);
    setLoading(true);
    setError(null);
    let request = pending.current.get(id);
    if (!request) {
      request = getNoticeById(id);
      pending.current.set(id, request);
    }
    try {
      const detail = await request;
      if (version.current !== requestVersion) return;
      setNotice(detail);
      callback.current(detail);
    } catch {
      if (version.current === requestVersion)
        setError('공지사항을 불러오지 못했습니다. 닫은 뒤 다시 시도해 주세요.');
    } finally {
      if (pending.current.get(id) === request) pending.current.delete(id);
      if (version.current === requestVersion) setLoading(false);
    }
  }, []);

  return { notice, selectedId: selected.current, isOpen, loading, error, open, close };
}
