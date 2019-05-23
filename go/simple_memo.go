package main

import (
	"encoding/json"
	"fmt"
	"github.com/valyala/fasthttp"
	"io/ioutil"
	"os"
	"sort"
	"strings"
)

const (
	FasthttpAddr       = ":8083"
	RouteArticleList   = "/list"
	RouteGetArticle    = "/get"
	RoutePostArticle   = "/post"
	RouteCreateArticle = "/create"
	ContentTypeJson    = "application/json"
	MarkdownSeparator  = "<article summary separator>"
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

type ArticlePointArray []*Article

func (c ArticlePointArray) Len() int {
	return len(c)
}
func (c ArticlePointArray) Swap(i, j int) {
	c[i], c[j] = c[j], c[i]
}
func (c ArticlePointArray) Less(i, j int) bool {
	return c[i].Timestamp > c[j].Timestamp
}

var ArticleList ArticlePointArray
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
		case RouteCreateArticle:
			createArticle(c)
		default:
			c.SetStatusCode(401)
			c.WriteString("Unrecognized request.")
		}
	}
	fasthttp.ListenAndServe(FasthttpAddr, firstHandler)
}

func createArticle(c *fasthttp.RequestCtx) {
	if string(c.Method()) == "OPTIONS" {
		c.SetStatusCode(204)
		c.Response.Header.Set("access-control-allow-headers", "content-type")
		return
	}
	t := new(struct {
		Id string `json:"id"`
	})
	if err := json.Unmarshal(c.PostBody(), t); err != nil {
		c.SetStatusCode(fasthttp.StatusInternalServerError)
		DebugPrintln(err)
	}
	articleId := t.Id
	if len(articleId) < 1 {
		c.SetStatusCode(400)
		c.WriteString("article id invalid")
		return
	}
	filename := "article/" + articleId + ".md"
	if canCreateFile(filename) {
		a := new(Article)
		a.Id = articleId
		a.Summary = articleId
		a.Markdown = "# " + articleId + "\n"
		err := ioutil.WriteFile(filename, []byte(a.Markdown+MarkdownSeparator+a.Summary), os.ModePerm)
		if err != nil {
			DebugPrintln("[error] can't write file err msg:", err)
			c.SetStatusCode(fasthttp.StatusInternalServerError)
			return
		}
		fi, err := os.Stat(filename)
		if err != nil {
			c.SetStatusCode(fasthttp.StatusInternalServerError)
			DebugPrintln(err)
			return
		}
		a.Timestamp = fi.ModTime().UnixNano() / 1e6
		ArticleMap[articleId] = a
		ArticleList = append(ArticleList, a)
		sort.Sort(ArticleList)
		c.SetStatusCode(fasthttp.StatusOK)
		c.WriteString("success")
	} else {
		c.SetStatusCode(fasthttp.StatusOK)
		c.WriteString("existed")
		return
	}
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
	t, ok := ArticleMap[upload.Id]
	if !ok {
		c.SetStatusCode(fasthttp.StatusInternalServerError)
		DebugPrintln("can't find article in map, id:", upload.Id)
		return
	}
	bytes := []byte(upload.Md + MarkdownSeparator + upload.Sum)
	filename := "article/" + upload.Id + ".md"
	if err := ioutil.WriteFile(filename, bytes, os.ModePerm); err != nil {
		c.SetStatusCode(fasthttp.StatusInternalServerError)
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
	sort.Sort(ArticleList)
	c.WriteString("success")
}

func getArticle(c *fasthttp.RequestCtx) {
	articleId := string(c.QueryArgs().Peek("id"))
	DebugPrintln("article id:", articleId)
	article, ok := ArticleMap[articleId]
	if !ok {
		c.SetStatusCode(fasthttp.StatusNotFound)
		return
	}
	json.NewEncoder(c).Encode(article.Markdown)
}

func scanArticleDir() {
	ArticleList = *new(ArticlePointArray)
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
	sort.Sort(ArticleList)
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
	// Set summary length limit.
	if len(summary) > 200 {
		summary = summary[:200]
	}
	return
}

func getArticleList(c *fasthttp.RequestCtx) {
	c.SetContentType(ContentTypeJson)
	json.NewEncoder(c).Encode(ArticleList)
}

func canCreateFile(filename string) bool {
	_, err := os.Stat(filename)
	if err != nil {
		if os.IsNotExist(err) {
			// path is not existed
			return true
		} else {
			// unknown error
			return false
		}
	}
	return false
}
