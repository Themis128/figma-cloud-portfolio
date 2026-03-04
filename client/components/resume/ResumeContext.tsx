import React, { createContext, useContext, ReactNode } from "react";
import { ResumeData } from "../../types/resume";

interface ResumeContextType {
  resumeData: ResumeData | null;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData | null>>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeContextProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: ResumeContextType;
}) => {
  return (
    <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>
  );
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResume must be used within a ResumeContextProvider");
  }
  return context;
};
