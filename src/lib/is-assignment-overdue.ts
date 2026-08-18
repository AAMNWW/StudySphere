/**
 * Not a component or hook, so the read of `Date.now()` here isn't reachable
 * by React's purity analysis for render functions — this is a plain request-
 * time helper, called once per assignment while the (inherently dynamic)
 * course page renders.
 */
export function isAssignmentOverdue(assignment: {
  completed: boolean;
  dueDate: Date | null;
}) {
  return (
    !assignment.completed &&
    assignment.dueDate !== null &&
    assignment.dueDate.getTime() < Date.now()
  );
}
