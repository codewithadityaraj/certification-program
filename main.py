import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import FastAPI, Query
from fastapi.responses import FileResponse, JSONResponse, Response

BASE_DIR = Path(__file__).resolve().parent
app = FastAPI(title="Certification Program Dashboard")

SHEET_URLS = {
    "fullPaymentCohort": "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBGYVm4WeDri55fxkXbFKVPRw4f7oIDtM3SySzIhh8MdkVU1-h2G-FoZwDvzdhJPcWlQPiUGSNNKmn/pub?gid=330939970&single=true&output=csv",
    "fullPaymentMonthly": "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBGYVm4WeDri55fxkXbFKVPRw4f7oIDtM3SySzIhh8MdkVU1-h2G-FoZwDvzdhJPcWlQPiUGSNNKmn/pub?gid=1529421032&single=true&output=csv",
    "tlCohort": "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBGYVm4WeDri55fxkXbFKVPRw4f7oIDtM3SySzIhh8MdkVU1-h2G-FoZwDvzdhJPcWlQPiUGSNNKmn/pub?gid=1379419762&single=true&output=csv",
    "tlMonthly": "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBGYVm4WeDri55fxkXbFKVPRw4f7oIDtM3SySzIhh8MdkVU1-h2G-FoZwDvzdhJPcWlQPiUGSNNKmn/pub?gid=1253162755&single=true&output=csv",
    "gmCohort": "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBGYVm4WeDri55fxkXbFKVPRw4f7oIDtM3SySzIhh8MdkVU1-h2G-FoZwDvzdhJPcWlQPiUGSNNKmn/pub?gid=2126600034&single=true&output=csv",
    "gmMonthly": "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBGYVm4WeDri55fxkXbFKVPRw4f7oIDtM3SySzIhh8MdkVU1-h2G-FoZwDvzdhJPcWlQPiUGSNNKmn/pub?gid=1449154150&single=true&output=csv",
    "bdaCohort": "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBGYVm4WeDri55fxkXbFKVPRw4f7oIDtM3SySzIhh8MdkVU1-h2G-FoZwDvzdhJPcWlQPiUGSNNKmn/pub?gid=1772864628&single=true&output=csv",
    "bdaMonthly": "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBGYVm4WeDri55fxkXbFKVPRw4f7oIDtM3SySzIhh8MdkVU1-h2G-FoZwDvzdhJPcWlQPiUGSNNKmn/pub?gid=1803907168&single=true&output=csv",
}

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
}


def fetch_sheet_csv(sheet_key: str) -> tuple[int, dict]:
    if not sheet_key or sheet_key not in SHEET_URLS:
        return 400, {"error": "Invalid or missing sheet key"}

    req = Request(
        SHEET_URLS[sheet_key],
        headers={"User-Agent": "LocalDashboard/1.0"},
    )
    try:
        with urlopen(req, timeout=30) as response:
            csv_text = response.read().decode("utf-8-sig")
        return 200, {"sheet": sheet_key, "csv": csv_text}
    except HTTPError as err:
        return err.code, {"error": f"Upstream error {err.code}"}
    except URLError as err:
        return 502, {"error": str(err.reason)}
    except Exception as err:
        return 500, {"error": str(err)}


@app.options("/.netlify/functions/sheets")
@app.options("/api/sheets")
def sheets_options():
    return Response(status_code=204, headers=CORS_HEADERS)


@app.get("/.netlify/functions/sheets")
@app.get("/api/sheets")
def sheets_proxy(sheet: str = Query(...)):
    status, body = fetch_sheet_csv(sheet)
    headers = {**CORS_HEADERS, "Content-Type": "application/json"}
    return JSONResponse(status_code=status, content=body, headers=headers)


@app.get("/")
def read_dashboard() -> FileResponse:
    return FileResponse(BASE_DIR / "index.html")


@app.get("/{file_path:path}")
def read_static_file(file_path: str):
    if file_path.startswith(".netlify/") or file_path.startswith("api/sheets"):
        return JSONResponse(status_code=404, content={"error": "Not found"})

    requested = (BASE_DIR / file_path).resolve()
    if requested.is_file() and requested.parent == BASE_DIR:
        return FileResponse(requested)
    return FileResponse(BASE_DIR / "index.html")
