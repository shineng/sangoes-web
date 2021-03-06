import React, { Component, Fragment } from 'react';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
  Steps,
  Radio,
} from 'antd';
import { PageHeader } from 'ant-design-pro';
import StandardTable from '@/components/StandardTable';
import styles from './index.less';
import { createActions, createAction } from '@/utils';
import { connect } from 'dva';
import NewRolePage from './new';
import BindMenuPage from './bind';

const confirm = Modal.confirm;

/**
 * 角色管理
 */
@connect(({ role, loading }) => ({
  ...role,
  roleLoading: loading.models.role,
}))
@Form.create()
export default class RoleMgtPage extends Component {
  constructor(props) {
    super(props);
    this.state = { bindMenuVisible: false, selectedRows: [], roleRecord: null };
  }
  // 加载完成
  componentDidMount() {
    // 网络获取分页用户
    this._getRolePageNet();
  }
  // 网络获取分页用户
  _getRolePageNet(params) {
    this.props.dispatch(createAction('role/getRolePage')(params));
  }

  // 新建角色点击确定
  _handleAdd = fields => {
    const { dispatch, form } = this.props;
    dispatch(
      createActions('role/addRole')(fields)(() => {
        // 清空form
        form.resetFields();
        // 关闭弹窗
        this.NewRolePage.hide();
      })
    );
  };
  // 选择
  _handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };
  // table变化
  _handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }
    // 网络获取
    this._getRolePageNet(params);
  };
  // 下啦确定
  _handleMenuClick = e => {
    switch (e.key) {
      case 'edit':
        const item = this.state.roleRecord;
        this.NewRolePage.showUpdate(item);
        break;
      case 'bind':
        this.setState({ bindMenuVisible: true });
        break;
      default:
        break;
    }
  };
  // 更多下拉
  moreMenu = (
    <Menu onClick={this._handleMenuClick} selectedKeys={['edit']}>
      <Menu.Item key="edit">修改</Menu.Item>
      <Menu.Item key="bind">绑定菜单权限</Menu.Item>
    </Menu>
  );
  // table列表
  columns = [
    {
      title: '角色名',
      dataIndex: 'roleName',
    },
    {
      title: '角色编码',
      dataIndex: 'roleCode',
    },
    {
      title: '描述',
      dataIndex: 'desc',
    },
    {
      title: '创建时间',
      dataIndex: 'crtTime',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '更新时间',
      dataIndex: 'updTime',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <Button
            size="small"
            type="danger"
            ghost
            onClick={() => {
              this._deleteRole(record);
            }}
          >
            删除
          </Button>
          <Divider type="vertical" />
          <Dropdown overlay={this.moreMenu} trigger={['click']}>
            <Button
              size="small"
              onClick={() => {
                this.setState({ roleRecord: record });
              }}
            >
              更多 <Icon type="down" />
            </Button>
          </Dropdown>
        </Fragment>
      ),
    },
  ];
  // 菜单选中
  _onMenuSelect = key => {
    const role = this.state.roleRecord;
    this.props.dispatch(createAction('role/getBindAuth')({ roleId: role.id, menuId: key }));
  };
  // 关闭绑定菜单权限
  _onCancelBindMenu = () => {
    this.setState({ bindMenuVisible: false });
  };
  // 添加菜单权限
  _handleAddMenuAuth = fields => {
    const { selectedRowKeys, checkedKeys, selectedMenuKeys } = fields;
    const role = this.state.roleRecord;
    this.props.dispatch(
      createActions('role/bindMenuAuth')({
        roleId: role.id,
        menuId: selectedMenuKeys,
        menuIds: checkedKeys.join(','),
        authIds: selectedRowKeys.join(','),
      })(() => {
        // 关闭窗口
        this._onCancelBindMenu();
      })
    );
  };
  // table变化
  _handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }
    // 网络获取
    // this._getRolePageNet(params);
  };
  // 删除角色
  _deleteRole = item => {
    const { dispatch } = this.props;
    confirm({
      title: '确定删除角色?',
      content: '一旦删除将不可恢复',
      onOk() {
        dispatch(
          createAction('role/deleteRole')({
            roleId: item.id,
          })
        );
      },
    });
  };
  // 批量删除角色
  _onBatchDeleteRoleClick = () => {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    const keys = selectedRows.map(item => {
      return item.id;
    });
    // 对话框
    confirm({
      title: '确定批量删除角色?',
      content: '一旦删除将不可恢复',
      onOk() {
        dispatch(createAction('role/batchDeleteRole')({ roleIds: keys }));
      },
    });
  };
  // 更新角色确认
  _handleUpdateRole = fields => {
    const { dispatch, form } = this.props;
    dispatch(
      createActions('role/updateRole')(fields)(() => {
        // 清空form
        form.resetFields();
        // 关闭弹窗
        this.NewRolePage.hide();
      })
    );
  };
  // render
  render() {
    const { selectedRows, bindMenuVisible } = this.state;
    const { roleList, roleLoading, menuKeys, menus, selectedKeys, expandedKeys } = this.props;
    return (
      <div>
        <PageHeader title="角色管理" />
        <Card bordered={false} className={styles.card}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.NewRolePage.show()}>
                新建
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Button type="danger" ghost onClick={this._onBatchDeleteRoleClick}>
                    批量删除
                  </Button>
                </span>
              )}
            </div>
            {/* 表格 */}
            <StandardTable
              rowKey="id"
              selectedRows={selectedRows}
              loading={roleLoading}
              data={roleList}
              columns={this.columns}
              onSelectRow={this._handleSelectRows}
              onChange={this._handleStandardTableChange}
            />
          </div>
        </Card>
        {/* 新建角色 */}
        <NewRolePage
          ref={ref => (this.NewRolePage = ref)}
          form={this.props.form}
          onOkHandle={this._handleAdd}
          onUpdateHandle={this._handleUpdateRole}
        />
        {/* 绑定菜单 */}
        {bindMenuVisible ? (
          <BindMenuPage
            visible={bindMenuVisible}
            record={this.state.roleRecord}
            handleAdd={this._handleAddMenuAuth}
            onMenuSelect={this._onMenuSelect}
            onCancel={this._onCancelBindMenu}
          />
        ) : null}
      </div>
    );
  }
}
