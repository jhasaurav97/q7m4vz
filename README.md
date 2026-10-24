# WindScope — UK Wind Forecast Analysis

WindScope is a full-stack pilot dashboard for analysing national UK wind generation forecasts against actual generation. It is designed around the January 2026 day-ahead electricity procurement decision period.

> **Live application:** Deployment pending. This section must be updated with the verified Vercel application URL before assessment submission.

## What the application does

- Retrieves UK national wind actual-generation records from Elexon's BMRS `FUELHH` dataset, filtered to `fuelType=WIND`.
- Retrieves forecast versions from Elexon's BMRS `WINDFOR` dataset, preserving each forecast's `publishTime`.
- Aggregates the two half-hourly actual observations into an hourly average so they can be compared with the hourly forecast.
- Matches forecast and actual records by UTC delivery `startTime`.
- Shows forecast accuracy metrics, hourly actual-versus-forecast trends, a paginated records table, and the forecast publication time used for each match.
- Reports the number of matched hours and coverage so missing observations are not silently treated as zero.

## Assessment scope and assumptions

The assessment requests data relevant to purchase decisions made in January 2026 and restricts the analysis to national UK wind generation from Elexon.

This implementation evaluates delivery hours from **2 January 2026 through 1 February 2026, inclusive**, corresponding to purchase-decision dates from **1 January through 31 January 2026**. The delivery window contains 744 expected hourly intervals.

The assessment does not specify an exact market gate-closure time. For the initial analysis, the application uses **09:50 Europe/London on the purchase-decision date** as an explicit day-ahead auction assumption. For each delivery hour, it selects the latest forecast published at or before that cutoff. This assumption should be confirmed with the intended market process if the product is extended beyond the pilot.

Actual generation is treated as hourly average power using both the :00 and :30 observations for the hour. An hour without both half-hourly observations is not included in the matched set.

## Accuracy metrics

Metrics are calculated only for hours with both an hourly actual value and an eligible forecast.

- **MAE (MW):** Mean absolute error between forecast and actual generation.
- **RMSE (MW):** Root mean squared error, which gives larger errors more weight.
- **WAPE (%):** Sum of absolute errors divided by the sum of absolute actual generation, multiplied by 100.
- **Matched intervals and coverage:** Count of matched hourly values and the share of 744 expected hours represented by those matches.

The signed error shown in the table is `forecast - actual`. A positive value means the forecast was higher than actual generation.

## Technology stack

- **Frontend:** React, Vite, Tailwind CSS, Recharts, Lucide React
- **Backend:** Python, FastAPI, HTTPX, Uvicorn
- **External data:** Elexon BMRS API
- **Containerization:** Dockerfiles and Docker Compose
- **Tests:** pytest

No Elexon API key is configured in the application; it requests the public BMRS endpoints used by this assessment.

## Repository structure

```text
.
├── backend/
│   ├── Dockerfile              # Container image for the FastAPI service
│   ├── main.py                 # Health, actuals, forecasts, and analysis endpoints
│   ├── analysis.py             # Timestamp handling, matching, cutoff selection, metrics
│   ├── requirements.txt        # Backend runtime dependencies
│   ├── requirements-dev.txt    # Runtime requirements plus pytest
│   ├── .dockerignore           # Excludes local Python files from the image
│   └── test/
│       └── test_analysis.py    # Analysis logic tests
├── frontend/
│   ├── Dockerfile              # Container image for the Vite frontend
│   ├── package.json            # Frontend scripts and dependencies
│   ├── package-lock.json       # Locked npm dependency versions
│   ├── vite.config.js          # Vite and Tailwind plugin configuration
│   ├── index.html               # Browser entry HTML
│   ├── public/                  # Static public assets
│   └── src/
│       ├── api/analysis.js      # Fetches the backend analysis response
│       ├── components/          # Dashboard sections and reusable UI
│       ├── App.jsx              # Loads analysis and assembles the dashboard
│       ├── index.css            # Global styles and Tailwind import
│       └── main.jsx             # React entry point
├── docker-compose.yml           # Runs frontend and backend containers together
└── .gitignore                   # Excludes local dependencies and environment files
```

## Run with Docker Compose

Docker Engine / Docker Desktop must be available to run the containers locally. The images can also be built by a remote deployment platform from the Dockerfiles, without installing Docker Desktop on the development laptop.

From the repository root:

```bash
docker compose up --build
```

Then open:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:8000/health
- Interactive API documentation: http://localhost:8000/docs
- Analysis endpoint: http://localhost:8000/api/analysis

Stop the containers with `Ctrl+C`. To remove the Compose containers, run:

```bash
docker compose down
```

## Run locally without Docker

### Backend

Python 3.12 or compatible is recommended.

From the repository root:

```bash
cd backend
python -m venv .venv
```

Activate the environment:

**Windows PowerShell**
```powershell
.venv\\Scripts\\Activate.ps1
```

**Git Bash**
```bash
source .venv/Scripts/activate
```

Install runtime dependencies and start the API:

```bash
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Frontend

Open a second terminal from the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173. By default, the frontend requests the backend at `http://127.0.0.1:8000`.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/actuals` | Actual FUELHH wind records in the delivery window |
| GET | `/api/forecasts` | WINDFOR forecast records in the delivery window |
| GET | `/api/analysis` | Matched records, accuracy metrics, assumptions, and data-quality counts |

The analysis endpoint fetches actuals and forecast records concurrently. The frontend calls this endpoint and uses the response for its metric cards, chart, and table.

## Configuration for deployment

- `VITE_API_BASE_URL`: Frontend build-time variable pointing to the deployed backend base URL (for example, the Render service URL). Do not leave it set to localhost in the deployed frontend.
- `FRONTEND_ORIGINS`: Comma-separated allowed browser origins for the backend CORS configuration. Set it to the deployed Vercel origin; retain `http://localhost:5173` for local development if needed.

Never commit secret keys or local `.env` files.

## Run tests

From the repository root:

```bash
cd backend
python -m pip install -r requirements-dev.txt
python -m pytest -q
```

The tests cover forecast cutoff selection, hourly aggregation, metrics, and the empty-data case.

## Data source documentation

- [Elexon FUELHH actual-generation endpoint](https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream)
- [Elexon WINDFOR forecast endpoint](https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/WINDFOR/stream)

## AI-tool disclosure

AI tools (including ChatGPT) were used to assist with implementation guidance, code drafting, debugging, and documentation. The implementation was run and tested during development; the author remains responsible for reviewing the analysis assumptions, verifying deployment behavior, and validating the final submission.

## Submission checklist

Before submitting the assessment:

- [ ] Deploy the application and replace the pending live-application note above with the verified Vercel URL.
- [ ] Verify the deployed frontend and backend endpoints in a private/incognito browser session.
- [ ] Record and upload the unlisted YouTube video, keeping both the customer-facing demo and technical review within the assessment's 10-minute total limit.
- [ ] Re-check this README, repository visibility, deployment link, and video link before completing the submission form.
