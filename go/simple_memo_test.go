package main

import (
	"testing"
	"fmt"
	"gopkg.in/russross/blackfriday.v2"
)

func Test_getSummaryAndMarkdown(t *testing.T) {
	md, sum, err := getSummaryAndMarkdown("article/first_article.md")
	fmt.Println("md:", md)
	fmt.Println("sum:", sum)
	fmt.Println("err:", err)
	output := blackfriday.Run([]byte(md), blackfriday.WithNoExtensions())
	fmt.Println(string(output))
}
