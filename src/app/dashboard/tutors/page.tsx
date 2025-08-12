"use client";

import { supabaseClient } from "@/lib/supabase";
import { List, EditButton, ShowButton, DeleteButton, CreateButton } from "@refinedev/antd";
import { Table, Space, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";

export default function TutorsList() {
  const { data: tutors, isLoading, error } = useQuery({
    queryKey: ["tutors"],
    queryFn: async () => {
      const { data, error } = await supabaseClient.from("tutors").select("*");
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
  return <div>Error: {(error as Error).message}</div>;
  }

  return (
    <List
      headerButtons={<CreateButton />}
    >
      <Table dataSource={tutors} rowKey="id" loading={isLoading}>
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column dataIndex="phone_number" title="Phone" />
        <Table.Column 
          dataIndex="instruments" 
          title="Instruments"
          render={(instruments) => (
            <div>
              {instruments?.map((instrument: string, index: number) => (
                <Tag key={index} color="blue">{instrument}</Tag>
              ))}
            </div>
          )}
        />
        <Table.Column dataIndex="created_at" title="Joined" />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
