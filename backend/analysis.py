from collections import defaultdict
from datetime import datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo
import math


UTC = timezone.utc
UK_TIMEZONE = ZoneInfo("Europe/London")

# Purchase decisions are made during January 2026.
# We evaluate the next day's electricity delivery.
DELIVERY_START = datetime(2026, 1, 2, tzinfo=UTC)
DELIVERY_END = datetime(2026, 2, 2, tzinfo=UTC)  # Exclusive

DECISION_CUTOFF = time(9, 50)

EXPECTED_HOURS = int(
    (DELIVERY_END - DELIVERY_START).total_seconds() / 3600
)


def parse_datetime(value):
    """Parse an ISO timestamp and normalize it to UTC."""
    if not isinstance(value, str) or not value:
        return None

    try:
        parsed = datetime.fromisoformat(
            value.replace("Z", "+00:00")
        )

        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=UTC)

        return parsed.astimezone(UTC)

    except (ValueError, TypeError):
        return None


def to_number(value):
    """Return a finite numeric value or None."""
    if value is None:
        return None

    try:
        number = float(value)
        return number if math.isfinite(number) else None

    except (TypeError, ValueError):
        return None


def format_utc(value):
    """Format a datetime as an ISO UTC timestamp."""
    return value.isoformat(timespec="seconds").replace("+00:00", "Z")


def is_delivery_in_scope(delivery):
    """Check whether a UTC delivery timestamp is in scope."""
    return (
        delivery is not None
        and DELIVERY_START <= delivery < DELIVERY_END
    )


def build_analysis(actual_records, forecast_records):
    # ---------------------------------------------------------
    # Step 1: Prepare actual half-hourly wind generation.
    # ---------------------------------------------------------
    actual_by_time = {}

    for record in actual_records:
        if not isinstance(record, dict):
            continue

        if record.get("fuelType") != "WIND":
            continue

        start = parse_datetime(record.get("startTime"))
        generation = to_number(record.get("generation"))

        if not is_delivery_in_scope(start) or generation is None:
            continue

        actual_by_time[start] = generation

    # ---------------------------------------------------------
    # Step 2: Aggregate actual generation into hourly averages.
    # Both the :00 and :30 observations must be available.
    # ---------------------------------------------------------
    actual_hourly = {}
    hour = DELIVERY_START

    while hour < DELIVERY_END:
        first = actual_by_time.get(hour)
        second = actual_by_time.get(hour + timedelta(minutes=30))

        if first is not None and second is not None:
            actual_hourly[hour] = (first + second) / 2

        hour += timedelta(hours=1)

    # ---------------------------------------------------------
    # Step 3: Group forecast versions by delivery hour.
    # The API request already limits publication timestamps.
    # ---------------------------------------------------------
    forecasts_by_hour = defaultdict(list)
    forecast_records_in_delivery_window = 0

    for record in forecast_records:
        if not isinstance(record, dict):
            continue

        delivery = parse_datetime(record.get("startTime"))
        published = parse_datetime(record.get("publishTime"))
        generation = to_number(record.get("generation"))

        if not is_delivery_in_scope(delivery):
            continue

        if published is None or generation is None:
            continue

        # WINDFOR provides hourly forecast values.
        if (
            delivery.minute != 0
            or delivery.second != 0
            or delivery.microsecond != 0
        ):
            continue

        forecast_records_in_delivery_window += 1

        forecasts_by_hour[delivery].append({
            "publishTime": format_utc(published),
            "published": published,
            "generation": generation,
        })

    # ---------------------------------------------------------
    # Step 4: Select the latest eligible forecast for each
    # delivery hour, using the purchase decision cutoff.
    # ---------------------------------------------------------
    selected_forecasts = {}

    for delivery, candidates in forecasts_by_hour.items():
        delivery_date_uk = delivery.astimezone(UK_TIMEZONE).date()
        decision_date = delivery_date_uk - timedelta(days=1)

        cutoff_local = datetime.combine(
            decision_date,
            DECISION_CUTOFF,
            tzinfo=UK_TIMEZONE,
        )

        cutoff_utc = cutoff_local.astimezone(UTC)

        eligible = [
            forecast
            for forecast in candidates
            if forecast["published"] <= cutoff_utc
        ]

        if eligible:
            selected_forecasts[delivery] = max(
                eligible,
                key=lambda forecast: forecast["published"],
            )

    # ---------------------------------------------------------
    # Step 5: Match hourly actuals and forecasts by delivery time.
    # Keep full precision for calculations.
    # ---------------------------------------------------------
    matched_points = []

    for delivery in sorted(actual_hourly):
        forecast = selected_forecasts.get(delivery)

        if forecast is None:
            continue

        actual = actual_hourly[delivery]
        predicted = forecast["generation"]

        matched_points.append({
            "delivery": delivery,
            "actual": actual,
            "forecast": predicted,
            "error": predicted - actual,
            "publishTime": forecast["publishTime"],
        })

    # ---------------------------------------------------------
    # Step 6: Calculate accuracy metrics from unrounded values.
    # ---------------------------------------------------------
    matched = len(matched_points)

    if matched > 0:
        absolute_errors = [
            abs(point["error"])
            for point in matched_points
        ]

        squared_errors = [
            point["error"] ** 2
            for point in matched_points
        ]

        actual_total = sum(
            abs(point["actual"])
            for point in matched_points
        )

        mae = sum(absolute_errors) / matched
        rmse = math.sqrt(sum(squared_errors) / matched)

        wape = (
            sum(absolute_errors) / actual_total * 100
            if actual_total > 0
            else None
        )

    else:
        mae = None
        rmse = None
        wape = None

    # Round only when preparing the API response.
    rows = [
        {
            "startTime": format_utc(point["delivery"]),
            "actualGenerationMw": round(point["actual"], 2),
            "forecastGenerationMw": round(point["forecast"], 2),
            "errorMw": round(point["error"], 2),
            "absoluteErrorMw": round(abs(point["error"]), 2),
            "publishTime": point["publishTime"],
        }
        for point in matched_points
    ]

    # ---------------------------------------------------------
    # Step 7: Return metrics, assumptions and data-quality counts.
    # ---------------------------------------------------------
    return {
        "source": "Elexon BMRS",
        "decisionPeriod": "2026-01-01 to 2026-01-31",
        "deliveryPeriod": "2026-01-02 to 2026-02-01 (inclusive)",
        "timezone": "Europe/London",
        "assumptions": {
            "decisionCutoff": (
                "09:50 Europe/London on the purchase-decision date; "
                "N2EX timing is an assumption, not specified in the brief"
            ),
            "forecastSelection": (
                "Latest forecast published at or before the decision cutoff"
            ),
            "actualAggregation": (
                "Hourly mean of the two half-hourly actual generation values"
            ),
            "metricsPopulation": (
                "Only delivery hours with both actual and eligible forecast data"
            ),
        },
        "metrics": {
            "maeMw": round(mae, 2) if mae is not None else None,
            "rmseMw": round(rmse, 2) if rmse is not None else None,
            "wapePercent": round(wape, 2) if wape is not None else None,
            "matchedIntervals": matched,
            "expectedIntervals": EXPECTED_HOURS,
            "coveragePercent": round(
                matched / EXPECTED_HOURS * 100, 2
            ),
        },
        "dataQuality": {
            "actualHalfHourlyRecords": len(actual_by_time),
            "actualHourlyIntervals": len(actual_hourly),
            "forecastRecordsInDeliveryWindow": (
                forecast_records_in_delivery_window
            ),
            "deliveryHoursWithForecasts": len(forecasts_by_hour),
            "eligibleForecastHours": len(selected_forecasts),
        },
        "data": rows,
    }