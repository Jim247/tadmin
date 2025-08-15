import { Enquiry } from "@/constants";
import { supabaseClient } from "@/lib/supabase";
import { message } from "antd";

export type EnquiryAction = "update" | "delete" | "archive" | "deleteStudent";

export async function enquiryHandler({
  action,
  enquiry,
  selectedTutors,
  studentId,
  setSelectedTutors,
  setLoading,
  onSuccess,
}: {
  action: EnquiryAction;
  enquiry?: Enquiry;
  selectedTutors?: Record<string, string>;
  studentId?: string;
  setSelectedTutors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}) {
  setLoading(true);
  try {
    if (action === "update" && selectedTutors && enquiry) {
      await Promise.all(
        enquiry.students.map(async (student) => {
          const tutorId = selectedTutors[student.id];
          if (tutorId) {
            await supabaseClient
              .from("students")
              .update({ tutor_id: tutorId, is_tutor_assigned: true })
              .eq("id", student.id);
          } else {
            await supabaseClient
              .from("students")
              .update({ tutor_id: null, is_tutor_assigned: false })
              .eq("id", student.id);
          }
        })
      );
      message.success("Tutor assignments updated!");
      if (setSelectedTutors) setSelectedTutors({});
    } else if (action === "delete" && enquiry) {
      // Move enquiry to deleted-enquiries and remove from enquiries
      const { error: insertError } = await supabaseClient
        .from("deleted-enquiries")
        .insert([{ ...enquiry }]);
      if (insertError) throw insertError;
      const { error: deleteError } = await supabaseClient
        .from("enquiries")
        .delete()
        .eq("id", enquiry.id);
      if (deleteError) throw deleteError;
      message.success("Enquiry deleted and archived.");
    } else if (action === "archive" && enquiry) {
      // Just move to deleted-enquiries, keep in enquiries
      const { error: insertError } = await supabaseClient
        .from("deleted-enquiries")
        .insert([{ ...enquiry }]);
      if (insertError) throw insertError;
      message.success("Enquiry archived.");
    } else if (action === "deleteStudent" && studentId) {
      await supabaseClient
        .from("students")
        .delete()
        .eq("id", studentId);
      message.success("Student deleted.");
    }
    onSuccess();
  } catch (error) {
    console.error("Enquiry handler error:", error);
    message.error("Failed to process enquiry action.");
  } finally {
    setLoading(false);
  }
}
