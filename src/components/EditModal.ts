"use client";

import { Modal, Button, Select, Space, Typography, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import { supabaseClient } from "@/lib/supabase";
import { Tutor, Student } from "@/constants/types";

const { Text, Title } = Typography;
const { Option } = Select;

interface EditTutorModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  student: Student;
  tutors: Tutor[];
}

export const EditTutorModal: React.FC<EditTutorModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  student,
  tutors,
}) => {
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(student.tutor_id ?? null);
  const [loading, setLoading] = useState(false);

  // Helper to parse instruments
  const toArray = (val: string | string[]) =>
    Array.isArray(val) ? val : typeof val === "string" ? val.split(",").map(s => s.trim()) : [];

  // Tutors matching student's instruments
  const getAllocatableTutors = () => {
    const studentInstruments = toArray(student.instruments);
    return tutors.filter((tutor) => {
      const tutorInstruments = toArray(tutor.instruments);
      return studentInstruments.some(instr => tutorInstruments.includes(instr));
    });
  };

  const handleAssign = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from("students")
        .update({ tutor_id: selectedTutorId, is_tutor_assigned: !!selectedTutorId })
        .eq("id", student.id);

      if (error) throw error;
      message.success(selectedTutorId ? "Tutor assigned!" : "Tutor de-assigned!");
      onSuccess();
    } catch (error) {
      message.error("Failed to update tutor assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Tutor Assignment"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="assign"
          type="primary"
          loading={loading}
          onClick={handleAssign}
          disabled={selectedTutorId === student.tutor_id}
        >
          {selectedTutorId ? "Assign Tutor" : "De-assign Tutor"}
        </Button>,
      ]}
      width={500}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Title level={5}>Student Details</Title>
        <Text>
          <strong>Name:</strong> {student.name}
        </Text>
        <Text>
          <strong>Instruments:</strong> {toArray(student.instruments).join(", ")}
        </Text>
        <Text>
          <strong>Current Tutor:</strong>{" "}
          {student.tutor_id
            ? tutors.find(t => t.id === student.tutor_id)?.name || "Unknown Tutor"
            : "Unassigned"}
        </Text>
        <Select
          style={{ width: 220 }}
          placeholder={getAllocatableTutors().length === 0 ? "No tutor available" : "Select tutor"}
          value={selectedTutorId ?? undefined}
          onChange={value => setSelectedTutorId(value)}
          disabled={getAllocatableTutors().length === 0}
          allowClear
        >
          {getAllocatableTutors().map((tutor: Tutor) => (
            <Option key={tutor.id} value={tutor.id}>
              <Space>
                <UserOutlined />
                {tutor.name} - {tutor.postcode}
              </Space>
            </Option>
          ))}
        </Select>
        {getAllocatableTutors().length === 0 && (
          <Text type="warning" style={{ marginLeft: 8 }}>
            No tutor available for this student.
          </Text>
        )}
      </div>
    </Modal>
  );
};