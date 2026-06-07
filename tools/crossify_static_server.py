from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"


class CrossifyHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        path_only = path.split("?", 1)[0].split("#", 1)[0]
        if path_only == "/" or path_only == "":
            return str(ROOT / "index.html")
        if path_only.startswith("/assets/"):
            return str(PUBLIC / path_only.lstrip("/"))
        return str(ROOT / path_only.lstrip("/"))

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", 5173), CrossifyHandler)
    print("Crossify local server: http://127.0.0.1:5173", flush=True)
    server.serve_forever()
