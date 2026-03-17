import React, { useMemo } from 'react';
import {
  DiagramComponent,
  type NodeModel,
  type ConnectorModel,
  SnapConstraints,
} from '@syncfusion/ej2-react-diagrams';
import type { CampusNode, DepartmentNode, EmployeeNode, SchoolNode } from '../types';

import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-react-diagrams/styles/material.css';

interface OrganizationTreeProps {
  level: 'department' | 'school' | 'employee';
  campus: CampusNode;
  departments: DepartmentNode[];
  schools: SchoolNode[];
  employees?: EmployeeNode[];
  departmentName?: string;
  schoolName?: string;
  onSelectDepartment: (department: DepartmentNode, targetLevel: 'school' | 'employee') => void;
  onSelectSchool: (school: SchoolNode) => void;
  onSelectEmployee?: (employeeId: string) => void;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getAvatarFallback = (fullName: string): string => {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="#e2e8f0"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#334155">${escapeHtml(initials || 'NA')}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const buildEmployeeCard = (employee: EmployeeNode, colorFill: string, colorStroke: string): string => {
  const name = escapeHtml(employee.fullName);
  const position = escapeHtml(employee.jobTitle || employee.role);
  const avatar = escapeHtml(employee.avatarUrl || getAvatarFallback(employee.fullName));

  return `<div style="display:flex;align-items:center;gap:10px;width:100%;height:100%;padding:8px 10px;border:1px solid ${colorStroke};border-radius:12px;background:${colorFill};box-sizing:border-box;font-family:Arial,sans-serif;"><img src="${avatar}" alt="${name}" style="width:42px;height:42px;border-radius:9999px;object-fit:cover;flex-shrink:0;border:1px solid #cbd5e1;"/><div style="min-width:0;"><div style="font-size:13px;font-weight:600;line-height:1.2;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div><div style="font-size:12px;line-height:1.25;color:#475569;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${position}</div></div></div>`;
};

const OrganizationTree: React.FC<OrganizationTreeProps> = ({
  level,
  campus,
  departments,
  schools,
  employees = [],
  departmentName,
  schoolName,
  onSelectDepartment,
  onSelectSchool,
  onSelectEmployee,
}) => {
  const fallbackTree = (
    <div className="rounded-lg border p-4">
      <ul className="space-y-2">
        <li>
          <div className="font-semibold">{campus.name}</div>
          <ul className="ml-4 border-l pl-4">
            {level === 'department'
              ? departments.map((department) => {
                  const targetLevel = department.name === 'Teaching Faculties' ? 'school' : 'employee';
                  return (
                    <li key={department.id} className="py-1">
                      <button
                        type="button"
                        onClick={() => onSelectDepartment(department, targetLevel)}
                        className="text-sm hover:underline"
                      >
                        {department.name}
                      </button>
                    </li>
                  );
                })
              : null}

            {level === 'school' ? (
              <li className="py-1">
                <div className="text-sm font-medium">Teaching Faculties</div>
                <ul className="ml-4 border-l pl-4">
                  {schools.map((school) => (
                    <li key={school.id} className="py-1">
                      <button
                        type="button"
                        onClick={() => onSelectSchool(school)}
                        className="text-sm hover:underline"
                      >
                        {school.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ) : null}
          </ul>
        </li>
      </ul>
    </div>
  );

  if (level !== 'employee') {
    return fallbackTree;
  }

  const hierarchy = useMemo(() => {
    const deans = employees.filter((employee) => employee.role === 'Dean');
    const chairmen = employees.filter((employee) => employee.role === 'Chairman');
    const hrAdmins = employees.filter((employee) => employee.role === 'HR Admin');
    const faculty = employees.filter((employee) => employee.role === 'Faculty');
    const staff = employees.filter((employee) => employee.role === 'Staff');

    const heads = [...deans, ...chairmen, ...hrAdmins];

    return {
      heads,
      members: [...faculty, ...staff],
    };
  }, [employees]);

  const diagramData = useMemo(() => {
    const nodes: NodeModel[] = [];
    const connectors: ConnectorModel[] = [];

    const rootId = 'root-campus';
    const departmentId = 'root-department';
    const schoolId = schoolName ? 'root-school' : null;

    nodes.push({
      id: rootId,
      offsetX: 540,
      offsetY: 60,
      width: 220,
      height: 48,
      style: { fill: '#f8fafc', strokeColor: '#94a3b8', color: '#0f172a' },
      annotations: [{ content: campus.name }],
    });

    nodes.push({
      id: departmentId,
      offsetX: 540,
      offsetY: 140,
      width: 260,
      height: 48,
      style: { fill: '#eef2ff', strokeColor: '#6366f1', color: '#1e1b4b' },
      annotations: [{ content: departmentName ?? 'Department' }],
    });

    connectors.push({
      id: 'conn-campus-dept',
      sourceID: rootId,
      targetID: departmentId,
      style: { strokeColor: '#64748b', strokeWidth: 1.5 },
      targetDecorator: { style: { fill: '#64748b', strokeColor: '#64748b' } },
    });

    let parentForPeople = departmentId;

    if (schoolId) {
      nodes.push({
        id: schoolId,
        offsetX: 540,
        offsetY: 220,
        width: 260,
        height: 48,
        style: { fill: '#ecfeff', strokeColor: '#0891b2', color: '#164e63' },
        annotations: [{ content: schoolName ?? 'School' }],
      });

      connectors.push({
        id: 'conn-dept-school',
        sourceID: departmentId,
        targetID: schoolId,
        style: { strokeColor: '#0891b2', strokeWidth: 1.5 },
        targetDecorator: { style: { fill: '#0891b2', strokeColor: '#0891b2' } },
      });

      parentForPeople = schoolId;
    }

    const headsY = schoolId ? 300 : 240;
    const membersY = headsY + 110;

    const buildRow = (
      row: EmployeeNode[],
      rowY: number,
      prefix: string,
      colorFill: string,
      colorStroke: string,
    ): void => {
      if (row.length === 0) {
        return;
      }

      const spacing = 220;
      const totalWidth = (row.length - 1) * spacing;
      const startX = 540 - totalWidth / 2;

      row.forEach((employee, index) => {
        const nodeId = `${prefix}-${employee.id}`;
        const x = startX + index * spacing;

        nodes.push({
          id: nodeId,
          offsetX: x,
          offsetY: rowY,
          width: 230,
          height: 74,
          style: { fill: 'transparent', strokeColor: 'transparent' },
          shape: {
            type: 'HTML',
            content: buildEmployeeCard(employee, colorFill, colorStroke),
          },
        });

        connectors.push({
          id: `conn-${parentForPeople}-${nodeId}`,
          sourceID: parentForPeople,
          targetID: nodeId,
          style: { strokeColor: '#94a3b8', strokeWidth: 1.2 },
          targetDecorator: { style: { fill: '#94a3b8', strokeColor: '#94a3b8' } },
        });
      });
    };

    buildRow(hierarchy.heads, headsY, 'head', '#dbeafe', '#3b82f6');
    buildRow(hierarchy.members, membersY, 'member', '#dcfce7', '#16a34a');

    return { nodes, connectors };
  }, [campus.name, departmentName, hierarchy.heads, hierarchy.members, schoolName]);

  const onDiagramClick = (args: { element?: { id?: string } }): void => {
    const elementId = args?.element?.id;

    if (!elementId) {
      return;
    }

    if (elementId.startsWith('head-')) {
      onSelectEmployee?.(elementId.replace('head-', ''));
      return;
    }

    if (elementId.startsWith('member-')) {
      onSelectEmployee?.(elementId.replace('member-', ''));
    }
  };

  return (
    <div className="rounded-lg border p-3">
      <DiagramComponent
        id="organization-syncfusion-diagram"
        width="100%"
        height="560px"
        nodes={diagramData.nodes}
        connectors={diagramData.connectors}
        snapSettings={{ constraints: SnapConstraints.None }}
        tool={0}
        click={onDiagramClick}
      />
    </div>
  );
};

export default OrganizationTree;
