import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { env } from '../config/env.js';

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'HR System API',
      version: '1.0.0',
      description:
        'API documentation for authentication, admin dashboard metrics, employee management, and request management.',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Local API server',
      },
    ],
    tags: [
      { name: 'Health', description: 'Service liveness endpoints' },
      { name: 'Auth', description: 'Authentication and session endpoints' },
      { name: 'Admin Dashboard', description: 'Administrative metrics endpoints' },
      { name: 'Admin Employees', description: 'Administrative employee management endpoints' },
      { name: 'Admin Requests', description: 'Administrative request review endpoints' },
      {
        name: 'Admin Attendance & Performance',
        description: 'Administrative attendance and performance review endpoints',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        refreshCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
        },
        AdminScope: {
          type: 'object',
          properties: {
            scopeType: {
              type: 'string',
              enum: ['GLOBAL', 'SCHOOL', 'DEPARTMENT'],
            },
            schoolId: { type: 'string', nullable: true },
            schoolName: { type: 'string', nullable: true },
            departmentId: { type: 'string', nullable: true },
            departmentName: { type: 'string', nullable: true },
          },
          required: ['scopeType'],
        },
        PublicUser: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            isActive: { type: 'boolean' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: {
              type: 'string',
              enum: [
                'ROLE_EMPLOYEE',
                'ROLE_HEAD_HR',
                'ROLE_CAMPUS_HR',
              ],
            },
            employeeType: {
              type: 'string',
              enum: ['TEACHING', 'NON_TEACHING'],
            },
            department: { type: 'string', nullable: true },
            schoolBranch: { type: 'string', nullable: true },
            profileImage: { type: 'string', nullable: true },
            joinDate: { type: 'string', format: 'date-time' },
            position: { type: 'string', nullable: true },
            scope: {
              allOf: [{ $ref: '#/components/schemas/AdminScope' }],
              nullable: true,
            },
          },
          required: ['id', 'email', 'isActive', 'firstName', 'lastName', 'role', 'employeeType', 'joinDate'],
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
          required: ['email', 'password'],
        },
        LoginResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            user: { $ref: '#/components/schemas/PublicUser' },
          },
          required: ['accessToken', 'user'],
        },
        Employee: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string' },
            employeeType: {
              type: 'string',
              enum: ['TEACHING', 'NON_TEACHING'],
            },
            isActive: { type: 'boolean' },
            schoolId: { type: 'string', nullable: true },
            schoolBranch: { type: 'string', nullable: true },
            departmentId: { type: 'string', nullable: true },
            department: { type: 'string', nullable: true },
            position: { type: 'string', nullable: true },
            profileImage: { type: 'string', nullable: true },
            joinDate: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'email', 'firstName', 'lastName', 'role', 'employeeType', 'isActive', 'joinDate'],
        },
        RequestRecord: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: {
              type: 'string',
              enum: [
                'LEAVE',
                'EXPENSE',
                'FUND',
                'OVERTIME',
                'UNDERTIME',
                'WFH',
                'TIME_ADJUSTMENT',
                'SHIFT_ASSIGNMENT',
                'SWAP_REQUEST',
              ],
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
            },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            leaveStartDate: { type: 'string', format: 'date-time', nullable: true },
            leaveEndDate: { type: 'string', format: 'date-time', nullable: true },
            employeeId: { type: 'string' },
            reviewedById: { type: 'string', nullable: true },
            schoolId: { type: 'string' },
            departmentId: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: [
            'id',
            'type',
            'status',
            'title',
            'employeeId',
            'schoolId',
            'createdAt',
            'updatedAt',
          ],
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
          required: ['page', 'limit', 'total', 'totalPages'],
        },
        AdminTeachingAttendanceRecord: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeId: { type: 'string' },
            status: {
              type: 'string',
              enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
            },
            remarks: { type: 'string', nullable: true },
            minutesLate: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            employee: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                position: { type: 'string', nullable: true },
              },
              required: ['id', 'firstName', 'lastName', 'email'],
            },
            classSession: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                sessionDate: { type: 'string', format: 'date-time' },
                startsAt: { type: 'string', format: 'date-time' },
                endsAt: { type: 'string', format: 'date-time' },
                room: { type: 'string', nullable: true },
                subject: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    code: { type: 'string' },
                    name: { type: 'string' },
                  },
                  required: ['id', 'code', 'name'],
                },
                school: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                  required: ['id', 'name'],
                },
                department: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                  required: ['id', 'name'],
                },
              },
              required: ['id', 'sessionDate', 'startsAt', 'endsAt', 'subject', 'school'],
            },
          },
          required: ['id', 'employeeId', 'status', 'createdAt', 'updatedAt', 'employee', 'classSession'],
        },
        AdminNonTeachingAttendanceRecord: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeId: { type: 'string' },
            schoolId: { type: 'string' },
            departmentId: { type: 'string', nullable: true },
            attendanceDate: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'],
            },
            checkInTime: { type: 'string', format: 'date-time', nullable: true },
            checkOutTime: { type: 'string', format: 'date-time', nullable: true },
            remarks: { type: 'string', nullable: true },
            minutesLate: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            employee: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                position: { type: 'string', nullable: true },
              },
              required: ['id', 'firstName', 'lastName', 'email'],
            },
            school: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
              required: ['id', 'name'],
            },
            department: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
              required: ['id', 'name'],
            },
          },
          required: [
            'id',
            'employeeId',
            'schoolId',
            'attendanceDate',
            'status',
            'createdAt',
            'updatedAt',
            'employee',
            'school',
          ],
        },
        AdminPerformanceEvaluationRecord: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeId: { type: 'string' },
            schoolId: { type: 'string' },
            departmentId: { type: 'string', nullable: true },
            evaluatorId: { type: 'string', nullable: true },
            rubricType: {
              type: 'string',
              enum: ['TEACHING', 'NON_TEACHING'],
            },
            periodStart: { type: 'string', format: 'date-time' },
            periodEnd: { type: 'string', format: 'date-time' },
            criteria: {
              type: 'object',
              additionalProperties: true,
            },
            overallScore: { type: 'number' },
            notes: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            employee: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                position: { type: 'string', nullable: true },
                employeeType: {
                  type: 'string',
                  enum: ['TEACHING', 'NON_TEACHING'],
                },
              },
              required: ['id', 'firstName', 'lastName', 'email', 'employeeType'],
            },
            evaluator: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
              },
              required: ['id', 'firstName', 'lastName', 'email'],
            },
            school: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
              required: ['id', 'name'],
            },
            department: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
              required: ['id', 'name'],
            },
          },
          required: [
            'id',
            'employeeId',
            'schoolId',
            'rubricType',
            'periodStart',
            'periodEnd',
            'criteria',
            'overallScore',
            'createdAt',
            'updatedAt',
            'employee',
            'school',
          ],
        },
        PaginatedTeachingAttendanceResponse: {
          type: 'object',
          properties: {
            rows: {
              type: 'array',
              items: { $ref: '#/components/schemas/AdminTeachingAttendanceRecord' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
          required: ['rows', 'pagination'],
        },
        PaginatedNonTeachingAttendanceResponse: {
          type: 'object',
          properties: {
            rows: {
              type: 'array',
              items: { $ref: '#/components/schemas/AdminNonTeachingAttendanceRecord' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
          required: ['rows', 'pagination'],
        },
        PaginatedPerformanceEvaluationResponse: {
          type: 'object',
          properties: {
            rows: {
              type: 'array',
              items: { $ref: '#/components/schemas/AdminPerformanceEvaluationRecord' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
          required: ['rows', 'pagination'],
        },
        TeachingAttendanceWriteResponse: {
          type: 'object',
          properties: {
            attendance: { $ref: '#/components/schemas/AdminTeachingAttendanceRecord' },
          },
          required: ['attendance'],
        },
        NonTeachingAttendanceWriteResponse: {
          type: 'object',
          properties: {
            attendance: { $ref: '#/components/schemas/AdminNonTeachingAttendanceRecord' },
          },
          required: ['attendance'],
        },
        PerformanceEvaluationWriteResponse: {
          type: 'object',
          properties: {
            evaluation: { $ref: '#/components/schemas/AdminPerformanceEvaluationRecord' },
          },
          required: ['evaluation'],
        },
        CreateTeachingAttendanceRequest: {
          type: 'object',
          properties: {
            employeeId: { type: 'string' },
            classSessionId: { type: 'string' },
            status: {
              type: 'string',
              enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
            },
            remarks: { type: 'string', nullable: true },
            minutesLate: { type: 'integer', nullable: true, minimum: 0 },
          },
          required: ['employeeId', 'classSessionId', 'status'],
        },
        UpdateTeachingAttendanceRequest: {
          type: 'object',
          properties: {
            employeeId: { type: 'string' },
            classSessionId: { type: 'string' },
            status: {
              type: 'string',
              enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
            },
            remarks: { type: 'string', nullable: true },
            minutesLate: { type: 'integer', nullable: true, minimum: 0 },
          },
        },
        CreateNonTeachingAttendanceRequest: {
          type: 'object',
          properties: {
            employeeId: { type: 'string' },
            schoolId: { type: 'string' },
            departmentId: { type: 'string', nullable: true },
            attendanceDate: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'],
            },
            checkInTime: { type: 'string', format: 'date-time', nullable: true },
            checkOutTime: { type: 'string', format: 'date-time', nullable: true },
            remarks: { type: 'string', nullable: true },
            minutesLate: { type: 'integer', nullable: true, minimum: 0 },
          },
          required: ['employeeId', 'attendanceDate', 'status'],
        },
        UpdateNonTeachingAttendanceRequest: {
          type: 'object',
          properties: {
            employeeId: { type: 'string' },
            schoolId: { type: 'string' },
            departmentId: { type: 'string', nullable: true },
            attendanceDate: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'],
            },
            checkInTime: { type: 'string', format: 'date-time', nullable: true },
            checkOutTime: { type: 'string', format: 'date-time', nullable: true },
            remarks: { type: 'string', nullable: true },
            minutesLate: { type: 'integer', nullable: true, minimum: 0 },
          },
        },
        DashboardSummaryResponse: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                totalEmployees: { type: 'integer' },
                totalTeachingEmployees: { type: 'integer' },
                totalNonTeachingEmployees: { type: 'integer' },
                teachingActive: { type: 'integer' },
                nonTeachingActive: { type: 'integer' },
                teachingSessionsPresent: { type: 'integer' },
                teachingSessionsTotal: { type: 'integer' },
                todayTeachingSessionsAttendance: { type: 'integer' },
                onLeave: { type: 'integer' },
                pendingRequests: { type: 'integer' },
                todayAttendance: { type: 'integer' },
                todayTeachingAttendance: { type: 'integer' },
                todayNonTeachingAttendance: { type: 'integer' },
                totalLate: { type: 'integer' },
                activeShifts: { type: 'integer' },
              },
              required: [
                'totalEmployees',
                'totalTeachingEmployees',
                'totalNonTeachingEmployees',
                'teachingActive',
                'nonTeachingActive',
                'teachingSessionsPresent',
                'teachingSessionsTotal',
                'todayTeachingSessionsAttendance',
                'onLeave',
                'pendingRequests',
                'todayAttendance',
                'todayTeachingAttendance',
                'todayNonTeachingAttendance',
                'totalLate',
                'activeShifts',
              ],
            },
            attendanceTrendNonTeaching: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'string' },
                  date: { type: 'string', format: 'date' },
                  present: { type: 'integer' },
                  absent: { type: 'integer' },
                  late: { type: 'integer' },
                },
                required: ['day', 'date', 'present', 'absent', 'late'],
              },
            },
            attendanceTrendTeaching: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'string' },
                  date: { type: 'string', format: 'date' },
                  present: { type: 'integer' },
                  absent: { type: 'integer' },
                  late: { type: 'integer' },
                },
                required: ['day', 'date', 'present', 'absent', 'late'],
              },
            },
            requestBreakdown: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    enum: ['Leave', 'Undertime', 'Overtime', 'Work from Home', 'Time Adjustment'],
                  },
                  value: { type: 'integer' },
                },
                required: ['name', 'value'],
              },
            },
            priorityRequests: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  avatarUrl: { type: 'string', nullable: true },
                  name: { type: 'string' },
                  requestType: {
                    type: 'string',
                    enum: ['Leave', 'Undertime', 'Overtime', 'Work from Home', 'Time Adjustment'],
                  },
                  dateSubmitted: { type: 'string', format: 'date-time' },
                },
                required: ['id', 'name', 'requestType', 'dateSubmitted'],
              },
            },
            tardinessWatchlist: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  employeeId: { type: 'string' },
                  avatarUrl: { type: 'string', nullable: true },
                  name: { type: 'string' },
                  department: { type: 'string', nullable: true },
                  minutesLate: { type: 'integer' },
                },
                required: ['id', 'employeeId', 'name', 'minutesLate'],
              },
            },
            recentMemos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  publishedAt: { type: 'string', format: 'date-time' },
                },
                required: ['id', 'title', 'publishedAt'],
              },
            },
          },
          required: [
            'summary',
            'attendanceTrendNonTeaching',
            'attendanceTrendTeaching',
            'requestBreakdown',
            'priorityRequests',
            'tardinessWatchlist',
            'recentMemos',
          ],
        },
        CreatePerformanceEvaluationRequest: {
          type: 'object',
          properties: {
            employeeId: { type: 'string' },
            schoolId: { type: 'string' },
            departmentId: { type: 'string', nullable: true },
            evaluatorId: { type: 'string', nullable: true },
            rubricType: {
              type: 'string',
              enum: ['TEACHING', 'NON_TEACHING'],
            },
            periodStart: { type: 'string', format: 'date-time' },
            periodEnd: { type: 'string', format: 'date-time' },
            criteria: {
              type: 'object',
              additionalProperties: true,
            },
            overallScore: { type: 'number' },
            notes: { type: 'string', nullable: true },
          },
          required: [
            'employeeId',
            'rubricType',
            'periodStart',
            'periodEnd',
            'criteria',
            'overallScore',
          ],
        },
        UpdatePerformanceEvaluationRequest: {
          type: 'object',
          properties: {
            employeeId: { type: 'string' },
            schoolId: { type: 'string' },
            departmentId: { type: 'string', nullable: true },
            evaluatorId: { type: 'string', nullable: true },
            rubricType: {
              type: 'string',
              enum: ['TEACHING', 'NON_TEACHING'],
            },
            periodStart: { type: 'string', format: 'date-time' },
            periodEnd: { type: 'string', format: 'date-time' },
            criteria: {
              type: 'object',
              additionalProperties: true,
            },
            overallScore: { type: 'number' },
            notes: { type: 'string', nullable: true },
          },
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: {
            200: {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                    required: ['status', 'timestamp'],
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Authenticate user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Authenticated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginResponse' },
                },
              },
            },
            401: {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'Account is inactive',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token using refresh cookie',
          security: [{ refreshCookie: [] }],
          responses: {
            200: {
              description: 'Access token refreshed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginResponse' },
                },
              },
            },
            401: {
              description: 'Refresh token missing/invalid/expired',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'Account is inactive',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout and revoke refresh session',
          security: [{ refreshCookie: [] }],
          responses: {
            204: { description: 'Logged out successfully' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current authenticated user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Current user',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/PublicUser' },
                    },
                    required: ['user'],
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/admin/dashboard/summary': {
        get: {
          tags: ['Admin Dashboard'],
          summary: 'Get scoped admin dashboard summary',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Dashboard summary',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DashboardSummaryResponse' },
                },
              },
            },
          },
        },
      },
      '/api/admin/employees/list': {
        get: {
          tags: ['Admin Employees'],
          summary: 'List scoped employees',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'schoolId', in: 'query', schema: { type: 'string' } },
            { name: 'departmentId', in: 'query', schema: { type: 'string' } },
            { name: 'isActive', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 200 } },
            {
              name: 'sortBy',
              in: 'query',
              schema: { type: 'string', enum: ['firstName', 'lastName', 'email', 'joinDate'] },
            },
            { name: 'sortDirection', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          ],
          responses: {
            200: {
              description: 'Paginated employee list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      rows: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Employee' },
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' },
                          totalPages: { type: 'integer' },
                        },
                        required: ['page', 'limit', 'total', 'totalPages'],
                      },
                    },
                    required: ['rows', 'pagination'],
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/employees/create': {
        post: {
          tags: ['Admin Employees'],
          summary: 'Create employee',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    employeeType: { type: 'string', enum: ['TEACHING', 'NON_TEACHING'] },
                    schoolId: { type: 'string' },
                    departmentId: { type: 'string', nullable: true },
                    position: { type: 'string', nullable: true },
                    profileImage: { type: 'string', nullable: true },
                    temporaryPassword: { type: 'string', minLength: 8, maxLength: 128 },
                  },
                  required: ['email', 'firstName', 'lastName', 'schoolId'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Employee created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      employee: { $ref: '#/components/schemas/Employee' },
                    },
                    required: ['employee'],
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/employees/{employeeId}': {
        get: {
          tags: ['Admin Employees'],
          summary: 'Get employee by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'employeeId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Employee detail',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      employee: { $ref: '#/components/schemas/Employee' },
                    },
                    required: ['employee'],
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/employees/{employeeId}/update': {
        patch: {
          tags: ['Admin Employees'],
          summary: 'Update employee by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'employeeId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    employeeType: { type: 'string', enum: ['TEACHING', 'NON_TEACHING'] },
                    schoolId: { type: 'string' },
                    departmentId: { type: 'string', nullable: true },
                    position: { type: 'string', nullable: true },
                    profileImage: { type: 'string', nullable: true },
                    isActive: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Employee updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      employee: { $ref: '#/components/schemas/Employee' },
                    },
                    required: ['employee'],
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/requests/list': {
        get: {
          tags: ['Admin Requests'],
          summary: 'List scoped requests',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            {
              name: 'type',
              in: 'query',
              schema: {
                type: 'string',
                enum: [
                  'LEAVE',
                  'EXPENSE',
                  'FUND',
                  'OVERTIME',
                  'UNDERTIME',
                  'WFH',
                  'TIME_ADJUSTMENT',
                  'SHIFT_ASSIGNMENT',
                  'SWAP_REQUEST',
                ],
              },
            },
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] },
            },
            { name: 'schoolId', in: 'query', schema: { type: 'string' } },
            { name: 'departmentId', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 200 } },
          ],
          responses: {
            200: {
              description: 'Paginated request list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      rows: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/RequestRecord' },
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' },
                          totalPages: { type: 'integer' },
                        },
                        required: ['page', 'limit', 'total', 'totalPages'],
                      },
                    },
                    required: ['rows', 'pagination'],
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/requests/{requestId}': {
        get: {
          tags: ['Admin Requests'],
          summary: 'Get request by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'requestId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Request detail',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      request: { $ref: '#/components/schemas/RequestRecord' },
                    },
                    required: ['request'],
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/requests/{requestId}/status': {
        patch: {
          tags: ['Admin Requests'],
          summary: 'Update request status',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'requestId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
                    },
                  },
                  required: ['status'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Request status updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      request: { $ref: '#/components/schemas/RequestRecord' },
                    },
                    required: ['request'],
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/requests/bulk-status': {
        patch: {
          tags: ['Admin Requests'],
          summary: 'Bulk update request status',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ids: {
                      type: 'array',
                      minItems: 1,
                      maxItems: 200,
                      items: { type: 'string' },
                    },
                    status: {
                      type: 'string',
                      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
                    },
                  },
                  required: ['ids', 'status'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Bulk update result',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      updated: { type: 'integer' },
                      requests: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/RequestRecord' },
                      },
                    },
                    required: ['updated', 'requests'],
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/attendance/teaching/list': {
        get: {
          tags: ['Admin Attendance & Performance'],
          summary: 'List scoped teaching attendance records',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'schoolId', in: 'query', schema: { type: 'string' } },
            { name: 'departmentId', in: 'query', schema: { type: 'string' } },
            { name: 'employeeId', in: 'query', schema: { type: 'string' } },
            { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
            { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] },
            },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 200 } },
          ],
          responses: {
            200: {
              description: 'Teaching attendance list',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedTeachingAttendanceResponse' },
                },
              },
            },
            400: {
              description: 'Invalid query filters',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'Requested school is outside scope',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/admin/attendance/teaching/create': {
        post: {
          tags: ['Admin Attendance & Performance'],
          summary: 'Create teaching attendance record',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateTeachingAttendanceRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Teaching attendance created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/TeachingAttendanceWriteResponse' },
                },
              },
            },
            400: {
              description: 'Validation failure or inconsistent employee/session mapping',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'Requested school is outside scope',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Employee or class session not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/admin/attendance/teaching/{id}/update': {
        patch: {
          tags: ['Admin Attendance & Performance'],
          summary: 'Update teaching attendance record',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateTeachingAttendanceRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Teaching attendance updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/TeachingAttendanceWriteResponse' },
                },
              },
            },
            400: {
              description: 'Validation failure or duplicate record key',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'Requested school is outside scope',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Teaching attendance, employee, or class session not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/admin/attendance/non-teaching/list': {
        get: {
          tags: ['Admin Attendance & Performance'],
          summary: 'List scoped non-teaching attendance records',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'schoolId', in: 'query', schema: { type: 'string' } },
            { name: 'departmentId', in: 'query', schema: { type: 'string' } },
            { name: 'employeeId', in: 'query', schema: { type: 'string' } },
            { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
            { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'],
              },
            },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 200 } },
          ],
          responses: {
            200: {
              description: 'Non-teaching attendance list',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedNonTeachingAttendanceResponse' },
                },
              },
            },
            400: {
              description: 'Invalid query filters',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'Requested school is outside scope',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/admin/attendance/non-teaching/create': {
        post: {
          tags: ['Admin Attendance & Performance'],
          summary: 'Create non-teaching attendance record',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateNonTeachingAttendanceRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Non-teaching attendance created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/NonTeachingAttendanceWriteResponse' },
                },
              },
            },
            400: {
              description: 'Validation failure or inconsistent employee/school/department mapping',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'Requested school is outside scope',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Employee not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/admin/attendance/non-teaching/{id}/update': {
        patch: {
          tags: ['Admin Attendance & Performance'],
          summary: 'Update non-teaching attendance record',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateNonTeachingAttendanceRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Non-teaching attendance updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/NonTeachingAttendanceWriteResponse' },
                },
              },
            },
            400: {
              description: 'Validation failure or duplicate record key',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'Requested school is outside scope',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Attendance record or employee not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/admin/performance-evaluations/list': {
        get: {
          tags: ['Admin Attendance & Performance'],
          summary: 'List scoped performance evaluations',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'schoolId', in: 'query', schema: { type: 'string' } },
            { name: 'departmentId', in: 'query', schema: { type: 'string' } },
            { name: 'employeeId', in: 'query', schema: { type: 'string' } },
            { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
            { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
            {
              name: 'rubricType',
              in: 'query',
              schema: { type: 'string', enum: ['TEACHING', 'NON_TEACHING'] },
            },
            {
              name: 'employeeType',
              in: 'query',
              schema: { type: 'string', enum: ['TEACHING', 'NON_TEACHING'] },
            },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 200 } },
          ],
          responses: {
            200: {
              description: 'Performance evaluation list',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedPerformanceEvaluationResponse' },
                },
              },
            },
            400: {
              description: 'Invalid query filters',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'Requested school is outside scope',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/admin/performance-evaluations/create': {
        post: {
          tags: ['Admin Attendance & Performance'],
          summary: 'Create performance evaluation',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreatePerformanceEvaluationRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Performance evaluation created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PerformanceEvaluationWriteResponse' },
                },
              },
            },
            400: {
              description: 'Validation failure or rubric/employee type mismatch',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'Requested school is outside scope',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Employee not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/admin/performance-evaluations/{id}/update': {
        patch: {
          tags: ['Admin Attendance & Performance'],
          summary: 'Update performance evaluation',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdatePerformanceEvaluationRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Performance evaluation updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PerformanceEvaluationWriteResponse' },
                },
              },
            },
            400: {
              description: 'Validation failure, duplicate key, or rubric/employee mismatch',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'Requested school is outside scope',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Performance evaluation or employee not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
});

export const registerSwagger = (app: Express): void => {
  app.get('/api/openapi.json', (_req, res) => {
    res.json(swaggerSpec);
  });

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
};
