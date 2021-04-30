package pagelets_test

import (
	"testing"
)
import "github.com/packaged-ui/pagelets/golang/pagelets"

func TestPagelet(t *testing.T) {
	response := pagelets.Response{}
	assertEquals(t, "{}", response.String())

	response.AddCssResource("/my.css")
	assertEquals(t, `{"actions":[{"type":"css","data":"/my.css","inline":false,"action":"resource"}]}`, response.String())

	response.AddJsResource("/my.js")
	assertEquals(t, `{"actions":[{"type":"css","data":"/my.css","inline":false,"action":"resource"},{"type":"js","data":"/my.js","inline":false,"action":"resource"}]}`, response.String())

	response.SetContent("<div>my content</div>", "")
	assertEquals(t, `{"actions":[{"type":"css","data":"/my.css","inline":false,"action":"resource"},{"type":"js","data":"/my.js","inline":false,"action":"resource"},{"content":"\u003cdiv\u003emy content\u003c/div\u003e","target":"","action":"content"}]}`, response.String())

	response.ClearActions()
	response.AddPageletReload("#my-page", "/new-url")
	assertEquals(t, `{"actions":[{"target":"#my-page","url":"/new-url","action":"load"}]}`, response.String())

	response.ClearActions()
	response.AddPageletReload("#my-page2", "/new-url2")
	assertEquals(t, `{"actions":[{"target":"#my-page2","url":"/new-url2","action":"load"}]}`, response.String())

	response.ClearActions()
	response.SetLocation("/new-location", true, false)
	assertEquals(t, `{"actions":[{"url":"/new-location","replace":true,"reload":false,"action":"location"}]}`, response.String())

	response.ClearActions()
	response.Redirect("/reload-page")
	assertEquals(t, `{"actions":[{"url":"/reload-page","replace":false,"reload":true,"action":"location"}]}`, response.String())
}

func assertEquals(t *testing.T, expected, actual string) {
	if actual != expected && actual != ")]}"+expected {
		t.Fatal("Expected ", expected, "\nactual ", actual)
	}
}
