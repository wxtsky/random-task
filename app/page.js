"use client"
import React, { useState, useEffect } from 'react';
import { InputNumber, Button, Table, Row, Col, Card, Select, Tag, Form, Checkbox, BackTop, Input, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Option } = Select;

const App = () => {
  const [form] = Form.useForm();
  const [numAccounts, setNumAccounts] = useState(2);
  const [numTasks, setNumTasks] = useState(1);
  const [taskNames, setTaskNames] = useState([]);
  const [numDays, setNumDays] = useState(2);
  const [randomTasks, setRandomTasks] = useState(true);
  const [customTaskNames, setCustomTaskNames] = useState(false);
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

  useEffect(() => {
    setTaskNames(Array(numTasks).fill(''));
  }, [numTasks]);

  const assignTasks = () => {
    if (numAccounts <= 1 || numTasks <= 1 || numDays <= 1 || numDays > numAccounts) {
      return;
    }

    if (customTaskNames) {
      if (taskNames.some((name) => name.trim() === '')) {
        message.error('请填写所有任务名称');
        return;
      }

      const uniqueTaskNames = [...new Set(taskNames)];
      if (uniqueTaskNames.length !== taskNames.length) {
        message.error('任务名称不能重复');
        return;
      }
    }

    const tasksArray = customTaskNames
        ? taskNames.filter((name) => name.trim() !== '')
        : Array.from({ length: numTasks }, (_, i) => String.fromCharCode(65 + i));

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

        const assignmentObject = {
          key: `${day}-${account}`,
          day,
          account,
        };

        tasks.forEach((task, index) => {
          assignmentObject[`任务${index + 1}`] = task;
        });

        assignmentsArray.push(assignmentObject);

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
    } else {
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    }
  };

  const handleTaskNameChange = (index, value) => {
    const newTaskNames = [...taskNames];
    newTaskNames[index] = value;
    setTaskNames(newTaskNames);
  };

  const columns = [
    {
      title: '天数',
      dataIndex: 'day',
      key: 'day',
      width: '10%',
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
      width: '10%',
      render: (account) => <Tag color="green">账号 {account}</Tag>,
    },
    ...Array.from({ length: numTasks }, (_, i) => ({
      title: `任务${i + 1}`,
      dataIndex: `任务${i + 1}`,
      key: `任务${i + 1}`,
      width: `${80 / numTasks}%`,
      render: (task) => task && <Tag>{task}</Tag>,
    })),
  ];

  return (
      <Row justify="center" style={{ marginTop: 24 }}>
        <BackTop />
        <Col xs={24} sm={22} md={20} lg={18} xl={16}>
          <Card title="随机任务分配" bordered={false}>
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={24}>
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
              </Row>
              <Row gutter={16}>
                <Col span={12}>
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
                <Col span={12}>
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
                        checked={customTaskNames}
                        onChange={(e) => setCustomTaskNames(e.target.checked)}
                    >
                      自定义任务名称
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item>
                    <Checkbox checked={randomTasks} onChange={(e) => setRandomTasks(e.target.checked)}>
                      随机任务顺序
                    </Checkbox>
                  </Form.Item>
                </Col>
              </Row>
              {customTaskNames && (
                  <Row gutter={16}>
                    {taskNames.map((taskName, index) => (
                        <Col span={8} key={index}>
                          <Form.Item label={`任务${index + 1}`}>
                            <Input
                                value={taskName}
                                onChange={(e) => handleTaskNameChange(index, e.target.value)}
                                style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                    ))}
                  </Row>
              )}
              <Row gutter={16}>
                <Col span={24}>
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
                size="small"
                columns={columns}
                dataSource={filteredAssignments}
                pagination={false}
                scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
      </Row>
  );
};

export default App;