"use client"
import React, { useState, useEffect } from 'react';
import { InputNumber, Button, Table, Row, Col, Card, Select, Tag, Form, Checkbox, BackTop, Input } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Option } = Select;

const App = () => {
  const [form] = Form.useForm();
  const [numAccounts, setNumAccounts] = useState(2);
  const [numTasks, setNumTasks] = useState(1);
  const [numDays, setNumDays] = useState(2);
  const [randomTasks, setRandomTasks] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [filters, setFilters] = useState({
    day: 'all',
    account: 'all',
  });
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const filtered = assignments.filter((item) => {
      const dayMatch = filters.day === 'all' || item.day === filters.day;
      const accountMatch = filters.account === 'all' || item.account === filters.account;
      return dayMatch && accountMatch;
    });
    setFilteredAssignments(filtered);
  }, [assignments, filters]);

  const assignTasks = () => {
    if (numAccounts <= 1 || numTasks <= 1 || numDays <= 1 || numDays > numAccounts) {
      return;
    }

    const tasksArray = Array.from({ length: numTasks }, (_, i) => String.fromCharCode(65 + i));
    const accountsArray = Array.from({ length: numAccounts }, (_, i) => i + 1);
    const shuffledAccounts = shuffle(accountsArray);

    const assignmentsArray = [];

    const accountsPerDay = Math.floor(numAccounts / numDays);
    const extraAccounts = numAccounts % numDays;

    let accountIndex = 0;

    for (let day = 1; day <= numDays; day++) {
      const numAccountsForDay = accountsPerDay + (day <= extraAccounts ? 1 : 0);

      for (let i = 0; i < numAccountsForDay; i++) {
        const account = shuffledAccounts[accountIndex];
        const tasks = randomTasks ? shuffle(tasksArray) : tasksArray;

        assignmentsArray.push({
          key: `${day}-${account}`,
          day,
          account,
          tasks: tasks.join(''),
        });

        accountIndex++;
      }
    }

    setAssignments(assignmentsArray);
  };

  const shuffle = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleFilterChange = (field, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredAssignments);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assignments');
    if (fileName === '') {
      XLSX.writeFile(workbook, 'assignments.xlsx');
    }else {
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    }
  };

  const columns = [
    {
      title: '天数',
      dataIndex: 'day',
      key: 'day',
      width: '20%',
      sorter: (a, b) => a.day - b.day,
      render: (day) => {
        const hue = (day * 137.508) % 360;
        const color = `hsl(${hue}, 50%, 50%)`;
        return <Tag color={color}>{day}</Tag>;
      },
    },
    {
      title: '账号',
      dataIndex: 'account',
      key: 'account',
      width: '20%',
      render: (account) => <Tag color="green">账号 {account}</Tag>,
    },
    {
      title: '任务顺序',
      dataIndex: 'tasks',
      key: 'tasks',
      width: '60%',
      render: (tasks) => tasks.split('').map((task, index) => <Tag key={index}>{task}</Tag>),
    },
  ];

  return (
      <Row justify="center" style={{ marginTop: 24 }}>
        <BackTop />
        <Col xs={24} sm={22} md={20} lg={18} xl={16}>
          <Card title="随机任务分配" bordered={false}>
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="账号数量">
                    <InputNumber
                        min={2}
                        placeholder="请输入账号数量"
                        value={numAccounts}
                        onChange={setNumAccounts}
                        style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="任务数量">
                    <InputNumber
                        min={1}
                        placeholder="请输入任务数量"
                        value={numTasks}
                        onChange={setNumTasks}
                        style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="完成天数">
                    <InputNumber
                        min={2}
                        max={numAccounts}
                        placeholder="请输入完成天数"
                        value={numDays}
                        onChange={setNumDays}
                        style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item>
                    <Checkbox
                        checked={randomTasks}
                        onChange={(e) => setRandomTasks(e.target.checked)}
                    >
                      随机任务顺序
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item>
                    <Button type="primary" onClick={assignTasks} style={{ width: '100%' }}>
                      分配任务
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Select
                    value={filters.day}
                    style={{ width: '100%' }}
                    onChange={(value) => handleFilterChange('day', value)}
                >
                  <Option value="all">全部天数</Option>
                  {[...new Set(assignments.map((item) => item.day))].map((day) => (
                      <Option key={day} value={day}>
                        第{day}天
                      </Option>
                  ))}
                </Select>
              </Col>
              <Col span={8}>
                <Select
                    value={filters.account}
                    style={{ width: '100%' }}
                    onChange={(value) => handleFilterChange('account', value)}
                >
                  <Option value="all">全部账号</Option>
                  {[...new Set(assignments.map((item) => item.account))]
                      .sort((a, b) => a - b)
                      .map((account) => (
                          <Option key={account} value={account}>
                            账号 {account}
                          </Option>
                      ))}
                </Select>
              </Col>
              <Col span={8}>
                <Input
                    placeholder="请输入文件名"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    style={{ width: '100%' }}
                />
              </Col>
            </Row>
            <Row justify="end" style={{ marginBottom: 16 }}>
              <Button icon={<DownloadOutlined />} onClick={exportToExcel}>
                导出Excel
              </Button>
            </Row>
            <Table
                size={'small'}
                columns={columns}
                dataSource={filteredAssignments}
                pagination={false}
            />
          </Card>
        </Col>
      </Row>
  );
};

export default App;