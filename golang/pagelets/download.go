package pagelets

import (
	"net/http"
	"strconv"
	"strings"
)

// DefaultDownloadContentType is used when a Download has no explicit content type.
const DefaultDownloadContentType = "application/octet-stream"

// Download represents a file streamed to the browser as an attachment. The
// pagelets client library detects the Content-Disposition header and performs
// a binary-safe download instead of processing the response as a pagelet, so
// the server only needs to send the file with the correct headers.
type Download struct {
	Filename    string
	ContentType string
	Data        []byte
}

// NewDownload builds a Download. When contentType is empty,
// DefaultDownloadContentType is used.
func NewDownload(filename string, data []byte, contentType string) Download {
	return Download{Filename: filename, Data: data, ContentType: contentType}
}

func (d Download) contentType() string {
	if d.ContentType == "" {
		return DefaultDownloadContentType
	}
	return d.ContentType
}

// ContentDisposition returns the Content-Disposition header value that marks the
// response as an attachment with the given filename.
func (d Download) ContentDisposition() string {
	escaped := strings.NewReplacer(`\`, `\\`, `"`, `\"`).Replace(d.Filename)
	return `attachment; filename="` + escaped + `"`
}

// ApplyHeaders sets the headers required for the client to treat the response as
// a download.
func (d Download) ApplyHeaders(h http.Header) {
	h.Set("Content-Type", d.contentType())
	h.Set("Content-Disposition", d.ContentDisposition())
	h.Set("Content-Length", strconv.Itoa(len(d.Data)))
}

// Write sends the download to the client: the headers followed by the body.
func (d Download) Write(w http.ResponseWriter) (int, error) {
	d.ApplyHeaders(w.Header())
	return w.Write(d.Data)
}