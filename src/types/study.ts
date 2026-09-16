export type StudyStatus = "DRAFT" | "PROCESSING" | "READY";

export interface Subject {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Study {
  id: string;
  subjectId: string;
  title: string;
  originalContent: string;
  status: StudyStatus;
  studyMinutes: number;
  mastery: number;
  createdAt: Date;
}
