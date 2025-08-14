// Aggregates owners and adds studentCount property
// Aggregation function: returns student count for a single owner
export function getStudentCount(owner) {
  let count = Array.isArray(owner.students) ? owner.students.length : 0;
  if (owner.is_booking_owner) count += 1;
  return count;
}
