import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase";
import { Student } from "@/constants/types";
import { BookingOwner } from "@/constants";

//Fetch and transform Enquiry
export function useEnquiries() {
  return useQuery({
    queryKey: ["enquiries"],
    queryFn: async () => {
      const { data: bookingOwners, error: bookingOwnersError } = await supabaseClient
        .from("booking_owners")
        .select(`*, students(*)`);
      if (bookingOwnersError) throw new Error(bookingOwnersError.message);
      const enquiries = (bookingOwners || []).map((owner: BookingOwner) => {
        if (owner.students && owner.students.length > 0) {
          const allStudentInstruments = owner.students
            .map((student: Student) => Array.isArray(student.instruments) ? student.instruments : [student.instruments])
            .flat()
            .filter(Boolean);
          return owner.students.map((student) => ({
            ...owner,
            student_id: student.id,
            student_name: student.name,
            student_age: student.age,
            instruments: allStudentInstruments.length > 0 ? allStudentInstruments.join(", ") : 'Not specified',
            level: student.level,
            is_self_booking: false,
            booking_type: 'parent_for_child',
            students: owner.students // add students array for compatibility
          }));
        } else {
          return [{
            ...owner,
            student_id: owner.id,
            student_name: `${owner.first_name} ${owner.last_name}`,
            student_age: owner.age,
            instruments: Array.isArray(owner.instruments) && owner.instruments.length > 0
              ? owner.instruments.join(", ")
              : owner.instruments || 'Not specified',
            level: owner.level,
            is_self_booking: true,
            booking_type: 'self_booking',
            students: [] // empty students array for compatibility
          }];
        }
      }).flat();
      return enquiries;
    },
  });
}

//Fetches tutors
export function useTutors() {
  return useQuery({
    queryKey: ["tutors"],
    queryFn: async () => {
      const { data, error } = await supabaseClient.from("tutors").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
}
