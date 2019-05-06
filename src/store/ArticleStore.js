import {decorate, observable, computed, autorun} from 'mobx';

class ArticleStore {
  constructor() {
    this.articleList = [];
    this.keywords = '';
    autorun(() => {
      this.articleList.forEach((item) => console.log(item.timestamp));
    });
  }

  setKeywords(k) {
    this.keywords = k;
  }

  setArticle(articleList) {
    this.articleList = articleList;
  }

  getArticleById(id) {
    this.articleList.forEach((item) => {
      if (item.id === id) {
        return item;
      }
    });
  }

  get filteredArticle() {
    console.log('filtered', this.articleList);
    return this.articleList.filter((item) => item.summary.toLowerCase().indexOf(this.keywords.toLowerCase()) > -1);
  }
}


decorate(ArticleStore, {
  articleList: observable,
  keywords: observable,
  filteredArticle: computed
});

const articleStore = new ArticleStore();

export default articleStore;