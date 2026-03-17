import React, { useMemo, useState } from 'react';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { Briefcase, GraduationCap, Plus, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';

type DivisionType = 'ACADEMIC' | 'NON_ACADEMIC';
type RoleType = 'SYSTEM_ADMIN' | 'HR_ADMIN' | 'DEAN' | 'CHAIRMAN' | 'FACULTY' | 'STAFF';

interface EmployeeNode {
  id: string;
  name: string;
  role: RoleType;
  position: string;
}

interface DepartmentNode {
  id: string;
  name: string;
  chairman?: string;
  employees: EmployeeNode[];
}

interface DivisionNode {
  id: string;
  name: string;
  type: DivisionType;
  dean?: string;
  departments: DepartmentNode[];
}

const initialOrganization: DivisionNode[] = [
  {
    id: 'DIV-HR',
    name: 'HR',
    type: 'NON_ACADEMIC',
    departments: [
      {
        id: 'DEP-HR-CORE',
        name: 'Human Resources',
        employees: [
          { id: 'EMP-101', name: 'Irene Velasco', role: 'HR_ADMIN', position: 'HR Manager' },
          { id: 'EMP-102', name: 'Paul Mercado', role: 'STAFF', position: 'HR Officer' },
        ],
      },
    ],
  },
  {
    id: 'DIV-ACC',
    name: 'Accounting',
    type: 'NON_ACADEMIC',
    departments: [
      {
        id: 'DEP-ACC-PAY',
        name: 'Payroll',
        employees: [
          { id: 'EMP-103', name: 'Joel Santos', role: 'STAFF', position: 'Payroll Specialist' },
          { id: 'EMP-104', name: 'Kyla Diaz', role: 'STAFF', position: 'Accounting Analyst' },
        ],
      },
    ],
  },
  {
    id: 'DIV-MNT',
    name: 'Maintenance',
    type: 'NON_ACADEMIC',
    departments: [
      {
        id: 'DEP-MNT-JAN',
        name: 'Cleaners',
        employees: [
          { id: 'EMP-105', name: 'Maria Cruz', role: 'STAFF', position: 'Cleaner' },
          { id: 'EMP-106', name: 'Leo Navarro', role: 'STAFF', position: 'Cleaner' },
        ],
      },
      {
        id: 'DEP-MNT-REP',
        name: 'Repair Staff',
        employees: [
          { id: 'EMP-107', name: 'Jules Ramos', role: 'STAFF', position: 'Electrician' },
          { id: 'EMP-108', name: 'Oscar Lim', role: 'STAFF', position: 'Technician' },
        ],
      },
    ],
  },
  {
    id: 'DIV-SAO',
    name: 'Student Affairs Office',
    type: 'NON_ACADEMIC',
    departments: [
      {
        id: 'DEP-SAO-CNS',
        name: 'Counselors',
        employees: [
          { id: 'EMP-109', name: 'Anne Villanueva', role: 'STAFF', position: 'Guidance Counselor' },
        ],
      },
    ],
  },
  {
    id: 'DIV-ENG',
    name: 'School of Engineering',
    type: 'ACADEMIC',
    dean: 'Dr. Amelia Smith',
    departments: [
      {
        id: 'DEP-ENG-CPE',
        name: 'Computer Engineering',
        chairman: 'Engr. Marco Doe',
        employees: [
          { id: 'EMP-201', name: 'Prof. Nina Castro', role: 'FACULTY', position: 'Faculty Member 1' },
          { id: 'EMP-202', name: 'Prof. John Lim', role: 'FACULTY', position: 'Faculty Member 2' },
          { id: 'EMP-203', name: 'Engr. Marco Doe', role: 'CHAIRMAN', position: 'Department Chairman' },
        ],
      },
      {
        id: 'DEP-ENG-CE',
        name: 'Civil Engineering',
        chairman: 'Engr. Carla Reyes',
        employees: [
          { id: 'EMP-204', name: 'Prof. Ian Cruz', role: 'FACULTY', position: 'Faculty Member 1' },
          { id: 'EMP-205', name: 'Prof. Tessa Molina', role: 'FACULTY', position: 'Faculty Member 2' },
          { id: 'EMP-206', name: 'Engr. Carla Reyes', role: 'CHAIRMAN', position: 'Department Chairman' },
        ],
      },
    ],
  },
  {
    id: 'DIV-CS',
    name: 'School of Computer Studies',
    type: 'ACADEMIC',
    dean: 'Dr. Elena Torres',
    departments: [
      {
        id: 'DEP-CS-CS',
        name: 'Computer Science',
        chairman: 'Prof. Kevin Lao',
        employees: [
          { id: 'EMP-207', name: 'Prof. Arman Teo', role: 'FACULTY', position: 'Faculty Member 1' },
          { id: 'EMP-208', name: 'Prof. Yna Suarez', role: 'FACULTY', position: 'Faculty Member 2' },
          { id: 'EMP-209', name: 'Prof. Kevin Lao', role: 'CHAIRMAN', position: 'Department Chairman' },
        ],
      },
      {
        id: 'DEP-CS-IT',
        name: 'Information Technology',
        chairman: 'Prof. Mia Perez',
        employees: [
          { id: 'EMP-210', name: 'Prof. Mia Perez', role: 'CHAIRMAN', position: 'Department Chairman' },
          { id: 'EMP-211', name: 'Prof. Carlo Sy', role: 'FACULTY', position: 'Faculty Member 1' },
        ],
      },
    ],
  },
];

const roleBadgeClass: Record<RoleType, string> = {
  SYSTEM_ADMIN: 'bg-muted text-muted-foreground',
  HR_ADMIN: 'bg-secondary/20 text-secondary-foreground',
  DEAN: 'bg-primary/10 text-primary',
  CHAIRMAN: 'bg-secondary/20 text-secondary-foreground',
  FACULTY: 'bg-primary/10 text-primary',
  STAFF: 'bg-muted text-muted-foreground',
};

interface DepartmentDropItemProps {
  department: DepartmentNode;
  isSelected: boolean;
  onClick: () => void;
}

const DepartmentDropItem: React.FC<DepartmentDropItemProps> = ({
  department,
  isSelected,
  onClick,
}) => {
  const droppableId = `department-${department.id}`;
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });

  return (
    <button
      type="button"
      ref={setNodeRef}
      onClick={onClick}
      className={`w-full rounded-md border p-3 text-left transition-colors ${
        isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background'
      } ${isOver ? 'ring-2 ring-primary/60' : ''}`}
    >
      <p className="font-medium">{department.name}</p>
      <p className="text-xs opacity-80">{department.employees.length} members</p>
      {department.chairman && (
        <Badge className="mt-2 bg-secondary/20 text-secondary-foreground">Chairman: {department.chairman}</Badge>
      )}
    </button>
  );
};

interface EmployeeDragItemProps {
  employee: EmployeeNode;
}

const EmployeeDragItem: React.FC<EmployeeDragItemProps> = ({ employee }) => {
  const draggableId = `employee-${employee.id}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: draggableId,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.55 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded-md border bg-background p-3 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{employee.name}</p>
          <p className="text-xs text-muted-foreground">{employee.position}</p>
        </div>
        <Badge className={roleBadgeClass[employee.role]}>{employee.role}</Badge>
      </div>
    </div>
  );
};

const AdminOrganization: React.FC = () => {
  const [organization, setOrganization] = useState<DivisionNode[]>(initialOrganization);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(organization[0]?.id ?? null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    organization[0]?.departments[0]?.id ?? null,
  );

  const selectedDivisionData = useMemo(
    () => organization.find((division) => division.id === selectedDivision) ?? null,
    [organization, selectedDivision],
  );

  const selectedDepartmentData = useMemo(
    () =>
      selectedDivisionData?.departments.find((department) => department.id === selectedDepartment) ??
      null,
    [selectedDepartment, selectedDivisionData],
  );

  const onSelectDivision = (divisionId: string): void => {
    setSelectedDivision(divisionId);
    const division = organization.find((item) => item.id === divisionId);
    setSelectedDepartment(division?.departments[0]?.id ?? null);
  };

  const onDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    if (!activeId.startsWith('employee-') || !overId.startsWith('department-')) {
      return;
    }

    const employeeId = activeId.replace('employee-', '');
    const targetDepartmentId = overId.replace('department-', '');

    let transferredName = '';
    let transferredDepartment = '';

    setOrganization((current) => {
      const next = current.map((division) => ({
        ...division,
        departments: division.departments.map((department) => ({
          ...department,
          employees: [...department.employees],
        })),
      }));

      let sourceDivisionIndex = -1;
      let sourceDepartmentIndex = -1;
      let employeeIndex = -1;

      let targetDivisionIndex = -1;
      let targetDepartmentIndex = -1;

      next.forEach((division, divIdx) => {
        division.departments.forEach((department, depIdx) => {
          if (department.id === targetDepartmentId) {
            targetDivisionIndex = divIdx;
            targetDepartmentIndex = depIdx;
          }

          const foundIndex = department.employees.findIndex((employee) => employee.id === employeeId);
          if (foundIndex >= 0) {
            sourceDivisionIndex = divIdx;
            sourceDepartmentIndex = depIdx;
            employeeIndex = foundIndex;
          }
        });
      });

      if (
        sourceDivisionIndex < 0 ||
        sourceDepartmentIndex < 0 ||
        employeeIndex < 0 ||
        targetDivisionIndex < 0 ||
        targetDepartmentIndex < 0
      ) {
        return current;
      }

      if (
        sourceDivisionIndex === targetDivisionIndex &&
        sourceDepartmentIndex === targetDepartmentIndex
      ) {
        return current;
      }

      const [movedEmployee] = next[sourceDivisionIndex].departments[sourceDepartmentIndex].employees.splice(
        employeeIndex,
        1,
      );

      next[targetDivisionIndex].departments[targetDepartmentIndex].employees.push(movedEmployee);

      transferredName = movedEmployee.name;
      transferredDepartment = next[targetDivisionIndex].departments[targetDepartmentIndex].name;

      return next;
    });

    if (transferredName && transferredDepartment) {
      toast.success(`Successfully transferred ${transferredName} to ${transferredDepartment}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Organization Matrix</h1>
        <p className="text-sm text-muted-foreground">
          Click through divisions and departments, then drag employees onto another department to transfer.
        </p>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className="flex flex-row overflow-x-auto gap-4 p-4 h-[calc(100vh-200px)]">
          <Card className="min-w-[320px] max-w-[360px] flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Divisions</CardTitle>
              <CardDescription>Schools and non-academic offices</CardDescription>
            </CardHeader>
            <CardContent className="h-full pb-6">
              <ScrollArea className="h-[calc(100vh-320px)] pr-3">
                <div className="space-y-2">
                  {organization.map((division) => {
                    const active = division.id === selectedDivision;
                    return (
                      <button
                        key={division.id}
                        type="button"
                        onClick={() => onSelectDivision(division.id)}
                        className={`w-full rounded-md border p-3 text-left transition-colors ${
                          active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium">{division.name}</p>
                          <Badge variant={active ? 'secondary' : 'outline'}>
                            {division.type === 'ACADEMIC' ? (
                              <span className="inline-flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" /> Academic
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                <Briefcase className="h-3 w-3" /> Non-Academic
                              </span>
                            )}
                          </Badge>
                        </div>
                        {division.dean && (
                          <p className="mt-1 text-xs opacity-80">Dean: {division.dean}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {selectedDivisionData && (
            <Card className="min-w-[320px] max-w-[380px] flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">Departments</CardTitle>
                    <CardDescription>{selectedDivisionData.name}</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success('Add Department action opened')}
                  >
                    <Plus className="h-4 w-4" />
                    Add Department
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-full pb-6">
                <ScrollArea className="h-[calc(100vh-320px)] pr-3">
                  <div className="space-y-2">
                    {selectedDivisionData.departments.map((department) => (
                      <DepartmentDropItem
                        key={department.id}
                        department={department}
                        isSelected={department.id === selectedDepartment}
                        onClick={() => setSelectedDepartment(department.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {selectedDepartmentData && (
            <Card className="min-w-[340px] max-w-[420px] flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">Staff & Faculty</CardTitle>
                    <CardDescription>{selectedDepartmentData.name}</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success('Add Employee action opened')}
                  >
                    <Plus className="h-4 w-4" />
                    Add Employee
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-full pb-6">
                <ScrollArea className="h-[calc(100vh-320px)] pr-3">
                  <div className="space-y-2">
                    {selectedDepartmentData.employees.length === 0 ? (
                      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                        No employees assigned to this department.
                      </div>
                    ) : (
                      selectedDepartmentData.employees.map((employee) => (
                        <EmployeeDragItem key={employee.id} employee={employee} />
                      ))
                    )}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    <UserRound className="mr-1 inline h-3 w-3" />
                    Drag an employee and drop onto any department in Panel 2 to transfer.
                  </p>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </DndContext>
    </div>
  );
};

export default AdminOrganization;
