import type { ShiftEmployee, ShiftGroup, ShiftOverride, ShiftTemplate } from './types';
import { getWeekDates, toDateKey } from './utils';

export const shiftGroups: ShiftGroup[] = [
  { id: 'GRP-REG', name: 'Regular Group', daysPerYear: 260 },
  { id: 'GRP-ROT', name: 'Rotational Group', daysPerYear: 312 },
  { id: 'GRP-FLEX', name: 'Flexible Group', daysPerYear: 240 },
];

export const shiftTemplates: ShiftTemplate[] = [
  {
    id: 'SHF-DAY',
    groupId: 'GRP-REG',
    name: 'Day Shift',
    startTime: '08:00 AM',
    endTime: '05:00 PM',
    daysIncluded: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  {
    id: 'SHF-MID',
    groupId: 'GRP-REG',
    name: 'Mid Shift',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    daysIncluded: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  {
    id: 'SHF-COMP',
    groupId: 'GRP-FLEX',
    name: 'Compressed Shift',
    startTime: '07:00 AM',
    endTime: '06:00 PM',
    daysIncluded: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
  },
  {
    id: 'SHF-NIGHT',
    groupId: 'GRP-ROT',
    name: 'Night Shift',
    startTime: '10:00 PM',
    endTime: '07:00 AM',
    daysIncluded: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  {
    id: 'SHF-WEND',
    groupId: 'GRP-ROT',
    name: 'Weekend Support',
    startTime: '10:00 AM',
    endTime: '07:00 PM',
    daysIncluded: ['Saturday', 'Sunday'],
  },
];

export const shiftEmployees: ShiftEmployee[] = [
  {
    id: 'EMP-1001',
    fullName: 'Dr. Amelia Smith',
    position: 'Dean of Engineering',
    avatarUrl: 'https://picsum.photos/seed/shift-emp-1001/80/80',
    defaultShiftId: 'SHF-DAY',
  },
  {
    id: 'EMP-1002',
    fullName: 'Engr. Marco Doe',
    position: 'Chairman, Computer Engineering',
    avatarUrl: 'https://picsum.photos/seed/shift-emp-1002/80/80',
    defaultShiftId: 'SHF-MID',
  },
  {
    id: 'EMP-1003',
    fullName: 'Prof. Nina Castro',
    position: 'Professor of Computer Engineering',
    avatarUrl: 'https://picsum.photos/seed/shift-emp-1003/80/80',
    defaultShiftId: 'SHF-DAY',
  },
  {
    id: 'EMP-1004',
    fullName: 'Dr. Victor Santos',
    position: 'Dean of Arts & Sciences',
    avatarUrl: 'https://picsum.photos/seed/shift-emp-1004/80/80',
    defaultShiftId: 'SHF-MID',
  },
  {
    id: 'EMP-1005',
    fullName: 'Prof. Liza Ramos',
    position: 'Professor of Biology',
    avatarUrl: 'https://picsum.photos/seed/shift-emp-1005/80/80',
    defaultShiftId: 'SHF-DAY',
  },
  {
    id: 'EMP-1006',
    fullName: 'Atty. Noel Fernandez',
    position: 'Dean of Law',
    avatarUrl: 'https://picsum.photos/seed/shift-emp-1006/80/80',
    defaultShiftId: 'SHF-MID',
  },
  {
    id: 'EMP-1007',
    fullName: 'Atty. Grace Mateo',
    position: 'Professor of Constitutional Law',
    avatarUrl: 'https://picsum.photos/seed/shift-emp-1007/80/80',
    defaultShiftId: 'SHF-COMP',
  },
  {
    id: 'EMP-1008',
    fullName: 'Dr. Elena Torres',
    position: 'Dean of Computer Studies',
    avatarUrl: 'https://picsum.photos/seed/shift-emp-1008/80/80',
    defaultShiftId: 'SHF-DAY',
  },
  {
    id: 'EMP-1009',
    fullName: 'Prof. Arman Teo',
    position: 'Professor of Computer Science',
    avatarUrl: 'https://picsum.photos/seed/shift-emp-1009/80/80',
    defaultShiftId: 'SHF-NIGHT',
  },
  {
    id: 'EMP-1010',
    fullName: 'Prof. Carla Mendoza',
    position: 'Professor of Chemistry',
    avatarUrl: 'https://picsum.photos/seed/shift-emp-1010/80/80',
    defaultShiftId: 'SHF-DAY',
  },
  {
    id: 'EMP-1011',
    fullName: 'Prof. Martin Perez',
    position: 'Professor of Physics',
    avatarUrl: 'https://picsum.photos/seed/shift-emp-1011/80/80',
    defaultShiftId: 'SHF-MID',
  },
];

export const createInitialOverrides = (): ShiftOverride[] => {
  const weekDates = getWeekDates(0);
  const day1 = toDateKey(weekDates[1]);
  const day2 = toDateKey(weekDates[2]);
  const day3 = toDateKey(weekDates[3]);

  return [
    {
      id: 'OVR-001',
      employeeId: 'EMP-1003',
      date: day1,
      shiftId: 'SHF-MID',
      status: 'console-assigned',
    },
    {
      id: 'OVR-002',
      employeeId: 'EMP-1007',
      date: day2,
      shiftId: 'SHF-DAY',
      status: 'employee-requested',
    },
    {
      id: 'OVR-003',
      employeeId: 'EMP-1009',
      date: day3,
      shiftId: 'SHF-MID',
      status: 'console-assigned',
    },
  ];
};
