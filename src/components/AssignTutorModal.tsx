"use client";

import { MailOutlined
 } from "@ant-design/icons";
import { Typography, Select, message, Modal, Button, Space, Card } from "antd";
import { useState } from "react";
import { Enquiry } from "@/constants/types";
import { FetchTutors } from "@/hooks/fetchFunctions";
import { filterTutors } from "@/utils/get-allocatable-tutors"
import { handleUpdateTutorAssignment } from "@/hooks/tutorHandlers";


const { Text, Title } = Typography;



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
  const { data: tutorsData, isLoading: tutorsLoading } = FetchTutors()

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
          onClick={() => handleUpdateTutorAssignment
            ({     selectedTutors,
              setSelectedTutors,
      enquiry,
      setLoading,
      onSuccess,
      message,
            })
          }
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
          {Array.isArray(enquiry.students) && enquiry.students.length > 0 ? (
            <ul>
              {enquiry.students.map((student) => {
                const allocatableTutors = filterTutors(tutorsData ?? [], student);
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
                      loading={tutorsLoading}
                      value={selectedTutors[student.id]}
                      onChange={value => setSelectedTutors(prev => ({ ...prev, [student.id]: value }))}
                      disabled={allocatableTutors.length === 0}
                    >
                      {allocatableTutors.map(tutor => (
                        <Select.Option key={tutor.id} value={tutor.id}>
                          {tutor.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Text>No students found.</Text>
          )}
        </Card>
        <div>
          <Title level={5}>Select Tutor</Title>
          <Text type="secondary">
          
          </Text>
          {filterTutors?.length === 0 && !tutorsLoading && (
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
