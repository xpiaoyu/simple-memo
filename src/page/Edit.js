import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../markdown.css';

class Article extends React.Component {
  constructor(props) {
    super(props);
    this.markdownSrc = `
# EIS Component 开发学习

### TrainingIntegrationInterfaceComponent 解析

1. 执行 \`ComponentInfo load(componentLoadInfo, instanceToBeLoaded)\` 这一步会创建一个 dto，并复制 metadata 到新建的 dto 中。

2. 加载 component view 时，执行 \`Object getViewModel(ComponentInfo runtimeInstance, List<ComponentInfo> dependencies, ViewType viewType)\`，将内部的 service 传入 dto 中。

3. 在 training-integration-interface-component-beans.xml 中，定义了创建 Bean 的一些参数和依赖。

注： 

1. dto 是拥有业务逻辑的 entity，view.xhtml 中引用的 \`#{model.xxx}\` 都是 entity 和 dto 中的属性。
2. Rules 中的部分函数可以到 \`BusinessRulesUtils\` 中查找。

--------

| Feature   | Support |
| --------- | ------- |
| tables    | ✔ |
| alignment | ✔ |
| wewt      | ✔ |
`;
  }


  render() {
    console.log(this.props);
    return (
      <div>
        <div id="markdown_area">
          <ReactMarkdown source={this.markdownSrc}/>
        </div>
        <button onClick={this.onClick.bind(this)}>Print text</button>
      </div>
    );
  }
}

export default Article;
