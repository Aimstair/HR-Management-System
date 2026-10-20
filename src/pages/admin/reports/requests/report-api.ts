import { getAdminEmployees, getAdminRequests, type AdminEmployeeRecord, type AdminRequestRecord, type AdminRequestStatus, type AdminRequestType } from '../../../../lib/admin-api';
import type { ProcessorInfo, ReportEmployeeSummary } from './types';

const PAGE_LIMIT = 200;

const collectPaged = async <T,>(
  fetchPage: (page: number) => Promise<{ rows: T[]; pagination: { totalPages: number } }>,
): Promise<T[]> => {
  const rows: T[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetchPage(page);
    rows.push(...response.rows);
    totalPages = response.pagination.totalPages;
    page += 1;
  }

  return rows;
};

const fallbackAvatarUrl = 'https://picsum.photos/seed/default-employee/80/80';

const dedupeById = <T extends { id: string }>(rows: T[]): T[] => {
  const unique = new Map<string, T>();
  rows.forEach((row) => {
    unique.set(row.id, row);
  });
  return Array.from(unique.values());
};

export const toReportEmployeeSummary = (employee: AdminEmployeeRecord): ReportEmployeeSummary => {
  const fullName = `${employee.firstName} ${employee.lastName}`.trim() || employee.email;

  return {
    id: employee.id,
    fullName,
    position: employee.position ?? 'Unassigned',
    department: employee.departmentModel?.name ?? employee.department ?? 'General Affairs',
    campus: employee.school?.name ?? employee.schoolBranch ?? 'Unknown Campus',
    campusId: employee.school?.id ?? employee.schoolId ?? null,
    avatarUrl: employee.profileImage ?? fallbackAvatarUrl,
    leaveFiledCount: 0,
    expenseTotal: 0,
    fundTotal: 0,
    fundRemaining: 0,
  };
};

export const toProcessorInfo = (reviewedBy: AdminRequestRecord['reviewedBy'] | null): ProcessorInfo => {
  if (!reviewedBy) {
    return {
      id: 'unassigned',
      name: 'Unassigned',
      avatarUrl: fallbackAvatarUrl,
    };
  }

  return {
    id: reviewedBy.id,
    name: `${reviewedBy.firstName} ${reviewedBy.lastName}`.trim() || reviewedBy.email,
    avatarUrl: fallbackAvatarUrl,
  };
};

export const mapRequestStatusToReportStatus = (
  status: AdminRequestStatus,
): 'Approved' | 'Declined' | 'Unprocessed' | 'Cancelled' => {
  switch (status) {
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Declined';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return 'Unprocessed';
  }
};

export const fetchReportEmployees = async (): Promise<ReportEmployeeSummary[]> => {
  const rows = await collectPaged((page) =>
    getAdminEmployees({ page, limit: PAGE_LIMIT, isActive: true }),
  );
  return dedupeById(rows).map(toReportEmployeeSummary);
};

export const fetchReportRequests = async (type: AdminRequestType): Promise<AdminRequestRecord[]> => {
  const rows = await collectPaged((page) =>
    getAdminRequests({
      type,
      page,
      limit: PAGE_LIMIT,
    }),
  );
  return dedupeById(rows);
};
