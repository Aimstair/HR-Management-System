'use client';

import React from 'react';
import { Card } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import { useAuth } from '../../context/AuthContext';
import { EmployeeType } from '../../types';
import EmployeeTypeSegmentedControl from '../../components/hr/EmployeeTypeSegmentedControl';

interface PerformanceAreaData {
  areaCode: string;
  areaName: string;
  participantCount: number;
  avgRating: number;
  performanceLevel: 'excellent' | 'good' | 'satisfactory' | 'needs-improvement';
}

const teachingPerformanceData: PerformanceAreaData[] = [
  {
    areaCode: 'CS101',
    areaName: 'Introduction to Computer Science',
    participantCount: 32,
    avgRating: 4.7,
    performanceLevel: 'excellent',
  },
  {
    areaCode: 'MATH202',
    areaName: 'Advanced Mathematics',
    participantCount: 28,
    avgRating: 4.3,
    performanceLevel: 'good',
  },
  {
    areaCode: 'PHYS301',
    areaName: 'Physics - Mechanics',
    participantCount: 24,
    avgRating: 4.1,
    performanceLevel: 'good',
  },
  {
    areaCode: 'CHEM150',
    areaName: 'General Chemistry',
    participantCount: 35,
    avgRating: 3.8,
    performanceLevel: 'satisfactory',
  },
  {
    areaCode: 'BIO200',
    areaName: 'Biology Fundamentals',
    participantCount: 30,
    avgRating: 4.5,
    performanceLevel: 'excellent',
  },
];

const nonTeachingPerformanceData: PerformanceAreaData[] = [
  {
    areaCode: 'OPS-QA',
    areaName: 'Process Compliance',
    participantCount: 14,
    avgRating: 4.4,
    performanceLevel: 'good',
  },
  {
    areaCode: 'SRV-01',
    areaName: 'Service Delivery',
    participantCount: 20,
    avgRating: 4.5,
    performanceLevel: 'excellent',
  },
  {
    areaCode: 'TEAM-09',
    areaName: 'Collaboration and Teamwork',
    participantCount: 18,
    avgRating: 4.2,
    performanceLevel: 'good',
  },
  {
    areaCode: 'TIME-05',
    areaName: 'Punctuality and Reliability',
    participantCount: 18,
    avgRating: 3.9,
    performanceLevel: 'satisfactory',
  },
];

const EmployeeEvaluations: React.FC = () => {
  const { user } = useAuth();
  const employeeType = user?.employeeType ?? EmployeeType.NON_TEACHING;

  const evaluationsData =
    employeeType === EmployeeType.TEACHING
      ? teachingPerformanceData
      : nonTeachingPerformanceData;

  const getPerformanceBadgeColor = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'bg-primary/10 text-primary';
      case 'good':
        return 'bg-primary/15 text-primary';
      case 'satisfactory':
        return 'bg-secondary/20 text-secondary-foreground';
      case 'needs-improvement':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPerformanceLabel = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'satisfactory':
        return 'Satisfactory';
      case 'needs-improvement':
        return 'Needs Improvement';
      default:
        return 'N/A';
    }
  };

  const overallAvg =
    evaluationsData.reduce((sum, evaluation) => sum + evaluation.avgRating, 0) /
    evaluationsData.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-linear-to-br from-primary/10 to-primary/20 border-primary/20">
          <p className="text-sm font-medium text-primary mb-2">Overall Rating</p>
          <p className="text-3xl font-bold text-foreground mb-2">
            {overallAvg.toFixed(1)}/5.0
          </p>
          <p className="text-xs text-primary/80">
            Based on {evaluationsData.length} performance areas
          </p>
        </Card>

        <Card className="p-6 bg-linear-to-br from-secondary/10 to-secondary/20 border-secondary/25">
          <p className="text-sm font-medium text-secondary-foreground mb-2">
            {employeeType === EmployeeType.TEACHING ? 'Total Students' : 'Total Reviewers'}
          </p>
          <p className="text-3xl font-bold text-foreground mb-2">
            {evaluationsData.reduce((sum, evaluation) => sum + evaluation.participantCount, 0)}
          </p>
          <p className="text-xs text-muted-foreground">
            {employeeType === EmployeeType.TEACHING
              ? 'Students evaluated'
              : 'Review records included'}
          </p>
        </Card>

        <Card className="p-6 bg-linear-to-br from-secondary/15 to-secondary/30 border-secondary/35">
          <p className="text-sm font-medium text-secondary-foreground mb-2">
            {employeeType === EmployeeType.TEACHING ? 'Courses Taught' : 'Performance Areas'}
          </p>
          <p className="text-3xl font-bold text-foreground mb-2">
            {evaluationsData.length}
          </p>
          <p className="text-xs text-secondary-foreground/80">Current cycle scope</p>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">
            {employeeType === EmployeeType.TEACHING
              ? 'Teaching Performance Areas'
              : 'Non-Teaching Performance Areas'}
          </h2>
        </div>
        {evaluationsData.map((evaluation) => (
          <Card key={evaluation.areaCode} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{evaluation.areaName}</h3>
                    <Badge className="text-xs">{evaluation.areaCode}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {evaluation.participantCount}{' '}
                    {employeeType === EmployeeType.TEACHING ? 'students evaluated' : 'reviewers included'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {evaluation.avgRating.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">out of 5.0</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Rating Distribution</span>
                  <Badge className={getPerformanceBadgeColor(evaluation.performanceLevel)}>
                    {getPerformanceLabel(evaluation.performanceLevel)}
                  </Badge>
                </div>
                <Progress
                  value={(evaluation.avgRating / 5.0) * 100}
                  className="h-2"
                />
              </div>

              <div className="flex gap-2 pt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i < Math.floor(evaluation.avgRating)
                        ? 'text-secondary'
                        : i < evaluation.avgRating
                        ? 'text-secondary opacity-50'
                        : 'text-muted-foreground/40'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmployeeEvaluations;
