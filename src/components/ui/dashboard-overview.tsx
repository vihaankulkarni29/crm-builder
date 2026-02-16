"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowDown,
    ArrowUp,
    Minus,
    Users,
    DollarSign,
    Clock,
    AlertCircle,
    Activity,
    CreditCard,
} from "lucide-react";

// Define the icon type. Using React.ElementType for flexibility.
type IconType =
    | React.ElementType
    | React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

// Define trend types
export type TrendType = "up" | "down" | "neutral";

// --- 📦 API (Props) Definition ---
export interface DashboardMetricCardProps {
    /** The main value of the metric (e.g., "1,234", "$5.6M", "92%"). */
    value: string | number;
    /** The descriptive title of the metric (e.g., "Total Users", "Revenue"). */
    title: string;
    /** Optional icon to display in the card header. */
    icon?: React.ReactNode;
    /** The percentage or absolute change for the trend (e.g., "2.5%"). */
    trendChange?: string;
    /** The direction of the trend ('up', 'down', 'neutral'). */
    trendType?: TrendType;
    /** Optional class name for the card container. */
    className?: string;
}

/**
 * A professional, animated metric card for admin dashboards.
 * Displays a key value, title, icon, and trend indicator with Framer Motion hover effects.
 */
export const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
    value,
    title,
    icon,
    trendChange,
    trendType = "neutral",
    className,
}) => {
    // Determine trend icon and color
    const TrendIcon =
        trendType === "up"
            ? ArrowUp
            : trendType === "down"
                ? ArrowDown
                : Minus;
    const trendColorClass =
        trendType === "up"
            ? "text-green-600 dark:text-green-400"
            : trendType === "down"
                ? "text-red-600 dark:text-red-400"
                : "text-muted-foreground";

    return (
        <motion.div
            whileHover={{
                y: -4,
                boxShadow:
                    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={cn("cursor-pointer rounded-lg", className)}
        >
            <Card className="h-full transition-colors duration-200 bg-card/50 backdrop-blur-sm border-muted/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    {icon}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground mb-2">
                        {value}
                    </div>
                    {trendChange && (
                        <p
                            className={cn(
                                "flex items-center text-xs font-medium",
                                trendColorClass
                            )}
                        >
                            <TrendIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                            {trendChange}{" "}
                            {trendType === "up"
                                ? "increase"
                                : trendType === "down"
                                    ? "decrease"
                                    : "change"}
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

interface DashboardOverviewProps {
    totalRevenue: number;
    activeLeads: number;
    activeProjects: number;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
    totalRevenue,
    activeLeads,
    activeProjects,
}) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DashboardMetricCard
                title="Total Revenue"
                value={`$${totalRevenue.toLocaleString()}`}
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                trendChange="+20.1%" // Placeholder for now
                trendType="up"
            />
            <DashboardMetricCard
                title="Active Leads"
                value={activeLeads}
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                trendChange="+2" // Placeholder
                trendType="up"
            />
            <DashboardMetricCard
                title="Active Projects"
                value={activeProjects}
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                trendChange="-1" // Placeholder
                trendType="down"
            />
        </div>
    );
};
