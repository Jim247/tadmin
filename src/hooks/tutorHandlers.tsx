import { Enquiry } from "@/constants/types";
import { supabaseClient } from "@/lib/supabase";

// tutorHandlers.ts
export async function handleAssignTutor({
  selectedTutors,
  setSelectedTutors,
  enquiry,
  setLoading,
  onSuccess,
  message,

}: {
  selectedTutors: Record<string, string>;
  setSelectedTutors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  enquiry: Enquiry;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
  message: any;
}) {
  setLoading(true);
  try {
    await Promise.all(
      enquiry.students.map(async (student) => {
        const tutorId = selectedTutors[student.id];
        // Log which student and tutor are being processed
        console.log("Assigning tutor:", { studentId: student.id, studentName: student.name, tutorId });

        if (tutorId) {
          const { data, error } = await supabaseClient
            .from("students")
            .update({ tutor_id: tutorId, is_tutor_assigned: true })
            .eq("id", student.id);

          // Log the result of the update
          console.log("Supabase update result:", { studentId: student.id, data, error });
        } 
      })
    );
    message.success("Statuses updated!");
    onSuccess(); // This triggers the refetch in the parent
    setSelectedTutors({});
  } catch (error) {
    console.error("Assignment error:", error);
    message.error("Failed to assign tutors");
  } finally {
    setLoading(false);
  }
}