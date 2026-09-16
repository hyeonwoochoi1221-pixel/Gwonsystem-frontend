// src/types/admin.ts

export type MemberRole = 'ROLE_SUPERVISOR' | 'ROLE_REGULAR' | 'ROLE_ASSOCIATE';

// 1. 임직원 정회원 승격 신청서 규격
export interface PromotionApplication {
  id: number;
  memberId: number;
  username: string;
  applicantName: string;
  email: string;
  phone: string;
  targetDepartment: string;   // 희망 부서 (예: AI 연구팀, 클라우드 인프라팀)
  targetPosition: string;     // 희망 직위 (예: 연구전담요원, 선임연구원)
  targetProject: string;      // 참여 희망 과제 (예: 반도체 이상치 탐지 AI)
  reason: string;             // 신청 사유
  appliedAt: string;          // 신청 일시
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// 2. 전체 회원 명부 조회용 규격 (일반 고객 포함)
export interface GeneralMember {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: MemberRole;
  departmentName?: string;
  position?: string;
  createdAt: string;
}
