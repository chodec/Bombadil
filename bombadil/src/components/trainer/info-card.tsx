import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import * as React from "react"

interface InfoCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}

export const InfoCard = ({ title, value, description, icon: Icon }: InfoCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}