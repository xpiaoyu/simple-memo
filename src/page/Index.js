import React from 'react';
import {List, Button, Affix, Modal, Input, message, Spin} from 'antd';
import axios from 'axios';
import moment from 'moment';
import {observer} from 'mobx-react';
import {Link} from 'react-router-dom';

import articleStore from '../store/ArticleStore';
import '../IndexPage.css';

// const APP_URL = 'http://192.168.50.78:8083';
// const APP_URL = 'http://localhost:8083';
const APP_URL = 'http://mv.piaoyu.org:8083';

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: [],
      visible: false,
      confirmLoading: false,
      newArticleId: '',
      spinning: false
    };

    // articleStore.setKeywords('');
  }

  componentDidMount() {
    this.loadArticleList();
  }

  loadArticleList() {
    this.setState({spinning: true});
    axios.get(APP_URL + '/list').then((resp) => {
      console.log(resp);
      if (resp.status === 200) {
        articleStore.setArticle(resp.data);
      }
      this.setState({spinning: false});
    }).catch(err => {
      message.error('列表获取失败 ' + err);
      articleStore.setArticle([]);
    });
  }

  onClick() {
    const activeKey = this.state.activeKey;
    if (!activeKey.includes('1')) {
      activeKey.push('1');
    }
    this.setState({activeKey: activeKey});
    document.getElementById('1').scrollIntoView();
    console.log(activeKey);
  }

  onChange(key) {
    this.setState({activeKey: key})
  }

  handleSearch(e) {
    // console.log('Handle search.', e.target.value, articleStore.filteredArticle);
    articleStore.setKeywords(e.target.value);
  }

  getTitle(text) {
    let limit = text.indexOf('\n');
    if (limit < 0) {
      limit = 30;
    } else {
      limit += 1;
    }
    let ellipsis = false;
    if (limit > 30) {
      limit = 30;
      ellipsis = true;
    }
    if (text.length > limit) {
      if (ellipsis) {
        return text.slice(0, limit) + '...';
      } else {
        return text.slice(0, limit);
      }
    }
    return text;
  }

  getHundredTitle(text) {
    if (text.length > 80) {
      return text.slice(0, 80) + '...';
    }
    return text;
  }

  onModalOpen() {
    this.setState({
      visible: true
    });
  }

  handleModalCancel() {
    this.setState({
      visible: false,
      confirmLoading: false
    });
  }

  handleModalOk() {
    this.setState({
      confirmLoading: true
    });
    axios.post(APP_URL + '/create', {
      id: this.state.newArticleId
    }).then((resp) => {
      if (resp.status === 200) {
        if (resp.data === 'success') {
          message.success('创建文章成功!');
          this.setState({
            confirmLoading: false,
            visible: false
          });
          this.loadArticleList();
        } else if (resp.data === 'existed') {
          message.error('失败：文章ID已存在!');
          this.setState({
            confirmLoading: false
          });
        } else {
          message.warn('未知错误', resp.data);
          this.setState({
            confirmLoading: false
          });
        }
      }
    }).catch((err) => {
      console.log(err);
      this.setState({confirmLoading: false});
      message.error('创建失败 ' + err);
    });
  }

  onNewArticleIdChange(v) {
    this.setState({newArticleId: v.target.value});
  }


  render() {
    const data = articleStore.filteredArticle;
    const {visible, confirmLoading, spinning} = this.state;
    return (
      <div>
        <Spin spinning={spinning}>
          <div>
            <Input
              // dataSource={dataSource}
              style={{width: '100%'}}
              // onSelect={onSelect}
              onChange={this.handleSearch.bind(this)}
              placeholder="搜索"
              allowClear={true}
              value={articleStore.keywords}
            />
            <List
              itemLayout="horizontal"
              dataSource={data}
              renderItem={(item) => (
                <List.Item>
                  <Link style={{textDecoration: 'none', width: '100%'}} to={'/post/' + item.id}>
                    <List.Item.Meta
                      title={<div className="shadow">{this.getTitle(item.summary)}</div>}
                      description={
                        <div className="list_desc">
                          <b>{moment(item.timestamp).format('YYYY-MM-DD HH:mm')}</b> {this.getHundredTitle(item.summary)}
                        </div>}
                      style={{cursor: 'pointer'}}
                    />
                  </Link>
                </List.Item>
              )}
            />
          </div>
        </Spin>
        <Affix style={{position: 'fixed', bottom: '10px'}}>
          <Button type="primary" shape="circle" icon="file-add" size="default" onClick={this.onModalOpen.bind(this)}/>
        </Affix>
        <Modal
          title="创建一篇新的文章"
          visible={visible}
          onOk={this.handleModalOk.bind(this)} okText={'创建'}
          confirmLoading={confirmLoading}
          onCancel={this.handleModalCancel.bind(this)} cancelText={'取消'}
        >
          <div>
            <Input size="large" placeholder="文章标题" value={this.state.newArticleId}
                   onChange={this.onNewArticleIdChange.bind(this)}/>
          </div>
        </Modal>
      </div>
    );
  }
}

observer(Index);

export default Index;
