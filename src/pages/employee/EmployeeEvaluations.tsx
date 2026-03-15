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
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'satisfactory':
        return 'bg-yellow-100 text-yellow-800';
      case 'needs-improvement':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    if (rating >= 4.5) return 'bg-green-600';
    if (rating >= 4.0) return 'bg-blue-600';
    if (rating >= 3.5) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const overallAvg =
    evaluationsData.reduce((sum, evaluation) => sum + evaluation.avgRating, 0) /
    evaluationsData.length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Evaluations</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm font-medium text-blue-600 mb-2">Overall Rating</p>
          <p className="text-3xl font-bold text-blue-900 mb-2">
            {overallAvg.toFixed(1)}/5.0
          </p>
          <p className="text-xs text-blue-700">Based on {evaluationsData.length} courses</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <p className="text-sm font-medium text-purple-600 mb-2">Total Students</p>
          <p className="text-3xl font-bold text-purple-900 mb-2">
            {evaluationsData.reduce((sum, evaluation) => sum + evaluation.studentCount, 0)}
          </p>
          <p className="text-xs text-purple-700">Students evaluated</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm font-medium text-green-600 mb-2">Courses Taught</p>
          <p className="text-3xl font-bold text-green-900 mb-2">
            {evaluationsData.length}
          </p>
          <p className="text-xs text-green-700">Active courses</p>
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
                  <p className="text-2xl font-bold text-blue-600">
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
                        ? 'text-yellow-400'
                        : i < evaluation.avgRating
                        ? 'text-yellow-400 opacity-50'
                        : 'text-gray-300'
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
