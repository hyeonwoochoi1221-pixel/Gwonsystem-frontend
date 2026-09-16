// src/pages/profile/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './ProfilePage.css';

// 카카오 우편번호 Daum 글로벌 인터페이스
declare global {
  interface Window {
    daum?: {
      Postcode: new (config: {
        oncomplete: (data: { zonecode: string; address: string; buildingName?: string }) => void;
      }) => { open: () => void };
    };
  }
}

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    username: localStorage.getItem('username') || 'hwchoi1221',
    lastName: localStorage.getItem('lastName') || '최',
    firstName: localStorage.getItem('firstName') || '현우',
    gender: '남',
    birthYear: '2000',
    birthMonth: '12',
    birthDay: '21',
    phonePrefix: '010',
    phoneMid: '3034',
    phoneEnd: '1924',
    email: 'hwchoi1221@naver.com',
    zipcode: '06561',
    address: '서울특별시 서초구 방배로37길 39',
    detailAddress: '401호',
    workplaceName: 'G-WON SYSTEM',
    departmentName: 'AI 연구개발실',
    position: '연구원',
    workplacePhone: '02-598-1924',
    role: localStorage.getItem('userRole') || 'ROLE_ASSOCIATE',
    newPassword: '',
    newPasswordConfirm: '',
    // 정회원 승격 신청
    targetDepartment: 'AI 연구개발실',
    targetPosition: '연구전담요원',
    targetProject: '반도체 공급망 시세 수집 및 이상치 탐지 AI',
    promotionReason: '',
  });

  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

  // 카카오 우편번호 스크립트 로드
  useEffect(() => {
    if (!document.getElementById('daum-postcode-script')) {
      const script = document.createElement('script');
      script.id = 'daum-postcode-script';
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // 카카오 우편번호 검색 팝업
  const handleOpenPostcode = () => {
    if (!window.daum?.Postcode) {
      toast.error('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        setFormData((prev) => ({
          ...prev,
          zipcode: data.zonecode,
          address: data.address,
          detailAddress: data.buildingName ? `(${data.buildingName}) ` : '',
        }));
      },
    }).open();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.newPassword) {
      if (formData.newPassword !== formData.newPasswordConfirm) {
        toast.error('새 비밀번호가 일치하지 않습니다.');
        return;
      }
      if (formData.newPassword.length < 8) {
        toast.error('비밀번호는 8자 이상이어야 합니다.');
        return;
      }
    }
    localStorage.setItem('lastName', formData.lastName);
    localStorage.setItem('firstName', formData.firstName);
    toast.success('개인정보가 성공적으로 수정되었습니다.');
  };

  const handlePromotionSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.promotionReason.trim()) {
      toast.error('신청 사유를 입력해주세요.');
      return;
    }
    toast.success('기업부설연구소 정회원 승격 신청서가 제출되었습니다.');
    setIsPromotionModalOpen(false);
  };

  return (
    <div className="wide-profile-container">
      <div className="wide-profile-card">
        {/* 상단 헤더 */}
        <div className="wide-header-row">
          <div>
            <h2>개인정보수정</h2>
            <p>가입 시 등록된 회원 기본 정보 및 사내 소속 정보를 조회하고 수정합니다.</p>
          </div>
          <div className="wide-header-actions">
            {formData.role === 'ROLE_ASSOCIATE' && (
              <button
                type="button"
                className="btn-open-promotion-wide"
                onClick={() => setIsPromotionModalOpen(true)}
              >
                🏢 연구소 정회원 승격 신청
              </button>
            )}
            <span className="req-guide-tag">■ 표시는 필수 입력 항목입니다.</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="wide-profile-form">
          <table className="wide-grid-table">
            <colgroup>
              <col style={{ width: '160px' }} />
              <col style={{ width: '42%' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '42%' }} />
            </colgroup>
            <tbody>
            {/* 1. 아이디 & 회원 등급 */}
            <tr>
              <th><span className="dot">■</span> 아이디</th>
              <td>
                <div className="align-row">
                  <input
                    type="text"
                    value={formData.username}
                    readOnly
                    className="wide-input readonly w-220"
                  />
                  <span className="badge-verified">인증 완료 계정</span>
                </div>
              </td>
              <th>회원 등급</th>
              <td>
                  <span className={`wide-role-badge ${formData.role.toLowerCase()}`}>
                    {formData.role === 'ROLE_SUPERVISOR' && '👑 관리자 (Supervisor)'}
                    {formData.role === 'ROLE_REGULAR' && '👔 정회원 (임직원/연구원)'}
                    {formData.role === 'ROLE_ASSOCIATE' && '🌱 일반회원 (준회원)'}
                  </span>
              </td>
            </tr>

            {/* 2. 성명 (한글 성/이름 분리) */}
            <tr>
              <th><span className="dot">■</span> 성명 (한글)</th>
              <td colSpan={3}>
                <div className="align-row">
                  <span className="label-sub">성:</span>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="wide-input w-100"
                    required
                  />
                  <span className="label-sub" style={{ marginLeft: '12px' }}>이름:</span>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="wide-input w-160"
                    required
                  />
                </div>
              </td>
            </tr>

            {/* 3. 생년월일 & 성별 */}
            <tr>
              <th><span className="dot">■</span> 생년월일</th>
              <td>
                <div className="align-row">
                  <select name="birthYear" value={formData.birthYear} onChange={handleInputChange} className="wide-select w-100">
                    <option value="2000">2000년</option>
                    <option value="1999">1999년</option>
                    <option value="1998">1998년</option>
                  </select>
                  <select name="birthMonth" value={formData.birthMonth} onChange={handleInputChange} className="wide-select w-80">
                    <option value="12">12월</option>
                    <option value="11">11월</option>
                    <option value="10">10월</option>
                  </select>
                  <select name="birthDay" value={formData.birthDay} onChange={handleInputChange} className="wide-select w-80">
                    <option value="21">21일</option>
                    <option value="20">20일</option>
                    <option value="19">19일</option>
                  </select>
                </div>
              </td>
              <th><span className="dot">■</span> 성별</th>
              <td>
                <div className="align-row">
                  <label className="wide-radio">
                    <input
                      type="radio"
                      name="gender"
                      value="남"
                      checked={formData.gender === '남'}
                      onChange={handleInputChange}
                    />
                    <span>남자</span>
                  </label>
                  <label className="wide-radio" style={{ marginLeft: '16px' }}>
                    <input
                      type="radio"
                      name="gender"
                      value="여"
                      checked={formData.gender === '여'}
                      onChange={handleInputChange}
                    />
                    <span>여자</span>
                  </label>
                </div>
              </td>
            </tr>

            {/* 4. 휴대폰 번호 */}
            <tr>
              <th><span className="dot">■</span> 휴대폰 번호</th>
              <td colSpan={3}>
                <div className="align-row">
                  <select
                    name="phonePrefix"
                    value={formData.phonePrefix}
                    onChange={handleInputChange}
                    className="wide-select w-90"
                  >
                    <option value="010">010</option>
                    <option value="011">011</option>
                  </select>
                  <span>-</span>
                  <input
                    type="text"
                    name="phoneMid"
                    value={formData.phoneMid}
                    onChange={handleInputChange}
                    className="wide-input w-90"
                    maxLength={4}
                    required
                  />
                  <span>-</span>
                  <input
                    type="text"
                    name="phoneEnd"
                    value={formData.phoneEnd}
                    onChange={handleInputChange}
                    className="wide-input w-90"
                    maxLength={4}
                    required
                  />
                </div>
              </td>
            </tr>

            {/* 5. 이메일 */}
            <tr>
              <th><span className="dot">■</span> 이메일</th>
              <td colSpan={3}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="wide-input w-full-mid"
                  required
                />
              </td>
            </tr>

            {/* 6. 주소 (카카오 우편번호 연동) */}
            <tr>
              <th><span className="dot">■</span> 주소</th>
              <td colSpan={3}>
                <div className="address-stack">
                  <div className="align-row">
                    <input
                      type="text"
                      value={formData.zipcode}
                      readOnly
                      placeholder="우편번호"
                      className="wide-input readonly w-120"
                    />
                    <button
                      type="button"
                      className="btn-kakao-search"
                      onClick={handleOpenPostcode}
                    >
                      우편번호 검색 (카카오)
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.address}
                    readOnly
                    placeholder="기본 도로명 주소"
                    className="wide-input readonly w-full"
                  />
                  <input
                    type="text"
                    name="detailAddress"
                    value={formData.detailAddress}
                    onChange={handleInputChange}
                    placeholder="상세 주소를 입력해주세요 (동·호수 등)"
                    className="wide-input w-full"
                  />
                </div>
              </td>
            </tr>

            {/* 7. 소속 정보 (2열 정렬) */}
            <tr>
              <th>근무처 소속명</th>
              <td>
                <input
                  type="text"
                  name="workplaceName"
                  value={formData.workplaceName}
                  onChange={handleInputChange}
                  className="wide-input w-full"
                  placeholder="예: G-WON SYSTEM"
                />
              </td>
              <th>부서명 / 학과명</th>
              <td>
                <input
                  type="text"
                  name="departmentName"
                  value={formData.departmentName}
                  onChange={handleInputChange}
                  className="wide-input w-full"
                  placeholder="예: AI 연구개발실"
                />
              </td>
            </tr>

            <tr>
              <th>직위 (직급)</th>
              <td>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="wide-input w-full"
                  placeholder="예: 연구원"
                />
              </td>
              <th>근무처 전화번호</th>
              <td>
                <input
                  type="text"
                  name="workplacePhone"
                  value={formData.workplacePhone}
                  onChange={handleInputChange}
                  className="wide-input w-full"
                  placeholder="예: 02-598-1924"
                />
              </td>
            </tr>

            {/* 8. 비밀번호 변경 (2열 정렬) */}
            <tr>
              <th>새 비밀번호</th>
              <td>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="변경 시에만 8자 이상 입력"
                  className="wide-input w-full"
                />
              </td>
              <th>새 비밀번호 확인</th>
              <td>
                <input
                  type="password"
                  name="newPasswordConfirm"
                  value={formData.newPasswordConfirm}
                  onChange={handleInputChange}
                  placeholder="새 비밀번호 재입력"
                  className="wide-input w-full"
                />
              </td>
            </tr>
            </tbody>
          </table>

          {/* 하단 버튼 */}
          <div className="wide-btn-center">
            <button type="button" className="btn-wide-cancel" onClick={() => window.history.back()}>
              취소
            </button>
            <button type="submit" className="btn-wide-submit">
              수정완료
            </button>
          </div>
        </form>
      </div>

      {/* 정회원 승격 신청 모달 */}
      {isPromotionModalOpen && (
        <div className="wide-modal-overlay" onClick={() => setIsPromotionModalOpen(false)}>
          <div className="wide-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title-box">
              <h3>🏢 기업부설연구소 정회원 승격 신청</h3>
              <p>연구과제 참여 및 사내 정회원 권한 부여를 위한 신청서를 작성합니다.</p>
            </div>
            <form onSubmit={handlePromotionSubmit}>
              <div className="m-group">
                <label>희망 부서</label>
                <input
                  type="text"
                  name="targetDepartment"
                  value={formData.targetDepartment}
                  onChange={handleInputChange}
                  className="wide-input"
                  required
                />
              </div>
              <div className="m-group">
                <label>희망 R&D 역할 (직책)</label>
                <select
                  name="targetPosition"
                  value={formData.targetPosition}
                  onChange={handleInputChange}
                  className="wide-select"
                >
                  <option value="연구전담요원">연구전담요원</option>
                  <option value="선임연구원">선임연구원</option>
                  <option value="연구책임자">연구책임자</option>
                  <option value="연구보조원">연구보조원</option>
                </select>
              </div>
              <div className="m-group">
                <label>참여 희망 과제명</label>
                <input
                  type="text"
                  name="targetProject"
                  value={formData.targetProject}
                  onChange={handleInputChange}
                  className="wide-input"
                  required
                />
              </div>
              <div className="m-group">
                <label>신청 사유</label>
                <textarea
                  rows={3}
                  name="promotionReason"
                  value={formData.promotionReason}
                  onChange={handleInputChange}
                  placeholder="연구 수행 목표나 참여 목적을 기재하세요."
                  className="wide-textarea"
                  required
                />
              </div>
              <div className="m-btn-row">
                <button type="button" className="btn-wide-cancel" onClick={() => setIsPromotionModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="btn-wide-submit">
                  승격 신청
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
