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
	RouteGetArticle   = "/get"
	RoutePostArticle  = "/post"
	ContentTypeJson   = "application/json"
	MarkdownSeparator = "<article summary separator>"
)

type Article struct {
	Id        string `json:"id"`
	Summary   string `json:"summary"`
	Markdown  string `json:"-"`
	Timestamp int64  `json:"timestamp"`
}

type UploadPost struct {
	Md  string `json:"md"`
	Sum string `json:"sum"`
	Id  string `json:"id"`
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
		case RoutePostArticle:
			postArticle(c)
		default:
			c.SetStatusCode(401)
			c.WriteString("Unrecognized request.")
		}
	}
	fasthttp.ListenAndServe(FasthttpAddr, firstHandler)
}

func postArticle(c *fasthttp.RequestCtx) {
	if string(c.Method()) == "OPTIONS" {
		c.SetStatusCode(204)
		c.Response.Header.Set("access-control-allow-headers", "content-type")
		return
	}
	//markdown := string(c.PostArgs().Peek("md"))
	//summary := string(c.PostArgs().Peek("sum"))
	//body := string(c.PostBody())
	upload := new(UploadPost)
	err := json.Unmarshal(c.PostBody(), upload)
	if err != nil {
		c.SetStatusCode(400)
		return
	}
	DebugPrintln(upload.Md, upload.Sum)

	bytes := []byte(upload.Md + MarkdownSeparator + upload.Sum)
	filename := "article/" + upload.Id + ".md"
	if err := ioutil.WriteFile(filename, bytes, os.ModePerm); err != nil {
		c.SetStatusCode(fasthttp.StatusInternalServerError)
		return
	}
	t, ok := ArticleMap[upload.Id]
	if !ok {
		c.SetStatusCode(fasthttp.StatusInternalServerError)
		DebugPrintln("can't find article in map, id:", upload.Id)
		return
	}
	t.Id = upload.Id
	t.Markdown = upload.Md
	t.Summary = upload.Sum
	fi, err := os.Stat(filename)
	if err != nil {
		c.SetStatusCode(fasthttp.StatusInternalServerError)
		DebugPrintln(err)
		return
	}
	t.Timestamp = fi.ModTime().UnixNano() / 1e6
	c.WriteString("success")
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
	ArticleList = make([]*Article, 0)
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
