import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DaumPostcodeEmbed from 'react-daum-postcode';
import toast from 'react-hot-toast';
import Logo from '../../assets/logo.svg?react';
import { registerMember } from '../../api/authService';
import { RegisterRequestPayload } from '../../types';
import './Auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterRequestPayload>({
    username: '',
    password: '',
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
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false,
  });

  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  // 카카오 우편번호 주소 선택 완료 콜백
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (formData.password !== passwordConfirm) {
      const msg = '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (!formData.termsAgreed || !formData.privacyAgreed) {
      const msg = '필수 약관(서비스 이용약관 및 개인정보 수집/이용)에 반드시 동의해야 합니다.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);

    try {
      await registerMember(formData);
      toast.success('회원가입이 완료되었습니다. 로그인해 주세요!');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data ||
        '회원가입 처리 중 오류가 발생했습니다.';
      const displayMsg = typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg);
      setErrorMsg(displayMsg);
      toast.error(displayMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <Logo className="auth-logo-svg" />
            <span className="auth-logo-text">GWON SYSTEM</span>
          </Link>
          <h2>신규 회원가입</h2>
          <p>기본 인적사항 및 직장 정보를 입력해 계정을 생성합니다.</p>
        </div>

        {errorMsg && <div className="auth-error-alert">{errorMsg}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* 1. 계정 정보 (필수) */}
          <div className="form-section-title">계정 정보 (필수)</div>

          <div className="form-group">
            <label htmlFor="reg-username">아이디 <span className="req">*</span></label>
            <input
              id="reg-username"
              name="username"
              type="text"
              placeholder="4~20자리 영문/숫자"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="reg-password">비밀번호 <span className="req">*</span></label>
              <input
                id="reg-password"
                name="password"
                type="password"
                placeholder="8자 이상 영문, 숫자, 특수문자"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-passwordConfirm">비밀번호 확인 <span className="req">*</span></label>
              <input
                id="reg-passwordConfirm"
                type="password"
                placeholder="비밀번호 재입력"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">이메일 주소 <span className="req">*</span></label>
            <input
              id="reg-email"
              name="email"
              type="email"
              placeholder="user@gwonsystem.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* 2. 기본 인적사항 */}
          <div className="form-section-title">기본 인적사항</div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="reg-lastName">성 <span className="req">*</span></label>
              <input
                id="reg-lastName"
                name="lastName"
                type="text"
                placeholder="예: 최"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-firstName">이름 <span className="req">*</span></label>
              <input
                id="reg-firstName"
                name="firstName"
                type="text"
                placeholder="예: 길동"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="reg-phone">휴대폰 번호 <span className="req">*</span></label>
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                placeholder="010-0000-0000"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-gender">성별 (선택)</label>
              <select
                id="reg-gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="auth-select"
              >
                <option value="">선택 안 함</option>
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
                <option value="OTHER">기타</option>
              </select>
            </div>
          </div>

          {/* 달력 생년월일 선택기 */}
          <div className="form-group">
            <label htmlFor="reg-birthDate">생년월일 (선택)</label>
            <input
              id="reg-birthDate"
              name="birthDate"
              type="date"
              className="input-date-picker"
              value={formData.birthDate}
              onChange={handleInputChange}
            />
          </div>

          {/* 3. 주소 정보 (카카오 우편번호 검색 연동) */}
          <div className="form-section-title">주소 정보</div>

          <div className="form-group">
            <label htmlFor="reg-zipcode">우편번호 <span className="req">*</span></label>
            <div className="postcode-search-row">
              <input
                id="reg-zipcode"
                name="zipcode"
                type="text"
                placeholder="우편번호"
                value={formData.zipcode}
                readOnly
                className="input-readonly"
                required
              />
              <button
                type="button"
                className="btn-address-search"
                onClick={() => setIsPostcodeOpen(true)}
              >
                우편번호 검색
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-address">기본 주소 <span className="req">*</span></label>
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
              />
            </div>
          </div>

          {/* 5. 개인정보보호법에 따른 법률 고지 및 동의 */}
          <div className="form-section-title">약관 및 개인정보 수집 동의</div>

          <div className="privacy-clause-box">
            <h4>[개인정보 수집 및 이용 동의 안내]</h4>
            <p>1. <strong>수집 및 이용 목적:</strong> 사내 포털 및 학회 서비스 제공, 본인 확인 및 식별, 일반/정회원 등급 심사 및 회원 관리</p>
            <p>2. <strong>수집하는 개인정보 항목:</strong><br />
              &nbsp;• [필수항목] 아이디, 비밀번호, 성명, 이메일, 휴대폰 번호, 우편번호, 기본주소<br />
              &nbsp;• [선택항목] 성별, 생년월일, 근무처 소속명, 부서명, 직위, 근무처 전화번호, 상세주소
            </p>
            <p>3. <strong>보유 및 이용 기간:</strong> 회원 탈퇴 시까지 (단, 전자상거래 등 관계 법령에 따른 보존 의무가 있는 경우 해당 법정 기간 동안 안전하게 보관)</p>
            <p>4. <strong>동의 거부권 및 불이익:</strong> 귀하는 개인정보 수집 및 이용 동의를 거부할 권리가 있습니다. 단, 필수항목 수집에 동의하지 않을 경우 포털 회원가입이 제한됩니다.</p>
          </div>

          <div className="agreement-group">
            <label className="checkbox-label all-agree">
              <input
                type="checkbox"
                checked={formData.termsAgreed && formData.privacyAgreed && formData.marketingAgreed}
                onChange={handleAllAgreed}
              />
              <strong>모든 약관에 전체 동의합니다.</strong>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="termsAgreed"
                checked={formData.termsAgreed}
                onChange={handleCheckboxChange}
                required
              />
              <span>[필수] 서비스 이용약관에 동의합니다.</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="privacyAgreed"
                checked={formData.privacyAgreed}
                onChange={handleCheckboxChange}
                required
              />
              <span>[필수] 개인정보 수집 및 이용에 동의합니다.</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="marketingAgreed"
                checked={formData.marketingAgreed}
                onChange={handleCheckboxChange}
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

      {/* 🔍 카카오 다음 우편번호 모달 */}
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
