import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../markdown.css';
import {Button, Modal, Affix, message} from 'antd';
import ReactMde from 'react-mde';
import "react-mde/lib/styles/css/react-mde-all.css";
import axios from 'axios';

// const APP_URL = 'http://192.168.50.78:8083';
// const APP_URL = 'http://localhost:8083';
const APP_URL = 'http://mv.piaoyu.org:8083';

class Article extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      confirmLoading: false,
      markdownSrc: ''
    };

    const articleId = props.match && props.match.params && props.match.params.postId;
    console.log(articleId);
    this.articleId = articleId;
    if (articleId) {
      // 兼容 IE11
      document.title = articleId;
      let id = window.encodeURI(articleId);
      axios.get(APP_URL + '/get?id=' + id).then((resp) => {
        if (resp.status === 200) {
          this.setState({markdownSrc: resp.data});
        }
      }).catch(err => {
        message.error('文章获取失败 ' + err);
      });
    }
    this.editorHeight = window.innerHeight * 0.75;
  }

  getMarkdownText() {
    return document.getElementById('markdown_area').innerText;
  }

  onClick() {
    console.log(this.getMarkdownText());
  }

  onEditClick() {
    this.setState({modalVisible: true});
  }

  handleOk() {
    this.setState({confirmLoading: true});
    axios.post(APP_URL + '/post',
      {md: this.state.markdownSrc, sum: this.getMarkdownText(), id: this.articleId}
    ).then((resp) => {
      if (resp.status === 200) {
        this.setState({confirmLoading: false, modalVisible: false});
        message.success('保存成功!');
      }
    }).catch((error) => {
      console.log(error);
      this.setState({confirmLoading: false});
      message.error('保存失败 ' + error);
    });
  }

  handleCancel() {
    console.log('cancel');
    this.setState({modalVisible: false});
  }

  handleValueChange(value) {
    this.setState({markdownSrc: value});
  }

  render() {
    const {modalVisible, confirmLoading, markdownSrc} = this.state;
    return (
      <div>
        <div id="markdown_area">
          <ReactMarkdown source={markdownSrc}/>
        </div>
        <div>
          <Modal
            width={'100%'} style={{maxWidth: '100%', top: '0', margin: 0}} bodyStyle={{padding: '5px'}}
            title="Markdown editor"
            visible={modalVisible}
            onOk={this.handleOk.bind(this)} okText={'保存'}
            confirmLoading={confirmLoading}
            onCancel={this.handleCancel.bind(this)} cancelText={'预览'}
          >
            <div>
              <ReactMde
                onChange={this.handleValueChange.bind(this)}
                value={markdownSrc}
                minEditorHeight={this.editorHeight + 'px'}
              />
            </div>
          </Modal>
        </div>
        <Affix style={{position: 'fixed', bottom: '10px'}}>
          <Button style={{marginRight: '10px'}} type="primary"
                  onClick={this.onEditClick.bind(this)} shape="circle" icon="edit" size="default"/>
          {/*<Button type="danger" shape="circle" icon="delete" size="default"/>*/}
        </Affix>
      </div>
    );
  }
}

export default Article;
