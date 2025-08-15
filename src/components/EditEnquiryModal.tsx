"use client";

import React, { useState } from "react";
import { Modal, Button, message as antdMessage, Select, Space, Typography, Card } from "antd";
import { MailOutlined, UserOutlined } from "@ant-design/icons";
import { filterTutors } from "@/utils/get-allocatable-tutors";
import type { Enquiry, Student, Tutor } from "@/constants/types";
import { FetchTutors } from "@/hooks/fetchFunctions";
import { handleUpdateTutorAssignment } from "@/hooks/tutorHandlers";
import { message } from "antd";

const { Text, Title } = Typography;

interface EditTutorModalProps {
  visible: boolean;
  enquiry: Enquiry;
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditEnquiryModal: React.FC<EditTutorModalProps> = ({
  visible,
  enquiry,
  onCancel,
  onSuccess,
}) => {
  const [selectedTutors, setSelectedTutors] = useState<Record<string, string>>({});
  // Initialize selectedTutors from enquiry when modal opens
  React.useEffect(() => {
    if (visible && enquiry) {
      const initial: Record<string, string> = {};
      enquiry.students.forEach(student => {
        if (student.tutor_id) initial[student.id] = student.tutor_id;
      });
      setSelectedTutors(initial);
    }
  }, [visible, enquiry]);
  const [loading, setLoading] = useState(false);

    // Fetch tutors using React Query
    const { data: tutorsData, isLoading: tutorsLoading } = FetchTutors()

  // Assignment logic copied from AssignTutorModal
  const handleAssign = async () => {
    setLoading(true);
    try {
      await handleUpdateTutorAssignment({
        selectedTutors,
        setSelectedTutors,
        enquiry,
        setLoading,
        onSuccess,
        message,
      });
      message.success("Tutor assignments updated!");
      onSuccess();
    } catch {
      message.error("Failed to update tutor assignments");
    } finally {
      setLoading(false);
    }
  };

  if (!enquiry) return null;

  return (
    <Modal
      title="Edit Tutor Assignments"
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
          Update Assignments
        </Button>,
      ]}
      width={600}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Card size="small">
          <Title level={5}>Students</Title>
          {Array.isArray(enquiry.students) && enquiry.students.length > 0 ? (
            <ul>
              {enquiry.students.map((student: Student) => {
                const allocatableTutors = filterTutors(tutorsData?? [], student);
                return (
                  <li key={student.id} style={{ marginBottom: 16 }}>
                    <strong>{student.name}</strong>
                    {student.instruments && (
                      <> — {Array.isArray(student.instruments) ? student.instruments.join(", ") : student.instruments}</>
                    )}
                    <br />
                    <Select
                      style={{ width: 220, marginTop: 8 }}
                      placeholder={allocatableTutors.length === 0 ? "No tutor available" : "Assign tutor"}
                      value={selectedTutors[student.id] ?? student.tutor_id ?? undefined}
                      onChange={value => setSelectedTutors(prev => ({ ...prev, [student.id]: value }))}
                      loading={tutorsLoading}
                      disabled={allocatableTutors.length === 0}
                      allowClear
                    >
                      {allocatableTutors.map((tutor: Tutor) => (
                        <Select.Option key={tutor.id} value={tutor.id}>
                          <Space>
                            <UserOutlined />
                            {tutor.name} - {tutor.postcode}
                          </Space>
                        </Select.Option>
                      ))}
                    </Select>
                    <Button
                      style={{ marginLeft: 8 }}
                      danger
                      size="small"
                      onClick={() => {
                        setSelectedTutors(prev => {
                          const updated = { ...prev };
                          updated[student.id] = "";
                          return updated;
                        });
                        antdMessage.info(`Tutor removed for ${student.name}. Changes will be saved when you update assignments.`);
                      }}
                      disabled={(!selectedTutors[student.id] && !student.tutor_id)}
                    >
                      Remove Tutor
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Text>No students found.</Text>
          )}
        </Card>
      </Space>
      </Modal>
  )};