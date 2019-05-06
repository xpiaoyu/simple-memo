import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../markdown.css';
import {Button, Modal, Affix} from 'antd';
import ReactMde from 'react-mde';
import "react-mde/lib/styles/css/react-mde-all.css";
import axios from 'axios';

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
    if (articleId) {
      axios.get('http://localhost:8083/getArticle?id=' + articleId).then((resp) => {
        if (resp.status === 200) {
          this.setState({markdownSrc: resp.data});
        }
      });
    }
    this.editorHeight = window.innerHeight * 0.8;
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
    this.setState({modalVisible: false});
  }

  handleCancel() {
    console.log('cancel');
    this.setState({modalVisible: false});
  }

  handleValueChange(value) {
    this.setState({markdownSrc: value})
  }

  render() {
    const {modalVisible, confirmLoading, markdownSrc} = this.state;
    return (
      <div>
        <div>
          <Affix offsetTop={20}>
            <Button style={{marginRight: '20px'}} type="default"
                    onClick={this.onEditClick.bind(this)} shape="circle" icon="edit" size="large"/>
            <Button type="danger" shape="circle" icon="delete" size="large"/>
          </Affix>
        </div>
        <div id="markdown_area">
          <ReactMarkdown source={markdownSrc}/>
        </div>
        <div>
          <Modal
            width={'100%'} style={{maxWidth: '100%', top: '0'}} bodyStyle={{padding: '5px'}}
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
      </div>
    );
  }
}

export default Article;
