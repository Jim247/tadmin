"use client";

import { MailOutlined, UserOutlined } from "@ant-design/icons";
import { supabaseClient } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Typography, Select, message, Modal, Button, Space, Card } from "antd";
import { useState } from "react";
import { Enquiry, Tutor, Student } from "@/constants/types";


const { Text, Title } = Typography;
const { Option } = Select;


interface AssignTutorModalProps {
  enquiry: Enquiry;
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const AssignTutorModal: React.FC<AssignTutorModalProps> = ({
  enquiry,
  visible,
  onCancel,
  onSuccess,
}) => {
  const [selectedTutors, setSelectedTutors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Fetch tutors using React Query
  const { data: tutorsData, isLoading: tutorsLoading } = useQuery({
    queryKey: ["tutors"],
    queryFn: async () => {
      const { data, error } = await supabaseClient.from("tutors").select("*");
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  // Helper to parse instruments (handles string or array)
  const toArray = (val: string | string[]) =>
    Array.isArray(val) ? val : typeof val === "string" ? val.split(",").map(s => s.trim()) : [];

  // For each student, get tutors who match at least one instrument
  const getAllocatableTutors = (student: Student) => {
    const studentInstruments = toArray(student.instruments);
    return tutorsData?.filter((tutor: Tutor) => {
      const tutorInstruments = toArray(tutor.instruments);
      return studentInstruments.some(instr => tutorInstruments.includes(instr));
    }) || [];
  };

  // Filtering tutors by matching any instrument in student's array with tutor's array
  const filteredTutors = tutorsData?.filter((tutor: Tutor) => {
    const tutorInstruments = (tutor.instruments);
    const studentInstruments = Array.isArray(enquiry.instruments)
      ? enquiry.instruments
      : [enquiry.instruments];
    // Check if any instrument matches
    return studentInstruments.some(instr => tutorInstruments.includes(instr));
  }) || [];

const handleAssign = async () => {
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
};

  return (
    <Modal
      title="Assign Tutor to Enquiry"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="assign"
          type="primary"
          icon={<MailOutlined />}
          loading={loading}
          onClick={handleAssign}
          disabled={Object.keys(selectedTutors).length === 0}
        >
          Assign & Send Emails
        </Button>,
      ]}
      width={600}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Card size="small">
          <Title level={5}>Enquiry Details</Title>
          <Text><strong>Booking Owner:</strong> {enquiry?.first_name}{" "}{enquiry?.last_name}</Text><br />
          <Text><strong>Email:</strong> {enquiry?.email}</Text><br />
          <Text><strong>Instrument:</strong> {enquiry?.instruments}</Text><br />
          <Text><strong>Level:</strong> {enquiry?.level}</Text><br />
          <Text><strong>Location:</strong> {enquiry?.ward}, {enquiry.postcode}</Text><br />
          {enquiry?.message && (
            <>
              <Text><strong>Message:</strong></Text><br />
              <Text>{enquiry.message}</Text>
            </>
          )}
        </Card>
               <Card size="small">
          <Title level={5}>Students</Title>
          <Text><strong>{Array.isArray(enquiry.students) && enquiry.students.length > 0 ? (
  <ul>
    {enquiry.students?.map((student) => (
      <li key={student.id} style={{ marginBottom: 16 }}>
        <strong>{student.name}</strong>
        {student.instruments && (
          <> — {toArray(student.instruments).join(", ")}</>
        )}
        <br />
        <Select
          style={{ width: 220, marginTop: 8 }}
          placeholder={getAllocatableTutors(student).length === 0 ? "No tutor available" : "Assign tutor"}
          loading={tutorsLoading}
          value={selectedTutors[student.id]}
          onChange={value => setSelectedTutors(prev => ({ ...prev, [student.id]: value }))}
          disabled={getAllocatableTutors(student).length === 0}
        >
          {getAllocatableTutors(student).map((tutor: Tutor) => (
            <Option key={tutor.id} value={tutor.id}>
              <Space>
                <UserOutlined />
                {tutor.name} - {tutor.postcode}
              </Space>
            </Option>
          ))}
        </Select>
        {getAllocatableTutors(student).length === 0 && (
          <>
            <Text type="warning" style={{ marginLeft: 8 }}>
            </Text>
            <Text>No tutor, Set to &quot;waiting&ldquo;</Text>
          </>
        )}
      </li>
    ))}
  </ul>
) : (
  <Text type="secondary">No students linked to this enquiry.</Text>
)}</strong></Text>

          {enquiry?.message && (
            <>
              <Text><strong>Message:</strong></Text><br />
              <Text>{enquiry.message}</Text>
            </>
          )}
        </Card>
        <div>
          <Title level={5}>Select Tutor</Title>
          <Text type="secondary">
          
          </Text>
          {filteredTutors?.length === 0 && !tutorsLoading && (
            <Text type="warning">
              No active tutors found for {enquiry?.instruments}
            </Text>
          )}
        </div>

        <Card size="small" style={{ backgroundColor: "#f6ffed" }}>
          <Text type="success">
            <MailOutlined /> After assignment, emails will be sent to:
          </Text>
          <ul>
            <li>Student confirmation email</li>
            <li>Tutor assignment notification (24h to respond)</li>
          </ul>
        </Card>
      </Space>
    </Modal>
  );
};
