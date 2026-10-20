import type { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';
import type { AuthTokenPayload } from '../types/auth.js';
import { getScopedSchoolId } from './scope-filters.js';

/**
 * Memos an HR account may see: head HR sees everything, campus HR sees memos
 * addressed to its campus (or anything inside it) plus organization-wide memos.
 */
export const getAdminMemoWhere = (auth: AuthTokenPayload): Prisma.MemoWhereInput => {
  if (auth.role === 'ROLE_HEAD_HR') {
    return {};
  }

  return {
    OR: [
      { campusId: getScopedSchoolId(auth) },
      { scopeType: 'GLOBAL', campusId: null },
    ],
  };
};

/**
 * Acknowledgements an HR account may see on a memo: campus HR only sees its own
 * campus's employees (relevant for organization-wide memos).
 */
export const getAdminAcknowledgementWhere = (
  auth: AuthTokenPayload,
): Prisma.MemoAcknowledgementWhereInput => {
  if (auth.role === 'ROLE_HEAD_HR') {
    return {};
  }

  return { employee: { schoolId: getScopedSchoolId(auth) } };
};

/**
 * Memos a user may see and acknowledge in the employee portal. A memo reaches the
 * user when it is addressed to them directly, or when it is a group memo
 * (no individual recipient) for the whole organization, their campus, one of
 * their schools, or their department.
 */
export const getEmployeeMemoWhere = async (userId: string): Promise<Prisma.MemoWhereInput> => {
  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      schoolId: true,
      departmentId: true,
      departmentModel: { select: { schoolId: true } },
      teachingAssignments: { select: { schoolId: true } },
    },
  });

  const directMemo: Prisma.MemoWhereInput = { recipientEmployeeId: userId };
  if (!user) {
    return directMemo;
  }

  const schoolIds = Array.from(
    new Set(
      [user.departmentModel?.schoolId, ...user.teachingAssignments.map((row) => row.schoolId)].filter(
        (id): id is string => Boolean(id),
      ),
    ),
  );

  const groupMemo = (where: Prisma.MemoWhereInput): Prisma.MemoWhereInput => ({
    recipientEmployeeId: null,
    ...where,
  });

  const audiences: Prisma.MemoWhereInput[] = [
    directMemo,
    groupMemo({ scopeType: 'GLOBAL', campusId: null, schoolId: null, departmentId: null }),
  ];

  if (user.schoolId) {
    // Campus-wide memos, including campus HR's "All" memos.
    audiences.push(groupMemo({ campusId: user.schoolId, schoolId: null, departmentId: null }));
  }

  if (schoolIds.length > 0) {
    audiences.push(groupMemo({ schoolId: { in: schoolIds }, departmentId: null }));
  }

  if (user.departmentId) {
    audiences.push(groupMemo({ departmentId: user.departmentId }));
  }

  return { OR: audiences };
};
