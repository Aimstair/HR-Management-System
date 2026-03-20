import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../components/ui/card';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-70 w-full">{children}</div>
      </CardContent>
    </Card>
  );
};

export default ChartCard;
