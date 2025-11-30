import React, { ReactNode } from "react";
import { cn } from "@/lib/utils"; // Utility function for conditional class names

type TabsProps = {
  defaultValue: string;
  children: ReactNode;
  className?: string;
};

type TabsListProps = {
  children: ReactNode;
  className?: string;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
};

type TabsTriggerProps = {
  value: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

type TabsContentProps = {
  value: string;
  children: ReactNode;
  className?: string;
};

export const Tabs = ({ defaultValue, children, className }: TabsProps) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  React.useEffect(() => {
    setActiveTab(defaultValue);
  }, [defaultValue]);

  return (
    <div className={cn("tabs-container", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList = ({ children, className, activeTab, setActiveTab }: TabsListProps) => {
  return (
    <div className={cn("tabs-list flex", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

export const TabsTrigger = ({
  value,
  children,
  className,
  onClick,
  activeTab,
  setActiveTab,
}: TabsTriggerProps & { activeTab?: string; setActiveTab?: (value: string) => void }) => {
  const isActive = activeTab === value;

  return (
    <button
      className={cn(
        "tabs-trigger px-4 py-2 text-sm font-medium rounded-b-md",
        !isActive ? " shadow-inner bg-gray-1 border" : "bg-gray-200 text-black",
        className
      )}
      onClick={() => {
        setActiveTab?.(value);
        onClick?.();
      }}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({
  value,
  children,
  className,
  activeTab,
}: TabsContentProps & { activeTab?: string }) => {
  if (activeTab !== value) return null;

  return <div className={cn("tabs-content mt-4", className)}>{children}</div>;
};
