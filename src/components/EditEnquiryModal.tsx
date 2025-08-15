"use client";

import React, { useState } from "react";
import { Modal, Button, message, Select, Space, Typography, Card } from "antd";
import { MailOutlined, UserOutlined } from "@ant-design/icons";
import { filterTutors } from "@/utils/get-allocatable-tutors";
import type { Enquiry, Student, Tutor } from "@/constants/types";
import { FetchTutors } from "@/hooks/fetchFunctions";

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
  const [loading, setLoading] = useState(false);

    // Fetch tutors using React Query
    const { data: tutorsData, isLoading: tutorsLoading } = FetchTutors()

  // Placeholder update function
  const handleUpdateTutor = (studentId: string, tutorId: string | null) => {
    // TODO: Implement update logic in handlers
    message.info(`Update tutor for student ${studentId} to ${tutorId}`);
  };

  // Placeholder delete function
  const handleDeleteTutor = (studentId: string) => {
    // TODO: Implement delete logic in handlers
    message.info(`Remove tutor for student ${studentId}`);
  };

  // Assignment logic copied from AssignTutorModal
  const handleAssign = async () => {
    setLoading(true);
    try {
      await Promise.all(
        enquiry.students.map(async (student) => {
          const tutorId = selectedTutors[student.id];
          // Placeholder: replace with your update handler
          handleUpdateTutor(student.id, tutorId ?? null);
        })
      );
      message.success("Tutor assignments updated!");
      onSuccess();
      setSelectedTutors({});
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
                      value={selectedTutors[student.id]}
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
                      onClick={() => handleDeleteTutor(student.id)}
                      disabled={!student.tutor_id}
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