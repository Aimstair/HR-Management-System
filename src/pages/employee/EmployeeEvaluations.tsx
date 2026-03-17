'use client';

import React from 'react';
import { Card } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';

interface EvaluationData {
  courseCode: string;
  courseName: string;
  studentCount: number;
  avgRating: number;
  performanceLevel: 'excellent' | 'good' | 'satisfactory' | 'needs-improvement';
}

const evaluationsData: EvaluationData[] = [
  {
    courseCode: 'CS101',
    courseName: 'Introduction to Computer Science',
    studentCount: 32,
    avgRating: 4.7,
    performanceLevel: 'excellent',
  },
  {
    courseCode: 'MATH202',
    courseName: 'Advanced Mathematics',
    studentCount: 28,
    avgRating: 4.3,
    performanceLevel: 'good',
  },
  {
    courseCode: 'PHYS301',
    courseName: 'Physics - Mechanics',
    studentCount: 24,
    avgRating: 4.1,
    performanceLevel: 'good',
  },
  {
    courseCode: 'CHEM150',
    courseName: 'General Chemistry',
    studentCount: 35,
    avgRating: 3.8,
    performanceLevel: 'satisfactory',
  },
  {
    courseCode: 'BIO200',
    courseName: 'Biology Fundamentals',
    studentCount: 30,
    avgRating: 4.5,
    performanceLevel: 'excellent',
  },
];

const EmployeeEvaluations: React.FC = () => {
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

  const getProgressColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-primary';
    if (rating >= 4.0) return 'bg-primary/80';
    if (rating >= 3.5) return 'bg-secondary';
    return 'bg-destructive';
  };

  const overallAvg =
    evaluationsData.reduce((sum, evaluation) => sum + evaluation.avgRating, 0) /
    evaluationsData.length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Evaluations</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/20 border-primary/20">
          <p className="text-sm font-medium text-primary mb-2">Overall Rating</p>
          <p className="text-3xl font-bold text-foreground mb-2">
            {overallAvg.toFixed(1)}/5.0
          </p>
          <p className="text-xs text-primary/80">Based on {evaluationsData.length} courses</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <p className="text-sm font-medium text-purple-600 mb-2">Total Students</p>
          <p className="text-3xl font-bold text-purple-900 mb-2">
            {evaluationsData.reduce((sum, evaluation) => sum + evaluation.studentCount, 0)}
          </p>
          <p className="text-xs text-purple-700">Students evaluated</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-secondary/15 to-secondary/30 border-secondary/35">
          <p className="text-sm font-medium text-secondary-foreground mb-2">Courses Taught</p>
          <p className="text-3xl font-bold text-foreground mb-2">
            {evaluationsData.length}
          </p>
          <p className="text-xs text-secondary-foreground/80">Active courses</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Course Evaluations</h2>
        {evaluationsData.map((evaluation) => (
          <Card key={evaluation.courseCode} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{evaluation.courseName}</h3>
                    <Badge className="text-xs">{evaluation.courseCode}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {evaluation.studentCount} students evaluated
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
