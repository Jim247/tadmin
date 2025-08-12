"use client";

import { useState } from "react";
import { Button, Modal, Select, message, Typography, Space, Card } from "antd";
import { useList, useCustomMutation } from "@refinedev/core";
import { MailOutlined, UserOutlined } from "@ant-design/icons";
import { Enquiry } from "@/types";

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
  const [selectedTutor, setSelectedTutor] = useState<string>();
  const [loading, setLoading] = useState(false);

  // Fetch active tutors
  const { data: tutorsData, isLoading: tutorsLoading } = useList({
    resource: "tutors",
    filters: [
      {
        field: "active",
        operator: "eq",
        value: true,
      },
    ],
  });

  // Custom mutation for assignment
  const { mutate: assignTutor } = useCustomMutation();

  const handleAssign = async () => {
    if (!selectedTutor) {
      message.error("Please select a tutor");
      return;
    }

    setLoading(true);
    
    try {
      // Call the assignment function
      await assignTutor({
        url: "",
        method: "post",
        values: {},
        config: {
          headers: {},
        },
        meta: {
          // Use Supabase RPC to call our function
          resource: "rpc/assign_tutor_to_enquiry",
          variables: {
            enquiry_id_param: enquiry.id,
            tutor_id_param: selectedTutor,
          },
        },
      });

      message.success("Tutor assigned successfully! Emails will be sent.");
      onSuccess();
      setSelectedTutor(undefined);
    } catch (error) {
      console.error("Assignment error:", error);
      message.error("Failed to assign tutor");
    } finally {
      setLoading(false);
    }
  };

  const filteredTutors = tutorsData?.data?.filter((tutor) => 
    tutor.instruments?.includes(enquiry?.instrument)
  );

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
          disabled={!selectedTutor}
        >
          Assign & Send Emails
        </Button>,
      ]}
      width={600}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Card size="small">
          <Title level={5}>Enquiry Details</Title>
          <Text><strong>Student:</strong> {enquiry?.student_name}</Text><br />
          <Text><strong>Email:</strong> {enquiry?.student_email}</Text><br />
          <Text><strong>Instrument:</strong> {enquiry?.instrument}</Text><br />
          <Text><strong>Level:</strong> {enquiry?.level}</Text><br />
          <Text><strong>Location:</strong> {enquiry?.location}</Text><br />
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
            Showing tutors who teach {enquiry?.instrument}
          </Text>
          <Select
            style={{ width: "100%", marginTop: 8 }}
            placeholder="Select a tutor"
            loading={tutorsLoading}
            value={selectedTutor}
            onChange={setSelectedTutor}
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                ?.includes(input.toLowerCase())
            }
          >
            {filteredTutors?.map((tutor) => (
              <Option key={tutor.id} value={tutor.id}>
                <Space>
                  <UserOutlined />
                  {tutor.name} - {tutor.location}
                  {tutor.strikes > 0 && (
                    <Text type="warning">({tutor.strikes} strikes)</Text>
                  )}
                </Space>
              </Option>
            ))}
          </Select>
          {filteredTutors?.length === 0 && !tutorsLoading && (
            <Text type="warning">
              No active tutors found for {enquiry?.instrument}
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
