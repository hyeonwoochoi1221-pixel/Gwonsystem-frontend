import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DaumPostcodeEmbed from 'react-daum-postcode';
import toast from 'react-hot-toast';
import {
  verifyCurrentPassword,
  getMemberProfile,
  updateMemberProfile,
} from '../../api/authService';
import '../auth/Auth.css';

// 전화번호 자동 포맷팅 (010-XXXX-XXXX)
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

// 유선전화 자동 포맷팅
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

export default function ProfilePage() {
  const navigate = useNavigate();
  const currentUsername = localStorage.getItem('username') || '';

  // 1단계: 비밀번호 본인 확인 게이트 상태
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authPassword, setAuthPassword] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // 2단계: 회원가입 화면과 1:1 동일한 구조의 폼 상태
  const [formData, setFormData] = useState({
    username: currentUsername,
    email: '',
    lastName: '',
    firstName: '',
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
    role: 'ROLE_ASSOCIATE',
  });

  // 비밀번호 변경 필드 (선택 사항)
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPostcodeOpen, setIsPostcodeOpen] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUsername) {
      toast.error('로그인이 필요한 페이지입니다.');
      navigate('/login');
    }
  }, [currentUsername, navigate]);

  // 1단계: 현재 비밀번호 검증 핸들러
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPassword) {
      toast.error('현재 비밀번호를 입력해 주세요.');
      return;
    }

    setIsVerifying(true);
    try {
      await verifyCurrentPassword(currentUsername, authPassword);
      toast.success('본인 확인이 완료되었습니다.');

      // 기존 회원 상세 정보 로드
      const data = await getMemberProfile(currentUsername);
      setFormData({
        username: data.username || currentUsername,
        email: data.email || '',
        lastName: data.lastName || '',
        firstName: data.firstName || '',
        phone: data.phone || '',
        zipcode: data.zipcode || '',
        address: data.address || '',
        detailAddress: data.detailAddress || '',
        gender: data.gender || '',
        birthDate: data.birthDate || '',
        workplaceName: data.workplaceName || '',
        departmentName: data.departmentName || '',
        position: data.position || '',
        workplacePhone: data.workplacePhone || '',
        role: data.role || 'ROLE_ASSOCIATE',
      });
      setIsAuthenticated(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || '비밀번호가 일치하지 않습니다.';
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  // 인풋 값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, phone: formatted }));
      return;
    }

    if (name === 'workplacePhone') {
      const formatted = formatWorkplacePhone(value);
      setFormData((prev) => ({ ...prev, workplacePhone: formatted }));
      return;
    }

    if (name === 'newPassword') {
      setNewPassword(value);
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      let msg = '';
      if (value.length > 0 && !passwordRegex.test(value)) {
        msg = '영문, 숫자, 특수문자(@$!%*#?&) 조합 8자 이상이어야 합니다.';
      }
      setFieldErrors((prev) => ({ ...prev, newPassword: msg }));
      return;
    }

    if (name === 'newPasswordConfirm') {
      setNewPasswordConfirm(value);
      setFieldErrors((prev) => ({
        ...prev,
        newPasswordConfirm: value && newPassword !== value ? '비밀번호가 일치하지 않습니다.' : '',
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 카카오 우편번호 선택 핸들러
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

  // 2단계: 최종 수정 저장 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword) {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        toast.error('새 비밀번호는 8자 이상 영문, 숫자, 특수문자 조합이어야 합니다.');
        passwordRef.current?.focus();
        return;
      }
      if (newPassword !== newPasswordConfirm) {
        toast.error('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        passwordConfirmRef.current?.focus();
        return;
      }
    }

    if (!formData.lastName.trim() || !formData.firstName.trim()) {
      toast.error('성명을 올바르게 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        ...formData,
        password: newPassword ? newPassword : null,
      };

      const res = await updateMemberProfile(currentUsername, payload);

      localStorage.setItem('lastName', res.lastName || formData.lastName);
      localStorage.setItem('firstName', res.firstName || formData.firstName);

      toast.success(res.message || '개인정보가 성공적으로 수정되었습니다.');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err: any) {
      const msg = err.response?.data?.message || '개인정보 수정 처리에 실패했습니다.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container" style={{ padding: '40px 16px 80px' }}>
      {/* 🌟 1단계: 비밀번호 본인 확인 게이트 */}
      {!isAuthenticated ? (
        <div className="auth-card" style={{ maxWidth: '440px', margin: '60px auto' }}>
          <div className="auth-header">
            <span style={{ fontSize: '36px', display: 'block', marginBottom: '10px' }}>🔒</span>
            <h2>회원정보 보호 확인</h2>
            <p>개인정보를 안전하게 보호하기 위해 현재 비밀번호를 입력해 주세요.</p>
          </div>

          <form className="auth-form" onSubmit={handleVerifyPassword}>
            <div className="form-group">
              <label htmlFor="auth-pwd">현재 비밀번호</label>
              <input
                id="auth-pwd"
                type="password"
                placeholder="현재 비밀번호를 입력하세요"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="btn-id-check"
                style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-sub)' }}
                onClick={() => navigate(-1)}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn-auth-submit"
                style={{ flex: 2, margin: 0 }}
                disabled={isVerifying}
              >
                {isVerifying ? '확인 중...' : '본인 확인'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* 🌟 2단계: 회원가입 페이지와 완벽히 동일한 카드 레이아웃 */
        <div className="auth-card register-card">
          <div className="auth-header">
            <h2>개인정보 수정</h2>
            <p>가입 시 등록된 기본 인적사항 및 직장 정보를 최신 상태로 수정합니다.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* 1. 계정 정보 */}
            <div className="form-section-title">계정 정보 (아이디/이메일은 변경 불가)</div>

            <div className="form-group">
              <label>아이디</label>
              <input
                type="text"
                value={formData.username}
                readOnly
                className="input-readonly"
              />
            </div>

            <div className="form-group">
              <label>이메일 주소</label>
              <div className="email-input-row">
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="input-readonly"
                />
                <button type="button" className="btn-email-action" disabled style={{ opacity: 0.8 }}>
                  인증 완료
                </button>
              </div>
            </div>

            {/* 비밀번호 변경 (선택) */}
            <div className="form-section-title">비밀번호 변경 (변경을 원하실 때만 입력하세요)</div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="new-password">새 비밀번호</label>
                <input
                  ref={passwordRef}
                  id="new-password"
                  name="newPassword"
                  type="password"
                  placeholder="8자 이상 영문, 숫자, 특수문자 조합"
                  value={newPassword}
                  onChange={handleInputChange}
                  className={fieldErrors.newPassword ? 'input-invalid' : ''}
                  disabled={isLoading}
                />
                {fieldErrors.newPassword && (
                  <span className="field-error-msg">⚠️ {fieldErrors.newPassword}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="new-passwordConfirm">새 비밀번호 확인</label>
                <input
                  ref={passwordConfirmRef}
                  id="new-passwordConfirm"
                  name="newPasswordConfirm"
                  type="password"
                  placeholder="새 비밀번호 재입력"
                  value={newPasswordConfirm}
                  onChange={handleInputChange}
                  className={fieldErrors.newPasswordConfirm ? 'input-invalid' : ''}
                  disabled={isLoading}
                />
                {fieldErrors.newPasswordConfirm && (
                  <span className="field-error-msg">⚠️ {fieldErrors.newPasswordConfirm}</span>
                )}
              </div>
            </div>

            {/* 2. 기본 인적사항 */}
            <div className="form-section-title">기본 인적사항</div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="prof-lastName">
                  성 <span className="req">*</span>
                </label>
                <input
                  id="prof-lastName"
                  name="lastName"
                  type="text"
                  placeholder="예: 홍"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  maxLength={10}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="prof-firstName">
                  이름 <span className="req">*</span>
                </label>
                <input
                  id="prof-firstName"
                  name="firstName"
                  type="text"
                  placeholder="예: 길동"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  maxLength={30}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="prof-phone">
                  휴대폰 번호 <span className="req">*</span>
                </label>
                <input
                  id="prof-phone"
                  name="phone"
                  type="tel"
                  placeholder="010-0000-0000"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={13}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="prof-gender">성별</label>
                <select
                  id="prof-gender"
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
              <label htmlFor="prof-birthDate">생년월일</label>
              <input
                id="prof-birthDate"
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
              <label htmlFor="prof-zipcode">
                우편번호 <span className="req">*</span>
              </label>
              <div className="postcode-search-row">
                <input
                  id="prof-zipcode"
                  name="zipcode"
                  type="text"
                  placeholder="우편번호 검색"
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
              <label htmlFor="prof-address">
                기본 주소 <span className="req">*</span>
              </label>
              <input
                id="prof-address"
                name="address"
                type="text"
                value={formData.address}
                readOnly
                className="input-readonly"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="prof-detailAddress">상세주소</label>
              <input
                id="prof-detailAddress"
                name="detailAddress"
                type="text"
                placeholder="동/호수, 건물명 등"
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
                <label htmlFor="prof-workplaceName">근무처 소속명</label>
                <input
                  id="prof-workplaceName"
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
                <label htmlFor="prof-departmentName">근무처 부서명 / 학과명</label>
                <input
                  id="prof-departmentName"
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
                <label htmlFor="prof-position">직위</label>
                <input
                  id="prof-position"
                  name="position"
                  type="text"
                  placeholder="선임연구원, 팀장 등"
                  value={formData.position}
                  onChange={handleInputChange}
                  maxLength={30}
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="prof-workplacePhone">근무처 유선전화</label>
                <input
                  id="prof-workplacePhone"
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

            {/* 하단 취소 및 완료 버튼 */}
            <div style={{ display: 'flex', gap: '14px', marginTop: '32px' }}>
              <button
                type="button"
                className="btn-id-check"
                style={{
                  flex: 1,
                  padding: '13px 0',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-sub)',
                  fontSize: '14px',
                }}
                onClick={() => navigate(-1)}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn-auth-submit"
                style={{ flex: 2, margin: 0 }}
                disabled={isLoading}
              >
                {isLoading ? '저장 중...' : '수정 완료'}
              </button>
            </div>
          </form>
        </div>
      )}

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
    </div>
  );
}
