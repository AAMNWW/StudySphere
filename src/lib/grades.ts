/** Standard US 4.0 scale, checked top-down — the first tier whose `min` the
 * percent clears wins. Assignment and Exam grades feed into this the same
 * way (see their earnedPoints/maxPoints doc comments), so one scale serves
 * both individual item grades and a course's overall grade. */
const GRADE_SCALE: { min: number; letter: string; gpaPoints: number }[] = [
  { min: 93, letter: "A", gpaPoints: 4.0 },
  { min: 90, letter: "A-", gpaPoints: 3.7 },
  { min: 87, letter: "B+", gpaPoints: 3.3 },
  { min: 83, letter: "B", gpaPoints: 3.0 },
  { min: 80, letter: "B-", gpaPoints: 2.7 },
  { min: 77, letter: "C+", gpaPoints: 2.3 },
  { min: 73, letter: "C", gpaPoints: 2.0 },
  { min: 70, letter: "C-", gpaPoints: 1.7 },
  { min: 67, letter: "D+", gpaPoints: 1.3 },
  { min: 60, letter: "D", gpaPoints: 1.0 },
  { min: 0, letter: "F", gpaPoints: 0.0 },
];

export interface GradableItem {
  earnedPoints: number | null;
  maxPoints: number | null;
}

/** Weighted percent across every graded item — an item only counts once
 * both its points are set, so a 100-point exam naturally outweighs a
 * 10-point homework without needing a separate "weight" field. Null means
 * nothing in the list has been graded yet. */
export function computeGradePercent(items: GradableItem[]): number | null {
  let earnedSum = 0;
  let maxSum = 0;

  for (const item of items) {
    if (item.earnedPoints == null || item.maxPoints == null || item.maxPoints <= 0) {
      continue;
    }
    earnedSum += item.earnedPoints;
    maxSum += item.maxPoints;
  }

  return maxSum > 0 ? (earnedSum / maxSum) * 100 : null;
}

export function percentToGrade(percent: number): { letter: string; gpaPoints: number } {
  const tier = GRADE_SCALE.find((t) => percent >= t.min) ?? GRADE_SCALE[GRADE_SCALE.length - 1];
  return { letter: tier.letter, gpaPoints: tier.gpaPoints };
}

export interface CourseGpaInput {
  gradePercent: number | null;
  creditHours: number | null;
}

/** Credit-hour-weighted GPA across courses — only counts a course once it
 * has both a computed grade and credit hours set, mirroring how a real
 * transcript only counts graded, credit-bearing courses. */
export function computeOverallGpa(courses: CourseGpaInput[]): number | null {
  let weightedSum = 0;
  let creditSum = 0;

  for (const course of courses) {
    if (course.gradePercent == null || course.creditHours == null || course.creditHours <= 0) {
      continue;
    }
    weightedSum += percentToGrade(course.gradePercent).gpaPoints * course.creditHours;
    creditSum += course.creditHours;
  }

  return creditSum > 0 ? weightedSum / creditSum : null;
}
