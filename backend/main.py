import asyncio
import os
from datetime import timedelta

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from analysis import (
    DELIVERY_END,
    DELIVERY_START,
    build_analysis,
    is_delivery_in_scope,
    parse_datetime,
)

FRONTEND_ORIGINS = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:5173",
)

app = FastAPI(title="WindScope API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in FRONTEND_ORIGINS.split(",")
        if origin.strip()
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)

ELEXON_BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1"

FORECAST_PUBLISH_FROM = "2025-12-31T00:00:00Z"
FORECAST_PUBLISH_TO = "2026-01-31T09:50:00Z"


def get_actual_params():
    """Actual generation query for the delivery dates in scope."""
    return {
        "settlementDateFrom": DELIVERY_START.date().isoformat(),
        "settlementDateTo": (
            DELIVERY_END - timedelta(days=1)
        ).date().isoformat(),
        "fuelType": "WIND",
    }


def get_forecast_params():
    """Publication-time window for historical forecast versions."""
    return {
        "publishDateTimeFrom": FORECAST_PUBLISH_FROM,
        "publishDateTimeTo": FORECAST_PUBLISH_TO,
    }


async def fetch_elexon_records(client, url, params):
    """Fetch and validate a list of records from Elexon."""
    try:
        response = await client.get(url, params=params)
        response.raise_for_status()
        records = response.json()

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Elexon returned HTTP {exc.response.status_code}.",
        ) from exc

    except (httpx.RequestError, ValueError) as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not fetch valid data from Elexon.",
        ) from exc

    if not isinstance(records, list):
        raise HTTPException(
            status_code=502,
            detail="Unexpected Elexon response format.",
        )

    return records


def filter_delivery_window(records):
    """Retain records whose delivery timestamps are in scope."""
    filtered = []

    for record in records:
        if not isinstance(record, dict):
            continue

        delivery = parse_datetime(record.get("startTime"))

        if is_delivery_in_scope(delivery):
            filtered.append(record)

    return filtered


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/api/actuals")
async def get_actual_generation():
    url = f"{ELEXON_BASE_URL}/datasets/FUELHH/stream"
    params = get_actual_params()

    async with httpx.AsyncClient(timeout=60.0) as client:
        records = await fetch_elexon_records(client, url, params)

    data = filter_delivery_window(records)

    return {
        "source": "Elexon BMRS FUELHH",
        "decisionPeriod": "January 2026",
        "deliveryPeriod": "2026-01-02 to 2026-02-01 (inclusive)",
        "fuelType": "WIND",
        "count": len(data),
        "data": data,
    }


@app.get("/api/forecasts")
async def get_forecast_generation():
    url = f"{ELEXON_BASE_URL}/datasets/WINDFOR/stream"
    params = get_forecast_params()

    async with httpx.AsyncClient(timeout=60.0) as client:
        records = await fetch_elexon_records(client, url, params)

    data = filter_delivery_window(records)

    return {
        "source": "Elexon BMRS WINDFOR",
        "decisionPeriod": "January 2026",
        "deliveryPeriod": "2026-01-02 to 2026-02-01 (inclusive)",
        "publicationWindow": {
            "from": FORECAST_PUBLISH_FROM,
            "to": FORECAST_PUBLISH_TO,
        },
        "count": len(data),
        "data": data,
    }


@app.get("/api/analysis")
async def get_wind_analysis():
    actual_url = f"{ELEXON_BASE_URL}/datasets/FUELHH/stream"
    forecast_url = f"{ELEXON_BASE_URL}/datasets/WINDFOR/stream"

    actual_params = get_actual_params()
    forecast_params = get_forecast_params()

    async with httpx.AsyncClient(timeout=60.0) as client:
        actual_records, forecast_records = await asyncio.gather(
            fetch_elexon_records(
                client,
                actual_url,
                actual_params,
            ),
            fetch_elexon_records(
                client,
                forecast_url,
                forecast_params,
            ),
        )

    return build_analysis(actual_records, forecast_records)