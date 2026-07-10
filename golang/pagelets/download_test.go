package pagelets_test

import (
	"net/http/httptest"
	"testing"
)
import "github.com/packaged-ui/pagelets/golang/pagelets"

func TestDownload(t *testing.T) {
	d := pagelets.NewDownload("report.csv", []byte("a,b,c"), "text/csv")

	assertEquals(t, `attachment; filename="report.csv"`, d.ContentDisposition())

	rec := httptest.NewRecorder()
	n, err := d.Write(rec)
	if err != nil {
		t.Fatal(err)
	}
	if n != 5 {
		t.Fatal("expected 5 bytes written, got ", n)
	}
	assertEquals(t, "text/csv", rec.Header().Get("Content-Type"))
	assertEquals(t, `attachment; filename="report.csv"`, rec.Header().Get("Content-Disposition"))
	assertEquals(t, "5", rec.Header().Get("Content-Length"))
	assertEquals(t, "a,b,c", rec.Body.String())
}

func TestDownloadDefaultContentType(t *testing.T) {
	d := pagelets.NewDownload("data.bin", []byte{0x00, 0x01, 0x02}, "")

	rec := httptest.NewRecorder()
	if _, err := d.Write(rec); err != nil {
		t.Fatal(err)
	}
	assertEquals(t, "application/octet-stream", rec.Header().Get("Content-Type"))
	assertEquals(t, "3", rec.Header().Get("Content-Length"))
}

func TestDownloadEscapesFilenameQuotes(t *testing.T) {
	d := pagelets.NewDownload(`quarterly "final".pdf`, []byte("x"), "application/pdf")
	assertEquals(t, `attachment; filename="quarterly \"final\".pdf"`, d.ContentDisposition())
}