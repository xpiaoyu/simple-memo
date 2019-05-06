package main

import (
	"github.com/valyala/fasthttp"
	"io/ioutil"
	"os"
	"strings"
	"fmt"
	"encoding/json"
)

const (
	FasthttpAddr      = ":8083"
	RouteArticleList  = "/list"
	RouteGetArticle   = "/getArticle"
	ContentTypeJson   = "application/json"
	MarkdownSeparator = "<article summary separator>"
)

type Article struct {
	Id        string `json:"id"`
	Summary   string `json:"summary"`
	Markdown  string `json:"-"`
	Timestamp int64  `json:"timestamp"`
}

var ArticleList []*Article
var ArticleMap map[string]*Article

func main() {
	ArticleMap = make(map[string]*Article)
	scanArticleDir()
	firstHandler := func(c *fasthttp.RequestCtx) {
		c.Response.Header.Add("Access-Control-Allow-Origin", "*")
		switch string(c.Path()) {
		case RouteArticleList:
			getArticleList(c)
		case RouteGetArticle:
			getArticle(c)
		default:
			c.SetStatusCode(401)
			c.WriteString("Unrecognized request.")
		}
	}
	fasthttp.ListenAndServe(FasthttpAddr, firstHandler)
}

func getArticle(c *fasthttp.RequestCtx) {
	articleId := string(c.QueryArgs().Peek("id"))
	article, ok := ArticleMap[articleId]
	if !ok {
		c.SetStatusCode(fasthttp.StatusNotFound)
		return
	}
	json.NewEncoder(c).Encode(article.Markdown)
}

func scanArticleDir() {
	files, err := ioutil.ReadDir("article")
	if err != nil {
		DebugPrintln("[error] ioutil.ReadDir failed err:", err)
		os.Exit(1)
	}
	for _, v := range files {
		if strings.HasSuffix(v.Name(), ".md") {
			DebugPrintln("Article name:", v.Name())
			t := new(Article)
			t.Id = strings.Replace(v.Name(), ".md", "", -1)
			if len(t.Id) < 1 {
				DebugPrintln("[error] article id length invalid")
				os.Exit(1)
			}
			t.Timestamp = v.ModTime().UnixNano() / 1e6
			md, sum, err := getSummaryAndMarkdown("article/" + v.Name())
			if err != nil {
				DebugPrintln("[error] getSummaryAndMarkdown err:", err)
				os.Exit(1)
			}
			t.Markdown = md
			t.Summary = sum
			ArticleList = append(ArticleList, t)
			ArticleMap[t.Id] = t
		}
	}
	DebugPrintln("scan article directory successfully")
	return
}

func getSummaryAndMarkdown(filename string) (markdown, summary string, err error) {
	bytes, err := ioutil.ReadFile(filename)
	if err != nil {
		return
	}
	results := strings.Split(string(bytes), MarkdownSeparator)
	if len(results) != 2 {
		err = fmt.Errorf("can't find MarkdownSeparator: %s", MarkdownSeparator)
		return
	}
	markdown = results[0]
	summary = strings.TrimSpace(results[1])
	return
}

func getArticleList(c *fasthttp.RequestCtx) {
	c.SetContentType(ContentTypeJson)
	json.NewEncoder(c).Encode(ArticleList)
}
