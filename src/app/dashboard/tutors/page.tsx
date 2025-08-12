"use client";

import { List, useTable, EditButton, ShowButton, DeleteButton, CreateButton } from "@refinedev/antd";
import { Table, Space, Tag } from "antd";

export default function TutorsList() {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List
      headerButtons={<CreateButton />}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column dataIndex="phone" title="Phone" />
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
        <Table.Column dataIndex="location" title="Location" />
        <Table.Column 
          dataIndex="strikes" 
          title="Strikes"
          render={(strikes) => (
            <Tag color={strikes > 0 ? "red" : "green"}>
              {strikes || 0}
            </Tag>
          )}
        />
        <Table.Column 
          dataIndex="active" 
          title="Status"
          render={(active) => (
            <Tag color={active ? "green" : "red"}>
              {active ? "Active" : "Inactive"}
            </Tag>
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
