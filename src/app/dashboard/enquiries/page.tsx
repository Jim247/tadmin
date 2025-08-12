"use client";

import { useState } from "react";
import { List, useTable, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Button, Tag } from "antd";
import { useMany } from "@refinedev/core";
import { MailOutlined } from "@ant-design/icons";
import { AssignTutorModal } from "@/components/AssignTutorModal";
import { Enquiry } from "@/types";

export default function EnquiriesList() {
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  const { tableProps, tableQuery } = useTable({
    syncWithLocation: true,
  });

  const { data: tutorData, isLoading: tutorIsLoading } = useMany({
    resource: "tutors",
    ids: tableProps?.dataSource?.map((item) => item?.tutor_id) ?? [],
    queryOptions: {
      enabled: !!tableProps?.dataSource,
    },
  });

  const handleAssign = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setAssignModalVisible(true);
  };

  const handleAssignSuccess = () => {
    setAssignModalVisible(false);
    setSelectedEnquiry(null);
    tableQuery.refetch();
  };

  return (
    <>
      <List>
        <Table {...tableProps} rowKey="id">
          <Table.Column dataIndex="id" title="ID" width={100} />
          <Table.Column dataIndex="student_name" title="Student Name" />
          <Table.Column dataIndex="student_email" title="Student Email" />
          <Table.Column dataIndex="instrument" title="Instrument" />
          <Table.Column dataIndex="level" title="Level" />
          <Table.Column dataIndex="location" title="Location" />
          <Table.Column 
            dataIndex="status" 
            title="Status"
            render={(status) => {
              const colors = {
                new: 'blue',
                assigned: 'orange',
                expired: 'red',
                completed: 'green'
              };
              return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
            }}
          />
          <Table.Column
            dataIndex={["tutor_id"]}
            title="Assigned Tutor"
            render={(value) => {
              if (tutorIsLoading) {
                return <>Loading...</>;
              }

              const tutor = tutorData?.data?.find((item) => item.id === value);
              return tutor?.name ?? "Unassigned";
            }}
          />
          <Table.Column dataIndex="created_at" title="Created At" />
          <Table.Column
            title="Actions"
            dataIndex="actions"
            render={(_, record) => (
              <Space>
                {record.status === 'new' && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<MailOutlined />}
                    onClick={() => handleAssign(record as Enquiry)}
                  >
                    Assign
                  </Button>
                )}
                <EditButton hideText size="small" recordItemId={record.id} />
                <ShowButton hideText size="small" recordItemId={record.id} />
                <DeleteButton hideText size="small" recordItemId={record.id} />
              </Space>
            )}
          />
        </Table>
      </List>

      {selectedEnquiry && (
        <AssignTutorModal
          enquiry={selectedEnquiry}
          visible={assignModalVisible}
          onCancel={() => setAssignModalVisible(false)}
          onSuccess={handleAssignSuccess}
        />
      )}
    </>
  );
}
