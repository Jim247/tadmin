// Aggregates owners and adds studentCount property

import { AnyObject } from "antd/es/_util/type";

// Aggregation function: returns student count for a single owner
export function getStudentCount(owner: AnyObject) {
  let count = Array.isArray(owner.students) ? owner.students.length : 0;
  if (owner.is_booking_owner) count += 1;
  return count;
}
