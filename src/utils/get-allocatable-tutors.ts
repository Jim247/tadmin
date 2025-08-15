import { Tutor, Student } from "@/constants/types";

// Filtering tutors by matching any instrument in student's array with tutor's array
export const filterTutors = (
  tutors: Tutor[],
  student: Student
): Tutor[] => {
  const tutorInstrumentsArray = (tutor: Tutor) =>
    Array.isArray(tutor.instruments)
      ? tutor.instruments
      : typeof tutor.instruments === "string"
      ? tutor.instruments.split(",").map(s => s.trim())
      : [];

  const studentInstruments = Array.isArray(student.instruments)
    ? student.instruments
    : typeof student.instruments === "string"
    ? student.instruments.split(",").map(s => s.trim())
    : [];

  return tutors.filter((tutor) =>
    studentInstruments.some(instr =>
      tutorInstrumentsArray(tutor).includes(instr)
    )
  );
};