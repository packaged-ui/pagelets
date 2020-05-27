package pagelets

import "encoding/json"

type Response struct {
	Resources     *Resource              `json:"resources,omitempty"`
	Content       map[string]string      `json:"content,omitempty"`
	ReloadPagelet map[string]string      `json:"reloadPagelet,omitempty"`
	Location      *Location              `json:"location,omitempty"`
	Meta          map[string]interface{} `json:"meta,omitempty"`
}

func (r Response) String() string {
	jsonBytes, _ := json.Marshal(r)
	return ")]}" + string(jsonBytes)
}

type Resource struct {
	StyleSheets []string `json:"css,omitempty"`
	JavaScript  []string `json:"js,omitempty"`
}

type Location struct {
	Url            string `json:"url"`
	ReplaceHistory bool   `json:"replaceHistory"`
	ReloadWindow   bool   `json:"reloadWindow"`
}
