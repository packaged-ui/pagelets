package pagelets_test

import (
	"testing"
)
import "github.com/packaged-ui/pagelets/golang/pagelets"

func TestPagelet(t *testing.T) {
	response := pagelets.Response{}
	assertEquals(t, "{}", response.String())

	response.AddCssResource("/my.css")
	assertEquals(t, `{"resources":{"css":["/my.css"]}}`, response.String())

	response.AddJsResource("/my.js")
	assertEquals(t, `{"resources":{"css":["/my.css"],"js":["/my.js"]}}`, response.String())

	response.SetContent("<div>my content</div>", "")
	assertEquals(t, `{"resources":{"css":["/my.css"],"js":["/my.js"]},"content":{"":"\u003cdiv\u003emy content\u003c/div\u003e"}}`, response.String())

	response.AddPageletReload("#my-page", "/new-url")
	assertEquals(t, `{"resources":{"css":["/my.css"],"js":["/my.js"]},"content":{"":"\u003cdiv\u003emy content\u003c/div\u003e"},"reloadPagelet":{"#my-page":"/new-url"}}`, response.String())

	response.AddPageletReload("#my-page2", "/new-url2")
	assertEquals(t, `{"resources":{"css":["/my.css"],"js":["/my.js"]},"content":{"":"\u003cdiv\u003emy content\u003c/div\u003e"},"reloadPagelet":{"#my-page":"/new-url","#my-page2":"/new-url2"}}`, response.String())

	response.SetLocation("/new-location", true, false)
	assertEquals(t, `{"resources":{"css":["/my.css"],"js":["/my.js"]},"content":{"":"\u003cdiv\u003emy content\u003c/div\u003e"},"reloadPagelet":{"#my-page":"/new-url","#my-page2":"/new-url2"},"location":{"url":"/new-location","replaceHistory":true,"reloadWindow":false}}`, response.String())

	response.Redirect("/reload-page")
	assertEquals(t, `{"resources":{"css":["/my.css"],"js":["/my.js"]},"content":{"":"\u003cdiv\u003emy content\u003c/div\u003e"},"reloadPagelet":{"#my-page":"/new-url","#my-page2":"/new-url2"},"location":{"url":"/reload-page","replaceHistory":false,"reloadWindow":true}}`, response.String())

	response.SetMeta("alert", map[string]string{"type": "warning", "message": "this is a warning"})
	assertEquals(t, `{"resources":{"css":["/my.css"],"js":["/my.js"]},"content":{"":"\u003cdiv\u003emy content\u003c/div\u003e"},"reloadPagelet":{"#my-page":"/new-url","#my-page2":"/new-url2"},"location":{"url":"/reload-page","replaceHistory":false,"reloadWindow":true},"meta":{"alert":{"message":"this is a warning","type":"warning"}}}`, response.String())
}

func assertEquals(t *testing.T, expected, actual string) {
	if actual != expected && actual != ")]}"+expected {
		t.Fatal("Expected ", expected, "\nactual ", actual)
	}
}
