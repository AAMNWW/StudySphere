/** Per-course row counts shown beside each CourseSidebar link. Split out
 * from the sidebar component so src/lib/course-tools.ts can reference the
 * keys without importing a client component. */
export interface CourseSidebarCounts {
  documents: number;
  resources: number;
  notes: number;
  assignments: number;
  exams: number;
  quizzes: number;
  flashcardSets: number;
  chatThreads: number;
  topics: number;
}
