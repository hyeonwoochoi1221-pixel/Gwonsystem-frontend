// src/pages/auth/FindAccountPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../../assets/logo.svg?react';
import {
  findUsername,
  sendPasswordResetCode,
  verifyEmailCode,
  resetPassword,
} from '../../api/authService';
import './Auth.css';

// 전화번호 자동 하이픈 포맷터
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

// 백엔드 예외 메시지 안전 추출기
const extractErrorMessage = (err: any, fallback: string): string => {
  return (
    err.response?.data?.message ||
    (typeof err.response?.data === 'string' ? err.response.data : null) ||
    fallback
  );
};

export default function FindAccountPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'username' | 'password'>('username');

  // ==========================
  // 1. 아이디 찾기 상태
  // ==========================
  const [findIdForm, setFindIdForm] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
  });
  const [findIdLoading, setFindIdLoading] = useState(false);

  // ==========================
  // 2. 비밀번호 재설정 상태
  // ==========================
  const [resetForm, setResetForm] = useState({
    username: '',
    email: '',
    code: '',
    newPassword: '',
    newPasswordConfirm: '',
  });

  const [isCodeSent, setIsCodeSent] = useState(false);         // 인증번호 발송 여부
  const [isCodeVerified, setIsCodeVerified] = useState(false); // 인증 완료 여부
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [verifyCodeLoading, setVerifyCodeLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [timer, setTimer] = useState(180); // 3분 (180초)

  // 3분 카운트다운 타이머
  useEffect(() => {
    let interval: any;
    if (isCodeSent && !isCodeVerified && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && isCodeSent && !isCodeVerified) {
      toast.error('인증 유효시간(3분)이 초과되었습니다. 인증번호를 다시 발송해 주세요.');
    }
    return () => clearInterval(interval);
  }, [isCodeSent, isCodeVerified, timer]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTabChange = (tab: 'username' | 'password') => {
    setActiveTab(tab);
  };

  // ----------------------------------------------------
  // [1] 아이디 찾기 제출
  // ----------------------------------------------------
  const handleFindUsernameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFindIdLoading(true);

    try {
      const res = await findUsername(findIdForm);
      toast.success(res.message || '가입된 아이디 정보를 이메일로 전송했습니다.');
    } catch (err: any) {
      const msg = extractErrorMessage(err, '일치하는 회원 정보를 찾을 수 없습니다.');
      toast.error(msg);
    } finally {
      setFindIdLoading(false);
    }
  };

  // ----------------------------------------------------
  // [2] 비밀번호 재설정 - 1단계: 인증코드 발송
  // ----------------------------------------------------
  const handleSendCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!resetForm.username.trim() || !resetForm.email.trim()) {
      toast.error('아이디와 가입 이메일을 모두 입력해 주세요.');
      return;
    }

    setSendCodeLoading(true);

    try {
      const res = await sendPasswordResetCode({
        username: resetForm.username.trim(),
        email: resetForm.email.trim(),
      });

      setIsCodeSent(true);
      setIsCodeVerified(false);
      setTimer(180);
      toast.success(res.message || '인증번호가 발송되었습니다. 3분 이내로 입력해 주세요.');
    } catch (err: any) {
      const msg = extractErrorMessage(err, '아이디와 이메일이 일치하지 않거나 발송에 실패했습니다.');
      toast.error(msg);
    } finally {
      setSendCodeLoading(false);
    }
  };

  // ----------------------------------------------------
  // [3] 비밀번호 재설정 - 2단계: 인증코드 6자리 일치 확인
  // ----------------------------------------------------
  const handleVerifyCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!resetForm.code || resetForm.code.trim().length !== 6) {
      toast.error('6자리 인증번호를 정확히 입력해 주세요.');
      return;
    }
    if (timer <= 0) {
      toast.error('인증 시간이 만료되었습니다. 인증번호를 다시 발송해 주세요.');
      return;
    }

    setVerifyCodeLoading(true);

    try {
      const res = await verifyEmailCode(resetForm.email.trim(), resetForm.code.trim());
      if (res.verified) {
        setIsCodeVerified(true);
        toast.success('인증번호가 정상 확인되었습니다.');
      } else {
        toast.error(res.message || '인증번호가 일치하지 않습니다.');
      }
    } catch (err: any) {
      const msg = extractErrorMessage(err, '인증번호가 일치하지 않거나 유효시간이 초과되었습니다.');
      toast.error(msg);
    } finally {
      setVerifyCodeLoading(false);
    }
  };

  // ----------------------------------------------------
  // [4] 비밀번호 재설정 - 3단계: 최종 변경 완료
  // ----------------------------------------------------
  const handleResetPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isCodeSent) {
      toast.error('먼저 인증번호를 발송해 주세요.');
      return;
    }

    if (!isCodeVerified) {
      toast.error('인증번호 [인증 확인]을 먼저 완료해 주세요.');
      return;
    }

    if (resetForm.newPassword !== resetForm.newPasswordConfirm) {
      toast.error('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(resetForm.newPassword)) {
      toast.error('비밀번호는 8자 이상 영문, 숫자, 특수문자(@$!%*#?&)를 포함해야 합니다.');
      return;
    }

    setResetLoading(true);

    try {
      const res = await resetPassword({
        username: resetForm.username.trim(),
        email: resetForm.email.trim(),
        code: resetForm.code.trim(),
        newPassword: resetForm.newPassword,
      });

      toast.success(res.message || '비밀번호가 안전하게 재설정되었습니다.');
      navigate('/login', { state: { registeredUsername: resetForm.username } });
    } catch (err: any) {
      const msg = extractErrorMessage(err, '비밀번호 재설정 처리 중 오류가 발생했습니다.');
      toast.error(msg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card find-card">
        {/* 상단 로고 헤더 */}
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <Logo className="auth-logo-svg" />
            <span className="auth-logo-text">GWON SYSTEM</span>
          </Link>
          <h2>계정 찾기</h2>
          <p>등록된 계정 정보 및 비밀번호를 안전하게 찾습니다.</p>
        </div>

        {/* 탭 전환 버튼 */}
        <div className="find-tab-group">
          <button
            type="button"
            className={`find-tab-btn ${activeTab === 'username' ? 'active' : ''}`}
            onClick={() => handleTabChange('username')}
          >
            아이디 찾기
          </button>
          <button
            type="button"
            className={`find-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => handleTabChange('password')}
          >
            비밀번호 재설정
          </button>
        </div>

        {/* ===================================================
            탭 1: 아이디 찾기
           =================================================== */}
        {activeTab === 'username' && (
          <form className="auth-form" onSubmit={handleFindUsernameSubmit}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>성</label>
                <input
                  type="text"
                  placeholder="예: 최"
                  value={findIdForm.lastName}
                  onChange={(e) => setFindIdForm({ ...findIdForm, lastName: e.target.value })}
                  disabled={findIdLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label>이름</label>
                <input
                  type="text"
                  placeholder="예: 현우"
                  value={findIdForm.firstName}
                  onChange={(e) => setFindIdForm({ ...findIdForm, firstName: e.target.value })}
                  disabled={findIdLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>가입 시 등록한 휴대폰 번호</label>
              <input
                type="tel"
                placeholder="010-0000-0000"
                value={findIdForm.phone}
                onChange={(e) =>
                  setFindIdForm({ ...findIdForm, phone: formatPhoneNumber(e.target.value) })
                }
                maxLength={13}
                disabled={findIdLoading}
                required
              />
            </div>

            <div className="form-group">
              <label>가입 시 등록한 이메일</label>
              <input
                type="email"
                placeholder="user@gwonsystem.com"
                value={findIdForm.email}
                onChange={(e) => setFindIdForm({ ...findIdForm, email: e.target.value })}
                disabled={findIdLoading}
                required
              />
            </div>

            <button type="submit" className="btn-auth-submit" disabled={findIdLoading}>
              {findIdLoading ? '확인 및 메일 발송 중...' : '아이디 이메일로 전송'}
            </button>
          </form>
        )}

        {/* ===================================================
            탭 2: 비밀번호 재설정
           =================================================== */}
        {activeTab === 'password' && (
          <form className="auth-form" onSubmit={handleResetPasswordSubmit}>
            <div className="form-group">
              <label>아이디</label>
              <input
                type="text"
                placeholder="등록된 아이디 입력"
                value={resetForm.username}
                onChange={(e) => setResetForm({ ...resetForm, username: e.target.value })}
                disabled={isCodeSent}
                required
              />
            </div>

            <div className="form-group">
              <label>가입 이메일</label>
              <div className="email-input-row">
                <input
                  type="email"
                  placeholder="user@gwonsystem.com"
                  value={resetForm.email}
                  onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                  disabled={isCodeSent}
                  required
                />
                <button
                  type="button"
                  className="btn-email-action"
                  onClick={handleSendCode}
                  disabled={sendCodeLoading || isCodeVerified}
                >
                  {sendCodeLoading
                    ? '발송 중...'
                    : isCodeSent
                      ? '인증번호 재발송'
                      : '인증번호 발송'}
                </button>
              </div>
            </div>

            {/* 🌟 인증번호 발송 완료 시 노출되는 일치 확인 UI */}
            {isCodeSent && (
              <div className="email-otp-box">
                <div className="form-group">
                  <label>이메일로 전송된 6자리 인증번호</label>
                  <div className="id-check-row">
                    <div className="otp-input-wrapper">
                      <input
                        type="text"
                        placeholder="6자리 숫자"
                        value={resetForm.code}
                        onChange={(e) =>
                          setResetForm({ ...resetForm, code: e.target.value.replace(/\D/g, '').slice(0, 6) })
                        }
                        maxLength={6}
                        disabled={isCodeVerified}
                        required
                      />
                      {!isCodeVerified && <span className="otp-timer">{formatTimer(timer)}</span>}
                    </div>

                    <button
                      type="button"
                      className="btn-id-check"
                      onClick={handleVerifyCode}
                      disabled={verifyCodeLoading || isCodeVerified || resetForm.code.length !== 6}
                    >
                      {verifyCodeLoading
                        ? '확인 중...'
                        : isCodeVerified
                          ? '인증완료 ✓'
                          : '인증 확인'}
                    </button>
                  </div>

                  {isCodeVerified && (
                    <div className="field-success-msg">✓ 인증번호 확인이 완료되었습니다.</div>
                  )}
                </div>

                {/* 인증번호 확인 완료 시 비밀번호 입력란 오픈 */}
                {isCodeVerified && (
                  <>
                    <div className="form-group">
                      <label>새 비밀번호</label>
                      <input
                        type="password"
                        placeholder="8자 이상 영문, 숫자, 특수문자 조합"
                        value={resetForm.newPassword}
                        onChange={(e) =>
                          setResetForm({ ...resetForm, newPassword: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>새 비밀번호 확인</label>
                      <input
                        type="password"
                        placeholder="새 비밀번호 재입력"
                        value={resetForm.newPasswordConfirm}
                        onChange={(e) =>
                          setResetForm({ ...resetForm, newPasswordConfirm: e.target.value })
                        }
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={resetLoading || !isCodeSent || !isCodeVerified}
            >
              {resetLoading ? '비밀번호 변경 처리 중...' : '비밀번호 재설정 완료'}
            </button>
          </form>
        )}

        <div className="auth-footer-nav">
          기억나셨나요? <Link to="/login">로그인 화면으로</Link>
        </div>
      </div>
    </div>
  );
}
