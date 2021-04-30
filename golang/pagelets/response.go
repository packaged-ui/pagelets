package pagelets

import "encoding/json"

type Response struct {
	Actions []PageletAction `json:"actions,omitempty"`
}

func (r *Response) ClearActions() {
	r.Actions = []PageletAction{}
}

func (r *Response) AddAction(action PageletAction) {
	r.Actions = append(r.Actions, action.PrepareForResponse())
}

func (r Response) String() string {
	jsonBytes, _ := json.Marshal(r)
	return ")]}" + string(jsonBytes)
}

type BaseAction struct {
	Action string `json:"action"`
}

type PageletAction interface {
	PrepareForResponse() PageletAction
}

type PageletContent struct {
	Content string `json:"content"`
	Target  string `json:"target"`
	BaseAction
}

func (p PageletContent) PrepareForResponse() PageletAction { p.Action = "content"; return p }

type PageletLoad struct {
	Target string `json:"target"`
	Url    string `json:"url"`
	BaseAction
}

func (p PageletLoad) PrepareForResponse() PageletAction { p.Action = "load"; return p }

type PageletLocation struct {
	Url     string `json:"url"`
	Replace bool   `json:"replace"`
	Reload  bool   `json:"reload"`
	BaseAction
}

func (p PageletLocation) PrepareForResponse() PageletAction { p.Action = "location"; return p }

type PageletLog struct {
	Message string `json:"message"`
	Level   string `json:"level"`
	BaseAction
}

func (p PageletLog) PrepareForResponse() PageletAction { p.Action = "log"; return p }

type PageletRefresh struct {
	Target string `json:"target"`
	BaseAction
}

func (p PageletRefresh) PrepareForResponse() PageletAction { p.Action = "refresh"; return p }

type PageletResourceType string

const (
	PageletResourceTypeCss PageletResourceType = "css"
	PageletResourceTypeJs  PageletResourceType = "js"
)

type PageletResource struct {
	Type   PageletResourceType `json:"type"`
	Data   string              `json:"data"`
	Inline bool                `json:"inline"`
	BaseAction
}

func (p PageletResource) PrepareForResponse() PageletAction { p.Action = "resource"; return p }
