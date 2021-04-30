package pagelets

func (r *Response) AddCssResource(res string) {
	r.AddAction(PageletResource{Type: PageletResourceTypeCss, Data: res})
}

func (r *Response) AddJsResource(res string) {
	r.AddAction(PageletResource{Type: PageletResourceTypeJs, Data: res})
}

func (r *Response) SetContent(content, target string) {
	r.AddAction(PageletContent{Target: target, Content: content})
}

func (r *Response) AddPageletReload(target, url string) {
	r.AddAction(PageletLoad{Url: url, Target: target})
}

func (r *Response) SetLocation(url string, replaceHistory bool, reloadWindow bool) {
	r.AddAction(PageletLocation{Url: url, Replace: replaceHistory, Reload: reloadWindow})
}

func (r *Response) Redirect(url string) {
	r.SetLocation(url, false, true)
}

func (r *Response) SetMeta(message, level string) {
	if level == "" {
		level = "log"
	}
	r.AddAction(PageletLog{Message: message, Level: level})
}
