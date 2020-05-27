package pagelets

func (r *Response) AddCssResource(res string) {
	if r.Resources == nil {
		r.Resources = &Resource{}
	}
	r.Resources.StyleSheets = append(r.Resources.StyleSheets, res)
}

func (r *Response) AddJsResource(res string) {
	if r.Resources == nil {
		r.Resources = &Resource{}
	}
	r.Resources.JavaScript = append(r.Resources.JavaScript, res)
}

func (r *Response) SetContent(content, target string) {
	if r.Content == nil {
		r.Content = map[string]string{}
	}
	r.Content[target] = content
}

func (r *Response) AddPageletReload(target, url string) {
	if r.ReloadPagelet == nil {
		r.ReloadPagelet = map[string]string{}
	}
	r.ReloadPagelet[target] = url
}

func (r *Response) SetLocation(url string, replaceHistory bool, reloadWindow bool) {
	r.Location = &Location{Url: url, ReplaceHistory: replaceHistory, ReloadWindow: reloadWindow}
}

func (r *Response) Redirect(url string) {
	r.SetLocation(url, false, true)
}

func (r *Response) SetMeta(key string, value interface{}) {
	if r.Meta == nil {
		r.Meta = map[string]interface{}{}
	}
	r.Meta[key] = value
}
