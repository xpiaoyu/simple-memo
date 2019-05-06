import React from 'react';
import {List, AutoComplete} from 'antd';
import axios from 'axios';
import moment from 'moment';
import {observer} from 'mobx-react';
import {Link} from 'react-router-dom';

import articleStore from '../store/ArticleStore';
import '../IndexPage.css';

const APP_URL = 'http://192.168.50.78:8083'

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: [],
    };

    articleStore.setKeywords('');

    axios.get(APP_URL + '/list').then((resp) => {
      console.log(resp);
      if (resp.status === 200) {
        // this.setState({
        //   articleList: resp.data
        // });
        articleStore.setArticle(resp.data);
      }
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

  handleSearch(key) {
    console.log('Handle search.', key, articleStore.filteredArticle);
    articleStore.setKeywords(key);
  }

  getTitle(text) {
    console.log(text.length);
    console.log(text.indexOf('\n'));
    let limit = text.indexOf('\n');
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

  render() {
    const data = articleStore.filteredArticle;
    console.log(articleStore.filteredArticle);
    return (
      <div>
        <AutoComplete
          // dataSource={dataSource}
          style={{width: '100%'}}
          // onSelect={onSelect}
          onSearch={this.handleSearch.bind(this)}
          placeholder="搜索"
          allowClear={true}
        />
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item, num) => (
            <List.Item>
              <Link style={{textDecoration: 'none'}} to={'/post/' + item.id}>
                <List.Item.Meta
                  title={<div className="shadow">{this.getTitle(item.summary)}</div>}
                  description={
                    <div>
                      <b>{moment(item.timestamp).format('YYYY-MM-DD HH:mm')}</b> {this.getHundredTitle(item.summary)}
                    </div>}
                  style={{cursor: 'pointer'}}
                />
              </Link>
            </List.Item>
          )}
        />
      </div>
    );
  }
}

observer(Index);
observer(List);

export default Index;
