"use client";

import type { SubjectRecord } from "@/types/study-flow";
import { createId, readCollection, writeCollection } from "./local-store";
import { finalAssessmentRepository } from "./final-assessment-repository";
import { bookRepository } from "./book-repository";
const key = "aryaverse-subjects";
type SubjectInput = Omit<SubjectRecord, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string };
export const subjectRepository = {
  list: () => {
    const subjects = readCollection<SubjectRecord>(key);
    subjects.forEach((subject) => { bookRepository.ensureLegacyNormal(subject.id, subject.name); finalAssessmentRepository.ensure(subject.id); });
    return subjects;
  },
  get: (id: string) => readCollection<SubjectRecord>(key).find((item) => item.id === id) ?? null,
  save: (subject: SubjectInput) => { const now = new Date().toISOString(); const all = readCollection<SubjectRecord>(key); const record: SubjectRecord = { ...subject, id: subject.id ?? createId(), createdAt: subject.createdAt ?? now, updatedAt: now }; writeCollection(key, all.some((item) => item.id === record.id) ? all.map((item) => item.id === record.id ? record : item) : [...all, record]); bookRepository.ensureLegacyNormal(record.id, record.name); finalAssessmentRepository.ensure(record.id); return record; },
  rename: (id: string, name: string) => { const current = readCollection<SubjectRecord>(key).find((item) => item.id === id); return current ? subjectRepository.save({ ...current, name }) : null; },
  remove: (id: string) => writeCollection(key, readCollection<SubjectRecord>(key).filter((item) => item.id !== id)),
};
