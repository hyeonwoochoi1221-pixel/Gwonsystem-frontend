// src/pages/auth/RegisterPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DaumPostcodeEmbed from 'react-daum-postcode';
import toast from 'react-hot-toast';
import Logo from '../../assets/logo.svg?react';
import {
  registerMember,
  checkUsernameDuplicate,
  sendEmailVerificationCode,
  verifyEmailCode,
} from '../../api/authService';
import { RegisterRequestPayload } from '../../types';
import './Auth.css';

// 전화번호 자동 하이픈 포맷팅
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

// 유선전화 포맷팅
const formatWorkplacePhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('02')) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5, 9)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  } else {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  }
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 소셜 로그인 리다이렉트 파라미터 파싱
  const socialEmail = searchParams.get('socialEmail');
  const socialLastName = searchParams.get('socialLastName');
  const socialFirstName = searchParams.get('socialFirstName');
  const socialProvider = searchParams.get('socialProvider');
  const socialProviderId = searchParams.get('socialProviderId');

  // 포커싱 및 스크롤용 Refs
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const emailCodeRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const termsGroupRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<RegisterRequestPayload & { provider?: string; providerId?: string }>({
    username: '',
    password: '',
    email: socialEmail ? decodeURIComponent(socialEmail) : '',
    lastName: socialLastName ? decodeURIComponent(socialLastName) : '',
    firstName: socialFirstName ? decodeURIComponent(socialFirstName) : '',
    phone: '',
    zipcode: '',
    address: '',
    detailAddress: '',
    gender: '',
    birthDate: '',
    workplaceName: '',
    departmentName: '',
    position: '',
    workplacePhone: '',
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false,
    provider: socialProvider || undefined,
    providerId: socialProviderId ? decodeURIComponent(socialProviderId) : undefined,
  });

  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  // 🔍 아이디 중복 확인 상태
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [usernameSuccessMsg, setUsernameSuccessMsg] = useState<string | null>(null);

  // 📧 이메일 6자리 OTP 인증 상태
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isEmailCodeSent, setIsEmailCodeSent] = useState(false);
  const [inputEmailCode, setInputEmailCode] = useState('');
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(Boolean(socialEmail));
  const [emailTimer, setEmailTimer] = useState(180); // 3분(180초)

  // 🌟 회원가입 완료 축하 모달 제어 상태
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [completedUserData, setCompletedUserData] = useState<{ username: string; fullName: string } | null>(null);

  // 각 필드별 실시간 피드백 에러 상태
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (socialProvider) {
      toast(`${socialProvider} 계정 정보가 자동 입력되었습니다. 사용할 아이디와 정보를 입력해주세요!`, {
        icon: '🔗',
        duration: 4000,
      });
    }
  }, [socialProvider]);

  // 3분 카운트다운 타이머
  useEffect(() => {
    let interval: any = null;
    if (isEmailCodeSent && !isEmailVerified && emailTimer > 0) {
      interval = setInterval(() => {
        setEmailTimer((prev) => prev - 1);
      }, 1000);
    } else if (emailTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isEmailCodeSent, isEmailVerified, emailTimer]);

  const formatTimer = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const scrollToErrorField = (ref: { current: HTMLElement | null }) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if ('focus' in ref.current && typeof ref.current.focus === 'function') {
        ref.current.focus();
      }
    }
  };

  // 1. 아이디 중복 확인 핸들러
  const handleCheckUsername = async () => {
    const rawUsername = formData.username.trim();
    if (!rawUsername) {
      const msg = '아이디를 입력해 주세요.';
      setFieldErrors((prev) => ({ ...prev, username: msg }));
      toast.error(msg);
      scrollToErrorField(usernameRef);
      return;
    }

    if (rawUsername.length < 4) {
      const msg = '아이디는 최소 4자리 이상이어야 합니다.';
      setFieldErrors((prev) => ({ ...prev, username: msg }));
      toast.error(msg);
      scrollToErrorField(usernameRef);
      return;
    }

    setIsCheckingUsername(true);
    setUsernameSuccessMsg(null);

    try {
      const res = await checkUsernameDuplicate(rawUsername);
      if (res.exists) {
        setFieldErrors((prev) => ({ ...prev, username: '이미 존재하는 아이디입니다.' }));
        setIsUsernameChecked(false);
        toast.error('이미 존재하는 아이디입니다.');
        scrollToErrorField(usernameRef);
      } else {
        setFieldErrors((prev) => ({ ...prev, username: '' }));
        setIsUsernameChecked(true);
        setUsernameSuccessMsg('사용 가능한 아이디입니다.');
        toast.success('사용 가능한 아이디입니다.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || '아이디 중복 검사에 실패했습니다.';
      setFieldErrors((prev) => ({ ...prev, username: msg }));
      toast.error(msg);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // 2. 이메일 인증번호 발송 핸들러
  const handleSendEmailCode = async () => {
    const email = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      const msg = '유효한 이메일 주소를 먼저 입력해 주세요.';
      setFieldErrors((prev) => ({ ...prev, email: msg }));
      toast.error(msg);
      scrollToErrorField(emailRef);
      return;
    }

    setIsEmailSending(true);

    try {
      await sendEmailVerificationCode(email);
      setIsEmailCodeSent(true);
      setEmailTimer(180);
      setFieldErrors((prev) => ({ ...prev, email: '' }));
      toast.success('입력하신 메일로 6자리 인증번호가 발송되었습니다.');
      setTimeout(() => emailCodeRef.current?.focus(), 150);
    } catch (err: any) {
      const msg = err.response?.data?.message || '인증번호 발송에 실패했습니다. 메일 주소를 확인해 주세요.';
      setFieldErrors((prev) => ({ ...prev, email: msg }));
      toast.error(msg);
    } finally {
      setIsEmailSending(false);
    }
  };

  // 3. 이메일 인증번호 검증 핸들러
  const handleVerifyEmailCode = async () => {
    if (!inputEmailCode.trim() || inputEmailCode.trim().length !== 6) {
      toast.error('6자리 인증번호를 올바르게 입력해 주세요.');
      emailCodeRef.current?.focus();
      return;
    }

    if (emailTimer <= 0) {
      toast.error('인증 유효시간(3분)이 초과되었습니다. 인증번호를 다시 요청해 주세요.');
      return;
    }

    setIsEmailVerifying(true);

    try {
      const res = await verifyEmailCode(formData.email.trim(), inputEmailCode.trim());
      if (res.verified) {
        setIsEmailVerified(true);
        setIsEmailCodeSent(false);
        setFieldErrors((prev) => ({ ...prev, email: '' }));
        toast.success('이메일 인증이 완료되었습니다.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || '인증번호가 일치하지 않습니다.';
      toast.error(msg);
    } finally {
      setIsEmailVerifying(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'username') {
      let msg = '';
      if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(value)) {
        msg = '아이디는 한글을 사용할 수 없습니다. 영문 소문자와 숫자만 입력해 주세요.';
      } else if (/[^a-zA-Z0-9]/.test(value)) {
        msg = '아이디에는 특수문자나 공백을 사용할 수 없습니다.';
      } else if (value.length > 0 && value.length < 4) {
        msg = '아이디는 최소 4자리 이상이어야 합니다.';
      }

      setFieldErrors((prev) => ({ ...prev, username: msg }));
      setIsUsernameChecked(false);
      setUsernameSuccessMsg(null);

      const filtered = value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 20);
      setFormData((prev) => ({ ...prev, [name]: filtered }));
      return;
    }

    if (name === 'lastName') {
      let msg = '';
      if (/[0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~]/.test(value)) {
        msg = '성(姓)에는 숫자나 특수문자를 입력할 수 없습니다.';
      }
      setFieldErrors((prev) => ({ ...prev, lastName: msg }));
      const filtered = value.replace(/[0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~]/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, lastName: filtered }));
      return;
    }

    if (name === 'firstName') {
      let msg = '';
      if (/[0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~]/.test(value)) {
        msg = '이름에는 숫자나 특수문자를 입력할 수 없습니다.';
      }
      setFieldErrors((prev) => ({ ...prev, firstName: msg }));
      const filtered = value.replace(/[0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~]/g, '').slice(0, 30);
      setFormData((prev) => ({ ...prev, firstName: filtered }));
      return;
    }

    if (name === 'phone') {
      let msg = '';
      if (/[^0-9-]/.test(value)) {
        msg = '휴대폰 번호는 숫자만 입력 가능합니다.';
      }
      const formatted = formatPhoneNumber(value);
      if (formatted.length > 0 && formatted.length < 12) {
        msg = '휴대폰 번호 형식을 끝까지 완성해 주세요 (010-XXXX-XXXX).';
      }
      setFieldErrors((prev) => ({ ...prev, phone: msg }));
      setFormData((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    if (name === 'workplacePhone') {
      const formatted = formatWorkplacePhone(value);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    if (name === 'password') {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      let msg = '';
      if (value.length > 0 && !passwordRegex.test(value)) {
        msg = '영문, 숫자, 특수문자(@$!%*#?&) 조합 8자 이상이어야 합니다.';
      }
      setFieldErrors((prev) => ({
        ...prev,
        password: msg,
        passwordConfirm: passwordConfirm && value !== passwordConfirm ? '비밀번호가 일치하지 않습니다.' : '',
      }));
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let msg = '';
      if (value.length > 0 && !emailRegex.test(value)) {
        msg = '올바른 이메일 주소 형식(@, 도메인 포함)이 아닙니다.';
      }
      setFieldErrors((prev) => ({ ...prev, email: msg }));
      if (!socialEmail) {
        setIsEmailVerified(false);
        setIsEmailCodeSent(false);
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPasswordConfirm(val);
    if (val && formData.password !== val) {
      setFieldErrors((prev) => ({ ...prev, passwordConfirm: '비밀번호가 일치하지 않습니다.' }));
    } else {
      setFieldErrors((prev) => ({ ...prev, passwordConfirm: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAllAgreed = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      termsAgreed: checked,
      privacyAgreed: checked,
      marketingAgreed: checked,
    }));
  };

  const handleCompletePostcode = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    setFormData((prev) => ({
      ...prev,
      zipcode: data.zonecode,
      address: fullAddress,
    }));
    setIsPostcodeOpen(false);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.username.length < 4) {
      toast.error('아이디를 4자리 이상 입력해 주세요.');
      scrollToErrorField(usernameRef);
      return;
    }

    if (!isUsernameChecked) {
      toast.error('아이디 중복 확인을 먼저 진행해 주세요.');
      scrollToErrorField(usernameRef);
      return;
    }

    if (!isEmailVerified) {
      toast.error('이메일 인증을 완료해야 회원가입이 가능합니다.');
      scrollToErrorField(emailRef);
      return;
    }

    if (formData.password.length < 8) {
      toast.error('비밀번호는 8자 이상 입력해야 합니다.');
      scrollToErrorField(passwordRef);
      return;
    }

    if (formData.password !== passwordConfirm) {
      toast.error('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      scrollToErrorField(passwordConfirmRef);
      return;
    }

    if (!formData.lastName.trim()) {
      toast.error('성을 입력해 주세요.');
      scrollToErrorField(lastNameRef);
      return;
    }

    if (!formData.firstName.trim()) {
      toast.error('이름을 입력해 주세요.');
      scrollToErrorField(firstNameRef);
      return;
    }

    const phoneRegex = /^01[016789]-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('휴대폰 번호 형식을 완성해 주세요 (010-XXXX-XXXX).');
      scrollToErrorField(phoneRef);
      return;
    }

    if (!formData.zipcode || !formData.address) {
      toast.error('우편번호 검색을 통해 기본 주소를 입력해 주세요.');
      setIsPostcodeOpen(true);
      return;
    }

    if (!formData.termsAgreed || !formData.privacyAgreed) {
      toast.error('필수 약관(서비스 이용약관 및 개인정보 수집/이용)에 반드시 동의해야 합니다.');
      scrollToErrorField(termsGroupRef);
      return;
    }

    setIsLoading(true);

    try {
      await registerMember(formData);

      setCompletedUserData({
        username: formData.username,
        fullName: `${formData.lastName}${formData.firstName}`.trim(),
      });
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      const backendMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        '회원가입 처리 중 오류가 발생했습니다.';

      toast.error(backendMessage);

      if (backendMessage.includes('이메일') || backendMessage.toLowerCase().includes('email')) {
        setFieldErrors((prev) => ({ ...prev, email: backendMessage }));
        setIsEmailVerified(false);
        scrollToErrorField(emailRef);
      } else if (
        backendMessage.includes('전화번호') ||
        backendMessage.includes('휴대폰') ||
        backendMessage.toLowerCase().includes('phone')
      ) {
        setFieldErrors((prev) => ({ ...prev, phone: backendMessage }));
        scrollToErrorField(phoneRef);
      } else if (
        backendMessage.includes('아이디') ||
        backendMessage.toLowerCase().includes('username')
      ) {
        setFieldErrors((prev) => ({ ...prev, username: backendMessage }));
        setIsUsernameChecked(false);
        setUsernameSuccessMsg(null);
        scrollToErrorField(usernameRef);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToLogin = () => {
    setIsSuccessModalOpen(false);
    toast.success('회원가입이 완료되었습니다. 로그인해 주세요!');
    navigate('/login', { state: { registeredUsername: completedUserData?.username } });
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <Logo className="auth-logo-svg" />
            <span className="auth-logo-text">G-WON SYSTEM</span>
          </Link>
          <h2>회원가입</h2>
          <p>
            {socialProvider
              ? `${socialProvider} 계정과 연동될 포털 아이디 및 계정을 생성합니다.`
              : '기본 인적사항 및 직장 정보를 입력해 계정을 생성합니다.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* 1. 계정 정보 */}
          <div className="form-section-title">계정 정보 (필수)</div>

          <div className="form-group">
            <label htmlFor="reg-username">
              아이디 <span className="req">*</span>
            </label>
            <div className="id-check-row">
              <input
                ref={usernameRef}
                id="reg-username"
                name="username"
                type="text"
                placeholder="4~20자리 영문 소문자 및 숫자"
                value={formData.username}
                onChange={handleInputChange}
                className={fieldErrors.username ? 'input-invalid' : ''}
                maxLength={20}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="btn-id-check"
                onClick={handleCheckUsername}
                disabled={isLoading || isCheckingUsername}
              >
                {isCheckingUsername ? '확인 중...' : '중복 확인'}
              </button>
            </div>
            {fieldErrors.username && <span className="field-error-msg">⚠️ {fieldErrors.username}</span>}
            {usernameSuccessMsg && <span className="field-success-msg">✓ {usernameSuccessMsg}</span>}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="reg-password">
                비밀번호 <span className="req">*</span>
              </label>
              <input
                ref={passwordRef}
                id="reg-password"
                name="password"
                type="password"
                placeholder="8자 이상 영문, 숫자, 특수문자 조합"
                value={formData.password}
                onChange={handleInputChange}
                className={fieldErrors.password ? 'input-invalid' : ''}
                disabled={isLoading}
                required
              />
              {fieldErrors.password && <span className="field-error-msg">⚠️ {fieldErrors.password}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="reg-passwordConfirm">
                비밀번호 확인 <span className="req">*</span>
              </label>
              <input
                ref={passwordConfirmRef}
                id="reg-passwordConfirm"
                type="password"
                placeholder="비밀번호 재입력"
                value={passwordConfirm}
                onChange={handlePasswordConfirmChange}
                className={fieldErrors.passwordConfirm ? 'input-invalid' : ''}
                disabled={isLoading}
                required
              />
              {fieldErrors.passwordConfirm && (
                <span className="field-error-msg">⚠️ {fieldErrors.passwordConfirm}</span>
              )}
            </div>
          </div>

          {/* 📧 이메일 및 6자리 OTP 인증번호 발송 영역 */}
          <div className="form-group">
            <label htmlFor="reg-email">
              이메일 주소 <span className="req">*</span>
            </label>
            <div className="email-input-row">
              <input
                ref={emailRef}
                id="reg-email"
                name="email"
                type="email"
                placeholder="user@gwonsystem.com"
                value={formData.email}
                onChange={handleInputChange}
                className={fieldErrors.email ? 'input-invalid' : ''}
                disabled={isLoading || Boolean(socialEmail) || isEmailVerified}
                required
              />
              {!socialEmail && !isEmailVerified && (
                <button
                  type="button"
                  className="btn-email-action"
                  onClick={handleSendEmailCode}
                  disabled={isLoading || isEmailSending}
                >
                  {isEmailSending ? '발송 중...' : isEmailCodeSent ? '재발송' : '인증번호 전송'}
                </button>
              )}
            </div>

            {/* 인증번호 입력 & 타이머 박스 */}
            {isEmailCodeSent && !isEmailVerified && (
              <div className="email-otp-box">
                <div className="otp-action-row">
                  <div className="otp-input-wrapper">
                    <input
                      ref={emailCodeRef}
                      type="text"
                      placeholder="6자리 인증코드 입력"
                      value={inputEmailCode}
                      onChange={(e) => setInputEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      disabled={isEmailVerifying}
                    />
                    <span className="otp-timer">{formatTimer(emailTimer)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-email-action"
                    onClick={handleVerifyEmailCode}
                    disabled={isEmailVerifying || inputEmailCode.length !== 6 || emailTimer <= 0}
                  >
                    {isEmailVerifying ? '확인 중...' : '인증 확인'}
                  </button>
                </div>
              </div>
            )}

            {isEmailVerified && (
              <span className="field-success-msg">✓ 이메일 본인 인증이 완료되었습니다.</span>
            )}
            {fieldErrors.email && <span className="field-error-msg">⚠️ {fieldErrors.email}</span>}
          </div>

          {/* 2. 기본 인적사항 */}
          <div className="form-section-title">기본 인적사항</div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="reg-lastName">
                성 <span className="req">*</span>
              </label>
              <input
                ref={lastNameRef}
                id="reg-lastName"
                name="lastName"
                type="text"
                placeholder="예: 홍"
                value={formData.lastName}
                onChange={handleInputChange}
                className={fieldErrors.lastName ? 'input-invalid' : ''}
                maxLength={10}
                disabled={isLoading}
                required
              />
              {fieldErrors.lastName && <span className="field-error-msg">⚠️ {fieldErrors.lastName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="reg-firstName">
                이름 <span className="req">*</span>
              </label>
              <input
                ref={firstNameRef}
                id="reg-firstName"
                name="firstName"
                type="text"
                placeholder="예: 길동"
                value={formData.firstName}
                onChange={handleInputChange}
                className={fieldErrors.firstName ? 'input-invalid' : ''}
                maxLength={30}
                disabled={isLoading}
                required
              />
              {fieldErrors.firstName && <span className="field-error-msg">⚠️ {fieldErrors.firstName}</span>}
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="reg-phone">
                휴대폰 번호 <span className="req">*</span>
              </label>
              <input
                ref={phoneRef}
                id="reg-phone"
                name="phone"
                type="tel"
                placeholder="010-0000-0000"
                value={formData.phone}
                onChange={handleInputChange}
                className={fieldErrors.phone ? 'input-invalid' : ''}
                maxLength={13}
                disabled={isLoading}
                required
              />
              {fieldErrors.phone && <span className="field-error-msg">⚠️ {fieldErrors.phone}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="reg-gender">성별 (선택)</label>
              <select
                id="reg-gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="auth-select"
                disabled={isLoading}
              >
                <option value="">선택 안 함</option>
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
                <option value="OTHER">기타</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-birthDate">생년월일 (선택)</label>
            <input
              id="reg-birthDate"
              name="birthDate"
              type="date"
              className="input-date-picker"
              value={formData.birthDate}
              onChange={handleInputChange}
              max="2099-12-31"
              disabled={isLoading}
            />
          </div>

          {/* 3. 주소 정보 */}
          <div className="form-section-title">주소 정보</div>

          <div className="form-group">
            <label htmlFor="reg-zipcode">
              우편번호 <span className="req">*</span>
            </label>
            <div className="postcode-search-row">
              <input
                id="reg-zipcode"
                name="zipcode"
                type="text"
                placeholder="우편번호 검색 클릭"
                value={formData.zipcode}
                readOnly
                className="input-readonly"
                required
              />
              <button
                type="button"
                className="btn-address-search"
                onClick={() => setIsPostcodeOpen(true)}
                disabled={isLoading}
              >
                우편번호 검색
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-address">
              기본 주소 <span className="req">*</span>
            </label>
            <input
              id="reg-address"
              name="address"
              type="text"
              placeholder="주소 검색 버튼을 클릭해 입력하세요"
              value={formData.address}
              readOnly
              className="input-readonly"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-detailAddress">상세주소 (선택)</label>
            <input
              id="reg-detailAddress"
              name="detailAddress"
              type="text"
              placeholder="동/호수, 건물명, 층수 등"
              value={formData.detailAddress}
              onChange={handleInputChange}
              maxLength={100}
              disabled={isLoading}
            />
          </div>

          {/* 4. 근무처 소속 정보 (선택) */}
          <div className="form-section-title">근무처 / 소속 정보 (선택)</div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="reg-workplaceName">근무처 소속명</label>
              <input
                id="reg-workplaceName"
                name="workplaceName"
                type="text"
                placeholder="회사명 또는 대학교명"
                value={formData.workplaceName}
                onChange={handleInputChange}
                maxLength={50}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-departmentName">근무처 부서명 / 학과명</label>
              <input
                id="reg-departmentName"
                name="departmentName"
                type="text"
                placeholder="부서 또는 학과"
                value={formData.departmentName}
                onChange={handleInputChange}
                maxLength={50}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="reg-position">직위</label>
              <input
                id="reg-position"
                name="position"
                type="text"
                placeholder="선임연구원, 팀장, 매니저 등"
                value={formData.position}
                onChange={handleInputChange}
                maxLength={30}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-workplacePhone">근무처 전화번호</label>
              <input
                id="reg-workplacePhone"
                name="workplacePhone"
                type="tel"
                placeholder="02-000-0000"
                value={formData.workplacePhone}
                onChange={handleInputChange}
                maxLength={14}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 5. 약관 및 개인정보 동의 */}
          <div className="form-section-title">약관 및 개인정보 수집 동의</div>

          <div className="privacy-clause-box">
            <h4>[개인정보 수집 및 이용 동의 안내]</h4>
            <p>
              1. <strong>수집 및 이용 목적:</strong> 사내 포털 및 학회 서비스 제공, 본인 확인 및 식별, 일반/정회원 등급 심사 및 회원 관리
            </p>
            <p>
              2. <strong>수집하는 개인정보 항목:</strong>
              <br />
              &nbsp;• [필수항목] 아이디, 비밀번호, 성명, 이메일, 휴대폰 번호, 우편번호, 기본주소
              <br />
              &nbsp;• [선택항목] 성별, 생년월일, 근무처 소속명, 부서명, 직위, 근무처 전화번호, 상세주소
            </p>
            <p>
              3. <strong>보유 및 이용 기간:</strong> 회원 탈퇴 시까지 (단, 전자상거래 등 관계 법령에 따른 보존 의무가 있는 경우 해당 법정 기간 동안 안전하게 보관)
            </p>
            <p>
              4. <strong>동의 거부권 및 불이익:</strong> 귀하는 개인정보 수집 및 이용 동의를 거부할 권리가 있습니다. 단, 필수항목 수집에 동의하지 않을 경우 포털 회원가입이 제한됩니다.
            </p>
          </div>

          <div className="agreement-group" ref={termsGroupRef}>
            <label className="checkbox-label all-agree">
              <input
                type="checkbox"
                checked={Boolean(formData.termsAgreed && formData.privacyAgreed && formData.marketingAgreed)}
                onChange={handleAllAgreed}
                disabled={isLoading}
              />
              <strong>모든 약관에 전체 동의합니다.</strong>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="termsAgreed"
                checked={Boolean(formData.termsAgreed)}
                onChange={handleCheckboxChange}
                disabled={isLoading}
                required
              />
              <span>[필수] 서비스 이용약관에 동의합니다.</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="privacyAgreed"
                checked={Boolean(formData.privacyAgreed)}
                onChange={handleCheckboxChange}
                disabled={isLoading}
                required
              />
              <span>[필수] 개인정보 수집 및 이용에 동의합니다.</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="marketingAgreed"
                checked={Boolean(formData.marketingAgreed)}
                onChange={handleCheckboxChange}
                disabled={isLoading}
              />
              <span>[선택] 이벤트 및 학회 소식 등 마케팅 정보 수신에 동의합니다.</span>
            </label>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={isLoading}>
            {isLoading ? '가입 처리 중...' : '회원가입 완료'}
          </button>
        </form>

        <div className="auth-footer-nav">
          이미 계정이 있으신가요? <Link to="/login">로그인 화면으로</Link>
        </div>
      </div>

      {/* 카카오 우편번호 모달 */}
      {isPostcodeOpen && (
        <div className="postcode-modal-overlay" onClick={() => setIsPostcodeOpen(false)}>
          <div className="postcode-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="postcode-modal-header">
              <h3>주소 검색</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsPostcodeOpen(false)}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <DaumPostcodeEmbed onComplete={handleCompletePostcode} autoClose />
          </div>
        </div>
      )}

      {/* 회원가입 완료 축하 모달 */}
      {isSuccessModalOpen && (
        <div className="register-success-modal-overlay">
          <div className="register-success-modal-content">
            <div className="success-icon-badge">✓</div>
            <h3>회원가입이 완료되었습니다!</h3>
            <p>
              GWON SYSTEM 사내 포털의 일반회원으로 등록되었습니다.<br />
              {formData.provider && (
                <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>
                  ({formData.provider} 소셜 계정과 연동되었습니다)<br />
                </span>
              )}
              생성된 계정으로 로그인해 주세요.
            </p>

            <div className="success-user-summary-box">
              <div className="summary-row">
                <span className="summary-label">성명</span>
                <span className="summary-val">{completedUserData?.fullName}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">가입 아이디</span>
                <span className="summary-val">{completedUserData?.username}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">회원 등급</span>
                <span className="summary-val" style={{ color: 'var(--accent-color)' }}>
                  🌱 준회원 (일반회원)
                </span>
              </div>
            </div>

            <button type="button" className="btn-go-login" onClick={handleProceedToLogin}>
              로그인 화면으로 이동
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
